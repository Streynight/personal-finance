# 💼 Personal Finance

> Multi-user finance tracker · Deployed on **GitHub Pages** · Backend on **Google Sheets**

✨ Multi-user accounts · 🌐 3 languages (TH/EN/中文) · 🎨 7 color themes · 📱 Mobile/Tablet/Desktop responsive

---

## 🏗️ Architecture (No Netlify, No tokens needed)

```
GitHub Pages (Static Frontend, free)
      ↓ fetch
Google Apps Script (API server, free, runs on Google Cloud)
      ↓
Google Sheets (Database)
   ├── Users tab        → all accounts (username + hashed pwd)
   └── tx_<username>    → one tab per user (their transactions)
```

**Why this works:**
- ✅ GitHub Pages hosts the React app for free
- ✅ Google Apps Script provides the API for free (no key needed)
- ✅ Each user gets their own sheet tab — data isolated per account
- ✅ No Netlify, no AWS, no payment

---

## 📋 STEP-BY-STEP DEPLOYMENT

### STEP 1 — Setup Google Sheet Backend (5 min, one-time)

1. Open [sheets.google.com](https://sheets.google.com) → **Blank** sheet
2. Rename it `Personal Finance DB` (optional)
3. Top menu: **Extensions → Apps Script**
4. Delete the default `function myFunction() {}`
5. Open `google-apps-script.js` from this repo and **paste all of it** into the editor
6. Click 💾 **Save** (Ctrl/Cmd+S) — name the project `pf-backend`
7. Click **Deploy → New deployment**
8. Click ⚙️ next to "Select type" → **Web app**
9. Settings:
   - Description: `pf api v1`
   - Execute as: **Me (your email)**
   - Who has access: **Anyone** ⚠️ (must be Anyone — not "Anyone with Google account")
10. Click **Deploy** → on first time, click **Authorize access** → choose your account → **Advanced → Go to pf-backend (unsafe) → Allow**
11. **Copy the "Web app URL"** — it looks like:
    ```
    https://script.google.com/macros/s/AKfycbz.../exec
    ```
    Save this URL — you'll need it in Step 3.

### STEP 2 — Push code to GitHub

1. Create new repo on GitHub (e.g. `personal-finance`)
2. Upload **all files** in this folder to repo root
   - ✅ Verify: `package.json` and `index.html` are at the **root** of the repo (not inside a subfolder)
3. Commit & push to `main` branch

### STEP 3 — Add GitHub Secret + Enable Pages

1. On your repo → **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `VITE_GAS_URL`
   - Value: paste the URL from Step 1 (must end with `/exec`)
   - Click **Add secret**

2. On your repo → **Settings → Pages**
   - Build and deployment → Source: **GitHub Actions**
   - Save

3. Go to **Actions** tab → you'll see "Deploy to GitHub Pages" running
4. Once green ✅, your site is live at:
   ```
   https://YOUR_USERNAME.github.io/personal-finance/
   ```

### STEP 4 — Test it

1. Open the live URL
2. Click **Create Account** → username: `test`, password: `test123`, confirm
3. Login with the same credentials
4. Add a transaction
5. Open your Google Sheet → you should see:
   - `Users` tab with the new account
   - `tx_test` tab with the transaction

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Multi-user accounts | Register / Login with username + password |
| 🗂️ Per-user data | Each user's transactions in separate sheet tab |
| 🌐 3 Languages | ไทย / English / 中文 — switch instantly |
| 🎨 7 Themes | Blue / Green / Red / Purple / Orange / Mono / Dark |
| 📱 Responsive | Mobile, Tablet, iPad, Desktop optimized |
| 💰 WeChat Pay + Alipay | Tag transactions by source |
| 📊 Category Chart | Visual breakdown of expenses |
| 🐱 Mascot | Professor Fin — glasses cat in hoodie |
| ⚡ Offline-friendly | LocalStorage cache for instant load |

---

## 📁 Project Structure

```
/
├── .github/workflows/deploy.yml  ← Auto-deploys to GitHub Pages on push
├── public/
├── src/
│   ├── main.jsx
│   ├── index.css                 ← Theme system + animations
│   ├── App.jsx                   ← Main app (auth + dashboard)
│   ├── Mascot.jsx                ← SVG mascot
│   ├── i18n.js                   ← TH/EN/ZH translations
│   └── api.js                    ← Google Apps Script client
├── google-apps-script.js         ← Paste in Apps Script editor
├── index.html
├── vite.config.js                ← Auto-detects GitHub repo name for base path
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 💻 Local Development

```bash
git clone https://github.com/YOUR_USERNAME/personal-finance.git
cd personal-finance
cp .env.example .env
# Edit .env and paste your VITE_GAS_URL
npm install
npm run dev
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **404 on GitHub Pages** | Settings → Pages → Source must be "GitHub Actions" |
| **API errors** | Check `VITE_GAS_URL` in GitHub Secrets ends with `/exec` |
| **CORS errors** | Re-deploy Apps Script with "Who has access: **Anyone**" |
| **Build fails** | Check Actions tab for error log |
| **Login works but no data** | Check Apps Script execution log: Apps Script → Executions |

---

## 🔒 Security Notes

- Passwords are hashed with SHA-256 + salt before sending
- Tokens are rotated on each login
- Each user can only access their own `tx_<username>` tab
- Apps Script execution runs as the sheet owner (not user)

⚠️ This is a **personal/hobby** auth system — for production use, consider Firebase Auth or Auth0.
