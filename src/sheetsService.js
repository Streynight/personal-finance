// sheetsService.js — Google Apps Script Web App backend

const SHEET_URL = import.meta.env.VITE_SHEET_URL || ''

export function isSheetConfigured() {
  return Boolean(SHEET_URL && SHEET_URL.startsWith('https://'))
}

async function sheetFetch(params) {
  if (!SHEET_URL) throw new Error('NO_URL')
  const url = new URL(SHEET_URL)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(url.toString(), { method: 'GET', signal: controller.signal })
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

export async function loadTransactions() {
  const data = await sheetFetch({ action: 'getAll' })
  return (data.rows || []).map(rowToTx).filter(Boolean)
}

export async function saveTransaction(tx) {
  return sheetFetch({ action: 'append', row: JSON.stringify(txToRow(tx)) })
}

export async function deleteTransaction(id) {
  return sheetFetch({ action: 'delete', id })
}
