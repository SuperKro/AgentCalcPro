# 🚀 PUT YOUR APP ONLINE - Step by Step Guide
## Follow these steps exactly - takes about 30 minutes!

---

## STEP 1: CREATE YOUR ACCOUNTS (10 minutes)

You need 3 FREE accounts. Open each link in a new tab:

### 1A. Create GitHub Account
```
Go to: https://github.com/signup
```
- Enter your email
- Create a password
- Choose a username
- Verify your email
- ✅ Done!

### 1B. Create Vercel Account
```
Go to: https://vercel.com/signup
```
- Click "Continue with GitHub"
- Authorize Vercel
- ✅ Done!

### 1C. Create Neon Account (Database)
```
Go to: https://neon.tech
```
- Click "Sign Up"
- Click "Continue with GitHub"
- Authorize Neon
- ✅ Done!

---

## STEP 2: CREATE YOUR DATABASE (5 minutes)

### 2A. In Neon Dashboard:
1. Click **"New Project"**
2. Project name: `agentcalc`
3. Region: Choose closest to Philippines (Singapore)
4. Click **"Create Project"**

### 2B. Copy Your Database URL:
1. You'll see a "Connection String" box
2. Click the **copy button** 📋
3. It looks like this:
   ```
   postgresql://neondb_owner:abc123xyz@ep-something.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **SAVE THIS** - paste it in Notepad temporarily!

---

## STEP 3: UPLOAD CODE TO GITHUB (10 minutes)

### 3A. Download Your App Files:
Your app files are in this sandbox. You need to download them.

**Option 1: If you have the files on your computer:**
- Skip to step 3B

**Option 2: Download from sandbox:**
- I'll create a download package for you

### 3B. Create Repository on GitHub:
1. Go to: https://github.com/new
2. Repository name: `agentcalc-pro`
3. Select: **Private** (so others can't see your code)
4. ✅ Check "Add a README file"
5. Click **"Create repository"**

### 3C. Upload Your Files:
1. In your new repository, click **"Add file"** → **"Upload files"**
2. Drag ALL your app files/folders into the box:
   - `src/` folder
   - `public/` folder
   - `package.json`
   - `next.config.ts`
   - `tsconfig.json`
   - `postcss.config.mjs`
   - `drizzle.config.json`
   - `eslint.config.mjs`
   - `.env.example` (NOT the actual .env file!)
3. Click **"Commit changes"**

---

## STEP 4: DEPLOY TO VERCEL (5 minutes)

### 4A. Connect Repository:
1. Go to: https://vercel.com/new
2. Find your `agentcalc-pro` repository
3. Click **"Import"**

### 4B. Add Environment Variables (IMPORTANT!):
Before clicking Deploy, scroll down and click **"Environment Variables"**

Add these TWO variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | *(paste your Neon connection string from Step 2B)* |
| `ADMIN_PASSWORD` | *(create your secret admin password, example: `MySecret2024!`)* |

### 4C. Deploy:
1. Click **"Deploy"**
2. Wait 2-3 minutes... ⏳
3. 🎉 **YOUR APP IS LIVE!**

You'll see a URL like: `https://agentcalc-pro.vercel.app`

---

## STEP 5: SETUP DATABASE TABLES (2 minutes)

### 5A. Open Vercel Console:
1. In Vercel, click on your project
2. Go to **"Settings"** tab
3. Click **"Functions"** in the left menu
4. Click **"Logs"** tab
5. Or use the **Deployments** → **Functions** tab

Actually, easier method:

### 5B. Use Neon Console Instead:
1. Go back to https://console.neon.tech
2. Click your project
3. Click **"SQL Editor"** in left menu
4. Copy and paste this SQL, then click **"Run"**:

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

5. Click **"Run"** ▶️
6. You should see "Query executed successfully"
7. ✅ Database is ready!

---

## STEP 6: SETUP YOUR ADMIN (2 minutes)

### 6A. Go to Admin Dashboard:
```
https://YOUR-APP-URL/admin
```
(Replace YOUR-APP-URL with your actual Vercel URL)

### 6B. Login:
- Enter the ADMIN_PASSWORD you set in Step 4B

### 6C. Setup Payment Info:
1. Click **"Settings"** tab
2. Enter your GCash number and name
3. Enter your PayMaya number (optional)
4. Enter your bank details (optional)
5. Set your prices (default: ₱50 monthly, ₱200 lifetime)
6. Click **"Save All Settings"**

---

## ✅ DONE! YOUR APP IS LIVE!

### Your URLs:
- **Main App:** `https://your-app.vercel.app`
- **Admin Dashboard:** `https://your-app.vercel.app/admin`
- **Help Page:** `https://your-app.vercel.app/help`

### Test It:
1. Go to your app URL
2. Click "Sign Up Free"
3. Create a test account
4. Try a calculator
5. Check Admin Dashboard - you should see your test user!

---

## 📱 OPTIONAL: GET A CUSTOM DOMAIN

Instead of `agentcalc-pro.vercel.app`, get `agentcalc.ph` or `agentcalculator.com`

### Buy a Domain:
- https://www.namecheap.com (cheapest)
- https://domains.google (easy)
- Cost: ~₱500-1000/year

### Connect to Vercel:
1. In Vercel, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add your domain
4. Follow the instructions to update DNS

---

## 📱 OPTIONAL: PUT ON PLAY STORE

### Easy Method (PWA Builder):
1. Make sure your app is live on Vercel first
2. Go to: https://www.pwabuilder.com
3. Enter your app URL
4. Click "Start"
5. Download the Android package
6. Go to: https://play.google.com/console
7. Pay $25 one-time fee
8. Create new app and upload
9. Wait for approval (1-7 days)

---

## 🆘 COMMON PROBLEMS

### "Database connection failed"
- Check your DATABASE_URL in Vercel Environment Variables
- Make sure you copied the FULL connection string from Neon
- The URL should start with `postgresql://`

### "Invalid password" on admin login
- Check your ADMIN_PASSWORD in Vercel Environment Variables
- It's case-sensitive!

### Changes not showing
- In Vercel, go to Deployments
- Click "Redeploy" on the latest deployment

### Need to change admin password
- Go to Vercel → Your Project → Settings → Environment Variables
- Edit ADMIN_PASSWORD
- Click Save
- Redeploy

---

## 📝 SAVE THIS INFORMATION

```
My App URL: _________________________________

My Admin URL: ______________________________/admin

My Admin Password: _________________________________

My Vercel Account: _________________________________

My GitHub Repo: _________________________________

My Neon Database: _________________________________

Date Deployed: _________________________________
```

---

🎉 **Congratulations! Your app is now online!**

Share your app URL with real estate agents and start earning!
