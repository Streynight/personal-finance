/**
 * sheetsService.js
 * ─────────────────────────────────────────────────────────────────
 * Backend: Google Apps Script Web App (deployed as "Anyone" access)
 *
 * HOW TO SET UP (ทำครั้งเดียว):
 * 1. เปิด Google Sheet ใหม่
 * 2. Extensions → Apps Script
 * 3. วางโค้ด Google Apps Script จาก README.md
 * 4. Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy "Web app URL" แล้วใส่ใน SHEET_URL ด้านล่าง
 * ─────────────────────────────────────────────────────────────────
 */

// ⚠️ ใส่ URL ของ Google Apps Script Web App ของคุณที่นี่
const SHEET_URL = import.meta.env.VITE_SHEET_URL || ''

const HEADERS = ['id', 'date', 'amount', 'category', 'note', 'source', 'createdAt']

/**
 * Generic fetch wrapper with timeout + CORS handling
 */
async function sheetFetch(params) {
  if (!SHEET_URL) {
    throw new Error('NO_URL')
  }

  const url = new URL(SHEET_URL)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return data
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') throw new Error('TIMEOUT')
    throw err
  }
}

/**
 * Load all transactions from Google Sheet
 * @returns {Promise<Array>}
 */
export async function loadTransactions() {
  const data = await sheetFetch({ action: 'getAll' })
  return (data.rows || []).map(rowToTx).filter(Boolean)
}

/**
 * Save a single transaction to Google Sheet
 * @param {Object} tx
 * @returns {Promise<Object>}
 */
export async function saveTransaction(tx) {
  const row = txToRow(tx)
  const data = await sheetFetch({
    action: 'append',
    row: JSON.stringify(row),
  })
  return data
}

/**
 * Save multiple transactions in one batch
 * @param {Array} txList
 * @returns {Promise<Object>}
 */
export async function saveTransactions(txList) {
  const rows = txList.map(txToRow)
  const data = await sheetFetch({
    action: 'appendBatch',
    rows: JSON.stringify(rows),
  })
  return data
}

/**
 * Delete a transaction by id
 * @param {string} id
 */
export async function deleteTransaction(id) {
  const data = await sheetFetch({ action: 'delete', id })
  return data
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function txToRow(tx) {
  return {
    id: tx.id || String(Date.now()),
    date: tx.date || '',
    amount: Number(tx.amount) || 0,
    category: tx.category || 'other',
    note: tx.note || '',
    source: tx.source || 'manual',
    createdAt: tx.createdAt || new Date().toISOString(),
  }
}

function rowToTx(row) {
  if (!row || typeof row !== 'object') return null
  const amount = parseFloat(row.amount)
  if (isNaN(amount)) return null
  return {
    id: row.id || String(Math.random()),
    date: row.date || '',
    amount,
    category: row.category || 'other',
    note: row.note || '',
    source: row.source || 'manual',
    createdAt: row.createdAt || '',
  }
}

/**
 * Check if Google Sheet is configured
 */
export function isSheetConfigured() {
  return Boolean(SHEET_URL && SHEET_URL.startsWith('https://'))
}
