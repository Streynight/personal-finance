/**
 * ═══════════════════════════════════════════════════════════════
 *  Personal Finance — Google Apps Script Backend
 * ═══════════════════════════════════════════════════════════════
 *
 *  ARCHITECTURE:
 *  - Sheet "Users":  stores username + password hash + token
 *  - Sheet "tx_<username>": one tab per user for their transactions
 *
 *  DEPLOY:
 *  1. เปิด Google Sheet ใหม่
 *  2. Extensions → Apps Script → ลบโค้ดเดิม → วางโค้ดนี้ทั้งหมด
 *  3. Save (กด 💾)
 *  4. Deploy → New Deployment
 *     - Type: Web App
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Copy "Web app URL" — เอาไปใส่ใน GitHub Secret ชื่อ VITE_GAS_URL
 */

const USERS_SHEET = 'Users'
const USER_HEADERS = ['username', 'pwdHash', 'token', 'createdAt']
const TX_HEADERS   = ['id', 'date', 'amount', 'category', 'note', 'source', 'createdAt']

// ─── Sheet helpers ────────────────────────────────────────────────────────────

function getUsersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sh = ss.getSheetByName(USERS_SHEET)
  if (!sh) {
    sh = ss.insertSheet(USERS_SHEET)
    sh.getRange(1, 1, 1, USER_HEADERS.length).setValues([USER_HEADERS])
    sh.getRange(1, 1, 1, USER_HEADERS.length)
      .setBackground('#1E1B4B').setFontColor('#F9C74F').setFontWeight('bold')
    sh.setFrozenRows(1)
  }
  return sh
}

function getUserTxSheet(username) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const name = 'tx_' + username
  let sh = ss.getSheetByName(name)
  if (!sh) {
    sh = ss.insertSheet(name)
    sh.getRange(1, 1, 1, TX_HEADERS.length).setValues([TX_HEADERS])
    sh.getRange(1, 1, 1, TX_HEADERS.length)
      .setBackground('#2563EB').setFontColor('#fff').setFontWeight('bold')
    sh.setFrozenRows(1)
  }
  return sh
}

function jsonOut(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

function makeToken() {
  return Utilities.getUuid().replace(/-/g, '') + Date.now().toString(36)
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

function findUserRow(username) {
  const sh = getUsersSheet()
  const data = sh.getDataRange().getValues()
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === username.toLowerCase()) {
      return { row: i + 1, hash: data[i][1], token: data[i][2] }
    }
  }
  return null
}

function verifyToken(username, token) {
  if (!username || !token) return false
  const u = findUserRow(username)
  return u && String(u.token) === String(token)
}

function actionRegister(p) {
  const username = String(p.username || '').toLowerCase().trim()
  const hash     = String(p.hash || '')
  if (username.length < 3) return jsonOut({ error: 'username too short' })
  if (hash.length < 10)    return jsonOut({ error: 'invalid hash' })
  if (findUserRow(username)) return jsonOut({ error: 'user exists' })

  const sh = getUsersSheet()
  const token = makeToken()
  sh.appendRow([username, hash, token, new Date().toISOString()])
  // Also create their tx tab now
  getUserTxSheet(username)
  return jsonOut({ success: true, username, token })
}

function actionLogin(p) {
  const username = String(p.username || '').toLowerCase().trim()
  const hash     = String(p.hash || '')
  const u = findUserRow(username)
  if (!u) return jsonOut({ error: 'user not found' })
  if (String(u.hash) !== hash) return jsonOut({ error: 'wrong pwd' })
  // Optionally rotate token on every login
  const newToken = makeToken()
  getUsersSheet().getRange(u.row, 3).setValue(newToken)
  return jsonOut({ success: true, username, token: newToken })
}

// ─── Transactions (per-user) ──────────────────────────────────────────────────

function actionGetTx(p) {
  if (!verifyToken(p.username, p.token)) return jsonOut({ error: 'auth' })
  const sh = getUserTxSheet(p.username)
  const data = sh.getDataRange().getValues()
  if (data.length <= 1) return jsonOut({ rows: [] })
  const headers = data[0]
  const rows = data.slice(1).map(r => {
    const o = {}
    headers.forEach((h, i) => { o[h] = r[i] })
    return o
  }).filter(r => r.id && r.id !== '')
  return jsonOut({ rows })
}

function actionAddTx(p) {
  if (!verifyToken(p.username, p.token)) return jsonOut({ error: 'auth' })
  const row = JSON.parse(p.row || '{}')
  const sh = getUserTxSheet(p.username)
  sh.appendRow(TX_HEADERS.map(h => row[h] !== undefined ? row[h] : ''))
  return jsonOut({ success: true })
}

function actionDeleteTx(p) {
  if (!verifyToken(p.username, p.token)) return jsonOut({ error: 'auth' })
  const sh = getUserTxSheet(p.username)
  const data = sh.getDataRange().getValues()
  const idCol = TX_HEADERS.indexOf('id')
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idCol]) === String(p.id)) {
      sh.deleteRow(i + 1)
      return jsonOut({ success: true })
    }
  }
  return jsonOut({ error: 'not found' })
}

// ─── Entry point ──────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    const p = e.parameter || {}
    switch (p.action) {
      case 'register': return actionRegister(p)
      case 'login':    return actionLogin(p)
      case 'getTx':    return actionGetTx(p)
      case 'addTx':    return actionAddTx(p)
      case 'deleteTx': return actionDeleteTx(p)
      default:         return jsonOut({ error: 'unknown action: ' + p.action })
    }
  } catch (err) {
    return jsonOut({ error: err.message || 'internal error' })
  }
}

function doPost(e) { return doGet(e) }
