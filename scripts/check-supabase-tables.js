// Script to check Supabase tables and ensure proper integration
// Run this with: node check-supabase-tables.js

require('dotenv').config({ path: '../frontend/.env' });
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in frontend/.env');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Required tables and their columns
const requiredTables = {
  users: ['id', 'email', 'name', 'created_at', 'updated_at'],
  entities: ['id', 'name', 'type', 'properties', 'created_at', 'updated_at', 'user_id'],
  relations: ['id', 'type', 'properties', 'from_entity_id', 'to_entity_id', 'created_at', 'updated_at', 'user_id'],
  sessions: ['id', 'user_id', 'expires_at', 'created_at']
};

// Function to check if a table exists and has the required columns
async function checkTable(tableName, requiredColumns) {
  try {
    // Check if table exists by trying to select from it
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.error(`❌ Table '${tableName}' does not exist.`);
        return false;
      } else {
        console.error(`❌ Error checking table '${tableName}':`, error.message);
        return false;
      }
    }
    
    // Get table information to check columns
    const { data: tableInfo, error: tableInfoError } = await supabase
      .rpc('get_table_info', { table_name: tableName });
    
    if (tableInfoError) {
      console.error(`❌ Error getting table info for '${tableName}':`, tableInfoError.message);
      return false;
    }
    
    // Check if all required columns exist
    const existingColumns = tableInfo.map(col => col.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.error(`❌ Table '${tableName}' is missing columns: ${missingColumns.join(', ')}`);
      return false;
    }
    
    console.log(`✅ Table '${tableName}' exists with all required columns.`);
    return true;
  } catch (error) {
    console.error(`❌ Error checking table '${tableName}':`, error.message);
    return false;
  }
}

// Main function to check all tables
async function checkAllTables() {
  console.log('Checking Supabase tables...');
  console.log('=========================');
  
  let allTablesExist = true;
  
  for (const [tableName, requiredColumns] of Object.entries(requiredTables)) {
    const tableExists = await checkTable(tableName, requiredColumns);
    if (!tableExists) {
      allTablesExist = false;
    }
  }
  
  console.log('=========================');
  
  if (allTablesExist) {
    console.log('✅ All required tables exist with the correct structure.');
    console.log('Your Supabase database is ready for integration with KB-multi-agent.');
  } else {
    console.log('❌ Some tables are missing or have incorrect structure.');
    console.log('Please run the SQL script in scripts/supabase-tables.sql to create the missing tables.');
  }
}

// Run the check
checkAllTables().catch(error => {
  console.error('Error checking tables:', error);
});
