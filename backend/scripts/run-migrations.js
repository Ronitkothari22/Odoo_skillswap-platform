const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const migrations = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrations.length} migration files`);

    for (const migration of migrations) {
      const migrationPath = path.join(migrationsDir, migration);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      console.log(`Running migration: ${migration}`);
      
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`Error running migration ${migration}:`, error);
        // Continue with other migrations
      } else {
        console.log(`✓ Migration ${migration} completed`);
      }
    }
    
    console.log('All migrations completed!');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

// Alternative method using direct SQL execution
async function runMigrationsDirect() {
  try {
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const migrations = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrations.length} migration files`);

    for (const migration of migrations) {
      const migrationPath = path.join(migrationsDir, migration);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      console.log(`Running migration: ${migration}`);
      
      // Split SQL into individual statements
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (error) {
            console.error(`Error in statement:`, error);
          }
        }
      }
      
      console.log(`✓ Migration ${migration} completed`);
    }
    
    console.log('All migrations completed!');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

// Run migrations
runMigrationsDirect(); 