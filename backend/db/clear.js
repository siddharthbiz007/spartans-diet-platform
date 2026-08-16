import { query } from './database.js';
import { seed } from './seed.js';

async function clearData() {
  try {
    await query.run('DELETE FROM diet_plans');
    await query.run('DELETE FROM assessments');
    await query.run('DELETE FROM patients');
    await query.run('DELETE FROM users');
    
    // Reset sqlite autoincrement sequences
    await query.run('DELETE FROM sqlite_sequence WHERE name IN ("diet_plans", "assessments", "patients", "users")');
    
    console.log('Successfully cleared all user and patient data.');
    
    console.log('Re-seeding default data...');
    await seed();
  } catch (err) {
    console.error('Error clearing data:', err);
  }
}

clearData();
