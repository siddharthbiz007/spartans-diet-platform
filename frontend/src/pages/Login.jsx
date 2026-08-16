import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import {
  Leaf,
  LogIn,
  UserPlus,
  AlertCircle,
  HelpCircle,
  Mail,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function Login() {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [loginMode, setLoginMode] = useState('password'); // 'password' | 'otp'

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('client');
  const [dietitianId, setDietitianId] = useState('');
  const [dietitiansList, setDietitiansList] = useState([]);
  const [dietitianSearch, setDietitianSearch] = useState('');

  // OTP Step States
  const [otpStep, setOtpStep] = useState(false); // true when waiting for OTP code entry
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState('');

  // Status states
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithOtp, sendOtp, signupWithOtp } = useAuth();
  const navigate = useNavigate();
  const otpInputRefs = useRef([]);

  // Fetch list of dietitians for dropdown on mount
  useEffect(() => {
    fetchDietitians();
  }, []);

  // Timer countdown for resending OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  async function fetchDietitians() {
    try {
      const res = await fetch(`${API_URL}/dietitians`);
      if (res.ok) {
        const data = await res.json();
        setDietitiansList(data);
        if (data.length > 0) {
          setDietitianId(data[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching dietitians list:', err);
    }
  }

  // Handle individual digit input for 6-digit OTP
  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    // Auto focus next box
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpCode(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // Trigger Send OTP for Sign Up or OTP Login
  const handleSendOtp = async (purpose) => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await sendOtp(email, purpose);
      setOtpStep(true);
      setResendTimer(60);
      setSuccessMsg(`A 6-digit verification code was sent to ${email}.`);
      if (res.devCode) {
        setDevOtpHint(res.devCode);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Password-based Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Submit OTP-based Login
  const handleOtpLogin = async (e) => {
    e.preventDefault();
    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginWithOtp(email, fullCode);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Registration with OTP Verification
  const handleVerifiedSignup = async (e) => {
    e.preventDefault();
    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signupWithOtp(
        name,
        email,
        password,
        role,
        role === 'client' ? dietitianId : undefined,
        fullCode
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetAllStates = (toLoginTab) => {
    setIsLoginTab(toLoginTab);
    setOtpStep(false);
    setOtpCode(['', '', '', '', '', '']);
    setError('');
    setSuccessMsg('');
    setDevOtpHint('');
    setResendTimer(0);
  };

  return (
    <div className="auth-wrapper fade-in">
      <div className="auth-header">
        <div style={{ display: 'inline-flex', color: 'var(--primary-color)', marginBottom: '1rem' }}>
          <Leaf size={40} strokeWidth={2.5} />
        </div>
        <h2>SPARTANS</h2>
        <p style={{ color: 'var(--text-muted)' }}>Ayurvedic Diet Management Portal</p>
      </div>

      <div className="card" style={{ padding: '2.5rem' }}>
        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <button
            type="button"
            className="btn-text"
            style={{
              flex: 1,
              paddingBottom: '1rem',
              fontWeight: 600,
              color: isLoginTab ? 'var(--primary-color)' : 'var(--text-muted)',
              borderBottom: isLoginTab ? '2px solid var(--primary-color)' : 'none',
              borderRadius: 0,
              cursor: 'pointer'
            }}
            onClick={() => resetAllStates(true)}
          >
            Sign In
          </button>
          <button
            type="button"
            className="btn-text"
            style={{
              flex: 1,
              paddingBottom: '1rem',
              fontWeight: 600,
              color: !isLoginTab ? 'var(--primary-color)' : 'var(--text-muted)',
              borderBottom: !isLoginTab ? '2px solid var(--primary-color)' : 'none',
              borderRadius: 0,
              cursor: 'pointer'
            }}
            onClick={() => resetAllStates(false)}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(198, 40, 40, 0.08)',
            color: 'var(--danger-color)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(46, 125, 50, 0.08)',
            color: 'var(--primary-color)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dev OTP Display Helper (if running in dev mode without configured SMTP) */}
        {devOtpHint && (
          <div style={{
            background: '#fff9db',
            border: '1px solid #ffe066',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: '#856404'
          }}>
            <strong>Demo / Test Mode OTP:</strong> <code style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1b4332' }}>{devOtpHint}</code>
            <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.85 }}>
              (Configure SMTP in .env for live emails)
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 1: SIGN IN TAB                                                       */}
        {/* ========================================================================= */}
        {isLoginTab && (
          <div>
            {/* Toggle between Password Login & OTP Login */}
            <div style={{
              display: 'flex',
              background: 'var(--background-color)',
              padding: '4px',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <button
                type="button"
                onClick={() => { setLoginMode('password'); setOtpStep(false); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: loginMode === 'password' ? '600' : '500',
                  background: loginMode === 'password' ? '#fff' : 'transparent',
                  color: loginMode === 'password' ? 'var(--primary-dark)' : 'var(--text-muted)',
                  boxShadow: loginMode === 'password' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Lock size={15} /> Password Sign In
              </button>
              <button
                type="button"
                onClick={() => { setLoginMode('otp'); setOtpStep(false); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: loginMode === 'otp' ? '600' : '500',
                  background: loginMode === 'otp' ? '#fff' : 'transparent',
                  color: loginMode === 'otp' ? 'var(--primary-dark)' : 'var(--text-muted)',
                  boxShadow: loginMode === 'otp' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Mail size={15} /> Email OTP Sign In
              </button>
            </div>

            {/* Subcase 1A: Password Sign In */}
            {loginMode === 'password' && (
              <form onSubmit={handlePasswordLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. dietitian@spartans.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : (
                    <>
                      <LogIn size={18} />
                      Sign In
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Subcase 1B: OTP Sign In */}
            {loginMode === 'otp' && (
              <div>
                {!otpStep ? (
                  <div>
                    <div className="form-group">
                      <label className="form-label">Registered Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                        We will send a 6-digit one-time code to your inbox to log in instantly.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendOtp('login')}
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
                      disabled={loading || !email}
                    >
                      {loading ? 'Sending Code...' : (
                        <>
                          <Mail size={18} />
                          Send Login OTP Code
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleOtpLogin}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Enter the 6-digit code sent to:
                      </div>
                      <div style={{ fontWeight: 'bold', color: 'var(--primary-dark)', fontSize: '0.95rem' }}>
                        {email}
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpStep(false)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', marginTop: '4px' }}
                      >
                        Change email
                      </button>
                    </div>

                    {/* 6-Digit OTP Box */}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '1.5rem 0' }}>
                      {otpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={handleOtpPaste}
                          style={{
                            width: '44px',
                            height: '52px',
                            textAlign: 'center',
                            fontSize: '1.4rem',
                            fontWeight: '700',
                            borderRadius: '8px',
                            border: '1.5px solid var(--border-color)',
                            backgroundColor: '#fff',
                            color: 'var(--primary-dark)'
                          }}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
                      disabled={loading || otpCode.join('').length !== 6}
                    >
                      {loading ? 'Verifying...' : (
                        <>
                          <ShieldCheck size={18} />
                          Verify & Sign In
                        </>
                      )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      {resendTimer > 0 ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Resend code in {resendTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp('login')}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <RotateCcw size={14} /> Resend OTP Code
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 2: SIGN UP / CREATE ACCOUNT TAB                                      */}
        {/* ========================================================================= */}
        {!isLoginTab && (
          <div>
            {!otpStep ? (
              /* Step 1: Account Information Details */
              <form onSubmit={(e) => { e.preventDefault(); handleSendOtp('signup'); }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Dr. Meera Iyer or Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Real / Active Inbox)</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                    We'll send a 6-digit OTP verification code to confirm this email.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Register As</label>
                  <select
                    className="form-control form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="client">Client / Patient</option>
                    <option value="dietitian">Ayurvedic Dietitian</option>
                  </select>
                </div>

                {role === 'client' && (
                  <div className="form-group">
                    <label className="form-label">Select Your Ayurvedic Dietitian</label>
                    <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type to search by name or email..."
                        value={dietitianSearch}
                        onChange={(e) => setDietitianSearch(e.target.value)}
                        style={{ paddingLeft: '2.25rem' }}
                      />
                      <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      </span>
                    </div>

                    <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', maxHeight: '140px', overflowY: 'auto', background: 'white' }}>
                      {(dietitianSearch
                        ? dietitiansList.filter(d =>
                            d.name.toLowerCase().includes(dietitianSearch.toLowerCase()) ||
                            d.email.toLowerCase().includes(dietitianSearch.toLowerCase())
                          )
                        : dietitiansList
                      ).map(d => (
                        <div
                          key={d.id}
                          onClick={() => { setDietitianId(d.id.toString()); setDietitianSearch(''); }}
                          style={{
                            padding: '0.65rem 0.85rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border-color)',
                            background: dietitianId === d.id.toString() ? 'rgba(26,66,32,0.07)' : 'transparent',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.85rem' }}>{d.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.email}</div>
                          </div>
                          {dietitianId === d.id.toString() && (
                            <span style={{ color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: 700 }}>✓ Selected</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
                  disabled={loading}
                >
                  {loading ? 'Sending Code...' : (
                    <>
                      <Mail size={18} />
                      Verify Email & Continue
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Enter 6-Digit Email OTP to finalize Signup */
              <form onSubmit={handleVerifiedSignup}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e8f5e9', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <ShieldCheck size={26} />
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: 'var(--primary-dark)' }}>Verify Your Email</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Enter the 6-digit code sent to:
                  </div>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary-dark)', fontSize: '0.95rem' }}>
                    {email}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpStep(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', marginTop: '4px' }}
                  >
                    Edit details or email
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '1.5rem 0' }}>
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      style={{
                        width: '44px',
                        height: '52px',
                        textAlign: 'center',
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        borderRadius: '8px',
                        border: '1.5px solid var(--border-color)',
                        backgroundColor: '#fff',
                        color: 'var(--primary-dark)'
                      }}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
                  disabled={loading || otpCode.join('').length !== 6}
                >
                  {loading ? 'Creating Verified Account...' : (
                    <>
                      <CheckCircle2 size={18} />
                      Verify & Complete Registration
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  {resendTimer > 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Resend OTP in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp('signup')}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RotateCcw size={14} /> Resend OTP Code
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="auth-footer">
        <p>
          {isLoginTab ? (
            <>
              New to Spartans?{' '}
              <span onClick={() => resetAllStates(false)} style={{ cursor: 'pointer', fontWeight: 600 }}>Create an account</span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span onClick={() => resetAllStates(true)} style={{ cursor: 'pointer', fontWeight: 600 }}>Sign in</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
