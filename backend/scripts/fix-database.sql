-- Fix swap_requests table schema
-- Run this directly in your Supabase SQL editor

-- Add message field to swap_requests table
ALTER TABLE public.swap_requests 
ADD COLUMN IF NOT EXISTS message text;

-- Add updated_at field to swap_requests table
ALTER TABLE public.swap_requests 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default now();

-- Create trigger to automatically update updated_at when row is modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for swap_requests table
DROP TRIGGER IF EXISTS update_swap_requests_updated_at ON public.swap_requests;
CREATE TRIGGER update_swap_requests_updated_at
    BEFORE UPDATE ON public.swap_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample skills
INSERT INTO public.skills (name) VALUES 
('React'),
('JavaScript'),
('Python'),
('TypeScript'),
('Node.js'),
('Express.js'),
('PostgreSQL'),
('MongoDB'),
('CSS'),
('HTML'),
('Vue.js'),
('Angular'),
('Java'),
('Spring Boot'),
('Docker'),
('Kubernetes'),
('AWS'),
('Azure'),
('Machine Learning'),
('Data Science'),
('DevOps'),
('Git'),
('GraphQL'),
('REST APIs'),
('Microservices'),
('System Design'),
('Database Design'),
('UI/UX Design'),
('Product Management'),
('Digital Marketing')
ON CONFLICT (name) DO NOTHING; 