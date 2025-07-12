-- 0002_auth_policies.sql
-- Row Level Security policies for authentication
-- Run after initial schema creation

-- -------------------------------
-- RLS POLICIES FOR USERS TABLE
-- -------------------------------

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can read public profiles
CREATE POLICY "Users can read public profiles" ON public.users
    FOR SELECT USING (visibility = true);

-- Policy: Service role can insert new users (for signup)
CREATE POLICY "Service role can insert users" ON public.users
    FOR INSERT WITH CHECK (true);

-- Policy: Service role can manage all users (for admin operations)
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- -------------------------------
-- RLS POLICIES FOR USER_SKILLS TABLE
-- -------------------------------

-- Policy: Users can read their own skills
CREATE POLICY "Users can read own skills" ON public.user_skills
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can manage their own skills
CREATE POLICY "Users can manage own skills" ON public.user_skills
    FOR ALL USING (auth.uid() = user_id);

-- Policy: Users can read public skills
CREATE POLICY "Users can read public skills" ON public.user_skills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = user_skills.user_id 
            AND users.visibility = true
        )
    );

-- -------------------------------
-- RLS POLICIES FOR DESIRED_SKILLS TABLE
-- -------------------------------

-- Policy: Users can read their own desired skills
CREATE POLICY "Users can read own desired skills" ON public.desired_skills
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can manage their own desired skills
CREATE POLICY "Users can manage own desired skills" ON public.desired_skills
    FOR ALL USING (auth.uid() = user_id);

-- Policy: Users can read public desired skills
CREATE POLICY "Users can read public desired skills" ON public.desired_skills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = desired_skills.user_id 
            AND users.visibility = true
        )
    );

-- -------------------------------
-- RLS POLICIES FOR AVAILABILITY_SLOTS TABLE
-- -------------------------------

-- Policy: Users can read their own availability
CREATE POLICY "Users can read own availability" ON public.availability_slots
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can manage their own availability
CREATE POLICY "Users can manage own availability" ON public.availability_slots
    FOR ALL USING (auth.uid() = user_id);

-- Policy: Users can read public availability
CREATE POLICY "Users can read public availability" ON public.availability_slots
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = availability_slots.user_id 
            AND users.visibility = true
        )
    );

-- -------------------------------
-- RLS POLICIES FOR SWAP_REQUESTS TABLE
-- -------------------------------

-- Policy: Users can read swap requests where they are involved
CREATE POLICY "Users can read own swap requests" ON public.swap_requests
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = responder_id);

-- Policy: Users can create swap requests as requester
CREATE POLICY "Users can create swap requests" ON public.swap_requests
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Policy: Users can update swap requests where they are involved
CREATE POLICY "Users can update own swap requests" ON public.swap_requests
    FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = responder_id);

-- -------------------------------
-- RLS POLICIES FOR FEEDBACK TABLE
-- -------------------------------

-- Policy: Users can read feedback about them
CREATE POLICY "Users can read feedback about them" ON public.feedback
    FOR SELECT USING (auth.uid() = to_user_id);

-- Policy: Users can read feedback they gave
CREATE POLICY "Users can read feedback they gave" ON public.feedback
    FOR SELECT USING (auth.uid() = from_user_id);

-- Policy: Users can create feedback if they were part of the swap
CREATE POLICY "Users can create feedback for their swaps" ON public.feedback
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.swap_requests 
            WHERE swap_requests.id = feedback.swap_id 
            AND (swap_requests.requester_id = auth.uid() OR swap_requests.responder_id = auth.uid())
            AND swap_requests.status = 'accepted'
        )
    );

-- Policy: Users can read public feedback (for reputation)
CREATE POLICY "Users can read public feedback" ON public.feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = feedback.to_user_id 
            AND users.visibility = true
        )
    );

-- -------------------------------
-- RLS POLICIES FOR SKILLS TABLE
-- -------------------------------

-- Policy: Anyone can read skills (public catalog)
CREATE POLICY "Anyone can read skills" ON public.skills
    FOR SELECT USING (true);

-- Policy: Authenticated users can create skills
CREATE POLICY "Authenticated users can create skills" ON public.skills
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- -------------------------------
-- RLS POLICIES FOR ADMIN_LOGS TABLE
-- -------------------------------

-- Policy: Only admins can read admin logs
CREATE POLICY "Only admins can read admin logs" ON public.admin_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.id = admin_logs.actor_id
        )
    );

-- Policy: Only admins can create admin logs
CREATE POLICY "Only admins can create admin logs" ON public.admin_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.id = admin_logs.actor_id
        )
    );

-- -------------------------------
-- HELPER FUNCTIONS
-- -------------------------------

-- Function to check if user is admin (placeholder for future admin role system)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    -- For now, return false. In future, implement admin role checking
    -- Example: Check if user has admin role in a roles table
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's visibility status
CREATE OR REPLACE FUNCTION public.user_is_visible(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id AND visibility = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 