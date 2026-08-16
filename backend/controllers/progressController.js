import { query } from '../db/database.js';

// Helper to get patient ID from the authenticated user (client role)
async function getPatientIdForUser(userId) {
  const patient = await query.get('SELECT id FROM patients WHERE client_id = ?', [userId]);
  return patient ? patient.id : null;
}

export async function logProgress(req, res) {
  try {
    const { feeling, notes } = req.body;
    const patientId = await getPatientIdForUser(req.user.id);

    if (!patientId) {
      return res.status(404).json({ error: 'Patient profile not found for this user.' });
    }

    if (!feeling) {
      return res.status(400).json({ error: 'Feeling is required.' });
    }

    await query.run(
      'INSERT INTO progress_logs (patient_id, feeling, notes) VALUES (?, ?, ?)',
      [patientId, feeling, notes || '']
    );

    res.status(201).json({ message: 'Progress logged successfully.' });
  } catch (error) {
    console.error('Error logging progress:', error);
    res.status(500).json({ error: 'Failed to log progress.' });
  }
}

export async function getProgressStats(req, res) {
  try {
    const patientId = await getPatientIdForUser(req.user.id);

    if (!patientId) {
      return res.status(404).json({ error: 'Patient profile not found for this user.' });
    }

    const logs = await query.all(
      'SELECT feeling FROM progress_logs WHERE patient_id = ? ORDER BY created_at DESC',
      [patientId]
    );

    // Calculate adherence and Agni status based on logs
    let adherenceRate = 0;
    let agniStatus = 'Unknown';
    let sleepTime = 7.5; // Keeping this static for now as it's not logged in the form

    if (logs.length > 0) {
      const totalLogs = logs.length;
      let positiveLogs = 0;

      logs.forEach(log => {
        if (log.feeling === 'Light & Energized') positiveLogs++;
      });

      // Real adherence: percentage of positive check-ins out of total
      adherenceRate = Math.round((positiveLogs / totalLogs) * 100);

      // Agni status based on most recent log
      const recentFeeling = logs[0].feeling;
      if (recentFeeling === 'Light & Energized') agniStatus = 'Optimal';
      else if (recentFeeling === 'Heavy / Bloated') agniStatus = 'Sluggish';
      else agniStatus = 'Variable';
    } else {
      // No logs yet — show honest defaults
      adherenceRate = 0;
      agniStatus = 'Not Started';
    }

    res.json({ adherenceRate, agniStatus, sleepTime });
  } catch (error) {
    console.error('Error fetching progress stats:', error);
    res.status(500).json({ error: 'Failed to fetch progress stats.' });
  }
}
