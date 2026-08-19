# 🚀 AgentCalc Pro - Deployment Guide

This guide covers how to deploy your app to the internet and publish it to the App Store and Play Store.

---

## 📋 Table of Contents

1. [Option 1: Deploy to Vercel (Recommended - FREE)](#option-1-deploy-to-vercel-recommended---free)
2. [Option 2: Deploy to Railway](#option-2-deploy-to-railway)
3. [Option 3: Deploy to Render](#option-3-deploy-to-render)
4. [Publishing to Google Play Store](#publishing-to-google-play-store)
5. [Publishing to Apple App Store](#publishing-to-apple-app-store)
6. [Quick PWA Installation (No App Store Needed)](#quick-pwa-installation)

---

## Option 1: Deploy to Vercel (Recommended - FREE)

Vercel is the company that created Next.js, so it's the easiest option.

### Step 1: Create Accounts
1. Create a GitHub account: https://github.com/signup
2. Create a Vercel account: https://vercel.com/signup (use GitHub login)

### Step 2: Push Code to GitHub
```bash
# In your project folder, run:
git init
git add .
git commit -m "Initial commit - AgentCalc Pro"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/agentcalc-pro.git
git branch -M main
git push -u origin main
```

### Step 3: Set Up PostgreSQL Database
1. Go to https://neon.tech (free PostgreSQL)
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:pass@host/dbname`)

### Step 4: Deploy on Vercel
1. Go to https://vercel.com/new
2. Click "Import" next to your GitHub repo
3. Add Environment Variable:
   - Name: `DATABASE_URL`
   - Value: Your PostgreSQL connection string from Neon
4. Click "Deploy"

### Step 5: Run Database Migration
After deployment, go to Vercel dashboard → Your Project → Settings → Functions → Open Console:
```bash
npx drizzle-kit push
```

**Your app is now live at: `https://your-project.vercel.app`** 🎉

---

## Option 2: Deploy to Railway

Railway offers free PostgreSQL + hosting together.

### Steps:
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Next.js
6. Add PostgreSQL: Click "New" → "Database" → "PostgreSQL"
7. Railway auto-connects the DATABASE_URL
8. Deploy!

**Cost**: Free tier includes $5/month credit (enough for small apps)

---

## Option 3: Deploy to Render

### Steps:
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Add PostgreSQL: "New +" → "PostgreSQL"
7. Add environment variable `DATABASE_URL`
8. Deploy!

---

## Publishing to Google Play Store

### Prerequisites
- Google Play Developer Account ($25 one-time fee): https://play.google.com/console/signup
- Your app deployed and accessible via HTTPS

### Method: Using Capacitor (Recommended)

#### Step 1: Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "AgentCalc Pro" "com.agentcalc.pro"
```

#### Step 2: Configure Capacitor
Create/edit `capacitor.config.ts`:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agentcalc.pro',
  appName: 'AgentCalc Pro',
  webDir: 'out',
  server: {
    // Use your deployed URL
    url: 'https://your-app.vercel.app',
    cleartext: true
  }
};

export default config;
```

#### Step 3: Add Android Platform
```bash
npx cap add android
npx cap sync
```

#### Step 4: Open in Android Studio
```bash
npx cap open android
```

#### Step 5: Build APK/AAB
1. In Android Studio: Build → Generate Signed Bundle/APK
2. Create a new keystore (save it securely!)
3. Build "Android App Bundle (.aab)" for Play Store

#### Step 6: Submit to Play Store
1. Go to https://play.google.com/console
2. Create new app
3. Fill in app details:
   - App name: AgentCalc Pro
   - Category: Finance / Tools
   - Description: Your app description
4. Upload your .aab file
5. Add screenshots (phone & tablet)
6. Set pricing (free with in-app purchases or paid)
7. Submit for review

**Review time**: Usually 1-7 days

---

## Publishing to Apple App Store

### Prerequisites
- Apple Developer Account ($99/year): https://developer.apple.com/programs/
- Mac computer with Xcode installed
- Your app deployed and accessible via HTTPS

### Method: Using Capacitor

#### Step 1: Add iOS Platform
```bash
npm install @capacitor/ios
npx cap add ios
npx cap sync
```

#### Step 2: Open in Xcode
```bash
npx cap open ios
```

#### Step 3: Configure in Xcode
1. Select your project in the navigator
2. Set Bundle Identifier: `com.agentcalc.pro`
3. Select your Team (Apple Developer account)
4. Set iOS Deployment Target: 14.0+

#### Step 4: Add App Icons
1. Open Assets.xcassets
2. Add your icon in all required sizes (use an icon generator tool)

#### Step 5: Archive & Upload
1. Select "Any iOS Device" as build target
2. Product → Archive
3. Click "Distribute App"
4. Choose "App Store Connect"
5. Upload

#### Step 6: Submit on App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Create new app
3. Fill in app details
4. Add screenshots for all device sizes
5. Set pricing
6. Submit for review

**Review time**: Usually 1-3 days

---

## Quick PWA Installation

Your app already supports PWA! Users can install it without going to app stores:

### On Android (Chrome):
1. Visit your deployed URL
2. Tap the menu (3 dots) → "Add to Home Screen"
3. Tap "Install"

### On iPhone (Safari):
1. Visit your deployed URL
2. Tap Share button → "Add to Home Screen"
3. Tap "Add"

### On Desktop (Chrome/Edge):
1. Visit your deployed URL
2. Click the install icon in the address bar
3. Click "Install"

---

## 💰 Estimated Costs Summary

| Service | Cost |
|---------|------|
| Vercel (Hosting) | FREE (Hobby tier) |
| Neon (PostgreSQL) | FREE (0.5GB) |
| Google Play Store | $25 one-time |
| Apple App Store | $99/year |

**Minimum to start**: FREE (web only)
**For both app stores**: $124 first year, $99/year after

---

## 📱 Alternative: PWA Builder (Easiest for App Stores)

Microsoft's PWA Builder can generate app store packages automatically:

1. Go to https://www.pwabuilder.com
2. Enter your deployed URL
3. Click "Start"
4. Download packages for Android & iOS
5. Submit to stores

This is the **easiest** method if you don't want to use Capacitor!

---

## 🔧 Need Help?

Common issues:
- **Database connection fails**: Make sure DATABASE_URL is set correctly
- **Build fails**: Run `npm run build` locally first to check for errors
- **App rejected**: Read rejection feedback carefully, usually it's missing screenshots or privacy policy

---

## 📄 Required Legal Documents

Before publishing to app stores, you need:

1. **Privacy Policy** - Required by both stores
2. **Terms of Service** - Recommended

You can generate these at:
- https://www.privacypolicygenerator.info
- https://www.termsofservicegenerator.net

Add links to these in your app's footer or settings page.

---

Good luck with your launch! 🚀
