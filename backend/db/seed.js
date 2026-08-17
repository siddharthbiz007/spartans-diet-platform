import bcrypt from 'bcryptjs';
import { query, initDb } from './database.js';

const initialFoods = [
  // ─── GRAINS ────────────────────────────────
  { name: 'Basmati Rice (White)', category: 'Grains', calories: 350, protein: 7, carbohydrates: 78, fat: 0.5,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Cooling', vipaka: 'Sweet', guna: 'Light, Soft' }) },

  { name: 'Oatmeal (Warm)', category: 'Grains', calories: 150, protein: 5, carbohydrates: 27, fat: 2.5,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Neutral', vipaka: 'Sweet', guna: 'Heavy, Oily' }) },

  { name: 'Millet (Bajra)', category: 'Grains', calories: 378, protein: 11, carbohydrates: 73, fat: 4.2,
    vata_effect: 'Aggravates', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Astringent', virya: 'Heating', vipaka: 'Pungent', guna: 'Light, Dry' }) },

  { name: 'Brown Rice', category: 'Grains', calories: 370, protein: 8, carbohydrates: 77, fat: 2.9,
    vata_effect: 'Pacifies', pitta_effect: 'Aggravates', kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Heating', vipaka: 'Sweet', guna: 'Heavy, Rough' }) },

  { name: 'Barley (Yava)', category: 'Grains', calories: 354, protein: 12, carbohydrates: 73, fat: 2.3,
    vata_effect: 'Aggravates', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Astringent', virya: 'Cooling', vipaka: 'Sweet', guna: 'Heavy, Dry' }) },

  // ─── LENTILS ───────────────────────────────
  { name: 'Mung Dal (Green Gram)', category: 'Lentils', calories: 347, protein: 24, carbohydrates: 63, fat: 1.15,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Astringent', virya: 'Cooling', vipaka: 'Sweet', guna: 'Light, Dry' }) },

  { name: 'Masoor Dal (Red Lentil)', category: 'Lentils', calories: 353, protein: 25, carbohydrates: 60, fat: 1.1,
    vata_effect: 'Aggravates', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Astringent, Sweet', virya: 'Cooling', vipaka: 'Pungent', guna: 'Light, Dry' }) },

  { name: 'Chana Dal (Split Chickpea)', category: 'Lentils', calories: 387, protein: 23, carbohydrates: 63, fat: 5,
    vata_effect: 'Aggravates', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Astringent', virya: 'Cooling', vipaka: 'Sweet', guna: 'Heavy, Dry' }) },

  { name: 'Urad Dal (Black Gram)', category: 'Lentils', calories: 341, protein: 25, carbohydrates: 59, fat: 1.6,
    vata_effect: 'Pacifies', pitta_effect: 'Aggravates', kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Heating', vipaka: 'Sweet', guna: 'Heavy, Oily' }) },

  // ─── VEGETABLES ────────────────────────────
  { name: 'Cooked Spinach', category: 'Vegetables', calories: 23, protein: 2.9, carbohydrates: 3.6, fat: 0.4,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Astringent, Sweet, Bitter', virya: 'Cooling', vipaka: 'Pungent', guna: 'Heavy, Dry' }) },

  { name: 'Steamed Carrots', category: 'Vegetables', calories: 35, protein: 0.8, carbohydrates: 8, fat: 0.2,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Bitter', virya: 'Heating', vipaka: 'Sweet', guna: 'Light' }) },

  { name: 'Bitter Gourd (Karela)', category: 'Vegetables', calories: 17, protein: 1, carbohydrates: 3.5, fat: 0.2,
    vata_effect: 'Aggravates', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Bitter', virya: 'Cooling', vipaka: 'Pungent', guna: 'Light, Dry' }) },

  { name: 'Sweet Potato', category: 'Vegetables', calories: 86, protein: 1.6, carbohydrates: 20, fat: 0.1,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Heating', vipaka: 'Sweet', guna: 'Heavy, Oily' }) },

  { name: 'Raw Onion', category: 'Vegetables', calories: 40, protein: 1.1, carbohydrates: 9.3, fat: 0.1,
    vata_effect: 'Pacifies', pitta_effect: 'Aggravates', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Pungent', virya: 'Heating', vipaka: 'Pungent', guna: 'Heavy, Oily' }) },

  { name: 'Ash Gourd (Winter Melon)', category: 'Vegetables', calories: 13, protein: 0.4, carbohydrates: 3, fat: 0.2,
    vata_effect: 'Aggravates', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Astringent', virya: 'Cooling', vipaka: 'Sweet', guna: 'Heavy, Oily' }) },

  { name: 'Ridge Gourd (Turai)', category: 'Vegetables', calories: 20, protein: 0.5, carbohydrates: 4.4, fat: 0.2,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Neutral',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Bitter', virya: 'Cooling', vipaka: 'Sweet', guna: 'Light, Oily' }) },

  // ─── DAIRY ─────────────────────────────────
  { name: 'Ghee (Clarified Butter)', category: 'Dairy', calories: 900, protein: 0, carbohydrates: 0, fat: 100,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Cooling', vipaka: 'Sweet', guna: 'Oily, Soft' }) },

  { name: 'Spiced Buttermilk (Takra)', category: 'Dairy', calories: 40, protein: 3, carbohydrates: 4.8, fat: 1,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sour, Sweet, Astringent', virya: 'Heating', vipaka: 'Sweet', guna: 'Light, Dry' }) },

  { name: 'Full-Fat Milk (Warm)', category: 'Dairy', calories: 61, protein: 3.2, carbohydrates: 4.8, fat: 3.3,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Cooling', vipaka: 'Sweet', guna: 'Heavy, Oily' }) },

  { name: 'Yogurt (Curd)', category: 'Dairy', calories: 59, protein: 3.5, carbohydrates: 4.7, fat: 3.3,
    vata_effect: 'Pacifies', pitta_effect: 'Aggravates', kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sour', virya: 'Heating', vipaka: 'Sour', guna: 'Heavy, Oily' }) },

  // ─── NUTS & SEEDS ──────────────────────────
  { name: 'Soaked Almonds (Peeled)', category: 'Nuts & Seeds', calories: 579, protein: 21, carbohydrates: 22, fat: 49,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Warming', vipaka: 'Sweet', guna: 'Heavy, Oily' }) },

  { name: 'Flaxseeds', category: 'Nuts & Seeds', calories: 534, protein: 18, carbohydrates: 29, fat: 42,
    vata_effect: 'Pacifies', pitta_effect: 'Aggravates', kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Bitter', virya: 'Heating', vipaka: 'Pungent', guna: 'Heavy, Oily' }) },

  { name: 'Pumpkin Seeds', category: 'Nuts & Seeds', calories: 446, protein: 19, carbohydrates: 54, fat: 19,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Neutral',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Astringent', virya: 'Cooling', vipaka: 'Sweet', guna: 'Light, Dry' }) },

  // ─── SPICES ────────────────────────────────
  { name: 'Cumin Seeds', category: 'Spices', calories: 375, protein: 18, carbohydrates: 44, fat: 22,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Pungent, Bitter', virya: 'Heating', vipaka: 'Pungent', guna: 'Light, Dry' }) },

  { name: 'Turmeric Powder', category: 'Spices', calories: 354, protein: 8, carbohydrates: 65, fat: 10,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Bitter, Pungent, Astringent', virya: 'Heating', vipaka: 'Pungent', guna: 'Dry, Light' }) },

  { name: 'Black Pepper', category: 'Spices', calories: 251, protein: 10, carbohydrates: 64, fat: 3.3,
    vata_effect: 'Pacifies', pitta_effect: 'Aggravates', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Pungent', virya: 'Heating', vipaka: 'Pungent', guna: 'Light, Dry' }) },

  { name: 'Coriander Powder', category: 'Spices', calories: 298, protein: 12, carbohydrates: 55, fat: 17,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Pungent, Astringent', virya: 'Cooling', vipaka: 'Sweet', guna: 'Light, Oily' }) },

  { name: 'Dry Ginger (Sunthi)', category: 'Spices', calories: 335, protein: 9, carbohydrates: 72, fat: 4.2,
    vata_effect: 'Pacifies', pitta_effect: 'Aggravates', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Pungent', virya: 'Heating', vipaka: 'Sweet', guna: 'Light, Dry' }) },

  // ─── FRUITS ────────────────────────────────
  { name: 'Ripe Mango', category: 'Fruits', calories: 60, protein: 0.8, carbohydrates: 15, fat: 0.4,
    vata_effect: 'Pacifies', pitta_effect: 'Aggravates', kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Sour', virya: 'Heating', vipaka: 'Sweet', guna: 'Heavy, Oily' }) },

  { name: 'Pomegranate', category: 'Fruits', calories: 83, protein: 1.7, carbohydrates: 19, fat: 1.2,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Astringent, Sour', virya: 'Cooling', vipaka: 'Sweet', guna: 'Light' }) },

  { name: 'Banana (Ripe)', category: 'Fruits', calories: 89, protein: 1.1, carbohydrates: 23, fat: 0.3,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Cooling', vipaka: 'Sweet', guna: 'Heavy, Oily' }) },

  { name: 'Amla (Indian Gooseberry)', category: 'Fruits', calories: 44, protein: 0.9, carbohydrates: 10, fat: 0.6,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sour, Sweet, Bitter, Pungent, Astringent', virya: 'Cooling', vipaka: 'Sweet', guna: 'Light, Dry' }) },

  { name: 'Lemon / Lime', category: 'Fruits', calories: 29, protein: 1.1, carbohydrates: 9, fat: 0.3,
    vata_effect: 'Pacifies', pitta_effect: 'Aggravates', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sour', virya: 'Heating', vipaka: 'Sour', guna: 'Light, Oily' }) },

  // ─── BEVERAGES ─────────────────────────────
  { name: 'Warm Ginger Water', category: 'Beverages', calories: 2, protein: 0, carbohydrates: 0.5, fat: 0,
    vata_effect: 'Pacifies', pitta_effect: 'Aggravates', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Pungent', virya: 'Heating', vipaka: 'Sweet', guna: 'Light, Sharp' }) },

  { name: 'Licorice Tea (Mulethi)', category: 'Beverages', calories: 10, protein: 0.2, carbohydrates: 2.5, fat: 0,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Cooling', vipaka: 'Sweet', guna: 'Heavy, Oily' }) },

  { name: 'Peppermint Infusion', category: 'Beverages', calories: 4, protein: 0.1, carbohydrates: 0.9, fat: 0.1,
    vata_effect: 'Aggravates', pitta_effect: 'Pacifies', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Pungent', virya: 'Cooling', vipaka: 'Pungent', guna: 'Light, Dry' }) },

  // ─── SWEETENERS & OILS ─────────────────────
  { name: 'Raw Honey', category: 'Sweeteners', calories: 304, protein: 0.3, carbohydrates: 82, fat: 0,
    vata_effect: 'Pacifies', pitta_effect: 'Aggravates', kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Astringent', virya: 'Heating', vipaka: 'Pungent', guna: 'Dry, Light' }) },

  { name: 'Coconut Oil', category: 'Oils', calories: 862, protein: 0, carbohydrates: 0, fat: 100,
    vata_effect: 'Pacifies', pitta_effect: 'Pacifies', kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Cooling', vipaka: 'Sweet', guna: 'Heavy, Oily' }) },

  { name: 'Sesame Oil (Til)', category: 'Oils', calories: 884, protein: 0, carbohydrates: 0, fat: 100,
    vata_effect: 'Pacifies', pitta_effect: 'Aggravates', kapha_effect: 'Neutral',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Bitter', virya: 'Heating', vipaka: 'Sweet', guna: 'Heavy, Oily' }) },
];


async function seed() {
  console.log('Starting seed process...');
  // Ensure tables exist
  await initDb();

  try {
    // 1. Seed Users (if empty)
    const usersCount = await query.get('SELECT COUNT(*) as count FROM users');
    if (usersCount.count === 0) {
      console.log('Seeding default users...');
      const dietitianHash = await bcrypt.hash('password123', 10);
      const clientHash = await bcrypt.hash('password123', 10);

      // Insert default Dietitian
      const dietitian = await query.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Dr. Aravind Sharma', 'dietitian@spartans.com', dietitianHash, 'dietitian']
      );

      // Insert default Client
      const client = await query.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Rohan Das', 'client@spartans.com', clientHash, 'client']
      );

      console.log(`Default users created. Dietitian ID: ${dietitian.id}, Client ID: ${client.id}`);

      // Seed a default patient record linked to the client
      await query.run(
        'INSERT INTO patients (dietitian_id, client_id, name, age, gender, phone, email, dosha, health_conditions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [dietitian.id, client.id, 'Rohan Das', 28, 'Male', '9876543210', 'client@spartans.com', 'Vata-Pitta', 'Indigestion, Insomnia']
      );
      console.log('Linked client user to dietitian patient database.');
    } else {
      console.log('Users already exist, skipping user seeding.');
    }

    // 2. Seed Foods (always refresh to pick up new entries)
    const foodsCount = await query.get('SELECT COUNT(*) as count FROM foods');
    if (foodsCount.count !== initialFoods.length) {
      console.log(`Re-seeding food database (${foodsCount.count} → ${initialFoods.length} foods)...`);
      await query.run('DELETE FROM foods');
      for (const food of initialFoods) {
        await query.run(
          `INSERT INTO foods (name, category, calories, protein, carbohydrates, fat, vata_effect, pitta_effect, kapha_effect, ayurvedic_properties)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [food.name, food.category, food.calories, food.protein, food.carbohydrates, food.fat,
           food.vata_effect, food.pitta_effect, food.kapha_effect, food.ayurvedic_properties]
        );
      }
      console.log(`Seeded ${initialFoods.length} food items.`);
    } else {
      console.log('Foods already up to date, skipping food seeding.');
    }

    console.log('Database seeding completed successfully.');
  } catch (err) {
    console.error('Error during seeding:', err.message);
  }
}

// Check if run directly
if (process.argv[1].endsWith('seed.js')) {
  seed();
}

export { seed };
