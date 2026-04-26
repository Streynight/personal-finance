import React, { useState, useEffect, useCallback, useRef } from 'react'
import Mascot from './Mascot.jsx'
import {
  loadTransactions,
  saveTransaction,
  saveTransactions,
  deleteTransaction,
  isSheetConfigured,
} from './sheetsService.js'

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'food',          label: '🍜 อาหาร',     color: '#FF6B6B' },
  { id: 'transport',     label: '🚗 เดินทาง',    color: '#4ECDC4' },
  { id: 'shopping',      label: '🛍 ช้อปปิ้ง',   color: '#F9C74F' },
  { id: 'health',        label: '💊 สุขภาพ',     color: '#6BCB77' },
  { id: 'entertainment', label: '🎮 บันเทิง',    color: '#A78BFA' },
  { id: 'income',        label: '💰 รายรับ',     color: '#6BCB77' },
  { id: 'other',         label: '📦 อื่นๆ',      color: '#94A3B8' },
]

const SEED_DATA = [
  { id: 's1', date: '2026-04-20', amount: -48.5,  category: 'food',      note: 'ข้าวกลางวัน',       source: 'wechat',  createdAt: '' },
  { id: 's2', date: '2026-04-21', amount: -128,   category: 'transport', note: 'Didi ไปออฟฟิศ',     source: 'alipay',  createdAt: '' },
  { id: 's3', date: '2026-04-22', amount: 15000,  category: 'income',    note: 'เงินเดือน',          source: 'manual',  createdAt: '' },
  { id: 's4', date: '2026-04-23', amount: -299,   category: 'shopping',  note: 'เสื้อผ้า Taobao',   source: 'alipay',  createdAt: '' },
  { id: 's5', date: '2026-04-24', amount: -55,    category: 'food',      note: 'กาแฟ + เค้ก',       source: 'wechat',  createdAt: '' },
  { id: 's6', date: '2026-04-25', amount: -180,   category: 'health',    note: 'ยา',                 source: 'manual',  createdAt: '' },
]

const today = () => new Date().toISOString().split('T')[0]

// ─── Utility Components ───────────────────────────────────────────────────────

function SourceBadge({ source }) {
  const MAP = {
    wechat: { label: '微信支付', bg: '#07C160', color: '#fff' },
    alipay: { label: '支付宝',   bg: '#1677FF', color: '#fff' },
    manual: { label: 'Manual',   bg: '#2A2F4A', color: '#94A3B8' },
    ai:     { label: 'AI',       bg: '#7C3AED', color: '#fff' },
  }
  const s = MAP[source] || MAP.manual
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
      background: s.bg, color: s.color, letterSpacing: 0.5, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

function CatLabel({ id }) {
  const c = CATEGORIES.find(x => x.id === id)
  return <span style={{ color: c?.color || '#94A3B8', fontWeight: 600, fontSize: 12 }}>{c?.label || id}</span>
}

function Toast({ msg, type }) {
  if (!msg) return null
  const bg = type === 'error' ? '#7F1D1D' : '#14532D'
  const border = type === 'error' ? '#FF6B6B' : '#6BCB77'
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: bg, border: `1px solid ${border}`, borderRadius: 12,
      padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 600,
      zIndex: 999, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'fadeUp 0.3s ease',
    }}>
      {type === 'error' ? '❌ ' : '✅ '}{msg}
    </div>
  )
}

function Spinner() {
  return (
    <div style={{
      width: 20, height: 20, border: '2px solid #2A2F4A',
      borderTop: '2px solid #F9C74F', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite', display: 'inline-block',
    }} />
  )
}

// ─── Setup Banner ─────────────────────────────────────────────────────────────

function SetupBanner({ onDismiss }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1E1B4B, #2E1B69)',
      border: '1px solid #4C1D95', borderRadius: 14,
      padding: '14px 18px', marginBottom: 20,
      animation: 'fadeUp 0.4s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🔧</span>
          <div>
            <div style={{ fontWeight: 700, color: '#C4B5FD', fontSize: 14 }}>ยังไม่ได้เชื่อม Google Sheet</div>
            <div style={{ color: '#7C3AED', fontSize: 12 }}>ตอนนี้ใช้โหมด Local — ข้อมูลจะหายเมื่อ reload</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setExpanded(e => !e)} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid #6D28D9',
            background: 'transparent', color: '#C4B5FD', fontSize: 12, cursor: 'pointer',
          }}>
            {expanded ? 'ซ่อน ▲' : 'วิธีตั้งค่า ▼'}
          </button>
          <button onClick={onDismiss} style={{
            padding: '6px 14px', borderRadius: 8, border: 'none',
            background: '#6D28D9', color: '#fff', fontSize: 12, cursor: 'pointer',
          }}>
            ข้ามไปก่อน
          </button>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 14, fontSize: 12, color: '#A78BFA', lineHeight: 1.8 }}>
          <b style={{ color: '#C4B5FD' }}>ขั้นตอนการตั้งค่า Google Sheet (ทำครั้งเดียว):</b>
          <ol style={{ marginLeft: 20, marginTop: 6, color: '#DDD6FE' }}>
            <li>เปิด Google Sheet ใหม่ → <b>Extensions → Apps Script</b></li>
            <li>วางโค้ดจาก <code style={{ background: '#1E1B4B', padding: '1px 6px', borderRadius: 4 }}>google-apps-script.js</code> ใน README</li>
            <li><b>Deploy → New Deployment → Web App</b></li>
            <li>Execute as: <b>Me</b> / Who has access: <b>Anyone</b></li>
            <li>Copy Web App URL → สร้างไฟล์ <code style={{ background: '#1E1B4B', padding: '1px 6px', borderRadius: 4 }}>.env</code> ใน root:</li>
          </ol>
          <div style={{
            background: '#0D0F1A', borderRadius: 8, padding: '10px 14px',
            fontFamily: 'monospace', marginTop: 8, color: '#86EFAC',
            border: '1px solid #2A2F4A', userSelect: 'all',
          }}>
            VITE_SHEET_URL=https://script.google.com/macros/s/YOUR_ID/exec
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Add Transaction Modal ────────────────────────────────────────────────────

function AddModal({ onClose, onAdd, saving }) {
  const [form, setForm] = useState({
    date: today(), amount: '', category: 'food',
    note: '', source: 'manual', type: 'expense',
  })
  const [err, setErr] = useState('')

  function set(field, val) {
    setForm(prev => ({ ...prev, [field]: val }))
    setErr('')
  }

  function handleSubmit() {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setErr('กรุณากรอกจำนวนเงินที่ถูกต้อง')
      return
    }
    if (!form.date) {
      setErr('กรุณาเลือกวันที่')
      return
    }
    const amt = parseFloat(form.amount) * (form.type === 'expense' ? -1 : 1)
    onAdd({
      id: String(Date.now()),
      date: form.date,
      amount: amt,
      category: form.type === 'income' ? 'income' : form.category,
      note: form.note.trim(),
      source: form.source,
      createdAt: new Date().toISOString(),
    })
  }

  const inputStyle = {
    width: '100%', background: '#0D0F1A', border: '1px solid #2A2F4A',
    borderRadius: 10, padding: '11px 14px', color: '#E8EAF6',
    fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
  }
  const labelStyle = { fontSize: 12, color: '#5C6080', marginBottom: 4, display: 'block' }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#161929', border: '1px solid #2A2F4A', borderRadius: 20,
        padding: 28, width: '100%', maxWidth: 400,
        animation: 'fadeUp 0.3s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 17, color: '#F9C74F', fontFamily: 'var(--font-display)' }}>
            ➕ เพิ่มรายการ
          </h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#5C6080', fontSize: 22, cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>

        {/* Type toggle */}
        <div style={{ display: 'flex', background: '#0D0F1A', borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {['expense', 'income'].map(t => (
            <button key={t} onClick={() => set('type', t)} style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
              background: form.type === t ? (t === 'expense' ? '#FF6B6B' : '#6BCB77') : 'transparent',
              color: form.type === t ? '#0D0F1A' : '#5C6080', cursor: 'pointer',
            }}>
              {t === 'expense' ? '💸 รายจ่าย' : '💰 รายรับ'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>วันที่</label>
            <input type="date" style={inputStyle} value={form.date}
              onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>จำนวนเงิน (¥)</label>
            <input type="number" min="0" step="0.01" placeholder="0.00"
              style={inputStyle} value={form.amount}
              onChange={e => set('amount', e.target.value)} />
          </div>
          {form.type === 'expense' && (
            <div>
              <label style={labelStyle}>หมวดหมู่</label>
              <select style={inputStyle} value={form.category}
                onChange={e => set('category', e.target.value)}>
                {CATEGORIES.filter(c => c.id !== 'income').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label style={labelStyle}>ช่องทาง</label>
            <select style={inputStyle} value={form.source}
              onChange={e => set('source', e.target.value)}>
              <option value="manual">✏️ Manual</option>
              <option value="wechat">🟢 WeChat Pay 微信支付</option>
              <option value="alipay">🔵 Alipay 支付宝</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>หมายเหตุ</label>
            <input type="text" placeholder="เช่น ข้าวกลางวัน, Grab, ..." style={inputStyle}
              value={form.note} onChange={e => set('note', e.target.value)} />
          </div>
        </div>

        {err && (
          <div style={{ marginTop: 12, color: '#FF6B6B', fontSize: 12, padding: '8px 12px', background: '#2D1515', borderRadius: 8 }}>
            ⚠️ {err}
          </div>
        )}

        <button onClick={handleSubmit} disabled={saving} style={{
          width: '100%', marginTop: 20, padding: 14, borderRadius: 12, border: 'none',
          background: saving ? '#2A2F4A' : 'linear-gradient(135deg, #F9C74F, #F59E0B)',
          color: '#0D0F1A', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.2s',
        }}>
          {saving ? <><Spinner /> กำลังบันทึก...</> : '💾 บันทึก'}
        </button>
      </div>
    </div>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ tx, onConfirm, onCancel, deleting }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#161929', border: '1px solid #7F1D1D', borderRadius: 20,
        padding: 28, width: '100%', maxWidth: 360, textAlign: 'center',
        animation: 'fadeUp 0.3s ease',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>ลบรายการนี้?</div>
        <div style={{ color: '#5C6080', fontSize: 13, marginBottom: 20 }}>
          {tx.note || '(ไม่มีหมายเหตุ)'} · ¥{Math.abs(tx.amount).toFixed(2)}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: 12, borderRadius: 10, border: '1px solid #2A2F4A',
            background: 'transparent', color: '#E8EAF6', cursor: 'pointer', fontWeight: 600,
          }}>ยกเลิก</button>
          <button onClick={onConfirm} disabled={deleting} style={{
            flex: 1, padding: 12, borderRadius: 10, border: 'none',
            background: '#DC2626', color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer',
            fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {deleting ? <><Spinner /> ลบ...</> : 'ลบเลย'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCards({ txs }) {
  const income  = txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expense = txs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  const balance = income - expense

  const fmt = n => '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
      {[
        { label: 'ยอดคงเหลือ', value: fmt(balance), color: balance >= 0 ? '#6BCB77' : '#FF6B6B', icon: '💼' },
        { label: 'รายรับ',     value: fmt(income),  color: '#6BCB77',  icon: '📈' },
        { label: 'รายจ่าย',   value: fmt(expense), color: '#FF6B6B',  icon: '📉' },
      ].map(c => (
        <div key={c.label} style={{
          background: '#161929', border: '1px solid #2A2F4A', borderRadius: 16,
          padding: '14px 10px', textAlign: 'center',
          animation: 'fadeUp 0.5s ease',
        }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>{c.icon}</div>
          <div style={{ fontSize: 10, color: '#5C6080', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {c.label}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: c.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Category Chart ────────────────────────────────────────────────────────────

function CategoryChart({ txs }) {
  const expense = txs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  if (expense === 0) return null

  const cats = CATEGORIES
    .map(c => ({ ...c, total: txs.filter(t => t.category === c.id && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0) }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)

  return (
    <div style={{
      background: '#161929', border: '1px solid #2A2F4A', borderRadius: 16,
      padding: '18px', marginBottom: 20,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#5C6080', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        รายจ่ายตามหมวดหมู่
      </div>
      {cats.map(c => (
        <div key={c.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 13 }}>{c.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: c.color }}>
              ¥{c.total.toFixed(2)} <span style={{ color: '#5C6080', fontWeight: 400, fontSize: 11 }}>
                ({((c.total / expense) * 100).toFixed(0)}%)
              </span>
            </span>
          </div>
          <div style={{ height: 6, background: '#2A2F4A', borderRadius: 99 }}>
            <div style={{
              height: '100%', borderRadius: 99, background: c.color,
              width: `${Math.min((c.total / expense) * 100, 100)}%`,
              transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Transaction List ─────────────────────────────────────────────────────────

function TxList({ txs, onDelete }) {
  if (txs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: '#5C6080' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
        <div>ยังไม่มีรายการ</div>
      </div>
    )
  }

  return (
    <div>
      {txs.map((tx, i) => (
        <div key={tx.id} style={{
          background: '#161929', border: '1px solid #2A2F4A', borderRadius: 14,
          padding: '14px 16px', marginBottom: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          animation: `fadeUp 0.3s ease ${i * 0.03}s both`,
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#1E2235'}
          onMouseLeave={e => e.currentTarget.style.background = '#161929'}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#E8EAF6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tx.note || '(ไม่มีหมายเหตุ)'}
              </span>
              <SourceBadge source={tx.source} />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#5C6080' }}>{tx.date}</span>
              <CatLabel id={tx.category} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: tx.amount < 0 ? '#FF6B6B' : '#6BCB77', fontFamily: 'var(--font-display)' }}>
              {tx.amount < 0 ? '−' : '+'}¥{Math.abs(tx.amount).toFixed(2)}
            </span>
            <button onClick={() => onDelete(tx)} style={{
              background: 'none', border: '1px solid #2A2F4A', borderRadius: 8,
              color: '#5C6080', padding: '4px 8px', cursor: 'pointer', fontSize: 13,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2D1515'; e.currentTarget.style.color = '#FF6B6B'; e.currentTarget.style.borderColor = '#FF6B6B' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#5C6080'; e.currentTarget.style.borderColor = '#2A2F4A' }}
            >
              🗑
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [txs, setTxs]               = useState([])
  const [loading, setLoading]        = useState(false)
  const [modal, setModal]            = useState(null) // 'add' | null
  const [deleteTx, setDeleteTx]      = useState(null)
  const [saving, setSaving]          = useState(false)
  const [deleting, setDeleting]      = useState(false)
  const [toast, setToast]            = useState({ msg: '', type: '' })
  const [filter, setFilter]          = useState('all')
  const [search, setSearch]          = useState('')
  const [showSetup, setShowSetup]    = useState(!isSheetConfigured())
  const [useSheet, setUseSheet]      = useState(isSheetConfigured())
  const [mascotMood, setMascotMood]  = useState('happy')

  const toastTimer = useRef(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast({ msg: '', type: '' }), 3000)
  }

  // Load data on mount
  useEffect(() => {
    if (useSheet) {
      setLoading(true)
      setMascotMood('loading')
      loadTransactions()
        .then(data => {
          setTxs(data.length > 0 ? data : SEED_DATA)
          setMascotMood('happy')
          showToast('โหลดข้อมูลจาก Google Sheet สำเร็จ!')
        })
        .catch(() => {
          setTxs(SEED_DATA)
          setMascotMood('sad')
          showToast('เชื่อม Google Sheet ไม่ได้ ใช้ข้อมูล demo แทน', 'error')
        })
        .finally(() => setLoading(false))
    } else {
      setTxs(SEED_DATA)
    }
  }, [useSheet])

  async function handleAdd(tx) {
    setSaving(true)
    setMascotMood('happy')
    if (useSheet) {
      try {
        await saveTransaction(tx)
        showToast('บันทึกลง Google Sheet แล้ว!')
      } catch {
        showToast('บันทึก Sheet ไม่ได้ บันทึก local แทน', 'error')
      }
    }
    setTxs(prev => [tx, ...prev])
    setSaving(false)
    setModal(null)
  }

  async function handleDelete() {
    if (!deleteTx) return
    setDeleting(true)
    if (useSheet) {
      try {
        await deleteTransaction(deleteTx.id)
        showToast('ลบออกจาก Google Sheet แล้ว')
      } catch {
        showToast('ลบจาก Sheet ไม่ได้ ลบ local แทน', 'error')
      }
    }
    setTxs(prev => prev.filter(t => t.id !== deleteTx.id))
    setDeleting(false)
    setDeleteTx(null)
    setMascotMood('sad')
    setTimeout(() => setMascotMood('happy'), 2000)
  }

  // Filtered & sorted list
  const displayed = txs
    .filter(t => filter === 'all' || t.source === filter)
    .filter(t => !search || t.note.toLowerCase().includes(search.toLowerCase()) || t.category.includes(search))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '20px 16px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Mascot size={64} mood={loading ? 'loading' : mascotMood} animate />
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#F9C74F', fontFamily: 'var(--font-display)', letterSpacing: -0.5 }}>
                MoneyPaw
              </h1>
              <div style={{ fontSize: 11, color: '#5C6080', marginTop: 1 }}>
                {useSheet ? '🟢 เชื่อม Google Sheet' : '⚪ โหมด Local'}
                {loading && <span style={{ marginLeft: 8 }}><Spinner /></span>}
              </div>
            </div>
          </div>
          <button onClick={() => setModal('add')} style={{
            padding: '10px 18px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #F9C74F, #F59E0B)',
            color: '#0D0F1A', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(249,199,79,0.3)',
            transition: 'transform 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            ＋ เพิ่มรายการ
          </button>
        </div>

        {/* Setup banner */}
        {showSetup && <SetupBanner onDismiss={() => setShowSetup(false)} />}

        {/* Summary */}
        <SummaryCards txs={txs} />

        {/* Category chart */}
        <CategoryChart txs={txs} />

        {/* Filter + Search */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { key: 'all',    label: 'ทั้งหมด' },
            { key: 'wechat', label: '微信支付' },
            { key: 'alipay', label: '支付宝'  },
            { key: 'manual', label: 'Manual'  },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '7px 16px', borderRadius: 99, border: `1px solid ${filter === f.key ? '#F9C74F' : '#2A2F4A'}`,
              background: filter === f.key ? '#F9C74F' : 'transparent',
              color: filter === f.key ? '#0D0F1A' : '#5C6080',
              fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {f.label}
            </button>
          ))}
          <input
            type="text"
            placeholder="🔍 ค้นหา..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              marginLeft: 'auto', padding: '7px 14px', borderRadius: 99,
              background: '#161929', border: '1px solid #2A2F4A',
              color: '#E8EAF6', fontSize: 12, outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#F9C74F'}
            onBlur={e => e.target.style.borderColor = '#2A2F4A'}
          />
        </div>

        {/* Count label */}
        <div style={{ fontSize: 12, color: '#5C6080', marginBottom: 10 }}>
          {displayed.length} รายการ
        </div>

        {/* Transaction list */}
        <TxList txs={displayed} onDelete={setDeleteTx} />

        {/* Export hint */}
        <div style={{
          marginTop: 24, padding: '14px 18px', background: '#161929',
          border: '1px solid #2A2F4A', borderRadius: 14, fontSize: 12, color: '#5C6080',
        }}>
          <b style={{ color: '#F9C74F' }}>💡 วิธี Export จาก App:</b>
          <br />
          <b style={{ color: '#5C6080' }}>WeChat:</b> Me → Services → Wallet → Bill Detail → Export
          <span style={{ margin: '0 8px' }}>·</span>
          <b style={{ color: '#5C6080' }}>Alipay:</b> My Account → Transaction History → Export
        </div>
      </div>

      {/* Modals */}
      {modal === 'add' && <AddModal onClose={() => setModal(null)} onAdd={handleAdd} saving={saving} />}
      {deleteTx && <DeleteConfirm tx={deleteTx} onConfirm={handleDelete} onCancel={() => setDeleteTx(null)} deleting={deleting} />}

      {/* Toast */}
      <Toast msg={toast.msg} type={toast.type} />
    </div>
  )
}
