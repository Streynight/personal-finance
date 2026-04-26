# 💴 MoneyPaw — Personal Finance Tracker

น้องแมวเหรียญ 🐱💰 ช่วยจัดการบัญชีส่วนตัว รองรับ WeChat Pay และ Alipay

---

## 🚀 วิธี Deploy บน Netlify (via GitHub)

### 1. Clone / Upload ไฟล์เหล่านี้ไปใน GitHub repo

```
finance-tracker/
├── index.html
├── vite.config.js
├── package.json
├── netlify.toml
├── .env               ← สร้างเองตามขั้นตอนด้านล่าง
├── google-apps-script.js
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx
    ├── Mascot.jsx
    └── sheetsService.js
```

### 2. ตั้งค่า Google Sheet Backend

1. เปิด [Google Sheet](https://sheets.google.com) ใหม่
2. **Extensions → Apps Script**
3. ลบโค้ดเดิม → วางโค้ดทั้งหมดจากไฟล์ `google-apps-script.js`
4. **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. กด Deploy → Copy **Web app URL**

### 3. สร้างไฟล์ `.env` ใน root ของ project

```env
VITE_SHEET_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

> ⚠️ ห้าม commit ไฟล์ `.env` ขึ้น GitHub — เพิ่ม `.env` ใน `.gitignore`

### 4. ตั้งค่า Environment Variable บน Netlify

- ไปที่ Netlify Dashboard → Site → **Environment variables**
- เพิ่ม key: `VITE_SHEET_URL` → value: URL ที่ copy มา

### 5. Deploy

- Netlify จะ build อัตโนมัติทุกครั้งที่ push ไป GitHub
- Build command: `npm run build`
- Publish directory: `dist`

---

## 💻 รันบนเครื่อง (Local Development)

```bash
npm install
npm run dev
```

---

## 📱 วิธี Export จาก WeChat Pay / Alipay

**WeChat Pay (微信支付):**
Me → Services → Wallet → Bill Detail → ⋯ → Export to Email

**Alipay (支付宝):**
My Account → Transaction History → Export → CSV

---

## 🏗 Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | CSS Variables + Inline Styles |
| Backend | Google Apps Script (Web App) |
| Database | Google Sheets |
| Deploy | Netlify (GitHub CI/CD) |

---

## 🐱 Mascot

น้องแมวเหรียญ **MoneyPaw** — SVG แบบ handcrafted ไม่ใช้ไฟล์รูปภาพ
มีอารมณ์ 3 แบบ: `happy` / `loading` / `sad`
