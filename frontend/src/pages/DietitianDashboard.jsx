import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { PlusCircle, Search, ClipboardCheck, Apple, Trash2, ShieldAlert, BarChart3, Users } from 'lucide-react';

export default function DietitianDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // AI Report State
  const [aiReport, setAiReport] = useState(null);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [currentPatientName, setCurrentPatientName] = useState('');

  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'patients';

  // New Patient Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [conditions, setConditions] = useState('');
  const [formError, setFormError] = useState('');

  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
    if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab]);

  async function fetchPatients() {
    try {
      const res = await fetch(`${API_URL}/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      } else {
        console.error('Error fetching patients');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAnalytics() {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`${API_URL}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setAnalytics(await res.json());
    } catch (err) { console.error(err); } finally { setAnalyticsLoading(false); }
  }

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !age || !gender) {
      setFormError('Name, age, and gender are required.');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum >= 150) {
      setFormError('Age must be a valid number between 1 and 149.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          age: parseInt(age),
          gender,
          phone,
          email,
          health_conditions: conditions
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Reset form
        setName('');
        setAge('');
        setGender('Female');
        setPhone('');
        setEmail('');
        setConditions('');
        setShowAddModal(false);
        fetchPatients();
      } else {
        setFormError(data.error || 'Failed to add patient.');
      }
    } catch (err) {
      setFormError('Failed to communicate with backend.');
    }
  };

  const handleGenerateAiReport = async (patientId, patientName) => {
    setGeneratingAi(true);
    setShowAiModal(true);
    setCurrentPatientName(patientName);
    setAiReport(null);

    try {
      const res = await fetch(`${API_URL}/ai/analyze-client/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAiReport(data.report);
      } else {
        setAiReport(`Error: ${data.error || 'Failed to generate report'}`);
      }
    } catch (err) {
      setAiReport(`Error: Could not connect to server. ${err.message}`);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleDeletePatient = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete patient "${name}" and all their assessments and diet plans?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/patients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPatients();
      } else {
        alert('Failed to delete patient.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
    (p.dosha && p.dosha.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fade-in">
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <h2>{activeTab === 'analytics' ? 'Practice Analytics' : 'Patients Registry'}</h2>
          <p>{activeTab === 'analytics' ? 'Insights about your patient base and practice activity.' : 'Register, assess, and manage Ayurvedic diet profiles for your patients.'}</p>
        </div>
        {activeTab !== 'analytics' && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <PlusCircle size={18} />
            Register Patient
          </button>
        )}
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          {analyticsLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading analytics...</div>
          ) : !analytics ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>No data yet. Add patients to see analytics.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* KPI Cards */}
              <div className="grid-4" style={{ gap: '1rem' }}>
                {[
                  { label: 'Total Patients', value: analytics.totalPatients, color: 'var(--primary-color)', icon: '👥' },
                  { label: 'Dosha Assessed', value: analytics.assessedPatients, color: 'var(--secondary-color)', icon: '🌿' },
                  { label: 'Active Plans', value: analytics.activePlans, color: 'var(--success-color)', icon: '📋' },
                  { label: 'Online Clients', value: analytics.onlineClients, color: '#1565c0', icon: '🌐' },
                ].map(({ label, value, color, icon }) => (
                  <div key={label} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</div>
                  </div>
                ))}
              </div>

              <div className="grid-2" style={{ gap: '1.5rem' }}>
                {/* Dosha Distribution */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart3 size={20} style={{ color: 'var(--primary-color)' }} /> Dosha Distribution
                  </h3>
                  {analytics.doshaDistribution.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No assessed patients yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {analytics.doshaDistribution.map(({ dosha, count }) => {
                        const pct = analytics.assessedPatients > 0 ? Math.round((count / analytics.assessedPatients) * 100) : 0;
                        const color = dosha?.includes('Vata') ? '#5c7cfa' : dosha?.includes('Pitta') ? '#f03e3e' : '#37b24d';
                        return (
                          <div key={dosha}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                              <span style={{ fontWeight: 600 }}>{dosha}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{count} patients ({pct}%)</span>
                            </div>
                            <div style={{ height: '10px', background: '#f0f0f0', borderRadius: '999px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px', transition: 'width 0.6s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Top Health Conditions */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={20} style={{ color: 'var(--secondary-color)' }} /> Top Health Conditions
                  </h3>
                  {analytics.topConditions.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No conditions recorded yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {analytics.topConditions.map(({ name, count }) => {
                        const maxCount = analytics.topConditions[0]?.count || 1;
                        const pct = Math.round((count / maxCount) * 100);
                        return (
                          <div key={name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 600 }}>{name}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{count}</span>
                            </div>
                            <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '999px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--secondary-color)', borderRadius: '999px', transition: 'width 0.6s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Plans Chart */}
              {analytics.monthlyPlans.length > 0 && (
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1.25rem' }}>📅 Diet Plans Created — Last 6 Months</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '120px' }}>
                    {analytics.monthlyPlans.map(({ month, count }) => {
                      const maxCount = Math.max(...analytics.monthlyPlans.map(m => m.count), 1);
                      const heightPct = Math.max((count / maxCount) * 100, 8);
                      const label = month ? month.split('-').slice(1).join('/') + ' ' + month.split('-')[0].slice(2) : '';
                      return (
                        <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)' }}>{count}</span>
                          <div style={{ width: '100%', height: `${heightPct}%`, background: 'var(--primary-color)', borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease', opacity: 0.85 }} />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Patients Tab (default) */}
      {activeTab !== 'analytics' && (<>
      {/* Stats Board */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
          <div className="info-icon" style={{ backgroundColor: 'rgba(26,66,32,0.08)', color: 'var(--primary-color)' }}>
            <ClipboardCheck size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--primary-dark)' }}>{patients.length}</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Registered Patients</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
          <div className="info-icon" style={{ backgroundColor: 'rgba(181, 141, 61, 0.08)', color: 'var(--secondary-color)' }}>
            <Apple size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--primary-dark)' }}>
              {patients.filter(p => p.dosha).length}
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Prakriti Assessed</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
          <div className="info-icon" style={{ backgroundColor: 'rgba(46, 125, 50, 0.08)', color: 'var(--success-color)' }}>
            <Search size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--primary-dark)' }}>
              {patients.filter(p => p.email && p.linked_user_id).length}
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Connected Online Clients</p>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Registered Patients</h3>
          <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, dosha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {loading ? (
          <p>Loading patient database...</p>
        ) : filteredPatients.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No patients found matching your search. Click "Register Patient" to add one.
          </p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age/Gender</th>
                  <th>Contact info</th>
                  <th>Dominant Dosha</th>
                  <th>Conditions</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>{patient.name}</span>
                      {patient.client_id && (
                        <span className="badge badge-success" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                          Online Client
                        </span>
                      )}
                    </td>
                    <td>{patient.age} yrs / {patient.gender}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{patient.phone || 'No phone'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{patient.email || 'No email'}</div>
                    </td>
                    <td>
                      {patient.dosha ? (
                        <span className="badge badge-primary">{patient.dosha}</span>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Not Assessed</span>
                      )}
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={patient.health_conditions}>
                        {patient.health_conditions || 'None'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => navigate(`/assessment/${patient.id}`)}>
                          Quiz
                        </button>
                        <button className="btn btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => navigate(`/diet-planner/${patient.id}`)}>
                          Plan Diet
                        </button>
                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleGenerateAiReport(patient.id, patient.name)}>
                          AI Analysis
                        </button>
                        <button 
                          className="btn btn-text" 
                          style={{ padding: '0.4rem', color: 'var(--danger-color)' }}
                          onClick={() => handleDeletePatient(patient.id, patient.name)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Register New Patient</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)} title="Close">
                ×
              </button>
            </div>

            <form onSubmit={handleAddPatient} style={{ padding: '1.75rem 2rem 2rem 2rem', overflowY: 'auto', flex: 1 }}>
              {formError && (
                <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', display: 'flex', gap: '0.4rem', alignItems: 'center', background: 'rgba(198,40,40,0.06)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <ShieldAlert size={16} />
                  <span style={{ fontSize: '0.85rem' }}>{formError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              </div>

              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 45"
                    min="1"
                    max="149"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    className="form-control form-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Optional)</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. patient@gmail.com"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  If the patient registers online with this email, their accounts will automatically link!
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Health Conditions &amp; Habits</label>
                <textarea
                  className="form-control"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="e.g. High acidity, bloating, wakes up at 5am, sleeps late..."
                  style={{ height: '80px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Create Patient Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Report Modal */}
      {showAiModal && (
        <div className="modal-overlay" onClick={() => setShowAiModal(false)}>
          <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>AI Analysis: {currentPatientName}</h3>
              <button className="close-btn" onClick={() => setShowAiModal(false)} title="Close">
                ×
              </button>
            </div>
            <div className="modal-body" style={{ background: '#f9fbf9' }}>
              {generatingAi ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="spinner" style={{ margin: '0 auto 1rem', width: '40px', height: '40px', border: '4px solid rgba(26,66,32,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <p style={{ color: 'var(--text-muted)' }}>Generating comprehensive Ayurvedic analysis... This may take a moment.</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : (
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  {aiReport}
                </div>
              )}
            </div>
            <div style={{ padding: '1rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'white' }}>
              <button className="btn btn-secondary" onClick={() => setShowAiModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      </>)}
    </div>
  );
}
