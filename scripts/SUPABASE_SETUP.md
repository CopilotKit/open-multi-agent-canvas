# Supabase Setup Guide for KB-multi-agent

This guide will help you set up Supabase for use with KB-multi-agent. Supabase provides a PostgreSQL database with a REST API, which is used by the Knowledge Agent to store and retrieve knowledge graph data.

## Option 1: Running in Offline Mode (No Setup Required)

If you don't need persistent storage, you can run KB-multi-agent in offline mode without setting up Supabase. The application will use in-memory storage instead.

When you see errors like `TypeError: fetch failed` in the Supabase window, the application will automatically fall back to offline mode.

## Option 2: Setting Up Supabase

If you want to use Supabase for persistent storage, follow these steps:

### 1. Create a Supabase Account

1. Go to [Supabase](https://supabase.com/) and sign up for a free account
2. Create a new project
3. Choose a name for your project and set a secure database password
4. Select a region close to you
5. Wait for your project to be created (this may take a few minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to Project Settings > API
2. Find the following information:
   - Project URL (e.g., `https://your-project.supabase.co`)
   - Service Role Key (starts with `eyJ...`)

### 3. Update Your .env File

1. Open the `.env` file in the `agent` directory
2. Update the following variables:
   ```
   DATABASE_BACKEND=supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   ```

### 4. Create the Required Tables

You can create the required tables in one of two ways:

#### Option A: Using the SQL Editor in Supabase

1. In your Supabase project dashboard, go to SQL Editor
2. Create a new query
3. Copy the contents of `scripts/supabase-tables.sql` into the query editor
4. Run the query

#### Option B: Using the Initialization Script

1. Run `./start-app-interactive.ps1` to start the application with Supabase initialization
2. The Supabase window will open and attempt to create the tables
3. If successful, you'll see a message confirming the tables were created

## Troubleshooting

### Connection Issues

If you see `TypeError: fetch failed` errors:

1. Check that your Supabase URL and service key are correct in the `.env` file
2. Ensure your Supabase project is active and not paused
3. Check your internet connection

### Table Creation Issues

If the tables cannot be created automatically:

1. Use Option A above to create them manually using the SQL Editor
2. Check the Supabase logs for any errors

### Still Having Issues?

The application will continue to work in offline mode even if Supabase is not available. Your data will be stored in memory and will be lost when the application is closed.

If you need persistent storage but cannot get Supabase working, consider using the PostgreSQL option instead by setting `DATABASE_BACKEND=postgres` in your `.env` file.
