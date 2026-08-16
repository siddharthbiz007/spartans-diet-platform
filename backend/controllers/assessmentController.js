import { query } from '../db/database.js';

export async function submitAssessment(req, res) {
  try {
    const { patientId, answers } = req.body; // answers is an object mapping question ID (1 to 10) to 'vata', 'pitta', or 'kapha'

    if (!patientId || !answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Patient ID and answers questionnaire are required.' });
    }

    // Verify patient exists and is accessible
    // If user is a dietitian, check if they own this patient.
    // If user is a client, check if this patient record is linked to their client ID.
    const userRole = req.user.role;
    const userId = req.user.id;
    let patient;

    if (userRole === 'dietitian') {
      patient = await query.get('SELECT * FROM patients WHERE id = ? AND dietitian_id = ?', [patientId, userId]);
    } else {
      patient = await query.get('SELECT * FROM patients WHERE id = ? AND client_id = ?', [patientId, userId]);
    }

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found or unauthorized.' });
    }

    // Calculate Dosha score
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
    if (total === 0) {
      return res.status(400).json({ error: 'Invalid answers format. Must score vata, pitta, or kapha.' });
    }

    // Calculate percentages — derive kapha as remainder to prevent rounding to 101%
    const vataPct = Math.round((vataScore / total) * 100);
    const pittaPct = Math.round((pittaScore / total) * 100);
    const kaphaPct = 100 - vataPct - pittaPct;

    // Determine dominant Dosha
    let dominantDosha = '';
    const scores = [
      { name: 'Vata', score: vataPct },
      { name: 'Pitta', score: pittaPct },
      { name: 'Kapha', score: kaphaPct }
    ];

    // Sort descending
    scores.sort((a, b) => b.score - a.score);

    // If the top score is significantly higher (> 15% difference than the second), it's single dominant
    if (scores[0].score - scores[1].score > 15) {
      dominantDosha = scores[0].name;
    } else {
      // Otherwise, it's a dual-dosha (e.g., "Vata-Pitta" or "Pitta-Kapha")
      dominantDosha = `${scores[0].name}-${scores[1].name}`;
    }

    // Save assessment record
    const result = await query.run(
      'INSERT INTO assessments (patient_id, answers, dosha_result) VALUES (?, ?, ?)',
      [patientId, JSON.stringify(answers), `${dominantDosha} (Vata: ${vataPct}%, Pitta: ${pittaPct}%, Kapha: ${kaphaPct}%)`]
    );

    // Update the patient's profile with their dominant Dosha
    await query.run('UPDATE patients SET dosha = ? WHERE id = ?', [dominantDosha, patientId]);

    res.status(201).json({
      message: 'Assessment submitted successfully.',
      assessmentId: result.id,
      result: {
        dominantDosha,
        vataPct,
        pittaPct,
        kaphaPct
      }
    });
  } catch (err) {
    console.error('submitAssessment error:', err);
    res.status(500).json({ error: 'Failed to process assessment.' });
  }
}

export async function getAssessmentHistory(req, res) {
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

    const assessments = await query.all(
      'SELECT * FROM assessments WHERE patient_id = ? ORDER BY id DESC',
      [patientId]
    );

    // Parse answers back to JSON
    const parsed = assessments.map(a => ({
      ...a,
      answers: JSON.parse(a.answers)
    }));

    res.json(parsed);
  } catch (err) {
    console.error('getAssessmentHistory error:', err);
    res.status(500).json({ error: 'Failed to fetch assessment history.' });
  }
}
