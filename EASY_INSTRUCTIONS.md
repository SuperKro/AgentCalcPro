# 🎯 SUPER EASY INSTRUCTIONS
## Just follow exactly what I say - like a recipe!

---

# PART 1: CREATE YOUR ACCOUNTS (Do this first!)

---

## 📧 Account #1: GITHUB (Where your code lives)

### Open your browser and:

1. **Type in address bar:** `github.com`
2. **Click:** Green button "Sign up"
3. **Type:** Your email address
4. **Click:** "Continue"
5. **Type:** Create a password (remember this!)
6. **Click:** "Continue"  
7. **Type:** Choose a username (example: `juanrealtor`)
8. **Click:** "Continue"
9. **Solve** the puzzle they show you
10. **Click:** "Create account"
11. **Check your email** - click the verification link
12. ✅ **DONE!** You have a GitHub account!

---

## 🚀 Account #2: VERCEL (Where your website lives)

### Open a new tab and:

1. **Type in address bar:** `vercel.com`
2. **Click:** "Sign Up" (top right corner)
3. **Click:** "Continue with GitHub" (the black button)
4. **Click:** "Authorize Vercel" (green button)
5. ✅ **DONE!** You have a Vercel account!

---

## 🗄️ Account #3: NEON (Your database)

### Open a new tab and:

1. **Type in address bar:** `neon.tech`
2. **Click:** "Sign Up" or "Get Started"
3. **Click:** "Continue with GitHub"
4. **Click:** "Authorize Neon" 
5. ✅ **DONE!** You have a Neon account!

---

# PART 2: CREATE YOUR DATABASE

---

## In your Neon tab:

1. **Click:** "Create a project" or "New Project"
2. **In "Project name" box, type:** `agentcalc`
3. **In "Region", select:** Singapore (closest to Philippines)
4. **Click:** "Create Project" button

### NOW IMPORTANT - Copy Your Connection String:

5. **Look for** a box that says "Connection string"
6. **Click** the copy icon 📋 next to it
7. **Open Notepad** on your computer
8. **Press** Ctrl+V to paste it there
9. **SAVE** this notepad file! You need it later!

The connection string looks like this:
```
postgresql://neondb_owner:AbCd1234XyZ@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

---

# PART 3: DOWNLOAD YOUR APP FILES

---

## You need to get the files from this sandbox:

### Option A: Ask me to create a downloadable zip
(I'll prepare all files for you)

### Option B: Copy files manually
(I'll show you each file to copy)

**Tell me which option you prefer!**

---

# PART 4: UPLOAD TO GITHUB

---

## In your GitHub tab:

1. **Click:** The "+" icon (top right corner, next to your profile picture)
2. **Click:** "New repository"
3. **In "Repository name" box, type:** `agentcalc-pro`
4. **Click:** The circle next to "Private" (keeps your code secret)
5. **Check ☑️:** "Add a README file"
6. **Click:** Green button "Create repository"

### Now upload your files:

7. **Click:** "Add file" button (above the file list)
8. **Click:** "Upload files"
9. **Drag** your downloaded app folder into the dotted box area
   - OR click "choose your files" and select all files
10. **Wait** for all files to upload (you'll see a progress bar)
11. **Click:** Green button "Commit changes"
12. ✅ **DONE!** Your code is on GitHub!

---

# PART 5: DEPLOY TO VERCEL (Put it online!)

---

## In your Vercel tab:

1. **Click:** "Add New..." button (top right)
2. **Click:** "Project"
3. **Find** your `agentcalc-pro` in the list
4. **Click:** "Import" button next to it

### ⚠️ STOP! Before clicking Deploy, do this:

5. **Scroll down** to find "Environment Variables"
6. **Click:** "Environment Variables" to expand it

### Add your first variable:

7. **In "Name" box, type:** `DATABASE_URL`
8. **In "Value" box, paste:** Your Neon connection string (from Notepad)
9. **Click:** "Add"

### Add your second variable:

10. **In "Name" box, type:** `ADMIN_PASSWORD`
11. **In "Value" box, type:** A secret password you create
    - Example: `MySecret2024!`
    - **REMEMBER THIS PASSWORD!**
12. **Click:** "Add"

### Now deploy:

13. **Click:** Big blue "Deploy" button
14. **Wait** 2-3 minutes (you'll see building progress)
15. 🎉 **CONGRATULATIONS!** You'll see "Congratulations!" with confetti!

### Your website URL:

16. **Click:** "Continue to Dashboard"
17. **Look at top** - you'll see your URL like:
    `https://agentcalc-pro.vercel.app`
18. **Copy this URL** - this is your live website!

---

# PART 6: SETUP YOUR DATABASE TABLES

---

## Go back to your Neon tab:

1. **Click:** Your project name (`agentcalc`)
2. **Click:** "SQL Editor" (in the left menu)
3. **Delete** anything in the text box
4. **Copy** ALL the text below (from CREATE to the last ;):

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  plan VARCHAR(20) NOT NULL DEFAULT 'free',
  calculations_used INTEGER NOT NULL DEFAULT 0,
  plan_expires_at TIMESTAMP,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calculation_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  calculator_type VARCHAR(100) NOT NULL,
  input_data TEXT NOT NULL,
  result_data TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  plan VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  expires_at TIMESTAMP NOT NULL,
  confirmed_by INTEGER,
  rejected_reason TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id INTEGER,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_limits (
  id SERIAL PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP NOT NULL DEFAULT NOW()
);
```

5. **Paste** it into the SQL Editor box
6. **Click:** "Run" button (or the ▶️ play button)
7. **Wait** for green checkmark ✅
8. ✅ **DONE!** Database is ready!

---

# PART 7: SETUP YOUR ADMIN ACCOUNT

---

## Open your live website:

1. **In address bar, type:** `https://YOUR-APP-NAME.vercel.app/admin`
   - Replace YOUR-APP-NAME with your actual app name
   - Example: `https://agentcalc-pro.vercel.app/admin`

2. **Type:** Your admin password (that you created in Part 5, step 11)
3. **Click:** "Login to Dashboard"

### Now setup your payment info:

4. **Click:** "Settings" tab
5. **Fill in your GCash info:**
   - GCash Number: Your number (like 09171234567)
   - Account Name: Your name as shown in GCash
6. **Fill in PayMaya** (optional - if you have it)
7. **Fill in Bank details** (optional - if you want bank transfer)
8. **Check** the prices (default ₱50 monthly, ₱200 lifetime)
9. **Click:** "Save All Settings" button

---

# ✅ ALL DONE! YOUR APP IS LIVE!

---

## Test it now:

1. **Open:** Your website URL (example: `https://agentcalc-pro.vercel.app`)
2. **Click:** "Sign Up Free"
3. **Create** a test account
4. **Try** using a calculator

## Check your admin dashboard:

1. **Open:** Your admin URL (add `/admin` to your website)
2. **Login** with your password
3. **Click:** "Overview" - you should see 1 user (your test account!)

---

# 🎉 CONGRATULATIONS!

You now have:
- ✅ Your own calculator website online
- ✅ Users can sign up and pay you
- ✅ You control everything from admin dashboard
- ✅ Money goes directly to YOUR GCash/PayMaya!

---

# 📝 WRITE DOWN YOUR INFO:

```
My Website: https://_________________________.vercel.app

My Admin Page: https://_________________________.vercel.app/admin

My Admin Password: _________________________

My Neon Database: _________________________

Today's Date: _________________________
```

---

# ❓ PROBLEMS?

### "Page not found" or "Error"
→ Wait 2 minutes and refresh. Vercel is still building.

### "Database error"
→ Make sure you ran the SQL in Part 6

### "Can't login to admin"
→ Check your password is exactly what you typed in Vercel

### Need to see password again?
→ Go to Vercel → Your Project → Settings → Environment Variables

---

# NEXT STEPS (Optional):

1. **Share your link** on Facebook, Instagram
2. **Tell real estate agent friends** about your app
3. **Check admin daily** for new payments
4. **Get a custom domain** like `agentcalc.ph` (costs ~₱500/year)
5. **Put on Play Store** using pwabuilder.com ($25 fee)
