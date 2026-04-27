/**
 * api.js — All communication with Google Apps Script backend
 *
 * The GAS_URL is injected at build time from GitHub Secret VITE_GAS_URL
 * Falls back gracefully to demo/local mode if not configured.
 */

const GAS_URL = import.meta.env.VITE_GAS_URL || ''

export const isConfigured = () => Boolean(GAS_URL && GAS_URL.startsWith('https://'))

// Simple hash for password (client-side, GAS will re-verify)
async function hashPwd(pwd) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pwd + 'pf_salt_2024'))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}

async function call(params, timeoutMs = 12000) {
  if (!GAS_URL) throw new Error('NO_URL')
  const url = new URL(GAS_URL)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  const ctrl = new AbortController()
  const tid  = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res  = await fetch(url.toString(), { signal: ctrl.signal })
    clearTimeout(tid)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return data
  } catch (e) {
    clearTimeout(tid)
    if (e.name === 'AbortError') throw new Error('TIMEOUT')
    throw e
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function register(username, password) {
  const hash = await hashPwd(password)
  return call({ action: 'register', username: username.toLowerCase().trim(), hash })
}

export async function loginUser(username, password) {
  const hash = await hashPwd(password)
  return call({ action: 'login', username: username.toLowerCase().trim(), hash })
}

// ── Transactions ──────────────────────────────────────────────────────────────

export async function getTx(username, token) {
  const data = await call({ action: 'getTx', username, token })
  return (data.rows || []).map(rowToTx).filter(Boolean)
}

export async function addTx(username, token, tx) {
  return call({ action: 'addTx', username, token, row: JSON.stringify(txToRow(tx)) })
}

export async function deleteTx(username, token, id) {
  return call({ action: 'deleteTx', username, token, id })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function txToRow(tx) {
  return {
    id:        tx.id        || String(Date.now()),
    date:      tx.date      || '',
    amount:    Number(tx.amount) || 0,
    category:  tx.category  || 'other',
    note:      tx.note      || '',
    source:    tx.source    || 'manual',
    createdAt: tx.createdAt || new Date().toISOString(),
  }
}

function rowToTx(row) {
  if (!row || typeof row !== 'object') return null
  const amount = parseFloat(row.amount)
  if (isNaN(amount)) return null
  return {
    id:        row.id       || String(Math.random()),
    date:      row.date     || '',
    amount,
    category:  row.category || 'other',
    note:      row.note     || '',
    source:    row.source   || 'manual',
    createdAt: row.createdAt || '',
  }
}
