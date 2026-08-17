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

// ── NEW: AI-powered Dinacharya generator (client-facing) ──────────────────────
export async function generateDinacharya(req, res) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const clientId = req.user.id;
    const patient = await query.get('SELECT * FROM patients WHERE client_id = ?', [clientId]);
    if (!patient) {
      return res.status(404).json({ error: 'Profile not found. Please complete your onboarding first.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    let onboardingData = {};
    try { onboardingData = JSON.parse(patient.onboarding_details || '{}'); } catch (e) {}

    const prompt = `
You are an expert Ayurvedic physician and lifestyle coach. Generate a highly personalized daily routine (Dinacharya) for this patient.

Patient Profile:
- Name: ${patient.name}
- Age: ${patient.age} years
- Dosha Type: ${patient.dosha || 'Vata-Pitta'}
- Health Conditions: ${patient.health_conditions || 'None'}
- Sleep Quality: ${onboardingData.lifestyle?.sleep || 'Variable'}
- Stress Level: ${onboardingData.lifestyle?.stress || 'Moderate'}
- Work Environment: ${onboardingData.lifestyle?.work || 'Hybrid'}
- Dietary Pattern: ${onboardingData.dietaryPattern || 'Vegetarian'}
- Primary Health Goal: ${onboardingData.intention || 'Improve Digestion'}
- Allergies: ${(onboardingData.allergies || []).join(', ') || 'None'}

IMPORTANT: For each health condition listed (e.g., Knee Pain, Diabetes, PCOS, Hypertension), provide SPECIFIC Ayurvedic activities and dietary advice. For example:
- Knee Pain → specific yoga poses safe for knees, anti-inflammatory foods, herbal remedies
- Diabetes → specific meal timing, foods to avoid, blood sugar regulating herbs
- PCOS → hormone-balancing routines, specific herbs

Return ONLY a valid JSON array (no markdown, no code block fences) in this exact format:
[
  {
    "time": "06:00 AM",
    "emoji": "🌅",
    "title": "Wake Up",
    "desc": "specific personalized description",
    "diseaseNote": "specific advice for their condition or empty string"
  }
]

Generate exactly 9 timeline items covering morning to night. Each item must be directly tailored to this patient's dosha and health conditions. The diseaseNote field should contain specific, actionable advice for their health condition(s), or empty string if not applicable to that time slot.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    let text = response.text.trim();
    // Strip any accidental markdown fences
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    let routine;
    try {
      routine = JSON.parse(text);
    } catch (e) {
      // Try to extract JSON array from response
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        routine = JSON.parse(match[0]);
      } else {
        throw new Error('AI returned invalid JSON: ' + text.substring(0, 200));
      }
    }

    res.json({ routine, dosha: patient.dosha, conditions: patient.health_conditions });

  } catch (error) {
    console.error('Error generating Dinacharya:', error);
    res.status(500).json({ error: 'Failed to generate personalized routine: ' + error.message });
  }
}
