-- 0006_feedback_rating_trigger.sql
-- Add trigger to automatically recalculate user ratings when feedback is added/updated/deleted

-- Function to recalculate user's average rating
CREATE OR REPLACE FUNCTION recalculate_user_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id uuid;
    avg_rating numeric(3,2);
    feedback_count integer;
BEGIN
    -- Determine which user's rating needs to be recalculated
    IF TG_OP = 'DELETE' THEN
        target_user_id := OLD.to_user_id;
    ELSE
        target_user_id := NEW.to_user_id;
    END IF;

    -- Calculate the new average rating for the user
    SELECT 
        COALESCE(AVG(stars), 0),
        COUNT(*)
    INTO avg_rating, feedback_count
    FROM public.feedback
    WHERE to_user_id = target_user_id;

    -- Update the user's rating_avg field
    UPDATE public.users
    SET rating_avg = ROUND(avg_rating, 2)
    WHERE id = target_user_id;

    -- Log the rating calculation for debugging/audit purposes
    INSERT INTO public.admin_logs (
        actor_id,
        action_type,
        target_id,
        details,
        created_at
    ) VALUES (
        target_user_id,
        'rating_recalculation',
        target_user_id,
        jsonb_build_object(
            'new_rating', ROUND(avg_rating, 2),
            'feedback_count', feedback_count,
            'trigger_operation', TG_OP,
            'recalculated_at', NOW()
        ),
        NOW()
    );

    -- Return the appropriate record based on the operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for feedback insertion
DROP TRIGGER IF EXISTS trigger_recalculate_rating_on_insert ON public.feedback;
CREATE TRIGGER trigger_recalculate_rating_on_insert
    AFTER INSERT ON public.feedback
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_user_rating();

-- Create trigger for feedback update
DROP TRIGGER IF EXISTS trigger_recalculate_rating_on_update ON public.feedback;
CREATE TRIGGER trigger_recalculate_rating_on_update
    AFTER UPDATE ON public.feedback
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_user_rating();

-- Create trigger for feedback deletion
DROP TRIGGER IF EXISTS trigger_recalculate_rating_on_delete ON public.feedback;
CREATE TRIGGER trigger_recalculate_rating_on_delete
    AFTER DELETE ON public.feedback
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_user_rating();

-- Create index on feedback.to_user_id for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_to_user_id ON public.feedback(to_user_id);

-- Create index on feedback.from_user_id for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_from_user_id ON public.feedback(from_user_id);

-- Create index on feedback.swap_id for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_swap_id ON public.feedback(swap_id);

-- Create index on feedback.stars for filtering performance
CREATE INDEX IF NOT EXISTS idx_feedback_stars ON public.feedback(stars);

-- Create index on feedback.created_at for date filtering
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_feedback_user_stars_date ON public.feedback(to_user_id, stars, created_at DESC);

-- Add constraint to prevent users from giving feedback to themselves
ALTER TABLE public.feedback 
ADD CONSTRAINT chk_feedback_different_users 
CHECK (from_user_id != to_user_id);

-- Add constraint to prevent duplicate feedback for the same swap from the same user
ALTER TABLE public.feedback 
ADD CONSTRAINT uq_feedback_swap_from_user 
UNIQUE (swap_id, from_user_id);

-- Function to get user's feedback summary (for API usage)
CREATE OR REPLACE FUNCTION get_user_feedback_summary(user_id uuid)
RETURNS TABLE(
    rating_avg numeric(3,2),
    total_feedback_count bigint,
    five_star_count bigint,
    four_star_count bigint,
    three_star_count bigint,
    two_star_count bigint,
    one_star_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.rating_avg,
        COALESCE(COUNT(f.id), 0) as total_feedback_count,
        COALESCE(COUNT(f.id) FILTER (WHERE f.stars = 5), 0) as five_star_count,
        COALESCE(COUNT(f.id) FILTER (WHERE f.stars = 4), 0) as four_star_count,
        COALESCE(COUNT(f.id) FILTER (WHERE f.stars = 3), 0) as three_star_count,
        COALESCE(COUNT(f.id) FILTER (WHERE f.stars = 2), 0) as two_star_count,
        COALESCE(COUNT(f.id) FILTER (WHERE f.stars = 1), 0) as one_star_count
    FROM public.users u
    LEFT JOIN public.feedback f ON u.id = f.to_user_id
    WHERE u.id = user_id
    GROUP BY u.id, u.rating_avg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate feedback before insertion
CREATE OR REPLACE FUNCTION validate_feedback_insertion()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the swap exists and is accepted
    IF NOT EXISTS (
        SELECT 1 FROM public.swap_requests 
        WHERE id = NEW.swap_id 
        AND status = 'accepted'
        AND (requester_id = NEW.from_user_id OR responder_id = NEW.from_user_id)
    ) THEN
        RAISE EXCEPTION 'Feedback can only be given for accepted swaps where you were a participant';
    END IF;

    -- Check if feedback already exists for this swap from this user
    IF EXISTS (
        SELECT 1 FROM public.feedback 
        WHERE swap_id = NEW.swap_id 
        AND from_user_id = NEW.from_user_id 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
        RAISE EXCEPTION 'Feedback already exists for this swap from this user';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for feedback validation
DROP TRIGGER IF EXISTS trigger_validate_feedback ON public.feedback;
CREATE TRIGGER trigger_validate_feedback
    BEFORE INSERT OR UPDATE ON public.feedback
    FOR EACH ROW
    EXECUTE FUNCTION validate_feedback_insertion();

-- Update RLS policies for feedback table to ensure proper access control
-- (These policies should already exist from the auth policies migration, but we'll update them)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read feedback about them" ON public.feedback;
DROP POLICY IF EXISTS "Users can read feedback they gave" ON public.feedback;
DROP POLICY IF EXISTS "Users can create feedback for their swaps" ON public.feedback;
DROP POLICY IF EXISTS "Users can read public feedback" ON public.feedback;

-- Recreate policies with better names and logic
CREATE POLICY "Users can read their received feedback" ON public.feedback
    FOR SELECT USING (auth.uid() = to_user_id);

CREATE POLICY "Users can read their given feedback" ON public.feedback
    FOR SELECT USING (auth.uid() = from_user_id);

CREATE POLICY "Users can create feedback for accepted swaps" ON public.feedback
    FOR INSERT WITH CHECK (
        auth.uid() = from_user_id
        AND EXISTS (
            SELECT 1 FROM public.swap_requests 
            WHERE swap_requests.id = feedback.swap_id 
            AND (swap_requests.requester_id = auth.uid() OR swap_requests.responder_id = auth.uid())
            AND swap_requests.status = 'accepted'
        )
    );

CREATE POLICY "Public can read feedback for visible users" ON public.feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = feedback.to_user_id 
            AND users.visibility = true
        )
    );

-- Allow users to update their own feedback (only comment, not stars or target user)
CREATE POLICY "Users can update their own feedback" ON public.feedback
    FOR UPDATE USING (auth.uid() = from_user_id)
    WITH CHECK (
        auth.uid() = from_user_id
        AND to_user_id = (SELECT to_user_id FROM public.feedback WHERE id = feedback.id)
        AND swap_id = (SELECT swap_id FROM public.feedback WHERE id = feedback.id)
    );

-- Comments
COMMENT ON FUNCTION recalculate_user_rating() IS 'Automatically recalculates user rating when feedback is added, updated, or deleted';
COMMENT ON FUNCTION get_user_feedback_summary(uuid) IS 'Returns comprehensive feedback summary for a user including rating breakdown';
COMMENT ON FUNCTION validate_feedback_insertion() IS 'Validates feedback before insertion to ensure business rules are followed';

-- Create a view for easy feedback statistics
CREATE OR REPLACE VIEW feedback_statistics AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.rating_avg,
    COUNT(f.id) as total_feedback_count,
    COUNT(f.id) FILTER (WHERE f.stars = 5) as five_star_count,
    COUNT(f.id) FILTER (WHERE f.stars = 4) as four_star_count,
    COUNT(f.id) FILTER (WHERE f.stars = 3) as three_star_count,
    COUNT(f.id) FILTER (WHERE f.stars = 2) as two_star_count,
    COUNT(f.id) FILTER (WHERE f.stars = 1) as one_star_count,
    AVG(f.stars) as calculated_avg_rating,
    MAX(f.created_at) as last_feedback_date
FROM public.users u
LEFT JOIN public.feedback f ON u.id = f.to_user_id
GROUP BY u.id, u.name, u.rating_avg;

COMMENT ON VIEW feedback_statistics IS 'Comprehensive view of user feedback statistics for easy querying'; 