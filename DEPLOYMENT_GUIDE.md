# Complete Guide: Deploying AYUVA Platform Online (100% Free)

This guide walks you through deploying the **Spartans AYUVA Ayurvedic Diet Platform** online with a live domain, real email OTP verification, and production security.

---

## Architecture Overview

```
 [ Client Browser ] 
        │
        ▼ (HTTPS)
 [ Frontend UI (Vercel) ] ── (REST API) ──▶ [ Backend API (Render / Railway) ]
                                                   │
                                                   ├──▶ [ SQLite Database ]
                                                   └──▶ [ Gmail SMTP / Nodemailer (Real OTP Emails) ]
```

---

## Part 1: Setting up Real Email OTP (Gmail App Password)

To send real OTP codes to user inboxes for free:
1. Open your Google Account at [myaccount.google.com/security](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned **ON**.
3. Search for **App Passwords** (or navigate to `https://myaccount.google.com/apppasswords`).
4. Create a new App Password named `AYUVA Platform`.
5. Copy the 16-character generated password (e.g., `abcd efgh ijkl mnop`).
6. Add these variables into your backend `.env` (or Render Environment Variables):
   ```env
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASS=abcdefghijklmnop
   ```

*Note: You can also use Brevo, SendGrid, Resend, or AWS SES via standard `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`!*

---

## Part 2: Deploying the Backend (Render.com)

1. Push your repository to **GitHub**.
2. Go to [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Fill in the settings:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. In the **Environment Variables** section, add:
   - `PORT` = `5000`
   - `JWT_SECRET` = (create a long secure random string)
   - `GMAIL_USER` = `your_email@gmail.com`
   - `GMAIL_APP_PASS` = `your_16_char_app_password`
   - `NODE_ENV` = `production`
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL (e.g. `https://spartans-backend.onrender.com`).

---

## Part 3: Deploying the Frontend (Vercel)

1. Go to [Vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select `frontend`.
4. In the **Environment Variables** section, add:
   - `VITE_API_URL` = `https://spartans-backend.onrender.com` *(your live Render backend URL from Part 2)*
5. Click **Deploy**.
6. Vercel will give you a live production URL (e.g., `https://spartans-ayurveda.vercel.app`)!

---

## Part 4: Testing & Verification Checklist

- [x] **Sign In with Password**: Dietitian and Client pre-seeded accounts work.
- [x] **Sign In with Email OTP**: Enter any registered email, receive 6-digit OTP code, and log in passwordless.
- [x] **Create Account with OTP**: Enter details, get OTP code in email, verify, and auto-login.
- [x] **Prakriti Assessment & Diet Planner**: Live dynamic calculation and real-time syncing.
