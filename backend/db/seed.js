import bcrypt from 'bcryptjs';
import { query, initDb } from './database.js';

const initialFoods = [
  {
    name: 'Mung Dal (Green Gram)',
    category: 'Lentils',
    calories: 347,
    protein: 24,
    carbohydrates: 63,
    fat: 1.15,
    vata_effect: 'Pacifies',
    pitta_effect: 'Pacifies',
    kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Astringent', virya: 'Cooling', vipaka: 'Sweet', guna: 'Light, Dry' })
  },
  {
    name: 'Basmati Rice (White)',
    category: 'Grains',
    calories: 350,
    protein: 7,
    carbohydrates: 78,
    fat: 0.5,
    vata_effect: 'Pacifies',
    pitta_effect: 'Pacifies',
    kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Cooling', vipaka: 'Sweet', guna: 'Light, Soft' })
  },
  {
    name: 'Ghee (Clarified Butter)',
    category: 'Dairy',
    calories: 900,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    vata_effect: 'Pacifies',
    pitta_effect: 'Pacifies',
    kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Cooling', vipaka: 'Sweet', guna: 'Oily, Soft' })
  },
  {
    name: 'Warm Ginger Water',
    category: 'Beverages',
    calories: 2,
    protein: 0,
    carbohydrates: 0.5,
    fat: 0,
    vata_effect: 'Pacifies',
    pitta_effect: 'Aggravates',
    kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Pungent', virya: 'Heating', vipaka: 'Sweet', guna: 'Light, Sharp' })
  },
  {
    name: 'Cooked Spinach',
    category: 'Vegetables',
    calories: 23,
    protein: 2.9,
    carbohydrates: 3.6,
    fat: 0.4,
    vata_effect: 'Pacifies',
    pitta_effect: 'Pacifies',
    kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Astringent, Sweet, Bitter', virya: 'Cooling', vipaka: 'Pungent', guna: 'Heavy, Dry' })
  },
  {
    name: 'Cumin Seeds',
    category: 'Spices',
    calories: 375,
    protein: 18,
    carbohydrates: 44,
    fat: 22,
    vata_effect: 'Pacifies',
    pitta_effect: 'Pacifies',
    kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Pungent, Bitter', virya: 'Heating', vipaka: 'Pungent', guna: 'Light, Dry' })
  },
  {
    name: 'Turmeric Powder',
    category: 'Spices',
    calories: 354,
    protein: 8,
    carbohydrates: 65,
    fat: 10,
    vata_effect: 'Pacifies',
    pitta_effect: 'Pacifies',
    kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Bitter, Pungent, Astringent', virya: 'Heating', vipaka: 'Pungent', guna: 'Dry, Light' })
  },
  {
    name: 'Soaked Almonds (Peeled)',
    category: 'Nuts',
    calories: 579,
    protein: 21,
    carbohydrates: 22,
    fat: 49,
    vata_effect: 'Pacifies',
    pitta_effect: 'Pacifies',
    kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Warming', vipaka: 'Sweet', guna: 'Heavy, Oily' })
  },
  {
    name: 'Spiced Buttermilk (Takra)',
    category: 'Dairy',
    calories: 40,
    protein: 3,
    carbohydrates: 4.8,
    fat: 1,
    vata_effect: 'Pacifies',
    pitta_effect: 'Pacifies',
    kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sour, Sweet, Astringent', virya: 'Heating', vipaka: 'Sweet', guna: 'Light, Dry' })
  },
  {
    name: 'Raw Honey',
    category: 'Sweeteners',
    calories: 304,
    protein: 0.3,
    carbohydrates: 82,
    fat: 0,
    vata_effect: 'Pacifies',
    pitta_effect: 'Aggravates',
    kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Astringent', virya: 'Heating', vipaka: 'Pungent', guna: 'Dry, Light' })
  },
  {
    name: 'Oatmeal (Warm)',
    category: 'Grains',
    calories: 150,
    protein: 5,
    carbohydrates: 27,
    fat: 2.5,
    vata_effect: 'Pacifies',
    pitta_effect: 'Pacifies',
    kapha_effect: 'Aggravates',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet', virya: 'Neutral', vipaka: 'Sweet', guna: 'Heavy, Oily' })
  },
  {
    name: 'Steamed Carrots',
    category: 'Vegetables',
    calories: 35,
    protein: 0.8,
    carbohydrates: 8,
    fat: 0.2,
    vata_effect: 'Pacifies',
    pitta_effect: 'Pacifies',
    kapha_effect: 'Pacifies',
    ayurvedic_properties: JSON.stringify({ rasa: 'Sweet, Bitter', virya: 'Heating', vipaka: 'Sweet', guna: 'Light' })
  }
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

    // 2. Seed Foods (if empty)
    const foodsCount = await query.get('SELECT COUNT(*) as count FROM foods');
    if (foodsCount.count === 0) {
      console.log('Seeding food and nutrient database...');
      for (const food of initialFoods) {
        await query.run(
          `INSERT INTO foods (name, category, calories, protein, carbohydrates, fat, vata_effect, pitta_effect, kapha_effect, ayurvedic_properties)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            food.name,
            food.category,
            food.calories,
            food.protein,
            food.carbohydrates,
            food.fat,
            food.vata_effect,
            food.pitta_effect,
            food.kapha_effect,
            food.ayurvedic_properties
          ]
        );
      }
      console.log(`Seeded ${initialFoods.length} food items.`);
    } else {
      console.log('Foods already exist, skipping food seeding.');
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
