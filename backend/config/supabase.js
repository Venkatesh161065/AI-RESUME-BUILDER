const { createClient } = require('@supabase/supabase-js');

// Must provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn('WARNING: Missing Supabase URL or Service Role Key! Backend operations requiring database access may fail.');
}

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

module.exports = supabase;
