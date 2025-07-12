-- 0004_sample_skills.sql
-- Populate skills table with sample data

-- Insert common skills for testing
insert into public.skills (name) values 
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
on conflict (name) do nothing; 