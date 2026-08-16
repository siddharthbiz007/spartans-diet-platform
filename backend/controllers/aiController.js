import { query } from '../db/database.js';
import { GoogleGenAI } from '@google/genai';

export async function generateClientReport(req, res) {
  try {
    const { patientId } = req.params;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // 1. Fetch patient profile
    const patient = await query.get('SELECT * FROM patients WHERE id = ?', [patientId]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // 2. Fetch assessments
    const assessments = await query.all('SELECT * FROM assessments WHERE patient_id = ? ORDER BY created_at DESC', [patientId]);
    
    // 3. Fetch current diet plan
    const dietPlans = await query.all('SELECT * FROM diet_plans WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1', [patientId]);
    
    const latestAssessment = assessments.length > 0 ? assessments[0] : null;
    const latestPlan = dietPlans.length > 0 ? dietPlans[0] : null;

    // 4. Construct Prompt
    const prompt = `
Act as an expert Ayurvedic Dietitian and Clinical Nutritionist.
Please analyze the following patient data and provide a comprehensive, structured report in Markdown format.

Patient Profile:
- Name: ${patient.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Assessed Dosha: ${patient.dosha || 'Unknown'}
- Health Conditions: ${patient.health_conditions || 'None reported'}
- Onboarding Details (Habits, Preferences): ${patient.onboarding_details ? patient.onboarding_details : 'Not provided'}

Latest Dosha Assessment Result:
${latestAssessment ? latestAssessment.dosha_result : 'No assessment data available.'}

Current Diet Plan Outline:
${latestPlan ? latestPlan.meals : 'No active diet plan.'}

Please structure your report into the following sections:
## 1. Dosha & Prakriti Analysis
## 2. Dietary Evaluation (Strengths & Areas for Improvement)
## 3. Ayurvedic Lifestyle Recommendations (Dinacharya)
## 4. Key Nutritional Focus
    `;

    // 5. Call Gemini
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    res.json({ report: response.text });

  } catch (error) {
    console.error('Error generating AI report:', error);
    res.status(500).json({ error: 'Failed to generate AI report' });
  }
}
