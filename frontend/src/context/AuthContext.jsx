import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('spartans_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('spartans_token', token);
      fetchUserProfile(token);
    } else {
      localStorage.removeItem('spartans_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  async function fetchUserProfile(authToken) {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Token invalid or expired
        setToken(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  // 1. Password Login
  async function login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed.');
    }

    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  // 2. OTP Login (Passwordless)
  async function loginWithOtp(email, otp) {
    const res = await fetch(`${API_URL}/auth/login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'OTP Login failed.');
    }

    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  // 3. Send OTP to Email
  async function sendOtp(email, purpose = 'signup') {
    const res = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to send OTP.');
    }
    return data;
  }

  // 4. Verify OTP Code
  async function verifyOtp(email, otp, purpose = 'signup') {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, purpose })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid OTP code.');
    }
    return data;
  }

  // 5. Signup with OTP verification
  async function signupWithOtp(name, email, password, role, dietitianId, otp) {
    const res = await fetch(`${API_URL}/auth/register-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, dietitianId, otp })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }

    if (data.token) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }

  // 6. Standard Signup (fallback)
  async function signup(name, email, password, role, dietitianId) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, dietitianId })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('spartans_token');
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      loginWithOtp,
      sendOtp,
      verifyOtp,
      signupWithOtp,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
