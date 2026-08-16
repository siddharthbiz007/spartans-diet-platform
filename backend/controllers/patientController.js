import { query } from '../db/database.js';

export async function getAllPatients(req, res) {
  try {
    const dietitianId = req.user.id;
    const patients = await query.all(
      `SELECT p.*, u.id as linked_user_id 
       FROM patients p 
       LEFT JOIN users u ON p.client_id = u.id 
       WHERE p.dietitian_id = ? 
       ORDER BY p.id DESC`,
      [dietitianId]
    );
    res.json(patients);
  } catch (err) {
    console.error('getAllPatients error:', err);
    res.status(500).json({ error: 'Failed to fetch patients.' });
  }
}

export async function getPatientById(req, res) {
  try {
    const { id } = req.params;
    const dietitianId = req.user.id;

    const patient = await query.get(
      'SELECT * FROM patients WHERE id = ? AND dietitian_id = ?',
      [id, dietitianId]
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found or unauthorized.' });
    }

    const assessments = await query.all(
      'SELECT * FROM assessments WHERE patient_id = ? ORDER BY id DESC',
      [id]
    );

    const dietPlans = await query.all(
      'SELECT * FROM diet_plans WHERE patient_id = ? ORDER BY id DESC',
      [id]
    );

    res.json({
      ...patient,
      assessments,
      dietPlans
    });
  } catch (err) {
    console.error('getPatientById error:', err);
    res.status(500).json({ error: 'Failed to fetch patient details.' });
  }
}

export async function createPatient(req, res) {
  try {
    const dietitianId = req.user.id;
    const { name, age, gender, phone, email, health_conditions } = req.body;

    if (!name || !age || !gender) {
      return res.status(400).json({ error: 'Name, age, and gender are required.' });
    }

    let clientId = null;
    if (email) {
      const linkedUser = await query.get("SELECT id FROM users WHERE email = ? AND role = 'client'", [email]);
      if (linkedUser) {
        clientId = linkedUser.id;
      }
    }

    const result = await query.run(
      `INSERT INTO patients (dietitian_id, client_id, name, age, gender, phone, email, health_conditions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [dietitianId, clientId, name, age, gender, phone, email, health_conditions || '']
    );

    if (clientId) {
      await query.run('UPDATE patients SET dietitian_id = ? WHERE client_id = ?', [dietitianId, clientId]);
    }

    res.status(201).json({
      message: 'Patient profile created successfully.',
      patientId: result.id
    });
  } catch (err) {
    console.error('createPatient error:', err);
    res.status(500).json({ error: 'Failed to create patient profile.' });
  }
}

export async function updatePatient(req, res) {
  try {
    const { id } = req.params;
    const dietitianId = req.user.id;
    const { name, age, gender, phone, email, health_conditions, dosha } = req.body;

    const patient = await query.get('SELECT * FROM patients WHERE id = ? AND dietitian_id = ?', [id, dietitianId]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found or unauthorized.' });
    }

    await query.run(
      `UPDATE patients 
       SET name = ?, age = ?, gender = ?, phone = ?, email = ?, health_conditions = ?, dosha = ? 
       WHERE id = ?`,
      [name || patient.name, age || patient.age, gender || patient.gender, phone || patient.phone, email || patient.email, health_conditions || patient.health_conditions, dosha || patient.dosha, id]
    );

    res.json({ message: 'Patient profile updated successfully.' });
  } catch (err) {
    console.error('updatePatient error:', err);
    res.status(500).json({ error: 'Failed to update patient profile.' });
  }
}

export async function deletePatient(req, res) {
  try {
    const { id } = req.params;
    const dietitianId = req.user.id;

    const patient = await query.get('SELECT * FROM patients WHERE id = ? AND dietitian_id = ?', [id, dietitianId]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found or unauthorized.' });
    }

    await query.run('DELETE FROM patients WHERE id = ?', [id]);
    await query.run('DELETE FROM assessments WHERE patient_id = ?', [id]);
    await query.run('DELETE FROM diet_plans WHERE patient_id = ?', [id]);

    res.json({ message: 'Patient and all associated records deleted successfully.' });
  } catch (err) {
    console.error('deletePatient error:', err);
    res.status(500).json({ error: 'Failed to delete patient.' });
  }
}

export async function getClientProfile(req, res) {
  try {
    const clientId = req.user.id;

    const patient = await query.get(
      `SELECT p.*, d.name as dietitian_name, d.email as dietitian_email 
       FROM patients p 
       LEFT JOIN users d ON p.dietitian_id = d.id 
       WHERE p.client_id = ?`,
      [clientId]
    );

    if (!patient) {
      return res.status(404).json({ error: 'Client profile not found.' });
    }

    const assessments = await query.all(
      'SELECT * FROM assessments WHERE patient_id = ? ORDER BY id DESC',
      [patient.id]
    );

    const dietPlans = await query.all(
      "SELECT * FROM diet_plans WHERE patient_id = ? AND status = 'Active' ORDER BY id DESC",
      [patient.id]
    );

    res.json({
      profile: patient,
      assessments,
      dietPlans
    });
  } catch (err) {
    console.error('getClientProfile error:', err);
    res.status(500).json({ error: 'Failed to fetch client profile.' });
  }
}

// Update client onboarding profile and automatically calculate Dosha and generate diet plan
export async function updateClientProfile(req, res) {
  try {
    const clientId = req.user.id;
    const { name, age, gender, height, weight, location, onboarding_details, answers } = req.body;

    // 1. Fetch or create patient profile
    let patient = await query.get('SELECT * FROM patients WHERE client_id = ?', [clientId]);
    
    if (!patient) {
      const defaultDietitian = await query.get("SELECT id FROM users WHERE role = 'dietitian' ORDER BY id ASC LIMIT 1");
      const dietitianId = defaultDietitian ? defaultDietitian.id : 1;
      
      const newPatient = await query.run(
        'INSERT INTO patients (dietitian_id, client_id, name, age, gender, email) VALUES (?, ?, ?, ?, ?, ?)',
        [dietitianId, clientId, name || req.user.name, age || 0, gender || 'Not Specified', req.user.email]
      );
      patient = await query.get('SELECT * FROM patients WHERE id = ?', [newPatient.id]);
    }

    const patientId = patient.id;

    // 2. Compute Dosha and save assessment if answers are provided
    let calculatedDosha = patient.dosha;
    if (answers && typeof answers === 'object' && Object.keys(answers).length > 0) {
      let vataScore = 0;
      let pittaScore = 0;
      let kaphaScore = 0;

      Object.values(answers).forEach((val) => {
        const lowerVal = val.toLowerCase();
        if (lowerVal === 'vata') vataScore++;
        else if (lowerVal === 'pitta') pittaScore++;
        else if (lowerVal === 'kapha') kaphaScore++;
      });

      const total = vataScore + pittaScore + kaphaScore;
      if (total > 0) {
        const vataPct = Math.round((vataScore / total) * 100);
        const pittaPct = Math.round((pittaScore / total) * 100);
        const kaphaPct = Math.round((kaphaScore / total) * 100);

        let dominant = '';
        const scores = [
          { name: 'Vata', score: vataPct },
          { name: 'Pitta', score: pittaPct },
          { name: 'Kapha', score: kaphaPct }
        ];
        scores.sort((a, b) => b.score - a.score);

        if (scores[0].score - scores[1].score > 15) {
          dominant = scores[0].name;
        } else {
          dominant = `${scores[0].name}-${scores[1].name}`;
        }

        calculatedDosha = dominant;

        // Save assessment record
        await query.run(
          'INSERT INTO assessments (patient_id, answers, dosha_result) VALUES (?, ?, ?)',
          [patientId, JSON.stringify(answers), `${dominant} (Vata: ${vataPct}%, Pitta: ${pittaPct}%, Kapha: ${kaphaPct}%)`]
        );
      }
    }

    // 3. Update patient data
    await query.run(
      `UPDATE patients 
       SET name = ?, age = ?, gender = ?, height = ?, weight = ?, location = ?, dosha = ?, onboarding_details = ?, health_conditions = ?
       WHERE id = ?`,
      [
        name || patient.name,
        age || patient.age,
        gender || patient.gender,
        height || patient.height,
        weight || patient.weight,
        location || patient.location,
        calculatedDosha,
        JSON.stringify(onboarding_details),
        onboarding_details.allergies ? onboarding_details.allergies.join(', ') : patient.health_conditions,
        patientId
      ]
    );

    // 4. Auto-generate diet plan based on Dosha, cuisine, and dietary pattern
    if (calculatedDosha) {
      // Set previous active plans to Archived
      await query.run("UPDATE diet_plans SET status = 'Archived' WHERE patient_id = ? AND status = 'Active'", [patientId]);

      // Fetch all foods from db
      const allFoods = await query.all('SELECT * FROM foods');
      const parsedFoods = allFoods.map(f => ({
        ...f,
        ayurvedic_properties: JSON.parse(f.ayurvedic_properties)
      }));

      // Helper to check if a food pacifies the client's dominant Dosha
      const isDoshaFriendly = (food) => {
        if (calculatedDosha.includes('Vata') && food.vata_effect === 'Pacifies') return true;
        if (calculatedDosha.includes('Pitta') && food.pitta_effect === 'Pacifies') return true;
        if (calculatedDosha.includes('Kapha') && food.kapha_effect === 'Pacifies') return true;
        return false;
      };

      // Helper to check dietary pattern limits
      const isDietPatternFriendly = (food) => {
        const dietPattern = onboarding_details.dietaryPattern?.toLowerCase() || 'vegetarian';
        if (dietPattern === 'vegan') {
          return food.category !== 'Dairy'; // Warm Ginger Water, Grains, Vegetables, Spices, Nuts
        } else if (dietPattern === 'vegetarian' || dietPattern === 'eggetarian') {
          return true; // We don't have meat items in seed foods anyway
        }
        return true;
      };

      const friendlyFoods = parsedFoods.filter(f => isDoshaFriendly(f) && isDietPatternFriendly(f));

      // Build meals (Selecting fallback if no friendly foods match categories)
      const selectFood = (category, fallbackId) => {
        const matches = friendlyFoods.filter(f => f.category === category);
        if (matches.length > 0) return matches[Math.floor(Math.random() * matches.length)];
        return parsedFoods.find(f => f.id === fallbackId) || parsedFoods[0];
      };

      // Breakfast selection (Grain + Nut)
      const bGrain = selectFood('Grains', 11); // Oatmeal fallback
      const bNut = selectFood('Nuts', 8); // Soaked Almonds fallback

      // Lunch selection (Grain + Lentil + Veg)
      const lGrain = selectFood('Grains', 2); // Basmati Rice
      const lLentil = selectFood('Lentils', 1); // Mung Dal
      const lVeg = selectFood('Vegetables', 12); // Steamed Carrots

      // Dinner selection (Lentil + Veg)
      const dLentil = selectFood('Lentils', 1); // Mung Dal
      const dVeg = selectFood('Vegetables', 5); // Cooked Spinach

      // Snacks selection (Beverages / Sweeteners)
      const sBev = selectFood('Beverages', 4); // Ginger Water
      const sSweet = selectFood('Sweeteners', 10); // Raw Honey

      const mealStructures = {
        breakfast: [
          { name: bGrain.name, calories: bGrain.calories, protein: bGrain.protein, carbohydrates: bGrain.carbohydrates, fat: bGrain.fat, quantity: '1 bowl', multiplier: 1.0, vata_effect: bGrain.vata_effect, pitta_effect: bGrain.pitta_effect, kapha_effect: bGrain.kapha_effect },
          { name: bNut.name, calories: bNut.calories, protein: bNut.protein, carbohydrates: bNut.carbohydrates, fat: bNut.fat, quantity: '5 pieces', multiplier: 0.5, vata_effect: bNut.vata_effect, pitta_effect: bNut.pitta_effect, kapha_effect: bNut.kapha_effect }
        ],
        lunch: [
          { name: lGrain.name, calories: lGrain.calories, protein: lGrain.protein, carbohydrates: lGrain.carbohydrates, fat: lGrain.fat, quantity: '1 bowl', multiplier: 1.0, vata_effect: lGrain.vata_effect, pitta_effect: lGrain.pitta_effect, kapha_effect: lGrain.kapha_effect },
          { name: lLentil.name, calories: lLentil.calories, protein: lLentil.protein, carbohydrates: lLentil.carbohydrates, fat: lLentil.fat, quantity: '1 cup', multiplier: 1.0, vata_effect: lLentil.vata_effect, pitta_effect: lLentil.pitta_effect, kapha_effect: lLentil.kapha_effect },
          { name: lVeg.name, calories: lVeg.calories, protein: lVeg.protein, carbohydrates: lVeg.carbohydrates, fat: lVeg.fat, quantity: '1 plate', multiplier: 1.0, vata_effect: lVeg.vata_effect, pitta_effect: lVeg.pitta_effect, kapha_effect: lVeg.kapha_effect }
        ],
        dinner: [
          { name: dLentil.name, calories: dLentil.calories, protein: dLentil.protein, carbohydrates: dLentil.carbohydrates, fat: dLentil.fat, quantity: '1 cup', multiplier: 0.8, vata_effect: dLentil.vata_effect, pitta_effect: dLentil.pitta_effect, kapha_effect: dLentil.kapha_effect },
          { name: dVeg.name, calories: dVeg.calories, protein: dVeg.protein, carbohydrates: dVeg.carbohydrates, fat: dVeg.fat, quantity: '1 plate', multiplier: 0.8, vata_effect: dVeg.vata_effect, pitta_effect: dVeg.pitta_effect, kapha_effect: dVeg.kapha_effect }
        ],
        snacks: [
          { name: sBev.name, calories: sBev.calories, protein: sBev.protein, carbohydrates: sBev.carbohydrates, fat: sBev.fat, quantity: '1 glass', multiplier: 1.0, vata_effect: sBev.vata_effect, pitta_effect: sBev.pitta_effect, kapha_effect: sBev.kapha_effect },
          { name: sSweet.name, calories: sSweet.calories, protein: sSweet.protein, carbohydrates: sSweet.carbohydrates, fat: sSweet.fat, quantity: '1 teaspoon', multiplier: 0.5, vata_effect: sSweet.vata_effect, pitta_effect: sSweet.pitta_effect, kapha_effect: sSweet.kapha_effect }
        ]
      };

      // Calculate totals
      let cals = 0, prot = 0, carb = 0, f = 0;
      Object.values(mealStructures).forEach(arr => {
        arr.forEach(item => {
          cals += item.calories * item.multiplier;
          prot += item.protein * item.multiplier;
          carb += item.carbohydrates * item.multiplier;
          f += item.fat * item.multiplier;
        });
      });

      const targets = { calories: 1800, protein: 60, carbohydrates: 220, fat: 50 };
      const actuals = { calories: cals, protein: prot, carbohydrates: carb, fat: f };

      const planName = `${calculatedDosha} Balancing Auto-Plan`;
      const ayurvedicNotes = `This plan is automatically generated to balance your dominant ${calculatedDosha} constitution. \n- Primary Intention: ${onboarding_details.intention || 'General Health'}\n- Avoid raw food after dark.\n- Drink warm water with meals.`;

      // Save plan
      await query.run(
        `INSERT INTO diet_plans (patient_id, dietitian_id, plan_name, meals, nutrients_target, nutrients_actual, ayurvedic_notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
        [patientId, patient.dietitian_id, planName, JSON.stringify(mealStructures), JSON.stringify(targets), JSON.stringify(actuals), ayurvedicNotes]
      );
    }

    res.json({ message: 'Onboarding profile updated and diet plan generated successfully.' });
  } catch (err) {
    console.error('updateClientProfile error:', err);
    res.status(500).json({ error: 'Failed to update onboarding profile.' });
  }
}
