import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Award, Leaf, Flame, Activity, CheckSquare } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <span className="badge badge-primary" style={{ marginBottom: '1rem', padding: '0.4rem 1rem' }}>
            Smart India Hackathon 2026 Submission
          </span>
          <h1 className="hero-title">
            Smart <span style={{ color: 'var(--secondary-color)', fontStyle: 'italic' }}>Ayurvedic</span> Diet Management
          </h1>
          <p className="hero-subtitle">
            A comprehensive cloud-based practice management and nutrient analysis platform. Unifying traditional Ayurvedic principles (Prakriti, Dosha) with modern clinical nutritional science to create personalized, rule-based diet plans.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">
                Go to My Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">
                  Get Started (Register/Login)
                </Link>
                <a href="#features" className="btn btn-secondary">
                  Explore Features
                </a>
              </>
            )}
          </div>
        </div>
        <div className="hero-image-container">
          <div className="hero-circle"></div>
          {/* A mock UI showing professional dietitian analysis */}
          <div className="card" style={{ padding: '1.5rem', width: '320px', transform: 'rotate(-2deg)', boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(26,66,32,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Active Diet Plan</h4>
              <span className="badge badge-success">Active</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>Vata-Pitta Balancing Diet</span>
              </div>
              <div style={{ background: '#f0f4f1', padding: '0.5rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                  <span>Nutrients (Actual vs Target)</span>
                  <span>1450 / 1800 kcal</span>
                </div>
                <div style={{ height: '6px', background: '#dce5de', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '80%', height: '100%', background: 'var(--primary-color)' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>Mung Dal Kitchari</span>
                <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>Soaked Almonds</span>
                <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>Ghee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" style={{ padding: '5rem 0 2rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Fully Operational Core Modules</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Empowering Ayurvedic Dietitians with cloud-based automation to calculate Prakriti assessments, track calorie targets, and compose custom menus.
          </p>
        </div>

        <div className="grid-3">
          <div className="card">
            <div className="info-icon" style={{ marginBottom: '1.5rem', width: '60px', height: '60px', borderRadius: '12px' }}>
              <Activity size={28} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Interactive Prakriti Quiz</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              A 10-parameter Ayurvedic assessment analyzing physical attributes, sleeping patterns, digestion, stress, and joints to calculate dominant Doshas (Vata, Pitta, Kapha) in real time.
            </p>
          </div>

          <div className="card">
            <div className="info-icon" style={{ marginBottom: '1.5rem', width: '60px', height: '60px', borderRadius: '12px', backgroundColor: 'rgba(181, 141, 61, 0.08)', color: 'var(--secondary-color)' }}>
              <Leaf size={28} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Ayurvedic Food Database</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Pre-loaded with traditional foods and spices (like Ghee, Ginger, Spinach, Honey). Includes detailed clinical nutrient values (calories, protein, carbs, fat) and Dosha compatibility flags.
            </p>
          </div>

          <div className="card">
            <div className="info-icon" style={{ marginBottom: '1.5rem', width: '60px', height: '60px', borderRadius: '12px' }}>
              <CheckSquare size={28} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Practice Management</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Provides a digital registry for dietitians to log new patient profiles, retrieve history, track weight trends, and schedule follow-ups. Includes secure credentials and authentication.
            </p>
          </div>
        </div>
      </section>

      {/* Target Audiences benefit */}
      <section style={{ background: 'var(--primary-dark)', padding: '5rem 3rem', borderRadius: 'var(--radius-lg)', color: 'white', margin: '4rem 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem' }}>Impact & Benefits</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', maxWidth: '600px', margin: '0 auto' }}>
              Designed to optimize patient care and bring structure to Ayurvedic wellness programs.
            </p>
          </div>

          <div className="grid-2">
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Award style={{ color: 'var(--secondary-color)' }} /> For Ayurvedic Dietitians
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem', color: 'rgba(255,255,255,0.8)' }}>
                <li>Simplifies practice management by digitizing patient health history.</li>
                <li>Eliminates manual nutrient arithmetic by auto-aggregating menu calories.</li>
                <li>Generates beautiful, printable, rule-based dietary charts.</li>
              </ul>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Flame style={{ color: 'var(--secondary-color)' }} /> For Clients & Patients
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem', color: 'rgba(255,255,255,0.8)' }}>
                <li>Gain transparent insights into your Prakriti type (Vata, Pitta, Kapha).</li>
                <li>Access active, dietitian-curated meal lists anytime, anywhere.</li>
                <li>Check off daily meal guidelines to maintain metabolic balance (Agni).</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <p>© 2026 Spartans Team. Developed for Smart India Hackathon.</p>
        <p>Ayuva Diet Management Software is fully operational.</p>
      </footer>
    </div>
  );
}
