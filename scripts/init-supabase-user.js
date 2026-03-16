// Script to initialize the default user in Supabase
// Run this with: node init-supabase-user.js

require('dotenv').config({ path: '../agent/.env' });
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in agent/.env');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Default user ID and information
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';
const DEFAULT_USER_EMAIL = 'default@example.com';
const DEFAULT_USER_NAME = 'Default User';

// Function to initialize the default user
async function initializeDefaultUser() {
  try {
    console.log('Checking if default user exists...');
    
    // Check if default user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', DEFAULT_USER_ID)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
      console.error('Error checking for default user:', fetchError.message);
      return;
    }
    
    // If user doesn't exist, create it
    if (!existingUser) {
      console.log('Default user not found. Creating...');
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          { 
            id: DEFAULT_USER_ID, 
            email: DEFAULT_USER_EMAIL, 
            name: DEFAULT_USER_NAME 
          }
        ])
        .select();
      
      if (insertError) {
        console.error('Error creating default user:', insertError.message);
      } else {
        console.log('✅ Created default user:', newUser[0]);
      }
    } else {
      console.log('✅ Default user already exists:', existingUser);
    }
  } catch (error) {
    console.error('Error initializing default user:', error.message);
  }
}

// Run the initialization
initializeDefaultUser().catch(error => {
  console.error('Error:', error);
});
