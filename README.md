# 💼 Personal Finance

> จัดการเงินอย่างชาญฉลาด · Manage money. Live smarter. · 智能管理财务，轻松生活

แอปบัญชีส่วนตัว รองรับ 3 ภาษา (ไทย / EN / 中文)
Backend: Google Sheets · Deploy: Netlify via GitHub

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18 + Vite 5                   |
| i18n     | Built-in (TH / EN / ZH)             |
| Backend  | Google Apps Script Web App          |
| Database | Google Sheets                       |
| Deploy   | Netlify (auto from GitHub)          |

---

## Project Structure

```
/
├── index.html
├── vite.config.js
├── package.json
├── netlify.toml          ← Build config (no manual Netlify settings needed)
├── .env.example          ← Copy to .env for local dev
├── .gitignore
├── google-apps-script.js ← Paste in Apps Script editor
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx            ← Main UI
    ├── Mascot.jsx         ← Glasses cat mascot SVG
    ├── i18n.js            ← TH / EN / ZH translations
    └── sheetsService.js   ← Google Sheet API layer
```

---

## Setup Guide

### 1. Google Sheet Backend (ทำครั้งเดียว)

1. เปิด [Google Sheets](https://sheets.google.com) → New Sheet
2. **Extensions → Apps Script**
3. ลบโค้ดเดิม → วางโค้ดทั้งหมดจาก `google-apps-script.js`
4. **Deploy → New Deployment**
   - Type: Web App
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy **Web app URL** (ต้องลงท้ายด้วย `/exec`)

### 2. GitHub

1. สร้าง repo ใหม่บน GitHub
2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้
3. ตรวจว่าเห็น `package.json` และ `index.html` ที่ root ทันที (ไม่ต้องกดเข้า folder)

### 3. Netlify

1. [netlify.com](https://netlify.com) → Add new site → Import from GitHub
2. เลือก repo → **Netlify อ่าน `netlify.toml` อัตโนมัติ** ไม่ต้องตั้ง Build settings
3. **Site configuration → Environment variables → Add variable**
   - Key: `VITE_SHEET_URL`
   - Value: URL จาก Step 1
4. **Deploys → Trigger deploy**

### 4. Local Development

```bash
# 1. Clone repo
git clone https://github.com/YOUR_USER/personal-finance.git
cd personal-finance

# 2. Install
npm install

# 3. Create .env
cp .env.example .env
# แก้ไข VITE_SHEET_URL ใน .env

# 4. Run
npm run dev
```

---

## Features

- 💰 บันทึกรายรับ-รายจ่าย
- 📊 กราฟแยกหมวดหมู่ 8 ประเภท
- 🔵🟢 รองรับ WeChat Pay + Alipay
- 🌐 3 ภาษา: ไทย / EN / 中文 (สลับได้ทันที)
- 📋 Google Sheet เป็น backend
- 🐱 Mascot น้องแมวใส่แว่น hoodie สีน้ำเงิน

---

## Environment Variables

| Variable        | Required | Description                         |
|-----------------|----------|-------------------------------------|
| VITE_SHEET_URL  | ✅       | Google Apps Script Web App URL      |
