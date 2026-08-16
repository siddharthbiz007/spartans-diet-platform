import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { ArrowLeft, ArrowRight, Check, Award, AlertCircle } from 'lucide-react';

const QUESTIONS = [
  {
    id: 1,
    title: "Body Frame & Joints Structure",
    options: [
      { type: "vata", text: "Slender, tall or very short, prominent joints and cracking bones" },
      { type: "pitta", text: "Medium build, muscular, balanced proportion, highly flexible joints" },
      { type: "kapha", text: "Broad frame, thick bones, tends to gain weight easily, sturdy joints" }
    ]
  },
  {
    id: 2,
    title: "Skin Texture & Complexity",
    options: [
      { type: "vata", text: "Dry, rough, thin skin, cool to touch, easily gets chapped" },
      { type: "pitta", text: "Soft, warm, slightly oily, reddish tone, freckles, sensitive to sun" },
      { type: "kapha", text: "Thick, oily, cool, smooth, soft, fair or pale complexion" }
    ]
  },
  {
    id: 3,
    title: "Hair Characteristics",
    options: [
      { type: "vata", text: "Dry, frizzy, brittle, coarse, dark, grows slowly" },
      { type: "pitta", text: "Fine, soft, straight, thin, early graying or thinning" },
      { type: "kapha", text: "Thick, abundant, wavy, dark, shiny, well-lubricated" }
    ]
  },
  {
    id: 4,
    title: "Appetite & Digestion Habits",
    options: [
      { type: "vata", text: "Irregular appetite, digests variable, frequent bloating or gas" },
      { type: "pitta", text: "Intense hunger, must eat on schedule, high acidity, strong digestion" },
      { type: "kapha", text: "Moderate but constant hunger, slow metabolism, feels heavy after eating" }
    ]
  },
  {
    id: 5,
    title: "Sleep Quality & Patterns",
    options: [
      { type: "vata", text: "Light sleeper, easily disturbed, wakes up anxious, frequent insomnia" },
      { type: "pitta", text: "Moderate sleeper, sound sleep, wakes up hot but refreshed" },
      { type: "kapha", text: "Deep, heavy sleeper, sleeps long hours, hard to wake up, feels groggy" }
    ]
  },
  {
    id: 6,
    title: "Response to Stress & Emotion",
    options: [
      { type: "vata", text: "Responds with anxiety, fear, worry, nervousness, and overthinking" },
      { type: "pitta", text: "Responds with anger, irritability, impatience, and aggressive behavior" },
      { type: "kapha", text: "Responds calmly, slows down, avoids conflict, behaves stubbornly" }
    ]
  },
  {
    id: 7,
    title: "Weather Preferences",
    options: [
      { type: "vata", text: "Strongly dislikes cold, wind, and dry weather; loves warmth" },
      { type: "pitta", text: "Strongly dislikes hot weather and direct sun; loves cool breezes" },
      { type: "kapha", text: "Strongly dislikes damp, cold, and cloudy weather; loves dry heat" }
    ]
  },
  {
    id: 8,
    title: "Physical Pace & Activity",
    options: [
      { type: "vata", text: "Quick, hyperactive, walks fast, talks fast, constantly moving" },
      { type: "pitta", text: "Goal-oriented, intense, walks with purpose, competitive, medium pace" },
      { type: "kapha", text: "Slow, steady, deliberate movements, hates rushing, relaxed pace" }
    ]
  },
  {
    id: 9,
    title: "Memory & Learning Style",
    options: [
      { type: "vata", text: "Learns very quickly, forgets quickly; mind easily wanders" },
      { type: "pitta", text: "Sharp intellect, understands quickly, remembers long term, highly organized" },
      { type: "kapha", text: "Learns slowly but retains information forever; deliberate recall" }
    ]
  },
  {
    id: 10,
    title: "Joints and Movement Stability",
    options: [
      { type: "vata", text: "Bony joints, crack easily, prone to dryness and stiffness" },
      { type: "pitta", text: "Medium, moderately loose, flexible, skin is warm" },
      { type: "kapha", text: "Well-lubricated, strong, covered, movement is slow and stable" }
    ]
  }
];

export default function AssessmentPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [patientName, setPatientName] = useState('Patient');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatientName();
  }, []);

  async function fetchPatientName() {
    try {
      // Find patient details
      const res = await fetch(`${API_URL}/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        const pat = list.find(p => p.id === parseInt(patientId));
        if (pat) {
          setPatientName(pat.name);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleSelectOption = (optionType) => {
    setAnswers(prev => ({
      ...prev,
      [QUESTIONS[currentStep].id]: optionType
    }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError('');

    // Check that all questions are answered
    if (Object.keys(answers).length < QUESTIONS.length) {
      setError('Please answer all 10 questions before submitting.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: parseInt(patientId),
          answers
        })
      });

      const data = await res.json();
      if (res.ok) {
        setResults(data.result);
      } else {
        setError(data.error || 'Failed to submit assessment.');
      }
    } catch (err) {
      setError('Connection failure during Prakriti analysis.');
    } finally {
      setLoading(false);
    }
  };

  const activeQuestion = QUESTIONS[currentStep];
  const selectedOption = answers[activeQuestion.id];
  const progressPct = ((currentStep + 1) / QUESTIONS.length) * 100;

  if (results) {
    return (
      <div className="quiz-container fade-in">
        <div className="card results-card">
          <Award size={64} style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Assessment Completed!</h2>
          <p style={{ color: 'var(--text-muted)' }}>Prakriti & Dosha distribution for <strong>{patientName}</strong></p>

          <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'rgba(26,66,32,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}>
              Dominant Dosha: <span style={{ color: 'var(--secondary-color)' }}>{results.dominantDosha}</span>
            </h3>
          </div>

          <div className="dosha-donut-container">
            <div className="dosha-score-circle">
              <div className="circle-score vata">{results.vataPct}%</div>
              <strong style={{ color: 'var(--primary-color)' }}>Vata</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Air & Ether</span>
            </div>

            <div className="dosha-score-circle">
              <div className="circle-score pitta">{results.pittaPct}%</div>
              <strong style={{ color: 'var(--secondary-color)' }}>Pitta</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fire & Water</span>
            </div>

            <div className="dosha-score-circle">
              <div className="circle-score kapha">{results.kaphaPct}%</div>
              <strong style={{ color: 'var(--primary-dark)' }}>Kapha</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Earth & Water</span>
            </div>
          </div>

          <div style={{ textAlign: 'left', fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.dominantDosha.includes('Vata') && (
              <p>
                <strong>Vata Recommendations:</strong> Focus on warm, cooked, nourishing foods. Add digestive spices (like ginger, cumin, cardamom). Favor sweet, sour, and salty tastes. Limit raw salads, dry food, and cold beverages.
              </p>
            )}
            {results.dominantDosha.includes('Pitta') && (
              <p>
                <strong>Pitta Recommendations:</strong> Focus on cooling, refreshing, and calming foods. Favor sweet, bitter, and astringent tastes. Limit hot spices, garlic, tomatoes, vinegar, and fried foods. Keep hydrated.
              </p>
            )}
            {results.dominantDosha.includes('Kapha') && (
              <p>
                <strong>Kapha Recommendations:</strong> Focus on light, warm, dry, and stimulating foods. Favor pungent, bitter, and astringent tastes. Limit heavy sweets, dairy products, cold desserts, and oily food. Warm ginger tea is highly recommended.
              </p>
            )}
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: '2.5rem' }}>
            Back to Patients Registry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-text" onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <span style={{ color: 'var(--text-muted)' }}>Prakriti Quiz for <strong>{patientName}</strong></span>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(progressPct)}% Completed</span>
        </div>

        <div className="quiz-progress">
          <div className="quiz-progress-bar" style={{ width: `${progressPct}%` }}></div>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(198,40,40,0.05)', color: 'var(--danger-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <h3 className="quiz-question-title">{activeQuestion.title}</h3>

        <div className="quiz-options">
          {activeQuestion.options.map((opt, idx) => (
            <button
              key={idx}
              className={`quiz-option ${selectedOption === opt.type ? 'selected' : ''}`}
              onClick={() => handleSelectOption(opt.type)}
            >
              <span>{opt.text}</span>
              {selectedOption === opt.type && (
                <span style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center' }}>
                  <Check size={18} strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="quiz-navigation">
          <button
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{ opacity: currentStep === 0 ? 0.5 : 1 }}
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          {currentStep === QUESTIONS.length - 1 ? (
            <button
              className="btn btn-gold"
              onClick={handleCalculate}
              disabled={loading || !selectedOption}
              style={{ padding: '0.75rem 2rem' }}
            >
              {loading ? 'Analyzing Prakriti...' : 'Calculate Prakriti'}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!selectedOption}
              style={{ opacity: !selectedOption ? 0.5 : 1 }}
            >
              Next
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
