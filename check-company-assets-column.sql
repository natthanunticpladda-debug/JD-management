-- Check if company_assets column exists in job_descriptions table

SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'job_descriptions' 
  AND column_name = 'company_assets';

-- If the query returns no rows, the column doesn't exist yet
-- You need to run: add-company-assets-column.sql

-- Expected result when column exists:
-- column_name      | data_type | is_nullable | column_default
-- -----------------|-----------|-------------|---------------
-- company_assets   | ARRAY     | YES         | NULL
