import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper functions to wrap sqlite3 callbacks in Promises
const query = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

// Initialize database tables
async function initDb() {
  try {
    // 1. Users Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT CHECK(role IN ('dietitian', 'client')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Patients Table (Extended with onboarding details)
    await query.run(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dietitian_id INTEGER NOT NULL,
        client_id INTEGER, -- Optional link to users(id) if they create an account
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        height REAL,
        weight REAL,
        location TEXT,
        dosha TEXT, -- Vata, Pitta, Kapha, etc. (determined by assessment)
        health_conditions TEXT, -- comma-separated list
        onboarding_details TEXT, -- JSON string storing cuisine, sleep, stress, primary intention, allergies, medications
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dietitian_id) REFERENCES users(id),
        FOREIGN KEY (client_id) REFERENCES users(id)
      )
    `);

    // 3. Assessments Table (Stores Prakriti/Dosha assessment questions and results)
    await query.run(`
      CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL, -- references patients(id) or users(id) if client self-assesses
        answers TEXT NOT NULL, -- JSON string of quiz answers
        dosha_result TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Diet Plans Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS diet_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        dietitian_id INTEGER NOT NULL,
        plan_name TEXT NOT NULL,
        meals TEXT NOT NULL, -- JSON string containing breakfast, lunch, dinner, snacks, lifestyle
        nutrients_target TEXT NOT NULL, -- JSON string of target calories, protein, carbs, fat
        nutrients_actual TEXT NOT NULL, -- JSON string of actual calories, protein, carbs, fat
        ayurvedic_notes TEXT,
        status TEXT CHECK(status IN ('Active', 'Completed', 'Archived')) DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (dietitian_id) REFERENCES users(id)
      )
    `);

    // 5. Foods Table (Ayurvedic Food & Nutrient Database)
    await query.run(`
      CREATE TABLE IF NOT EXISTS foods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        carbohydrates REAL NOT NULL,
        fat REAL NOT NULL,
        vata_effect TEXT CHECK(vata_effect IN ('Pacifies', 'Aggravates', 'Neutral')) NOT NULL,
        pitta_effect TEXT CHECK(pitta_effect IN ('Pacifies', 'Aggravates', 'Neutral')) NOT NULL,
        kapha_effect TEXT CHECK(kapha_effect IN ('Pacifies', 'Aggravates', 'Neutral')) NOT NULL,
        ayurvedic_properties TEXT NOT NULL -- JSON string of Rasa, Virya, Vipaka, Guna
      )
    `);

    // 6. OTP Verifications Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        otp_code TEXT NOT NULL,
        purpose TEXT NOT NULL DEFAULT 'signup',
        expires_at DATETIME NOT NULL,
        verified INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully.');
  } catch (err) {
    console.error('Error initializing tables:', err.message);
  }
}

export { query, initDb };
