import React, { useState, useEffect, useRef } from 'react'
import Mascot from './Mascot.jsx'
import { LANGS, useTranslation } from './i18n.js'
import { loadTransactions, saveTransaction, deleteTransaction, isSheetConfigured } from './sheetsService.js'

// ─── Data ─────────────────────────────────────────────────────────────────────

const CAT_IDS = ['food','transport','shopping','health','education','entertainment','bill','other']

function getCategories(t) {
  return [
    { id: 'food',          label: t.catFood,      color: '#F97316', bg: '#FFF7ED' },
    { id: 'transport',     label: t.catTransport,  color: '#0EA5E9', bg: '#F0F9FF' },
    { id: 'shopping',      label: t.catShopping,   color: '#EC4899', bg: '#FDF2F8' },
    { id: 'health',        label: t.catHealth,     color: '#10B981', bg: '#F0FDF4' },
    { id: 'education',     label: t.catEducation,  color: '#8B5CF6', bg: '#F5F3FF' },
    { id: 'entertainment', label: t.catEntertain,  color: '#6366F1', bg: '#EEF2FF' },
    { id: 'bill',          label: t.catBill,       color: '#64748B', bg: '#F8FAFC' },
    { id: 'other',         label: t.catOther,      color: '#94A3B8', bg: '#F8FAFC' },
    { id: 'income',        label: t.catIncome,     color: '#059669', bg: '#D1FAE5' },
  ]
}

const SEED = [
  { id:'d1', date:'2026-04-20', amount:-48.5,  category:'food',          note:'ข้าวกลางวัน / Lunch / 午饭',        source:'wechat',  createdAt:'' },
  { id:'d2', date:'2026-04-21', amount:-128,   category:'transport',     note:'Didi ไปออฟฟิศ / to office / 去公司', source:'alipay',  createdAt:'' },
  { id:'d3', date:'2026-04-22', amount:15000,  category:'income',        note:'เงินเดือน / Salary / 薪水',          source:'manual',  createdAt:'' },
  { id:'d4', date:'2026-04-23', amount:-299,   category:'shopping',      note:'Taobao',                               source:'alipay',  createdAt:'' },
  { id:'d5', date:'2026-04-24', amount:-180,   category:'health',        note:'ยา / Medicine / 药',                  source:'manual',  createdAt:'' },
  { id:'d6', date:'2026-04-25', amount:-55,    category:'food',          note:'กาแฟ + เค้ก / Coffee / 咖啡',         source:'wechat',  createdAt:'' },
]

const todayStr = () => new Date().toISOString().split('T')[0]

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Spinner({ size = 16 }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: `2px solid #e0e7ff`, borderTop: `2px solid #2563EB`,
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
    }} />
  )
}

function Toast({ msg, type }) {
  if (!msg) return null
  const colors = type === 'error'
    ? { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' }
    : { bg: '#F0FDF4', border: '#BBF7D0', text: '#059669' }
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%',
      background: colors.bg, border: `1px solid ${colors.border}`,
      color: colors.text, borderRadius: 12,
      padding: '12px 22px', fontSize: 14, fontWeight: 600,
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 9999,
      animation: 'toastIn 0.3s ease',
    }}>
      {type === 'error' ? '⚠️ ' : '✅ '}{msg}
    </div>
  )
}

function SourceBadge({ source, t }) {
  const MAP = {
    wechat: { bg: '#07C160', color: '#fff', label: 'WeChat' },
    alipay: { bg: '#1677FF', color: '#fff', label: 'Alipay' },
    manual: { bg: '#EEF2FF', color: '#6366F1', label: t.sourceManual },
  }
  const s = MAP[source] || MAP.manual
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
      background: s.bg, color: s.color, letterSpacing: 0.4, whiteSpace: 'nowrap',
    }}>{s.label}</span>
  )
}

// ─── Language Switcher ────────────────────────────────────────────────────────

function LangSwitcher({ lang, setLang }) {
  return (
    <div style={{
      display: 'flex', gap: 4, background: '#EEF2FF',
      borderRadius: 99, padding: 4,
    }}>
      {LANGS.map(l => (
        <button key={l.code} onClick={() => setLang(l.code)} style={{
          padding: '5px 12px', borderRadius: 99, border: 'none', fontSize: 12,
          fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
          background: lang === l.code ? '#2563EB' : 'transparent',
          color: lang === l.code ? '#fff' : '#6B7280',
        }}>
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  )
}

// ─── Setup Banner ─────────────────────────────────────────────────────────────

function SetupBanner({ t, onDismiss }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      background: '#EEF2FF', border: '1.5px dashed #A5B4FC',
      borderRadius: 14, padding: '14px 18px', marginBottom: 20,
      animation: 'fadeUp 0.4s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700, color: '#4338CA', fontSize: 14 }}>🔧 {t.setupTitle}</div>
          <div style={{ color: '#818CF8', fontSize: 12, marginTop: 2 }}>{t.setupSub}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setOpen(o => !o)} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid #818CF8',
            background: 'transparent', color: '#4338CA', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{t.setupHow} {open ? '▲' : '▼'}</button>
          <button onClick={onDismiss} style={{
            padding: '6px 14px', borderRadius: 8, border: 'none',
            background: '#4338CA', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{t.setupSkip}</button>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 14, fontSize: 12, color: '#4338CA', lineHeight: 2 }}>
          <b>1.</b> เปิด Google Sheet → Extensions → Apps Script<br />
          <b>2.</b> วางโค้ดจาก <code style={{ background: '#C7D2FE', padding: '1px 6px', borderRadius: 4 }}>google-apps-script.js</code><br />
          <b>3.</b> Deploy → New Deployment → Web App (Execute as: Me / Access: Anyone)<br />
          <b>4.</b> Copy URL → ใส่ใน Netlify Environment Variables:<br />
          <div style={{ background: '#fff', borderRadius: 8, padding: '8px 14px', marginTop: 6, fontFamily: 'monospace', color: '#059669', border: '1px solid #BBF7D0', userSelect: 'all' }}>
            VITE_SHEET_URL=https://script.google.com/macros/s/YOUR_ID/exec
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Add Transaction Modal ────────────────────────────────────────────────────

function AddModal({ t, lang, onClose, onAdd, saving }) {
  const CATS = getCategories(t)
  const [form, setForm] = useState({
    date: todayStr(), amount: '', category: 'food',
    note: '', source: 'manual', type: 'expense',
  })
  const [err, setErr] = useState('')

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); setErr('') }

  function submit() {
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) { setErr(t.validAmt); return }
    if (!form.date) { setErr(t.validDate); return }
    const amt = parseFloat(form.amount) * (form.type === 'expense' ? -1 : 1)
    onAdd({ id: String(Date.now()), date: form.date, amount: amt,
      category: form.type === 'income' ? 'income' : form.category,
      note: form.note.trim(), source: form.source, createdAt: new Date().toISOString() })
  }

  const inp = { width: '100%', background: '#F8FAFC', border: '1.5px solid #E0E7FF', borderRadius: 10, padding: '11px 14px', color: '#1E1B4B', fontSize: 14, outline: 'none' }
  const lbl = { fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 5, display: 'block' }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(30,27,75,0.4)',
      zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 20, padding: 28,
        width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(37,99,235,0.18)',
        animation: 'slideIn 0.3s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1E1B4B' }}>{t.modalAddTitle}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: '#94A3B8', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Type toggle */}
        <div style={{ display: 'flex', background: '#F0F4FF', borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {['expense','income'].map(tp => (
            <button key={tp} onClick={() => set('type', tp)} style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 9, fontSize: 13,
              fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              background: form.type === tp ? (tp === 'expense' ? '#DC2626' : '#059669') : 'transparent',
              color: form.type === tp ? '#fff' : '#9CA3AF',
            }}>
              {tp === 'expense' ? t.typeExpense : t.typeIncome}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>{t.fieldDate}</label>
            <input type="date" style={inp} value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>{t.fieldAmount}</label>
            <input type="number" min="0" step="0.01" placeholder="0.00" style={inp} value={form.amount} onChange={e => set('amount', e.target.value)} />
          </div>
          {form.type === 'expense' && (
            <div>
              <label style={lbl}>{t.fieldCat}</label>
              <select style={inp} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATS.filter(c => c.id !== 'income').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label style={lbl}>{t.fieldSource}</label>
            <select style={inp} value={form.source} onChange={e => set('source', e.target.value)}>
              <option value="manual">✏️ {t.sourceManual}</option>
              <option value="wechat">🟢 WeChat Pay 微信支付</option>
              <option value="alipay">🔵 Alipay 支付宝</option>
            </select>
          </div>
          <div>
            <label style={lbl}>{t.fieldNote}</label>
            <input type="text" placeholder={t.fieldNotePlh} style={inp} value={form.note} onChange={e => set('note', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
        </div>

        {err && (
          <div style={{ marginTop: 12, color: '#DC2626', fontSize: 12, background: '#FEF2F2', borderRadius: 8, padding: '9px 13px', border: '1px solid #FECACA' }}>
            ⚠️ {err}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 13, borderRadius: 12, border: '1.5px solid #E0E7FF',
            background: '#fff', color: '#6B7280', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>{t.btnCancel}</button>
          <button onClick={submit} disabled={saving} style={{
            flex: 2, padding: 13, borderRadius: 12, border: 'none',
            background: saving ? '#E0E7FF' : 'linear-gradient(135deg, #2563EB, #4F46E5)',
            color: saving ? '#94A3B8' : '#fff', fontWeight: 700, fontSize: 14,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: saving ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
          }}>
            {saving ? <><Spinner size={15} />{t.btnSaving}</> : t.btnSave}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteModal({ tx, t, onConfirm, onCancel, deleting, cats }) {
  const cat = cats.find(c => c.id === tx.category)
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(30,27,75,0.4)',
      zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 32,
        width: '100%', maxWidth: 360, textAlign: 'center',
        boxShadow: '0 20px 60px rgba(220,38,38,0.15)',
        animation: 'slideIn 0.3s ease',
      }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>🗑️</div>
        <div style={{ fontWeight: 800, fontSize: 17, color: '#1E1B4B', marginBottom: 8 }}>{t.deleteTitle}</div>
        <div style={{
          background: '#F8FAFC', borderRadius: 10, padding: '10px 14px',
          color: '#6B7280', fontSize: 13, marginBottom: 24,
        }}>
          {tx.note || '—'} · <span style={{ color: cat?.color }}>¥{Math.abs(tx.amount).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: 13, borderRadius: 12, border: '1.5px solid #E0E7FF',
            background: '#fff', color: '#6B7280', fontWeight: 600, cursor: 'pointer', fontSize: 14,
          }}>{t.btnCancel}</button>
          <button onClick={onConfirm} disabled={deleting} style={{
            flex: 1, padding: 13, borderRadius: 12, border: 'none',
            background: deleting ? '#FEE2E2' : '#DC2626', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: deleting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {deleting ? <><Spinner size={14} />{t.deleting}</> : t.deleteConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCards({ txs, t }) {
  const inc  = txs.filter(tx => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0)
  const exp  = txs.filter(tx => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0)
  const bal  = inc - exp
  const fmt  = n => '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const cards = [
    { label: t.balance, value: fmt(bal), color: bal >= 0 ? '#059669' : '#DC2626', bg: bal >= 0 ? '#D1FAE5' : '#FEE2E2', icon: '💼', border: bal >= 0 ? '#A7F3D0' : '#FECACA' },
    { label: t.income,  value: fmt(inc), color: '#059669', bg: '#D1FAE5', icon: '📈', border: '#A7F3D0' },
    { label: t.expense, value: fmt(exp), color: '#DC2626', bg: '#FEE2E2', icon: '📉', border: '#FECACA' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
      {cards.map((c, i) => (
        <div key={c.label} style={{
          background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 16,
          padding: '16px 12px', textAlign: 'center',
          animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>{c.icon}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: c.color, opacity: 0.7, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 }}>{c.label}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: c.color, fontVariantNumeric: 'tabular-nums' }}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Category Chart ────────────────────────────────────────────────────────────

function CategoryChart({ txs, t }) {
  const CATS = getCategories(t)
  const total = txs.filter(tx => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0)
  if (total === 0) return null

  const rows = CATS
    .map(c => ({ ...c, sum: txs.filter(tx => tx.category === c.id && tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0) }))
    .filter(c => c.sum > 0)
    .sort((a, b) => b.sum - a.sum)
    .slice(0, 6)

  return (
    <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: 'var(--shadow)' }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#6B7280', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 16 }}>
        {t.catChartTitle}
      </div>
      {rows.map(c => (
        <div key={c.id} style={{ marginBottom: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{c.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: c.color }}>
              ¥{c.sum.toFixed(2)}
              <span style={{ color: '#CBD5E1', fontWeight: 400, fontSize: 11, marginLeft: 4 }}>
                {((c.sum/total)*100).toFixed(0)}%
              </span>
            </span>
          </div>
          <div style={{ height: 7, background: c.bg, borderRadius: 99 }}>
            <div style={{
              height: '100%', borderRadius: 99, background: c.color,
              width: `${Math.min((c.sum/total)*100,100)}%`,
              animation: 'barGrow 0.7s ease',
              transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TxRow({ tx, t, cats, onDelete, idx }) {
  const cat = cats.find(c => c.id === tx.category) || cats[cats.length - 1]
  return (
    <div style={{
      background: '#fff', border: '1.5px solid var(--border)', borderRadius: 14,
      padding: '13px 16px', marginBottom: 8,
      display: 'flex', alignItems: 'center', gap: 12,
      animation: `fadeUp 0.3s ease ${idx * 0.03}s both`,
      transition: 'box-shadow 0.2s, transform 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
    >
      {/* Category icon bubble */}
      <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
        {cat.label.split(' ')[0]}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1E1B4B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
            {tx.note || '—'}
          </span>
          <SourceBadge source={tx.source} t={t} />
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8' }}>
          {tx.date} · <span style={{ color: cat.color, fontWeight: 600 }}>{cat.label}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: tx.amount < 0 ? '#DC2626' : '#059669', fontVariantNumeric: 'tabular-nums' }}>
          {tx.amount < 0 ? '−' : '+'}¥{Math.abs(tx.amount).toFixed(2)}
        </span>
        <button onClick={() => onDelete(tx)} style={{
          background: 'none', border: '1.5px solid #E0E7FF', borderRadius: 8,
          color: '#CBD5E1', padding: '4px 8px', cursor: 'pointer', fontSize: 13,
          transition: 'all 0.18s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.borderColor = '#FECACA' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#CBD5E1'; e.currentTarget.style.borderColor = '#E0E7FF' }}
        >
          🗑
        </button>
      </div>
    </div>
  )
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────

function HeroBanner({ t, mascotMood, loading }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
      borderRadius: 20, padding: '24px 28px', marginBottom: 20,
      display: 'flex', alignItems: 'center', gap: 20,
      boxShadow: '0 8px 32px rgba(37,99,235,0.3)',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -20, right: 120, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', bottom: -30, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

      <Mascot size={110} mood={loading ? 'loading' : mascotMood} animate />

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5, lineHeight: 1.3, marginBottom: 8 }}>
          {t.appName}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {t.mascotGreet}
        </div>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            <Spinner size={13} /> Loading...
          </div>
        )}
      </div>

      {/* Chat bubble */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        background: '#fff', borderRadius: '14px 14px 0 14px',
        padding: '8px 14px', fontSize: 12, color: '#4338CA', fontWeight: 600,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: 160,
        lineHeight: 1.5,
      }}>
        {t.appSlogan}
        <div style={{ position: 'absolute', bottom: -8, right: 0, width: 0, height: 0, borderLeft: '8px solid transparent', borderTop: '8px solid #fff' }} />
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [lang, setLang]            = useState('th')
  const [txs, setTxs]              = useState([])
  const [loading, setLoading]      = useState(false)
  const [modal, setModal]          = useState(null)
  const [deleteTx, setDeleteTx]    = useState(null)
  const [saving, setSaving]        = useState(false)
  const [deleting, setDeleting]    = useState(false)
  const [toast, setToast]          = useState({ msg: '', type: '' })
  const [filter, setFilter]        = useState('all')
  const [search, setSearch]        = useState('')
  const [showSetup, setShowSetup]  = useState(!isSheetConfigured())
  const [useSheet]                 = useState(isSheetConfigured())
  const [mascotMood, setMascotMood]= useState('happy')
  const toastRef                   = useRef(null)

  const t    = useTranslation(lang)
  const CATS = getCategories(t)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast({ msg: '', type: '' }), 3000)
  }

  useEffect(() => {
    if (useSheet) {
      setLoading(true)
      setMascotMood('thinking')
      loadTransactions()
        .then(d => {
          setTxs(d.length > 0 ? d : SEED)
          setMascotMood('excited')
          showToast(t.toastLoaded)
          setTimeout(() => setMascotMood('happy'), 2000)
        })
        .catch(() => {
          setTxs(SEED)
          setMascotMood('sad')
          showToast(t.toastSheetErr, 'error')
          setTimeout(() => setMascotMood('happy'), 2500)
        })
        .finally(() => setLoading(false))
    } else {
      setTxs(SEED)
    }
  }, [useSheet])

  async function handleAdd(tx) {
    setSaving(true)
    if (useSheet) {
      try { await saveTransaction(tx); showToast(t.toastSaved) }
      catch { showToast(t.toastSaveErr, 'error') }
    } else {
      showToast(t.toastSaved)
    }
    setTxs(p => [tx, ...p])
    setSaving(false)
    setModal(null)
    setMascotMood('excited')
    setTimeout(() => setMascotMood('happy'), 2000)
  }

  async function handleDelete() {
    if (!deleteTx) return
    setDeleting(true)
    if (useSheet) {
      try { await deleteTransaction(deleteTx.id) }
      catch { /* local delete anyway */ }
    }
    setTxs(p => p.filter(tx => tx.id !== deleteTx.id))
    setDeleting(false)
    setDeleteTx(null)
    showToast(t.toastDeleted)
    setMascotMood('sad')
    setTimeout(() => setMascotMood('happy'), 1800)
  }

  const displayed = txs
    .filter(tx => filter === 'all' || tx.source === filter)
    .filter(tx => !search || tx.note.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const filterBtns = [
    { key: 'all',    label: t.filterAll },
    { key: 'wechat', label: t.filterWechat },
    { key: 'alipay', label: t.filterAlipay },
    { key: 'manual', label: t.filterManual },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '20px 16px 80px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
            {useSheet ? t.connectedSheet : t.localMode}
          </div>
          <LangSwitcher lang={lang} setLang={setLang} />
        </div>

        {/* Hero */}
        <HeroBanner t={t} mascotMood={mascotMood} loading={loading} />

        {/* Setup banner */}
        {showSetup && <SetupBanner t={t} onDismiss={() => setShowSetup(false)} />}

        {/* Summary */}
        <SummaryCards txs={txs} t={t} />

        {/* Chart */}
        <CategoryChart txs={txs} t={t} />

        {/* Actions row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {filterBtns.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                padding: '7px 15px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                border: `1.5px solid ${filter === f.key ? '#2563EB' : '#E0E7FF'}`,
                background: filter === f.key ? '#2563EB' : '#fff',
                color: filter === f.key ? '#fff' : '#94A3B8',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>{f.label}</button>
            ))}
          </div>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '8px 15px', borderRadius: 99, border: '1.5px solid #E0E7FF',
              background: '#fff', color: '#1E1B4B', fontSize: 13, outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#2563EB'}
            onBlur={e => e.target.style.borderColor = '#E0E7FF'}
          />
        </div>

        {/* Count + Add button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>{t.txCount(displayed.length)}</span>
          <button onClick={() => setModal('add')} style={{
            padding: '10px 22px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(37,99,235,0.30)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(37,99,235,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.30)' }}
          >
            {t.addTx}
          </button>
        </div>

        {/* Transactions */}
        {displayed.length === 0
          ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>📭</div>
              <div style={{ fontSize: 15 }}>{t.noTx}</div>
            </div>
          )
          : displayed.map((tx, i) => (
            <TxRow key={tx.id} tx={tx} t={t} cats={CATS} onDelete={setDeleteTx} idx={i} />
          ))
        }

        {/* Export hint */}
        <div style={{
          marginTop: 24, padding: '14px 18px',
          background: '#EEF2FF', border: '1.5px solid #C7D2FE',
          borderRadius: 14, fontSize: 12, color: '#6B7280', lineHeight: 1.8,
        }}>
          {t.exportHint}
        </div>
      </div>

      {/* Modals */}
      {modal === 'add' && <AddModal t={t} lang={lang} onClose={() => setModal(null)} onAdd={handleAdd} saving={saving} />}
      {deleteTx && <DeleteModal tx={deleteTx} t={t} cats={CATS} onConfirm={handleDelete} onCancel={() => setDeleteTx(null)} deleting={deleting} />}
      <Toast msg={toast.msg} type={toast.type} />
    </div>
  )
}
