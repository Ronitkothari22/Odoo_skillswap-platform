-- 0005_fix_swap_rls.sql
-- Fix RLS policies for swap_requests table to work with JWT authentication

-- Drop existing policies for swap_requests to recreate them
DROP POLICY IF EXISTS "Users can read own swap requests" ON public.swap_requests;
DROP POLICY IF EXISTS "Users can create swap requests" ON public.swap_requests;
DROP POLICY IF EXISTS "Users can update own swap requests" ON public.swap_requests;

-- Create improved RLS policies for swap_requests
-- Policy: Users can read swap requests where they are involved (requester or responder)
CREATE POLICY "Users can read own swap requests" ON public.swap_requests
    FOR SELECT USING (
        auth.uid() = requester_id OR 
        auth.uid() = responder_id
    );

-- Policy: Users can create swap requests as requester
CREATE POLICY "Users can create swap requests" ON public.swap_requests
    FOR INSERT WITH CHECK (
        auth.uid() = requester_id AND
        requester_id != responder_id
    );

-- Policy: Users can update swap requests where they are involved
CREATE POLICY "Users can update own swap requests" ON public.swap_requests
    FOR UPDATE USING (
        auth.uid() = requester_id OR 
        auth.uid() = responder_id
    );

-- Policy: Users can delete their own swap requests (only if they are the requester)
CREATE POLICY "Users can delete own swap requests" ON public.swap_requests
    FOR DELETE USING (
        auth.uid() = requester_id
    );

-- Create a function to debug auth context (for development)
CREATE OR REPLACE FUNCTION debug_auth_context()
RETURNS jsonb AS $$
BEGIN
    RETURN jsonb_build_object(
        'auth_uid', auth.uid(),
        'auth_role', auth.role(),
        'auth_jwt_valid', auth.jwt() IS NOT NULL,
        'current_user', current_user,
        'session_user', session_user
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION debug_auth_context() TO authenticated;
GRANT EXECUTE ON FUNCTION debug_auth_context() TO anon;

-- Ensure RLS is enabled
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_swap_requests_requester_id ON public.swap_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_responder_id ON public.swap_requests(responder_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON public.swap_requests(status);
CREATE INDEX IF NOT EXISTS idx_swap_requests_created_at ON public.swap_requests(created_at DESC); 