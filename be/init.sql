-- EVX Database Initialization Script
-- This script runs when PostgreSQL container starts for the first time

-- Create database if it doesn't exist (handled by environment variables)
-- The database 'evx_db' is created automatically by the container

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE evx_db TO evx_user;

-- Connect to the database
\c evx_db;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO evx_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO evx_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO evx_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO evx_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO evx_user;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log initialization completion
SELECT 'EVX Database initialized successfully' AS status;