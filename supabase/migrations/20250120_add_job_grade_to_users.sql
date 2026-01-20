-- Add job_grade column to users table
ALTER TABLE users
ADD COLUMN job_grade VARCHAR(3) CHECK (job_grade IN ('1.1', '1.2', '2.1', '2.2', '3.1', '3.2', '5'));

-- Add comment to the column
COMMENT ON COLUMN users.job_grade IS 'User job grade level (1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 5)';
