const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Attempt a lightweight query on your actual 'students' table
    const { data, error } = await supabase.from('students').select('*').limit(1);
    
    if (error) {
      console.log('Connection fail');
      console.error(error.message);
    } else {
      console.log('Connection Success');
    }
  } catch (err) {
    console.log('Connection fail');
    console.error(err.message);
  }
}

testConnection();

module.exports = supabase;