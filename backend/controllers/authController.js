import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/database.js';
import { sendOtpEmail } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'spartans_secret_key_2026';

// Helper to generate 6 digit random numeric OTP
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Step 1: Send OTP to email
 */
export async function sendOtp(req, res) {
  try {
    const { email, purpose = 'signup' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // If purpose is signup, verify email is not already registered
    if (purpose === 'signup') {
      const existing = await query.get('SELECT id FROM users WHERE email = ?', [cleanEmail]);
      if (existing) {
        return res.status(400).json({ error: 'This email is already registered. Please sign in.' });
      }
    }

    // If purpose is login, verify account exists
    if (purpose === 'login') {
      const existing = await query.get('SELECT id FROM users WHERE email = ?', [cleanEmail]);
      if (!existing) {
        return res.status(404).json({ error: 'No account found with this email. Please sign up first.' });
      }
    }

    const otpCode = generateOtpCode();
    // Expiration: 10 minutes from now (in ISO string for SQLite)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Invalidate prior active OTPs for this email and purpose
    await query.run(
      'UPDATE otp_verifications SET verified = 2 WHERE email = ? AND purpose = ? AND verified = 0',
      [cleanEmail, purpose]
    );

    // Store new OTP
    await query.run(
      'INSERT INTO otp_verifications (email, otp_code, purpose, expires_at, verified) VALUES (?, ?, ?, ?, 0)',
      [cleanEmail, otpCode, purpose, expiresAt]
    );

    // Send actual email via service
    const emailResult = await sendOtpEmail(cleanEmail, otpCode, purpose);

    res.json({
      message: `OTP code sent successfully to ${cleanEmail}`,
      email: cleanEmail,
      purpose,
      mode: emailResult.mode,
      ...(emailResult.devCode ? { devCode: emailResult.devCode } : {})
    });
  } catch (err) {
    console.error('sendOtp error:', err);
    res.status(500).json({ error: 'Failed to send OTP code. Please try again.' });
  }
}

/**
 * Step 2: Verify OTP
 */
export async function verifyOtp(req, res) {
  try {
    const { email, otp, purpose = 'signup' } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    // Find valid matching OTP
    const record = await query.get(
      `SELECT * FROM otp_verifications 
       WHERE email = ? AND otp_code = ? AND purpose = ? AND verified = 0
       ORDER BY id DESC LIMIT 1`,
      [cleanEmail, cleanOtp, purpose]
    );

    if (!record) {
      return res.status(400).json({ error: 'Invalid OTP code. Please check and try again.' });
    }

    const now = new Date();
    const expiry = new Date(record.expires_at);
    if (now > expiry) {
      return res.status(400).json({ error: 'OTP code has expired. Please request a new code.' });
    }

    // Mark as verified
    await query.run('UPDATE otp_verifications SET verified = 1 WHERE id = ?', [record.id]);

    res.json({
      message: 'OTP verified successfully.',
      verified: true,
      email: cleanEmail
    });
  } catch (err) {
    console.error('verifyOtp error:', err);
    res.status(500).json({ error: 'Error verifying OTP code.' });
  }
}

/**
 * Step 3: Register with verified OTP
 */
export async function registerWithOtp(req, res) {
  try {
    const { name, email, password, role, dietitianId, otp } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if OTP was provided & verified
    if (otp) {
      const record = await query.get(
        `SELECT * FROM otp_verifications 
         WHERE email = ? AND otp_code = ? AND purpose = 'signup'
         ORDER BY id DESC LIMIT 1`,
        [cleanEmail, otp.toString().trim()]
      );

      if (!record) {
        return res.status(400).json({ error: 'Invalid verification code.' });
      }

      const now = new Date();
      if (now > new Date(record.expires_at)) {
        return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      }

      // Mark record as verified
      await query.run('UPDATE otp_verifications SET verified = 1 WHERE id = ?', [record.id]);
    }

    // Check if user already exists
    const existingUser = await query.get('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword, role]
    );

    // If client registers, link them to the chosen dietitian
    if (role === 'client') {
      const selectedDietitianId = dietitianId ? parseInt(dietitianId) : 1;
      await query.run(
        'INSERT INTO patients (dietitian_id, client_id, name, age, gender, email) VALUES (?, ?, ?, ?, ?, ?)',
        [selectedDietitianId, result.id, name.trim(), 0, 'Not Specified', cleanEmail]
      );
    }

    // Generate JWT token for immediate auto-login
    const token = jwt.sign(
      { id: result.id, email: cleanEmail, name: name.trim(), role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Account created and verified successfully!',
      token,
      user: {
        id: result.id,
        name: name.trim(),
        email: cleanEmail,
        role
      }
    });
  } catch (err) {
    console.error('registerWithOtp error:', err);
    res.status(500).json({ error: 'Registration failed. ' + err.message });
  }
}

/**
 * Step 4: Login with Email OTP (Passwordless Login)
 */
export async function loginWithOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    // Verify OTP
    const record = await query.get(
      `SELECT * FROM otp_verifications 
       WHERE email = ? AND otp_code = ? AND purpose = 'login' AND verified = 0
       ORDER BY id DESC LIMIT 1`,
      [cleanEmail, cleanOtp]
    );

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired OTP code.' });
    }

    const now = new Date();
    if (now > new Date(record.expires_at)) {
      return res.status(400).json({ error: 'OTP code has expired. Please request a new one.' });
    }

    // Mark OTP as used
    await query.run('UPDATE otp_verifications SET verified = 1 WHERE id = ?', [record.id]);

    // Fetch user
    const user = await query.get('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'OTP verification successful. Signed in!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('loginWithOtp error:', err);
    res.status(500).json({ error: 'Login with OTP failed.' });
  }
}

/**
 * Standard Password-based Registration
 */
export async function register(req, res) {
  try {
    const { name, email, password, role, dietitianId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields (name, email, password, role) are required.' });
    }

    if (role !== 'dietitian' && role !== 'client') {
      return res.status(400).json({ error: 'Role must be either "dietitian" or "client".' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await query.get('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword, role]
    );

    if (role === 'client') {
      const selectedDietitianId = dietitianId ? parseInt(dietitianId) : 1;
      await query.run(
        'INSERT INTO patients (dietitian_id, client_id, name, age, gender, email) VALUES (?, ?, ?, ?, ?, ?)',
        [selectedDietitianId, result.id, name.trim(), 0, 'Not Specified', cleanEmail]
      );
    }

    const token = jwt.sign(
      { id: result.id, email: cleanEmail, name: name.trim(), role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: result.id,
        name: name.trim(),
        email: cleanEmail,
        role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

/**
 * Standard Password-based Login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await query.get('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
}

export async function getMe(req, res) {
  try {
    const user = await query.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Internal server error fetching profile.' });
  }
}

export async function getDietitians(req, res) {
  try {
    const dietitians = await query.all("SELECT id, name, email FROM users WHERE role = 'dietitian' ORDER BY name ASC");
    res.json(dietitians);
  } catch (err) {
    console.error('getDietitians error:', err);
    res.status(500).json({ error: 'Failed to fetch dietitians.' });
  }
}
