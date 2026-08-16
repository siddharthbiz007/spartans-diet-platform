import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { ArrowLeft, Save, Plus, Trash2, HelpCircle } from 'lucide-react';

export default function DietPlannerPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [patient, setPatient] = useState(null);
  const [foodsList, setFoodsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Plan Details State
  const [planName, setPlanName] = useState('Daily Balance Meal Plan');
  const [ayurvedicNotes, setAyurvedicNotes] = useState('');
  
  // Nutrients Targets State
  const [targetCals, setTargetCals] = useState(1800);
  const [targetProtein, setTargetProtein] = useState(60);
  const [targetCarbs, setTargetCarbs] = useState(220);
  const [targetFat, setTargetFat] = useState(50);

  // Meals Contents State
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });

  // Modal selector State
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMealTarget, setActiveMealTarget] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [foodQuantity, setFoodQuantity] = useState('1 serving');
  const [multiplier, setMultiplier] = useState(1.0); // e.g. double portion = 2.0

  useEffect(() => {
    fetchPlannerData();
  }, []);

  async function fetchPlannerData() {
    try {
      // 1. Fetch patient
      const resPat = await fetch(`${API_URL}/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resPat.ok) {
        const list = await resPat.json();
        const pat = list.find(p => p.id === parseInt(patientId));
        if (pat) setPatient(pat);
      }

      // 2. Fetch food database
      const resFoods = await fetch(`${API_URL}/foods`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resFoods.ok) {
        const foods = await resFoods.json();
        setFoodsList(foods);
        if (foods.length > 0) {
          setSelectedFoodId(foods[0].id.toString());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate actual aggregate nutrients in real time
  const calculateTotals = () => {
    let calories = 0;
    let protein = 0;
    let carbohydrates = 0;
    let fat = 0;

    Object.values(meals).forEach(mealArray => {
      mealArray.forEach(item => {
        calories += item.calories * item.multiplier;
        protein += item.protein * item.multiplier;
        carbohydrates += item.carbohydrates * item.multiplier;
        fat += item.fat * item.multiplier;
      });
    });

    return { calories, protein, carbohydrates, fat };
  };

  const handleOpenAddModal = (mealName) => {
    setActiveMealTarget(mealName);
    setShowAddModal(true);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const food = foodsList.find(f => f.id === parseInt(selectedFoodId));
    if (!food) return;

    const newItem = {
      id: food.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbohydrates: food.carbohydrates,
      fat: food.fat,
      vata_effect: food.vata_effect,
      pitta_effect: food.pitta_effect,
      kapha_effect: food.kapha_effect,
      quantity: foodQuantity,
      multiplier: parseFloat(multiplier) || 1.0
    };

    setMeals(prev => ({
      ...prev,
      [activeMealTarget]: [...prev[activeMealTarget], newItem]
    }));

    // Reset fields & close
    setFoodQuantity('1 serving');
    setMultiplier(1.0);
    setShowAddModal(false);
  };

  const handleRemoveItem = (mealName, idx) => {
    setMeals(prev => {
      const updated = [...prev[mealName]];
      updated.splice(idx, 1);
      return {
        ...prev,
        [mealName]: updated
      };
    });
  };

  const handleSavePlan = async () => {
    const totals = calculateTotals();
    const payload = {
      patientId: parseInt(patientId),
      planName,
      meals,
      nutrientsTarget: {
        calories: parseInt(targetCals),
        protein: parseInt(targetProtein),
        carbohydrates: parseInt(targetCarbs),
        fat: parseInt(targetFat)
      },
      nutrientsActual: totals,
      ayurvedicNotes
    };

    try {
      const res = await fetch(`${API_URL}/diet-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Ayurvedic diet plan saved and activated successfully!');
        navigate('/dashboard');
      } else {
        const errData = await res.json();
        alert(`Failed to save: ${errData.error}`);
      }
    } catch (err) {
      alert('Network failure saving diet plan.');
    }
  };

  if (loading) {
    return <p>Loading dietitian planner tools...</p>;
  }

  if (!patient) {
    return <p>Patient profile not found.</p>;
  }

  const totals = calculateTotals();

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-text" onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <span style={{ color: 'var(--text-muted)' }}>
          Create Diet Plan for <strong>{patient.name}</strong> (Dosha: {patient.dosha || 'Not Assessed'})
        </span>
      </div>

      <div className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div className="dashboard-title-area">
          <h2>Diet Planner</h2>
          <p>Compose meal schedules, configure daily nutritional limits, and input Ayurvedic instructions.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSavePlan} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={18} />
          Save & Activate Plan
        </button>
      </div>

      <div className="planner-layout">
        {/* Left Side: Meals builder */}
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Meal Settings</h3>
            <div className="form-group">
              <label className="form-label">Diet Plan Name</label>
              <input
                type="text"
                className="form-control"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g. Vata Balancing Summer Plan"
              />
            </div>
          </div>

          {/* Meals list */}
          {Object.keys(meals).map(mealName => (
            <div key={mealName} className="meal-block">
              <div className="meal-header">
                <h3 style={{ textTransform: 'capitalize', fontSize: '1.3rem' }}>{mealName}</h3>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleOpenAddModal(mealName)}>
                  <Plus size={14} /> Add Food
                </button>
              </div>

              {meals[mealName].length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  No foods added yet for this meal. Click "Add Food".
                </p>
              ) : (
                <div className="meal-items-list">
                  {meals[mealName].map((item, idx) => (
                    <div key={idx} className="meal-item-row">
                      <div>
                        <strong>{item.name}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          ({item.quantity} x {item.multiplier})
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                            Vata: {item.vata_effect}
                          </span>
                          <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                            Pitta: {item.pitta_effect}
                          </span>
                          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                            Kapha: {item.kapha_effect}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          {Math.round(item.calories * item.multiplier)} kcal
                        </span>
                        <button className="btn-text" style={{ color: 'var(--danger-color)', padding: '0.25rem' }} onClick={() => handleRemoveItem(mealName, idx)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Lifestyle Notes */}
          <div className="card">
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Ayurvedic Lifestyle & Custom Instructions</h3>
            <div className="form-group">
              <label className="form-label">Lifestyle Rules & Guidelines</label>
              <textarea
                className="form-control"
                value={ayurvedicNotes}
                onChange={(e) => setAyurvedicNotes(e.target.value)}
                placeholder="e.g. Sip warm ginger tea throughout the day. Avoid eating cold salads after sunset. Chew food 32 times. Meditate for 10 minutes in the morning..."
                style={{ height: '120px', resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Sticky Nutrients targets tracker */}
        <div className="nutrients-sidebar">
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} style={{ color: 'var(--secondary-color)' }} />
              Nutritional Limits
            </h3>

            {/* Target inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Calories</label>
                <input
                  type="number"
                  className="form-control"
                  value={targetCals}
                  onChange={(e) => setTargetCals(e.target.value)}
                  style={{ padding: '0.5rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Protein (g)</label>
                <input
                  type="number"
                  className="form-control"
                  value={targetProtein}
                  onChange={(e) => setTargetProtein(e.target.value)}
                  style={{ padding: '0.5rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Carbs (g)</label>
                <input
                  type="number"
                  className="form-control"
                  value={targetCarbs}
                  onChange={(e) => setTargetCarbs(e.target.value)}
                  style={{ padding: '0.5rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Fat (g)</label>
                <input
                  type="number"
                  className="form-control"
                  value={targetFat}
                  onChange={(e) => setTargetFat(e.target.value)}
                  style={{ padding: '0.5rem' }}
                />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

            {/* Live Progress Bar Aggregators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="nutrient-progress-group">
                <div className="nutrient-progress-label">
                  <span>Calories</span>
                  <span>{Math.round(totals.calories)} / {targetCals} kcal</span>
                </div>
                <div className="nutrient-progress-bar-bg">
                  <div 
                    className={`nutrient-progress-bar-fill ${totals.calories > targetCals ? 'exceeded' : ''}`}
                    style={{ width: `${Math.min((totals.calories / targetCals) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="nutrient-progress-group">
                <div className="nutrient-progress-label">
                  <span>Protein</span>
                  <span>{Math.round(totals.protein)} / {targetProtein} g</span>
                </div>
                <div className="nutrient-progress-bar-bg">
                  <div 
                    className={`nutrient-progress-bar-fill ${totals.protein > targetProtein ? 'exceeded' : ''}`}
                    style={{ width: `${Math.min((totals.protein / targetProtein) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="nutrient-progress-group">
                <div className="nutrient-progress-label">
                  <span>Carbohydrates</span>
                  <span>{Math.round(totals.carbohydrates)} / {targetCarbs} g</span>
                </div>
                <div className="nutrient-progress-bar-bg">
                  <div 
                    className={`nutrient-progress-bar-fill ${totals.carbohydrates > targetCarbs ? 'exceeded' : ''}`}
                    style={{ width: `${Math.min((totals.carbohydrates / targetCarbs) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="nutrient-progress-group">
                <div className="nutrient-progress-label">
                  <span>Fat</span>
                  <span>{Math.round(totals.fat)} / {targetFat} g</span>
                </div>
                <div className="nutrient-progress-bar-bg">
                  <div 
                    className={`nutrient-progress-bar-fill ${totals.fat > targetFat ? 'exceeded' : ''}`}
                    style={{ width: `${Math.min((totals.fat / targetFat) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {patient.dosha && (
              <div className="nutrient-summary-box">
                <strong>Dosha Balancing Rules:</strong>
                <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
                  Patient has a <strong>{patient.dosha}</strong> constitution. Ensure menu selection pacifies this Dosha where possible by balancing warming, cooling, grounding, or light properties.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Food Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select Food Item</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label className="form-label">Search / Select Food</label>
                <select
                  className="form-control"
                  value={selectedFoodId}
                  onChange={(e) => setSelectedFoodId(e.target.value)}
                >
                  {foodsList.map(food => (
                    <option key={food.id} value={food.id}>
                      {food.name} ({food.category}) - {food.calories} kcal
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Portion Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={foodQuantity}
                  onChange={(e) => setFoodQuantity(e.target.value)}
                  placeholder="e.g. 1 bowl, 2 pieces, 2 tablespoons"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Serving Multiplier (Portion size factor)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={multiplier}
                  onChange={(e) => setMultiplier(e.target.value)}
                  placeholder="e.g. 1.0 (default), 1.5, 2.0"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Adjusts calories and nutrients proportionally (e.g. 0.5 for half serving, 2.0 for double).
                </span>
              </div>

              {selectedFoodId && foodsList.find(f => f.id === parseInt(selectedFoodId)) && (
                <div style={{ background: '#f4f7f5', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                  <strong>Selected Food Ayurvedic Properties:</strong>
                  {(() => {
                    const f = foodsList.find(f => f.id === parseInt(selectedFoodId));
                    const props = f.ayurvedic_properties;
                    return (
                      <div style={{ marginTop: '0.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                        <div>Rasa (Taste): {props.rasa}</div>
                        <div>Virya (Action): {props.virya}</div>
                        <div>Vipaka (Post-digestion): {props.vipaka}</div>
                        <div>Vata: {f.vata_effect}</div>
                        <div>Pitta: {f.pitta_effect}</div>
                        <div>Kapha: {f.kapha_effect}</div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Add to {activeMealTarget}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
