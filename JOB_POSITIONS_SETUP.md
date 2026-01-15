# Job Positions Feature Setup

## Database Setup

You need to run the SQL script to create the `job_positions` table in your Supabase database.

### Steps:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `create-job-positions-table.sql`
5. Click "Run" to execute the script

This will:
- Create the `job_positions` table
- Set up Row Level Security (RLS) policies
- Insert 10 default job positions

## Features

### Job Positions Settings Page

Navigate to **Settings → Job Positions** to:

1. **View all positions** - See all job positions in a table
2. **Add new position** - Click "Add Position" button
   - Enter position name (required)
   - Enter description (optional)
3. **Edit position** - Click "Edit" button on any position
4. **Delete position** - Click "Delete" button on any position
5. **Import from CSV** - Click "Import CSV" button
   - Upload a CSV file with format: `name,description`
   - First row should be headers
6. **Download template** - Click "Template" button to download a sample CSV file

### CSV Import Format

```csv
name,description
Senior Manager,Senior management position
Project Manager,Project management position
Technical Lead,Technical leadership position
```

### Default Positions Included

The script includes these default positions:
- Manager
- Senior Developer
- Developer
- Junior Developer
- Team Lead
- Director
- VP
- Analyst
- Specialist
- Coordinator

## Usage in Job Descriptions

Once set up, these positions can be used when creating or editing job descriptions. The position field will be a dropdown/autocomplete with all available positions.
