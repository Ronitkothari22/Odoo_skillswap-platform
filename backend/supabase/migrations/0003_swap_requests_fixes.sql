-- 0003_swap_requests_fixes.sql
-- Add missing fields to swap_requests table

-- Add message field to swap_requests table
alter table public.swap_requests 
add column if not exists message text;

-- Add updated_at field to swap_requests table
alter table public.swap_requests 
add column if not exists updated_at timestamp with time zone default now();

-- Create trigger to automatically update updated_at when row is modified
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for swap_requests table
drop trigger if exists update_swap_requests_updated_at on public.swap_requests;
create trigger update_swap_requests_updated_at
    before update on public.swap_requests
    for each row execute function update_updated_at_column(); 