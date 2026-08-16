import { query } from '../db/database.js';

export async function getFoods(req, res) {
  try {
    const foods = await query.all('SELECT * FROM foods ORDER BY name ASC');
    // Parse the properties JSON string
    const parsedFoods = foods.map(f => ({
      ...f,
      ayurvedic_properties: JSON.parse(f.ayurvedic_properties)
    }));
    res.json(parsedFoods);
  } catch (err) {
    console.error('getFoods error:', err);
    res.status(500).json({ error: 'Failed to fetch food items.' });
  }
}

export async function createDietPlan(req, res) {
  try {
    const dietitianId = req.user.id;
    const { patientId, planName, meals, nutrientsTarget, nutrientsActual, ayurvedicNotes } = req.body;

    if (!patientId || !planName || !meals || !nutrientsTarget || !nutrientsActual) {
      return res.status(400).json({ error: 'Missing required fields for diet plan.' });
    }

    // Verify patient is managed by this dietitian
    const patient = await query.get('SELECT * FROM patients WHERE id = ? AND dietitian_id = ?', [patientId, dietitianId]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found or unauthorized.' });
    }

    // Set any other active plans for this patient to "Archived" so only one plan is active at a time
    await query.run(
      "UPDATE diet_plans SET status = 'Archived' WHERE patient_id = ? AND status = 'Active'",
      [patientId]
    );

    // Save new diet plan
    const result = await query.run(
      `INSERT INTO diet_plans (patient_id, dietitian_id, plan_name, meals, nutrients_target, nutrients_actual, ayurvedic_notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [
        patientId,
        dietitianId,
        planName,
        JSON.stringify(meals),
        JSON.stringify(nutrientsTarget),
        JSON.stringify(nutrientsActual),
        ayurvedicNotes || ''
      ]
    );

    res.status(201).json({
      message: 'Diet plan created and activated successfully.',
      dietPlanId: result.id
    });
  } catch (err) {
    console.error('createDietPlan error:', err);
    res.status(500).json({ error: 'Failed to create diet plan.' });
  }
}

export async function getDietPlansByPatient(req, res) {
  try {
    const { patientId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check authorization
    let patient;
    if (userRole === 'dietitian') {
      patient = await query.get('SELECT * FROM patients WHERE id = ? AND dietitian_id = ?', [patientId, userId]);
    } else {
      patient = await query.get('SELECT * FROM patients WHERE id = ? AND client_id = ?', [patientId, userId]);
    }

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found or unauthorized.' });
    }

    const plans = await query.all(
      'SELECT * FROM diet_plans WHERE patient_id = ? ORDER BY id DESC',
      [patientId]
    );

    const parsedPlans = plans.map(p => ({
      ...p,
      meals: JSON.parse(p.meals),
      nutrients_target: JSON.parse(p.nutrients_target),
      nutrients_actual: JSON.parse(p.nutrients_actual)
    }));

    res.json(parsedPlans);
  } catch (err) {
    console.error('getDietPlansByPatient error:', err);
    res.status(500).json({ error: 'Failed to fetch diet plans.' });
  }
}

export async function updateDietPlanStatus(req, res) {
  try {
    const { id } = req.params;
    const dietitianId = req.user.id;
    const { status } = req.body;

    if (!status || !['Active', 'Completed', 'Archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "Active", "Completed", or "Archived".' });
    }

    // Verify ownership
    const plan = await query.get('SELECT * FROM diet_plans WHERE id = ? AND dietitian_id = ?', [id, dietitianId]);
    if (!plan) {
      return res.status(404).json({ error: 'Diet plan not found or unauthorized.' });
    }

    // If changing to active, archive other active plans for this patient
    if (status === 'Active') {
      await query.run(
        "UPDATE diet_plans SET status = 'Archived' WHERE patient_id = ? AND status = 'Active'",
        [plan.patient_id]
      );
    }

    await query.run('UPDATE diet_plans SET status = ? WHERE id = ?', [status, id]);

    res.json({ message: `Diet plan status updated to ${status}.` });
  } catch (err) {
    console.error('updateDietPlanStatus error:', err);
    res.status(500).json({ error: 'Failed to update diet plan status.' });
  }
}
