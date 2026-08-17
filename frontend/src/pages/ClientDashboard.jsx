import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { Leaf, Award, Heart, CheckCircle2, User, Mail, MessageSquare, ChevronRight, ChevronLeft, ShieldCheck, Plus, X, Sliders, Check, Clock, Eye, ShieldAlert } from 'lucide-react';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    title: "How would you describe your body frame?",
    options: [
      { type: "vata", text: "Slender, tall or very short, thin bones, cracking joints" },
      { type: "pitta", text: "Medium build, muscular, balanced proportion, highly flexible" },
      { type: "kapha", text: "Broad frame, thick bones, sturdy joints, tends to gain weight easily" }
    ]
  },
  {
    id: 2,
    title: "What is your skin type?",
    options: [
      { type: "vata", text: "Dry, rough, thin, easily gets chapped or dry in cold weather" },
      { type: "pitta", text: "Soft, warm, sensitive to sun, red tones, slightly oily" },
      { type: "kapha", text: "Thick, smooth, soft, oily, fair or pale complexion" }
    ]
  },
  {
    id: 3,
    title: "How would you describe your natural appetite?",
    options: [
      { type: "pitta", text: "Strong and regular (Needs food on time)" },
      { type: "vata", text: "Variable (Sometimes ravenous, sometimes skips meals)" },
      { type: "kapha", text: "Moderate and steady (Can skip meals easily)" }
    ]
  },
  {
    id: 4,
    title: "What are your digestion tendencies?",
    options: [
      { type: "vata", text: "Frequent bloating, gas, irregular bowel movements" },
      { type: "pitta", text: "High acidity, heartburn, quick digestion, loose stools" },
      { type: "kapha", text: "Slow digestion, feels heavy after eating, sluggish metabolism" }
    ]
  },
  {
    id: 5,
    title: "How is your sleep pattern?",
    options: [
      { type: "vata", text: "Light sleeper, easily disturbed, wakes up anxious, frequent insomnia" },
      { type: "pitta", text: "Moderate sleeper, sound sleep, wakes up hot but refreshed" },
      { type: "kapha", text: "Deep, heavy sleeper, sleeps long hours, groggy in the morning" }
    ]
  },
  {
    id: 6,
    title: "How do you respond to stress?",
    options: [
      { type: "vata", text: "Anxiety, fear, worry, overthinking" },
      { type: "pitta", text: "Anger, irritability, impatience, frustration" },
      { type: "kapha", text: "Calm, slow to react, stays quiet, avoids conflict" }
    ]
  },
  {
    id: 7,
    title: "What weather do you prefer?",
    options: [
      { type: "vata", text: "Dislikes cold, dry, wind; loves warm climates" },
      { type: "pitta", text: "Dislikes hot weather, direct sun; loves cool breezes" },
      { type: "kapha", text: "Dislikes damp, wet, cold weather; loves dry warmth" }
    ]
  },
  {
    id: 8,
    title: "How is your learning style and memory?",
    options: [
      { type: "vata", text: "Learns very quickly, forgets quickly; mind constantly wanders" },
      { type: "pitta", text: "Sharp intellect, understands quickly, remembers long-term details" },
      { type: "kapha", text: "Learns slowly but retains information forever; deliberate recall" }
    ]
  }
];

// ── DinacharyaAI Sub-Component ────────────────────────────────────────────────
function DinacharyaAI({ token, profileDosha, API_URL }) {
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/client/dinacharya`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      setRoutine(data.routine);
      setGenerated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Static fallback routine shown before AI generation
  const staticRoutine = [
    { time: '06:30 AM', emoji: '🌅', title: 'Wake & Hydrate', desc: 'Drink a glass of warm water to stimulate Agni and clear toxins (Ama).', diseaseNote: '' },
    { time: '07:00 AM', emoji: '🧘', title: 'Light Movement', desc: '15 mins of gentle yoga or a brisk walk to ground Vata.', diseaseNote: '' },
    { time: '08:30 AM', emoji: '🍵', title: 'Breakfast', desc: 'Eat your prescribed warm breakfast in a calm environment.', diseaseNote: '' },
    { time: '01:30 PM', emoji: '☀️', title: 'Lunch', desc: 'Consume your main meal of the day when your digestive fire (Agni) is at its peak strength.', diseaseNote: '' },
    { time: '05:00 PM', emoji: '🌿', title: 'Evening Routine', desc: 'Gentle stretching or light walking. Avoid heavy snacks.', diseaseNote: '' },
    { time: '08:00 PM', emoji: '🌙', title: 'Dinner', desc: 'Consume a light, warm soup or broth to facilitate restful sleep.', diseaseNote: '' },
  ];

  const displayRoutine = routine || staticRoutine;

  return (
    <div>
      {/* Generate / Regenerate button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 2rem', borderRadius: '12px',
            background: loading ? '#ccc' : 'var(--primary-color)',
            color: 'white', border: 'none', fontWeight: 700,
            fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {loading ? (
            <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> Generating your personalized routine...</>
          ) : generated ? (
            <><span>✨</span> Regenerate AI Routine</>
          ) : (
            <><span>🤖</span> Generate My AI Dinacharya</>
          )}
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fdecea', border: '1px solid #f5c6cb', borderRadius: '8px', color: '#c62828', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {!generated && !loading && (
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          ↑ Click above to get AI-personalized advice based on your dosha and health conditions
        </div>
      )}

      {generated && (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ background: 'rgba(26,66,32,0.08)', padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.83rem', color: 'var(--primary-dark)', fontWeight: 600 }}>
            ✅ Personalized for {profileDosha || 'your'} Dosha · Disease-specific advice included
          </span>
        </div>
      )}

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: '3rem' }}>
        <div style={{ position: 'absolute', left: '10px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--border-color)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {displayRoutine.map((item, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              {/* Bullet */}
              <div style={{ position: 'absolute', left: '-28px', top: '8px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white', border: '3px solid var(--primary-color)', zIndex: 2 }} />
              <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid rgba(26,66,32,0.07)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary-color)', display: 'block', marginBottom: '0.25rem' }}>
                  {item.emoji && <span style={{ marginRight: '0.3rem' }}>{item.emoji}</span>}
                  {item.time}
                </span>
                <h4 style={{ fontSize: '1.15rem', color: 'var(--primary-dark)', marginBottom: '0.3rem' }}>{item.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{item.desc}</p>
                {item.diseaseNote && (
                  <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', background: 'rgba(181,141,61,0.1)', borderLeft: '3px solid var(--secondary-color)', borderRadius: '0 6px 6px 0', fontSize: '0.83rem', color: 'var(--secondary-dark)' }}>
                    🩺 <strong>For your condition:</strong> {item.diseaseNote}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const [profile, setProfile] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnboardingMode, setIsOnboardingMode] = useState(false);

  // Daily Logging State
  const [checkInDone, setCheckInDone] = useState(false);
  const [checkInNote, setCheckInNote] = useState('');
  const [checkInLogs, setCheckInLogs] = useState([]);

  // Progress subpage state
  const [adherenceRate, setAdherenceRate] = useState(0);
  const [agniStatus, setAgniStatus] = useState('Not Started');
  const [sleepTime, setSleepTime] = useState(7.5);
  const [selectedFeeling, setSelectedFeeling] = useState('Light & Energized');
  const [weeklyNotes, setWeeklyNotes] = useState('');

  // Meal Modal State
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealModalContent, setMealModalContent] = useState(null);
  const [mealModalType, setMealModalType] = useState('details'); // 'details' or 'why'

  // Messages subpage state
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  // Main navigation tab query
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'plan';

  // Inner tab for "My Plan"
  const [planInnerTab, setPlanInnerTab] = useState('today');

  const { token, user } = useAuth();

  // Onboarding Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [wName, setWName] = useState(user?.name || '');
  const [wAge, setWAge] = useState('');
  const [wHeight, setWHeight] = useState('');
  const [wWeight, setWWeight] = useState('');
  const [wLocation, setWLocation] = useState('');
  
  // Step 2: Ahara
  const [wDietPattern, setWDietPattern] = useState('Vegetarian');
  const [wCuisine, setWCuisine] = useState('South Indian');
  const [wBreakfastTime, setWBreakfastTime] = useState('08:30 AM');
  const [wLunchTime, setWLunchTime] = useState('01:30 PM');
  const [wDinnerTime, setWDinnerTime] = useState('08:00 PM');

  // Step 3: Dinacharya
  const [wSleepQuality, setWSleepQuality] = useState('Variable');
  const [wStress, setWStress] = useState('Moderate');
  const [wWorkEnv, setWWorkEnv] = useState('Hybrid (Desk job)');

  // Step 4: Ayurvedic Quiz
  const [wQuizAnswers, setWQuizAnswers] = useState({});
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);

  // Step 5: Health
  const [wAllergies, setWAllergies] = useState(['Dairy']);
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [showAllergyInput, setShowAllergyInput] = useState(false);
  const [wMedications, setWMedications] = useState('None');

  // Step 5.5: Health Conditions (NEW)
  const [wHealthConditions, setWHealthConditions] = useState([]);

  // Step 6: Intention
  const [wIntention, setWIntention] = useState('Improve Digestion');

  // Step 8: Results
  const [onboardingResults, setOnboardingResults] = useState(null);

  useEffect(() => {
    fetchClientData();
    fetchProgressStats();
    const savedLogs = localStorage.getItem(`spartans_checkin_${user.id}`);
    if (savedLogs) {
      setCheckInLogs(JSON.parse(savedLogs));
    }
    const savedMsg = localStorage.getItem(`spartans_msg_${user.id}`);
    if (savedMsg) {
      setMessages(JSON.parse(savedMsg));
    }
  }, [location.search]);

  async function fetchClientData() {
    try {
      const res = await fetch(`${API_URL}/client/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setAssessments(data.assessments);
        
        if (data.profile && data.profile.age === 0) {
          setIsOnboardingMode(true);
        }

        if (data.dietPlans && data.dietPlans.length > 0) {
          const plan = data.dietPlans[0];
          setActivePlan({
            ...plan,
            meals: JSON.parse(plan.meals),
            nutrients_target: JSON.parse(plan.nutrients_target),
            nutrients_actual: JSON.parse(plan.nutrients_actual)
          });
        }
      } else if (res.status === 404) {
        setIsOnboardingMode(true);
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProgressStats() {
    try {
      const res = await fetch(`${API_URL}/client/progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdherenceRate(data.adherenceRate);
        setAgniStatus(data.agniStatus);
        setSleepTime(data.sleepTime);
      }
    } catch (err) {
      console.error('Error fetching progress stats:', err);
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = {
      sender: 'client',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: messageInput
    };
    
    // Auto-reply mockup to simulate delivery
    const replyMsg = {
      sender: 'dietitian',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `[System] Message delivered to ${profile?.dietitian_name || 'your dietitian'}. They will respond shortly.`
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setMessageInput('');
    localStorage.setItem(`spartans_msg_${user.id}`, JSON.stringify(updated));

    // Simulate reply after 1.5 seconds
    setTimeout(() => {
      setMessages(prev => {
        const withReply = [...prev, replyMsg];
        localStorage.setItem(`spartans_msg_${user.id}`, JSON.stringify(withReply));
        return withReply;
      });
    }, 1500);
  };

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/client/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feeling: selectedFeeling,
          notes: weeklyNotes
        })
      });

      if (res.ok) {
        alert('Weekly Reflection Check-in saved successfully! Your stats have been updated.');
        setWeeklyNotes('');
        fetchProgressStats(); // Refresh stats immediately
      } else {
        const data = await res.json();
        alert(`Failed to save progress: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving progress.');
    }
  };

  const handleOpenMealModal = (mealName, items, type) => {
    setMealModalType(type);
    setMealModalContent({ mealName, items });
    setShowMealModal(true);
  };

  const handleAddAllergy = (e) => {
    e.preventDefault();
    if (newAllergyInput.trim() && !wAllergies.includes(newAllergyInput.trim())) {
      setWAllergies([...wAllergies, newAllergyInput.trim()]);
      setNewAllergyInput('');
      setShowAllergyInput(false);
    }
  };

  const handleRemoveAllergy = (idx) => {
    const updated = [...wAllergies];
    updated.splice(idx, 1);
    setWAllergies(updated);
  };

  const handleOnboardingSubmit = async () => {
    setLoading(true);
    const onboardingDetails = {
      dietaryPattern: wDietPattern,
      cuisine: wCuisine,
      mealTimes: { breakfast: wBreakfastTime, lunch: wLunchTime, dinner: wDinnerTime },
      lifestyle: { sleep: wSleepQuality, stress: wStress, work: wWorkEnv },
      allergies: wAllergies,
      medications: wMedications,
      healthConditions: wHealthConditions,
      intention: wIntention
    };

    try {
      const res = await fetch(`${API_URL}/client/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: wName,
          age: parseInt(wAge) || 30,
          gender: 'Not Specified',
          height: parseFloat(wHeight) || 165,
          weight: parseFloat(wWeight) || 60,
          location: wLocation,
          onboarding_details: onboardingDetails,
          health_conditions: wHealthConditions.join(', '),
          answers: wQuizAnswers
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        await fetchClientData();
        
        let vataCount = 0, pittaCount = 0, kaphaCount = 0;
        Object.values(wQuizAnswers).forEach(ans => {
          if (!ans) return;
          const val = String(ans).toLowerCase();
          if (val === 'vata') vataCount++;
          else if (val === 'pitta') pittaCount++;
          else if (val === 'kapha') kaphaCount++;
        });
        const total = vataCount + pittaCount + kaphaCount || 1;
        
        setOnboardingResults({
          vataPct: Math.round((vataCount / total) * 100),
          pittaPct: Math.round((pittaCount / total) * 100),
          kaphaPct: Math.round((kaphaCount / total) * 100)
        });
        
        setWizardStep(8);
      } else {
        alert(data.error || 'Failed to save onboarding details. Please try again.');
      }
    } catch (err) {
      console.error('handleOnboardingSubmit error:', err);
      alert('Error connecting to backend server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && wizardStep !== 8) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading dashboard details...</div>;
  }

  // --- ONBOARDING MULTI-STEP WIZARD UI ---
  if (isOnboardingMode) {
    return (
      <div className="fade-in" style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Top Header / Progress Indicator */}
        {wizardStep < 8 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Step 0{wizardStep}</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {[1, 2, 3, 4, 5, 6, 7].map(step => (
                <div 
                  key={step} 
                  style={{ 
                    width: '40px', 
                    height: '6px', 
                    borderRadius: '3px', 
                    backgroundColor: step <= wizardStep ? 'var(--secondary-color)' : 'var(--border-color)',
                    transition: 'var(--transition)'
                  }}
                />
              ))}
            </div>
            <span>07 Review</span>
          </div>
        )}

        {/* STEP 1: Personal Details */}
        {wizardStep === 1 && (
          <div className="card fade-in" style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Let's start with you.</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Tell us a little about yourself to set up your profile.</p>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={wName} 
                  onChange={(e) => setWName(e.target.value)} 
                  placeholder="Priya Sharma"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age (years)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={wAge} 
                  onChange={(e) => setWAge(e.target.value)} 
                  placeholder="32"
                  min="1"
                  max="149"
                  style={wAge && (parseInt(wAge) < 1 || parseInt(wAge) >= 150) ? { borderColor: 'var(--danger-color)', boxShadow: '0 0 0 3px rgba(198,40,40,0.1)' } : {}}
                />
                {wAge && (parseInt(wAge) < 1 || parseInt(wAge) >= 150) && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    ⚠ Age must be between 1 and 149 years.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={wHeight} 
                  onChange={(e) => setWHeight(e.target.value)} 
                  placeholder="164"
                  min="30"
                  max="299"
                  style={wHeight && (parseFloat(wHeight) < 30 || parseFloat(wHeight) >= 300) ? { borderColor: 'var(--danger-color)', boxShadow: '0 0 0 3px rgba(198,40,40,0.1)' } : {}}
                />
                {wHeight && (parseFloat(wHeight) < 30 || parseFloat(wHeight) >= 300) && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    ⚠ Height must be between 30 and 299 cm.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={wWeight} 
                  onChange={(e) => setWWeight(e.target.value)} 
                  placeholder="68"
                  min="1"
                  max="649"
                  style={wWeight && (parseFloat(wWeight) < 1 || parseFloat(wWeight) >= 650) ? { borderColor: 'var(--danger-color)', boxShadow: '0 0 0 3px rgba(198,40,40,0.1)' } : {}}
                />
                {wWeight && (parseFloat(wWeight) < 1 || parseFloat(wWeight) >= 650) && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    ⚠ Weight must be between 1 and 649 kg.
                  </span>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Location</label>
              <input 
                type="text" 
                className="form-control" 
                value={wLocation} 
                onChange={(e) => setWLocation(e.target.value)} 
                placeholder="Chennai"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.8rem 2.5rem' }} 
                onClick={() => setWizardStep(2)}
                disabled={
                  !wName || !wAge ||
                  (wAge && (parseInt(wAge) < 1 || parseInt(wAge) >= 150)) ||
                  (wHeight && (parseFloat(wHeight) < 30 || parseFloat(wHeight) >= 300)) ||
                  (wWeight && (parseFloat(wWeight) < 1 || parseFloat(wWeight) >= 650))
                }
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Eating Profile */}
        {wizardStep === 2 && (
          <div className="card fade-in" style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Tell us about the way you eat.</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Your Ahara (food) profile helps us recommend the right ingredients.</p>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Dietary Pattern</label>
              <div className="grid-4" style={{ gap: '1rem' }}>
                {['Vegetarian', 'Vegan', 'Eggetarian', 'Non-Veg'].map(pattern => (
                  <button
                    key={pattern}
                    className={`quiz-option ${wDietPattern === pattern ? 'selected' : ''}`}
                    onClick={() => setWDietPattern(pattern)}
                    style={{ padding: '1rem 0.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
                  >
                    {pattern === 'Vegetarian' && <Leaf size={20} style={{ color: 'var(--primary-color)' }} />}
                    <span>{pattern}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Primary Cuisine Preference</label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['North Indian', 'South Indian', 'Continental', 'Asian'].map(cuisine => (
                  <button
                    key={cuisine}
                    className="btn"
                    onClick={() => setWCuisine(cuisine)}
                    style={{ 
                      backgroundColor: wCuisine === cuisine ? 'var(--primary-dark)' : 'white',
                      color: wCuisine === cuisine ? 'white' : 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      padding: '0.5rem 1.25rem',
                      fontSize: '0.9rem',
                      borderRadius: '999px'
                    }}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Breakfast Time</label>
                <input type="text" className="form-control" value={wBreakfastTime} onChange={(e) => setWBreakfastTime(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Lunch Time</label>
                <input type="text" className="form-control" value={wLunchTime} onChange={(e) => setWLunchTime(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Dinner Time</label>
                <input type="text" className="form-control" value={wDinnerTime} onChange={(e) => setWDinnerTime(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
              <button className="btn btn-secondary" onClick={() => setWizardStep(1)}>← Back</button>
              <button className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }} onClick={() => setWizardStep(3)}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Daily Rhythm */}
        {wizardStep === 3 && (
          <div className="card fade-in" style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Understand your daily rhythm.</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Dinacharya (lifestyle) deeply impacts how food is metabolized.</p>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Sleep Quality</label>
                <span className="badge badge-primary">{wSleepQuality}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="1"
                className="form-control" 
                style={{ padding: 0, height: '6px', background: '#dce5de', outline: 'none' }}
                value={wSleepQuality === 'Deep/Consistent' ? 0 : wSleepQuality === 'Variable' ? 1 : 2}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setWSleepQuality(val === 0 ? 'Deep/Consistent' : val === 1 ? 'Variable' : 'Poor/Disturbed');
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <span>Deep/Consistent</span>
                <span>Variable/Light</span>
                <span>Poor/Disturbed</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Stress Perception</label>
                <span className="badge badge-gold">{wStress}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="1"
                className="form-control" 
                style={{ padding: 0, height: '6px', background: '#dce5de', outline: 'none' }}
                value={wStress === 'Very Calm' ? 0 : wStress === 'Moderate' ? 1 : 2}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setWStress(val === 0 ? 'Very Calm' : val === 1 ? 'Moderate' : 'High Stress');
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <span>Very Calm</span>
                <span>Moderate</span>
                <span>High Stress</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Work Environment</label>
              <div className="grid-3" style={{ gap: '1rem' }}>
                {['Hybrid (Desk job)', 'Active / Outdoors', 'Sedentary (No movement)'].map(env => (
                  <button
                    key={env}
                    className={`quiz-option ${wWorkEnv === env ? 'selected' : ''}`}
                    onClick={() => setWWorkEnv(env)}
                    style={{ fontSize: '0.9rem', padding: '1rem 0.5rem', textAlign: 'center', justifyContent: 'center' }}
                  >
                    <span>{env}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
              <button className="btn btn-secondary" onClick={() => setWizardStep(2)}>← Back</button>
              <button className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }} onClick={() => setWizardStep(4)}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 4: Ayurvedic Quiz */}
        {wizardStep === 4 && (
          <div className="card fade-in" style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Discover your Ayurvedic profile.</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>A short guided assessment to understand your natural tendencies and digestive fire (Agni).</p>

            <div style={{ background: '#f4f7f5', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>QUESTION {quizQuestionIdx + 1} OF {QUIZ_QUESTIONS.length}</span>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-dark)', marginTop: '0.25rem' }}>
                "{QUIZ_QUESTIONS[quizQuestionIdx].title}"
              </h3>
            </div>

            <div className="quiz-options" style={{ marginBottom: '2.5rem' }}>
              {QUIZ_QUESTIONS[quizQuestionIdx].options.map((opt, idx) => {
                const isSelected = wQuizAnswers[QUIZ_QUESTIONS[quizQuestionIdx].id] === opt.type;
                return (
                  <button
                    key={idx}
                    className={`quiz-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setWQuizAnswers({
                        ...wQuizAnswers,
                        [QUIZ_QUESTIONS[quizQuestionIdx].id]: opt.type
                      });
                    }}
                    style={{ fontSize: '1.05rem', padding: '1.25rem' }}
                  >
                    <span>{opt.text}</span>
                    {isSelected && (
                      <span style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center' }}>
                        <Check size={18} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  if (quizQuestionIdx > 0) {
                    setQuizQuestionIdx(quizQuestionIdx - 1);
                  } else {
                    setWizardStep(3);
                  }
                }}
              >
                ← Back
              </button>

              <button 
                className="btn btn-primary"
                style={{ padding: '0.8rem 2.5rem' }}
                disabled={!wQuizAnswers[QUIZ_QUESTIONS[quizQuestionIdx].id]}
                onClick={() => {
                  if (quizQuestionIdx < QUIZ_QUESTIONS.length - 1) {
                    setQuizQuestionIdx(quizQuestionIdx + 1);
                  } else {
                    setWizardStep(5);
                  }
                }}
              >
                {quizQuestionIdx === QUIZ_QUESTIONS.length - 1 ? 'Continue →' : 'Next Question →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Health Context */}
        {wizardStep === 5 && (
          <div className="card fade-in" style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Help us understand your health context.</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Safety is our priority. Please note any critical dietary restrictions.</p>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Food Allergies / Intolerances</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', background: 'white', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                {wAllergies.map((allergy, idx) => (
                  <span key={idx} className="badge badge-primary" style={{ gap: '0.25rem', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                    {allergy}
                    <X size={14} style={{ cursor: 'pointer' }} onClick={() => handleRemoveAllergy(idx)} />
                  </span>
                ))}
                
                {showAllergyInput ? (
                  <form onSubmit={handleAddAllergy} style={{ display: 'inline-flex' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', width: '120px' }}
                      value={newAllergyInput}
                      onChange={(e) => setNewAllergyInput(e.target.value)}
                      placeholder="e.g. Gluten"
                      autoFocus
                      onBlur={() => setShowAllergyInput(false)}
                    />
                  </form>
                ) : (
                  <button 
                    className="btn" 
                    onClick={() => setShowAllergyInput(true)}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', border: '1px dashed var(--primary-color)', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'transparent' }}
                  >
                    <Plus size={14} /> Add item
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Current Medications</label>
              <input 
                type="text" 
                className="form-control" 
                value={wMedications} 
                onChange={(e) => setWMedications(e.target.value)} 
                placeholder="None or list items..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
              <button className="btn btn-secondary" onClick={() => setWizardStep(4)}>← Back</button>
              <button className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }} onClick={() => setWizardStep(5.5)}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 5.5: Health Conditions */}
        {wizardStep === 5.5 && (
          <div className="card fade-in" style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>What health concerns do you have?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Select all that apply. This helps us personalize your diet plan and alert your dietitian.</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
              {[
                { label: '🩺 Diabetes', value: 'Diabetes' },
                { label: '⚖️ Obesity / Overweight', value: 'Obesity' },
                { label: '🔥 Acidity / GERD', value: 'Acidity/GERD' },
                { label: '❤️ High Blood Pressure', value: 'Hypertension' },
                { label: '🦋 Thyroid Disorder', value: 'Thyroid' },
                { label: '🦴 Joint / Knee Pain', value: 'Joint Pain' },
                { label: '🍽️ Poor Digestion / IBS', value: 'Poor Digestion' },
                { label: '🌸 Hormonal / PCOS', value: 'PCOS/Hormonal' },
                { label: '🫁 Respiratory / Asthma', value: 'Respiratory' },
                { label: '🧠 Anxiety / Depression', value: 'Anxiety/Stress' },
                { label: '💤 Chronic Fatigue', value: 'Chronic Fatigue' },
                { label: '🍬 Cholesterol', value: 'High Cholesterol' },
                { label: '🌿 Skin Disorders', value: 'Skin Disorders' },
                { label: '✅ None / General Wellness', value: 'None' }
              ].map(({ label, value }) => {
                const isSelected = wHealthConditions.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => {
                      if (value === 'None') {
                        setWHealthConditions(['None']);
                      } else {
                        setWHealthConditions(prev => {
                          const withoutNone = prev.filter(c => c !== 'None');
                          return isSelected
                            ? withoutNone.filter(c => c !== value)
                            : [...withoutNone, value];
                        });
                      }
                    }}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '999px',
                      border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      background: isSelected ? 'rgba(26,66,32,0.08)' : 'white',
                      color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)',
                      fontWeight: isSelected ? 700 : 400,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {wHealthConditions.length > 0 && !wHealthConditions.includes('None') && (
              <div style={{ padding: '0.75rem 1rem', background: '#f4f7f5', borderRadius: '8px', fontSize: '0.88rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>
                <strong>Selected:</strong> {wHealthConditions.join(', ')}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={() => setWizardStep(5)}>← Back</button>
              <button
                className="btn btn-primary"
                style={{ padding: '0.8rem 2.5rem' }}
                disabled={wHealthConditions.length === 0}
                onClick={() => setWizardStep(6)}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Primary Intention */}
        {wizardStep === 6 && (
          <div className="card fade-in" style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>What is your primary intention?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Aligning your diet plan with your core health goals.</p>

            <div className="grid-2" style={{ gap: '1rem' }}>
              {[
                { name: 'Improve Digestion', desc: 'Regulate digestive fire (Agni), eliminate bloating, and enhance nutrient absorption.' },
                { name: 'Weight Management', desc: 'Optimize metabolic rates to naturally balance body mass (Kapha management).' },
                { name: 'Boost Energy Levels', desc: 'Reduce fatigue, balance physical stamina (Ojas), and stabilize alertness.' },
                { name: 'Reduce Stress & Anxiety', desc: 'Calm the nervous system (Vata pacifying) and improve mental clarity.' },
                { name: 'Better Sleep Quality', desc: 'Establish deep circadian patterns and reduce nocturnal restiveness.' }
              ].map(item => (
                <button
                  key={item.name}
                  className={`quiz-option ${wIntention === item.name ? 'selected' : ''}`}
                  onClick={() => setWIntention(item.name)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1.25rem', height: '100%', gap: '0.5rem' }}
                >
                  <strong style={{ color: 'var(--primary-dark)', fontSize: '1.1rem' }}>{item.name}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left', fontWeight: 400 }}>{item.desc}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
              <button className="btn btn-secondary" onClick={() => setWizardStep(5)}>← Back</button>
              <button className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }} onClick={() => setWizardStep(7)}>Review Profile →</button>
            </div>
          </div>
        )}

        {/* STEP 7: Review Profile */}
        {wizardStep === 7 && (
          <div className="card fade-in" style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Review your Ayurvedic Profile.</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Verify your credentials and parameters before generating your initial Balancing Plan.</p>

            <div className="grid-2" style={{ gap: '2rem', fontSize: '0.95rem' }}>
              <div style={{ background: '#f4f7f5', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem' }}>Personal Metrics</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div><strong>Name:</strong> {wName}</div>
                  <div><strong>Age:</strong> {wAge} years</div>
                  <div><strong>Height / Weight:</strong> {wHeight} cm / {wWeight} kg</div>
                  <div><strong>Location:</strong> {wLocation}</div>
                </div>
              </div>

              <div style={{ background: '#f4f7f5', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.75rem' }}>Ahara (Eating Profile)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div><strong>Dietary Pattern:</strong> {wDietPattern}</div>
                  <div><strong>Primary Cuisine:</strong> {wCuisine}</div>
                  <div><strong>Meal Times:</strong> B: {wBreakfastTime} | L: {wLunchTime} | D: {wDinnerTime}</div>
                </div>
              </div>

              <div style={{ background: '#fcf8ee', padding: '1.5rem', borderRadius: '12px', border: '1px solid #faeccb' }}>
                <h4 style={{ color: 'var(--secondary-dark)', marginBottom: '0.75rem' }}>Dinacharya (Daily Rhythm)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div><strong>Sleep Quality:</strong> {wSleepQuality}</div>
                  <div><strong>Stress:</strong> {wStress}</div>
                  <div><strong>Environment:</strong> {wWorkEnv}</div>
                </div>
              </div>

              <div style={{ background: '#fcf8ee', padding: '1.5rem', borderRadius: '12px', border: '1px solid #faeccb' }}>
                <h4 style={{ color: 'var(--secondary-dark)', marginBottom: '0.75rem' }}>Health Context & Intention</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div><strong>Health Concerns:</strong> {wHealthConditions.length > 0 ? wHealthConditions.join(', ') : 'None'}</div>
                  <div><strong>Allergies:</strong> {wAllergies.join(', ') || 'None'}</div>
                  <div><strong>Medications:</strong> {wMedications}</div>
                  <div><strong>Primary Intention:</strong> {wIntention}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setWizardStep(6)}>← Back</button>
              <button className="btn btn-gold" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }} onClick={handleOnboardingSubmit}>
                Generate Plan →
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: Generate Plan Output */}
        {wizardStep === 8 && onboardingResults && (
          <div className="card fade-in results-card" style={{ padding: '3rem', maxWidth: '700px' }}>
            <Heart size={64} style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Your Balancing Plan is Ready!</h2>
            <p style={{ color: 'var(--text-muted)' }}>We have successfully analyzed your Prakriti & computed your daily menu.</p>

            <div className="dosha-donut-container" style={{ margin: '2.5rem 0' }}>
              <div className="dosha-score-circle">
                <div className="circle-score vata">{onboardingResults.vataPct}%</div>
                <strong style={{ color: 'var(--primary-color)' }}>Vata</strong>
              </div>

              <div className="dosha-score-circle">
                <div className="circle-score pitta">{onboardingResults.pittaPct}%</div>
                <strong style={{ color: 'var(--secondary-color)' }}>Pitta</strong>
              </div>

              <div className="dosha-score-circle">
                <div className="circle-score kapha">{onboardingResults.kaphaPct}%</div>
                <strong style={{ color: 'var(--primary-dark)' }}>Kapha</strong>
              </div>
            </div>

            <div style={{ background: '#f4f7f5', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid var(--primary-color)', textAlign: 'left', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
              <strong>Rule-Based Menu Generated:</strong>
              <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                Based on your preference for <strong>{wCuisine}</strong> cuisine and a <strong>{wDietPattern}</strong> pattern, we selected Dosha-pacifying items (like warm porridge, mung dal, custom herbs) pre-configured with 1800 kcal limits. You can review and edit these details anytime on your dashboard!
              </p>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem' }} 
              onClick={() => {
                setIsOnboardingMode(false);
                setWizardStep(1);
                navigate('/dashboard?tab=plan');
              }}
            >
              Access My Active Dashboard
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- SUBPAGE: MY PLAN TAB (Image 1) ---
  if (activeTab === 'plan') {
    return (
      <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', marginBottom: '0.25rem' }}>
              Good morning, {profile?.name || user.name}.
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Here is your personalized Ahara guidance for today.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            {profile?.dosha && (
              <span className="badge badge-gold" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', letterSpacing: '1px' }}>
                ● {profile.dosha.toUpperCase()} PROFILE
              </span>
            )}
            {profile?.dietitian_name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(26,66,32,0.05)', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid var(--border-color)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--secondary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                  {profile.dietitian_name.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>{profile.dietitian_name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{profile.dietitian_email || 'Your Dietitian'}</div>
                </div>
              </div>
            )}
            <button
              onClick={() => window.print()}
              style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'white', color: 'var(--text-muted)', fontSize: '0.83rem', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-color)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              title="Download plan as PDF"
            >
              🖨️ Download PDF
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          backgroundColor: '#fcf8ee', 
          border: '1px solid #faeccb', 
          padding: '1rem 1.5rem', 
          borderRadius: '12px',
          color: '#8c6a28',
          fontSize: '0.95rem',
          fontWeight: 500,
          marginBottom: '2rem'
        }}>
          <Clock size={20} />
          <span>
            {profile?.dietitian_name
              ? `Your plan is being reviewed by ${profile.dietitian_name}. You can start following it today.`
              : 'Your AI-generated plan is currently being reviewed by your Ayurvedic Dietitian. You can start following it today.'}
          </span>
        </div>

        {/* Inner tabs */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', gap: '2rem' }}>
            {['today', 'seven-day', 'grocery'].map(tab => (
              <button
                key={tab}
                className="btn-text"
                onClick={() => setPlanInnerTab(tab)}
                style={{
                  paddingBottom: '1rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: planInnerTab === tab ? 'var(--primary-color)' : 'var(--text-muted)',
                  borderBottom: planInnerTab === tab ? '2px solid var(--primary-color)' : 'none',
                  borderRadius: 0,
                  cursor: 'pointer'
                }}
              >
                {tab === 'today' ? "Today's Ahara" : tab === 'seven-day' ? "7-Day View" : "Grocery List"}
              </button>
            ))}
          </div>

          {planInnerTab === 'today' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {activePlan ? (
                Object.entries(activePlan.meals).map(([mealName, mealItems]) => {
                  if (mealItems.length === 0) return null;
                  
                  // Extract dynamic titles and timing mockups based on step times
                  let timing = "08:30 AM";
                  let subtitle = "Light, warm, and easy to digest to start the day.";
                  if (mealName === 'lunch') {
                    timing = "01:30 PM";
                    subtitle = "Tridoshic, balancing meal that supports your moderate Agni.";
                  } else if (mealName === 'dinner') {
                    timing = "08:00 PM";
                    subtitle = "Nourishing, grounding, and easy to digest before bedtime.";
                  } else if (mealName === 'snacks') {
                    timing = "05:00 PM";
                    subtitle = "Light crunch, paired with warm beverages.";
                  }

                  return (
                    <div 
                      key={mealName} 
                      style={{ 
                        display: 'flex', 
                        borderBottom: '1px solid var(--border-color)', 
                        paddingBottom: '1.5rem',
                        gap: '2.5rem',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{ width: '120px', flexShrink: 0 }}>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                          {mealName}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                          <Clock size={14} />
                          {timing}
                        </span>
                      </div>

                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-sans)', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                          {mealItems.map(item => item.name).join(' + ')}
                        </h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{subtitle}</p>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          <span>𓎩 {mealItems.map(item => `${item.quantity || '1 portion'} (${item.multiplier}x)`).join(', ')}</span>
                          <span>🔥 {mealItems.reduce((acc, curr) => acc + Math.round(curr.calories * curr.multiplier), 0)} kcal</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => handleOpenMealModal(mealName, mealItems, 'details')}>
                          View Details
                        </button>
                        <button className="btn btn-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: '#fcf8ee', border: '1px solid #faeccb', color: 'var(--secondary-dark)' }} onClick={() => handleOpenMealModal(mealName, mealItems, 'why')}>
                          ✨ Why this?
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No active diet plan. Complete your onboarding wizard to auto-generate one!
                </p>
              )}
            </div>
          )}

          {planInnerTab === 'seven-day' && (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Your 7-day schedule is aligned with your Prakriti template. Check back for seasonal changes!
            </p>
          )}

          {planInnerTab === 'grocery' && (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Mung dal, basmati rice, ghee, fresh ginger, and spices are pre-loaded to your grocery checkout checklist.
            </p>
          )}
        </div>
        
        {/* Meal Detail Modal */}
        {showMealModal && mealModalContent && (
          <div className="modal-overlay" onClick={() => setShowMealModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
                  {mealModalContent.mealName} {mealModalType === 'why' ? 'Ayurvedic Reasoning' : 'Details'}
                </h3>
                <button className="close-btn" onClick={() => setShowMealModal(false)} title="Close">×</button>
              </div>
              <div className="modal-body">
                {mealModalType === 'details' ? (
                  <div>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--primary-dark)' }}>Ingredients & Preparation</h4>
                    <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {mealModalContent.items.map((item, idx) => (
                        <li key={idx}>
                          <strong>{item.name}</strong> - {item.quantity || '1 portion'}
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f4f7f5', borderRadius: '8px' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <em>Preparation Note:</em> Cook warm and avoid raw cold items to support your Agni (digestive fire).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--secondary-dark)' }}>Why this balances your Prakriti</h4>
                    <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {mealModalContent.items.map((item, idx) => (
                        <li key={idx}>
                          <strong>{item.name}:</strong> 
                          {item.name.toLowerCase().includes('rice') || item.name.toLowerCase().includes('ghee') 
                            ? ' Provides grounding, cooling energy to soothe Pitta and stabilize Vata.' 
                            : ' Easy to digest, tridoshic, and helps clear Ama (toxins).'}
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fcf8ee', border: '1px solid #faeccb', borderRadius: '8px' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--secondary-dark)' }}>
                        <em>Ayurvedic Principle:</em> Like increases like. By introducing opposing qualities (warm, oily, heavy) we counteract biological imbalances.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ padding: '1rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'white' }}>
                <button className="btn btn-primary" onClick={() => setShowMealModal(false)}>Got it</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- SUBPAGE: DINACHARYA — AI-Powered ─────────────────────────────────────
  if (activeTab === 'dinacharya') {
    return (
      <div className="fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Your Daily Rhythm</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            AI-powered Dinacharya tailored to your Dosha{profile?.health_conditions ? ` and ${profile.health_conditions.split(',').slice(0,2).join(', ')}` : ''}.
          </p>

          {profile?.health_conditions && profile.health_conditions !== 'None' && (
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginTop: '0.75rem' }}>
              {profile.health_conditions.split(',').map(c => c.trim()).filter(Boolean).map(cond => (
                <span key={cond} style={{ padding: '0.25rem 0.8rem', background: 'rgba(181,141,61,0.12)', border: '1px solid #d4a843', borderRadius: '999px', fontSize: '0.8rem', color: 'var(--secondary-dark)', fontWeight: 600 }}>
                  🩺 {cond}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AI Routine state */}
        <DinacharyaAI token={token} profileDosha={profile?.dosha} API_URL={API_URL} />
      </div>
    );
  }

  // --- SUBPAGE: PROGRESS (Image 3) ---
  if (activeTab === 'progress') {
    return (
      <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Your Progress</h2>
          <p style={{ color: 'var(--text-muted)' }}>Tracking your consistency and digestive health over time.</p>
        </div>

        {/* Stats Row */}
        <div className="grid-3" style={{ marginBottom: '3rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="circle-score vata" style={{ margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              📈
            </div>
            <h4 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-dark)', margin: 0 }}>
              {adherenceRate}%
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>PLAN ADHERENCE</p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="circle-score pitta" style={{ margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              💧
            </div>
            <h4 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: 'var(--secondary-dark)', margin: 0 }}>
              {agniStatus}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>AGNI STATUS</p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="circle-score kapha" style={{ margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🌙
            </div>
            <h4 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-dark)', margin: 0 }}>
              {sleepTime}h
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>AVG SLEEP</p>
          </div>
        </div>

        {/* Weekly Reflection Check-in Card */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Weekly Reflection Check-in</h3>
          <form onSubmit={handleSaveProgress}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">How did this week's plan feel regarding your digestion and energy?</label>
              <div className="grid-3" style={{ gap: '1rem', marginTop: '0.5rem' }}>
                {['Heavy / Bloated', 'Light & Energized', 'Variable'].map(feeling => (
                  <button
                    type="button"
                    key={feeling}
                    className={`quiz-option ${selectedFeeling === feeling ? 'selected' : ''}`}
                    onClick={() => setSelectedFeeling(feeling)}
                    style={{ textAlign: 'center', justifyContent: 'center', padding: '1rem' }}
                  >
                    <span>{feeling}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Any specific notes for your dietitian?</label>
              <textarea
                className="form-control"
                style={{ height: '100px', resize: 'vertical' }}
                value={weeklyNotes}
                onChange={(e) => setWeeklyNotes(e.target.value)}
                placeholder="e.g. Felt highly energetic on day 2. Bloating resolved."
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.75rem 2rem' }}>
              Log Weekly Progress
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- SUBPAGE: MESSAGES TAB (Image 4) ---
  if (activeTab === 'messages') {
    const dietitianName = profile?.dietitian_name || 'Your Dietitian';
    const dietitianInitial = dietitianName.charAt(0).toUpperCase();
    const clientInitial = (profile?.name || user.name || 'U').charAt(0).toUpperCase();
    return (
      <div className="fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: '600px', display: 'flex', flexDirection: 'column' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(26,66,32,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--secondary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                {dietitianInitial}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem' }}>{dietitianName}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {profile?.dietitian_email || 'Ayurvedic Nutrition Specialist'}
                </span>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => alert('Consultation booking portal loaded.')}>
              🖲 Book Consult
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#fafafa' }}>
            <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
              <span style={{ backgroundColor: '#e2e8f0', color: 'var(--text-muted)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                Today
              </span>
            </div>

            {messages.map((msg, idx) => {
              const isDietitian = msg.sender === 'dietitian';
              return (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: isDietitian ? 'flex-start' : 'flex-end',
                    gap: '0.75rem',
                    alignItems: 'flex-start'
                  }}
                >
                  {isDietitian && (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e1e7e2', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                      {dietitianInitial}
                    </div>
                  )}

                  <div style={{ 
                    maxWidth: '70%', 
                    backgroundColor: isDietitian ? 'white' : 'var(--primary-color)',
                    color: isDietitian ? 'var(--text-main)' : 'white',
                    padding: '1rem 1.25rem',
                    borderRadius: '16px',
                    borderTopLeftRadius: isDietitian ? '2px' : '16px',
                    borderTopRightRadius: isDietitian ? '16px' : '2px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                    fontSize: '0.95rem',
                    lineHeight: '1.5'
                  }}>
                    <p style={{ margin: 0 }}>{msg.text}</p>
                    <span style={{ display: 'block', textAlign: 'right', fontSize: '0.75rem', color: isDietitian ? 'var(--text-muted)' : 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>
                      {msg.time}
                    </span>
                  </div>

                  {!isDietitian && (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--secondary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                      {clientInitial}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', background: 'white' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              style={{ flex: 1, borderRadius: '999px', padding: '0.75rem 1.25rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '45px', height: '45px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ➔
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}
