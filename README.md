# Spartans: Smart Ayurvedic Diet Management Platform (SIH 2026 Submission)

A fully operational practice management and nutrient analysis software for Ayurvedic Dietitians. This platform calculates Prakriti/Dosha assessments based on a 10-parameter questionnaire and outputs custom, nutrient-analyzed diet plans for clients.

---

## Folder Structure

The project is structured into two main parts:
- **/backend**: Express API server + local SQLite database (`database.sqlite`).
- **/frontend**: React UI dashboard styled with a premium forest green & white theme.

---

## Prerequisites

Before running the application, make sure you have **Node.js** installed on your system:
- Check Node.js version by running in terminal: `node -v`
- Check npm version by running: `npm -v`

---

## Step-by-Step Guide to Run the App

You will need to open **two separate terminal windows** (one for the backend and one for the frontend).

### Step 1: Start the Backend Server
1. Open a terminal, and navigate to the `backend` folder:
   ```bash
   cd "d:\new pro\spartans-diet\backend"
   ```
2. Start the backend server:
   ```bash
   npm start
   ```
   *Note: Upon starting, the server will automatically initialize the SQLite database and seed it with default foods and accounts if they don't exist yet.*
   *You should see a message in the terminal saying: `SPARTANS AYURVEDIC BACKEND SERVER RUNNING` at `http://localhost:5000`.*

### Step 2: Start the Frontend React App
1. Open a second terminal window, and navigate to the `frontend` folder:
   ```bash
   cd "d:\new pro\spartans-diet\frontend"
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   *You should see a local URL printed, typically: `http://localhost:5173`.*
3. Open `http://localhost:5173` in your web browser.

---

## Default Login Credentials for Testing

The database comes pre-seeded with the following default accounts. You can sign in directly:

### 1. Ayurvedic Dietitian Account
- **Email:** `dietitian@spartans.com`
- **Password:** `password123`
- *What you can do: Register new patients, run the Prakriti/Dosha assessment quiz, and build daily menu diet plans with automatic nutrient trackers.*

### 2. Client / Patient Account
- **Email:** `client@spartans.com`
- **Password:** `password123`
- *What you can do: Log in to view your profile, dominant Dosha results, daily diet schedules, and submit daily food log updates.*

---

## Creating New Accounts

If you want to test signup:
1. Go to **Sign In / Sign Up** -> **Create Account**.
2. To sign up as a **Dietitian**, select "Ayurvedic Dietitian". You will see an empty patients list where you can register new patients.
3. To sign up as a **Client**, select "Client / Patient".
   *Note: Once you register a client user, ask your dietitian to create a patient profile using that exact email address to link your active diets and Prakriti profile!*
