# 📱 AgentCalc Pro - Simple Setup Guide
## For Non-Techy People (Tagalog/English)

---

## 🎯 What You Will Get

After following this guide, you will have:
- ✅ Your own calculator app on the internet
- ✅ Users can sign up and use it
- ✅ You receive payments via GCash/PayMaya
- ✅ Admin dashboard to manage everything
- ✅ (Optional) Your app on Play Store and App Store

---

## 📋 Things You Need Before Starting

1. **Email Address** - For creating accounts
2. **GCash or PayMaya Account** - To receive payments
3. **Computer or Laptop** - For the setup (phone pwede pero mas madali sa computer)
4. **About 1-2 hours** - For the whole setup

---

## 🚀 STEP-BY-STEP GUIDE

---

### STEP 1: Download Your App Files (5 minutes)

**What to do:**
1. I will give you a link to download all your app files
2. Click the download button
3. Save the ZIP file to your computer
4. Extract/Unzip the file

**You now have:** A folder with all your app files ✅

---

### STEP 2: Create FREE Accounts (10 minutes)

You need to create accounts on these FREE websites:

#### A. GitHub Account (stores your code)
1. Go to: **github.com**
2. Click "Sign Up"
3. Enter your email and create a password
4. Verify your email

#### B. Vercel Account (hosts your website)
1. Go to: **vercel.com**
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Allow access

#### C. Neon Account (your database)
1. Go to: **neon.tech**
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Allow access

**You now have:** 3 accounts ready to use ✅

---

### STEP 3: Create Your Database (10 minutes)

**What to do:**
1. Go to **neon.tech** and login
2. Click "Create Project"
3. Project name: `agentcalc-db`
4. Click "Create Project"
5. You will see a "Connection String" - it looks like this:
   ```
   postgresql://user:password@something.neon.tech/neondb
   ```
6. **COPY THIS** - you will need it later!

**You now have:** Your database ready ✅

---

### STEP 4: Upload Your Code to GitHub (15 minutes)

**Option A: Using GitHub Website (Easiest)**

1. Go to **github.com** and login
2. Click the "+" button (top right) → "New repository"
3. Repository name: `agentcalc-pro`
4. Make it "Private" (so others can't see your code)
5. Click "Create repository"
6. Click "uploading an existing file"
7. Drag ALL your app files into the box
8. Click "Commit changes"

**Option B: Using GitHub Desktop (Mas madali for future updates)**

1. Download GitHub Desktop: **desktop.github.com**
2. Install and login with your GitHub account
3. File → Add Local Repository
4. Choose your app folder
5. Click "Publish repository"

**You now have:** Your code on GitHub ✅

---

### STEP 5: Deploy Your App to the Internet (10 minutes)

**What to do:**
1. Go to **vercel.com** and login
2. Click "Add New..." → "Project"
3. Find your `agentcalc-pro` repository
4. Click "Import"
5. **IMPORTANT:** Before clicking Deploy, add your database:
   - Click "Environment Variables"
   - Add this:
     - Name: `DATABASE_URL`
     - Value: *paste your connection string from Step 3*
   - Add another:
     - Name: `ADMIN_PASSWORD`
     - Value: *create a secret password for admin* (example: `MySecret123!`)
6. Click "Deploy"
7. Wait 2-3 minutes...

**🎉 YOUR APP IS NOW LIVE!**

You will see a URL like: `https://agentcalc-pro.vercel.app`

**You now have:** Your app on the internet ✅

---

### STEP 6: Setup Your Database Tables (5 minutes)

**What to do:**
1. In Vercel, go to your project
2. Click "Settings" tab
3. Click "Functions" on the left
4. Click "Console" tab
5. Type this command and press Enter:
   ```
   npx drizzle-kit push
   ```
6. Wait for it to finish

**You now have:** Your database ready to store users ✅

---

### STEP 7: Setup Your Admin Dashboard (5 minutes)

**What to do:**
1. Go to: `https://YOUR-APP-URL/admin`
   (example: `https://agentcalc-pro.vercel.app/admin`)
2. Enter the admin password you created in Step 5
3. Go to "Settings" tab
4. Enter your payment details:
   - **GCash Number:** Your GCash number
   - **GCash Name:** Your name as it appears in GCash
   - **PayMaya Number:** (optional)
   - **Bank Details:** (optional)
5. Click "Save Payment Settings"
6. Set your prices:
   - Monthly Price: 50 (or whatever you want)
   - Lifetime Price: 200 (or whatever you want)
7. Click "Save Prices"

**You now have:** Your payment settings ready ✅

---

### STEP 8: Test Your App (5 minutes)

**What to do:**
1. Go to your app URL
2. Click "Sign Up Free"
3. Create a test account
4. Try using a calculator
5. Go to Pricing and try the payment flow
6. Check your Admin Dashboard - you should see your test user!

**You now have:** A working app! 🎉

---

## 💰 HOW PAYMENTS WORK

1. **User clicks "Subscribe Monthly" or "Get Lifetime Access"**
2. **User sees YOUR GCash/PayMaya number**
3. **User sends payment to you**
4. **User enters the reference number**
5. **You receive notification in Admin Dashboard**
6. **You verify the payment in your GCash/PayMaya**
7. **You click "Confirm Paid" in Admin Dashboard**
8. **User's account is automatically upgraded!**

---

## 📱 HOW TO PUT ON PLAY STORE (Optional - Costs $25)

### Simple Method: PWA Builder

1. Go to: **pwabuilder.com**
2. Enter your app URL
3. Click "Start"
4. Click "Build My PWA"
5. Download the Android package
6. Go to: **play.google.com/console**
7. Pay the $25 registration fee
8. Create new app
9. Upload the package file
10. Fill in the details (name, description, screenshots)
11. Submit for review

**Wait 1-7 days for approval**

---

## 🍎 HOW TO PUT ON APP STORE (Optional - Costs $99/year)

### Requirements:
- Mac computer (required by Apple)
- Apple Developer account ($99/year)

### Steps:
1. Go to: **pwabuilder.com**
2. Enter your app URL
3. Download the iOS package
4. On your Mac, open Xcode
5. Follow PWA Builder's instructions
6. Submit to App Store

**Wait 1-3 days for approval**

---

## ❓ COMMON QUESTIONS

### "Paano kung may mag-subscribe?"
1. Check your GCash/PayMaya for the payment
2. Go to your Admin Dashboard
3. Click "Payments" tab
4. Find the pending payment
5. Click "Confirm Paid"
6. Done! User is now upgraded

### "Paano ko makikita kung ilan na ang users ko?"
1. Go to Admin Dashboard
2. "Overview" tab shows all statistics
3. "Users" tab shows all users

### "Paano kung gusto ko baguhin ang price?"
1. Go to Admin Dashboard
2. Click "Settings" tab
3. Change the prices
4. Click "Save Prices"

### "Paano kung nakalimutan ko ang admin password?"
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Edit `ADMIN_PASSWORD`
4. Redeploy

### "Paano mag-update ng app?"
1. Edit files in your computer
2. Upload new files to GitHub
3. Vercel automatically updates your app!

---

## 🆘 NEED HELP?

If you get stuck:
1. Take a screenshot of the error
2. Note which step you're on
3. Ask for help with the screenshot

---

## 📝 YOUR INFO (Fill this out for reference)

```
My App URL: _______________________________

My Admin URL: _____________________________ /admin

My Admin Password: _______________________________

My GitHub Repo: _______________________________

My Neon Database: _______________________________

Date Launched: _______________________________
```

---

## 🎉 CONGRATULATIONS!

You now have your own calculator app business!

- ✅ App is live on the internet
- ✅ Users can sign up and pay
- ✅ You receive money directly to your GCash/PayMaya
- ✅ You have full control via Admin Dashboard

**Next steps:**
1. Share your app link on Facebook, Instagram, etc.
2. Tell real estate agent friends about it
3. Check your Admin Dashboard daily for new payments
4. Enjoy your new passive income! 💰

---

*Good luck! Kaya mo yan! 💪*
