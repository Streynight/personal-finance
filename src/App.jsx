import React, { useState, useEffect, useRef } from 'react'
import Mascot from './Mascot.jsx'
import { LANGS, THEMES, useT } from './i18n.js'
import { isConfigured, register, loginUser, getTx, addTx, deleteTx } from './api.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY = () => new Date().toISOString().split('T')[0]
const LS = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } },
  set: (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
  del: k => { try { localStorage.removeItem(k) } catch {} },
}

const DEMO_TX = [
  { id:'d1', date:'2026-04-22', amount:15000, category:'income',    note:'เงินเดือน / Salary',     source:'manual',  createdAt:'' },
  { id:'d2', date:'2026-04-23', amount:-48.5, category:'food',      note:'ข้าวกลางวัน / Lunch',   source:'wechat',  createdAt:'' },
  { id:'d3', date:'2026-04-24', amount:-128,  category:'transport', note:'Didi to office',          source:'alipay',  createdAt:'' },
  { id:'d4', date:'2026-04-25', amount:-299,  category:'shopping',  note:'Taobao',                  source:'alipay',  createdAt:'' },
  { id:'d5', date:'2026-04-26', amount:-180,  category:'health',    note:'ยา / Medicine',           source:'manual',  createdAt:'' },
]

function getCats(t) {
  return [
    { id:'food',          label:t.catFood,      color:'#F97316', bg:'#FFF7ED' },
    { id:'transport',     label:t.catTransport,  color:'#0EA5E9', bg:'#F0F9FF' },
    { id:'shopping',      label:t.catShopping,   color:'#EC4899', bg:'#FDF2F8' },
    { id:'health',        label:t.catHealth,     color:'#10B981', bg:'#F0FDF4' },
    { id:'education',     label:t.catEdu,        color:'#8B5CF6', bg:'#F5F3FF' },
    { id:'entertainment', label:t.catEnt,        color:'#6366F1', bg:'#EEF2FF' },
    { id:'bill',          label:t.catBill,       color:'#64748B', bg:'#F8FAFC' },
    { id:'other',         label:t.catOther,      color:'#94A3B8', bg:'#F8FAFC' },
    { id:'income',        label:t.catIncome,     color:'#059669', bg:'#D1FAE5' },
  ]
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

function Spinner({ size=16, color='var(--c-primary)' }) {
  return <span style={{ display:'inline-block', width:size, height:size, border:`2.5px solid var(--c-border)`, borderTop:`2.5px solid ${color}`, borderRadius:'50%', animation:'spin 0.7s linear infinite', verticalAlign:'middle' }} />
}

function Toast({ msg, type }) {
  if (!msg) return null
  const ok = type !== 'error'
  return (
    <div style={{
      position:'fixed', bottom:24, left:'50%',
      background: ok ? 'var(--c-surface)' : '#FEF2F2',
      border:`1.5px solid ${ok ? 'var(--c-primary-lt)' : '#FECACA'}`,
      color: ok ? 'var(--c-primary)' : '#DC2626',
      borderRadius:12, padding:'12px 22px', fontSize:14, fontWeight:600,
      boxShadow:'0 4px 24px rgba(0,0,0,0.12)', zIndex:9999,
      animation:'toastIn 0.3s ease', whiteSpace:'nowrap',
    }}>
      {ok ? '✅ ' : '⚠️ '}{msg}
    </div>
  )
}

function Btn({ children, onClick, disabled, variant='primary', size='md', style:sx={} }) {
  const base = {
    border:'none', borderRadius:12, fontWeight:700, cursor:disabled?'not-allowed':'pointer',
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:7,
    transition:'transform 0.15s, box-shadow 0.15s, opacity 0.15s',
    opacity: disabled ? 0.6 : 1,
    padding: size==='sm' ? '8px 16px' : size==='lg' ? '15px 28px' : '11px 22px',
    fontSize: size==='sm' ? 13 : size==='lg' ? 16 : 14,
    ...sx,
  }
  const variants = {
    primary:  { background:'var(--c-primary)', color:'#fff', boxShadow:'0 4px 16px var(--c-shadow)' },
    ghost:    { background:'transparent', color:'var(--c-primary)', border:'1.5px solid var(--c-border)' },
    danger:   { background:'#DC2626', color:'#fff' },
    surface:  { background:'var(--c-surface2)', color:'var(--c-text)' },
  }
  return (
    <button onClick={disabled?undefined:onClick} style={{ ...base, ...variants[variant] }}
      onMouseEnter={e=>{ if(!disabled){ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 20px var(--c-shadow)' }}}
      onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=variants[variant].boxShadow||'none' }}
    >{children}</button>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize:12, fontWeight:600, color:'var(--c-text2)', marginBottom:6, display:'block', letterSpacing:0.3 }}>{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, type='text', placeholder, onKeyDown, autoFocus }) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      onKeyDown={onKeyDown} autoFocus={autoFocus}
      style={{
        width:'100%', background:'var(--c-surface2)', border:'1.5px solid var(--c-border)',
        borderRadius:10, padding:'12px 14px', color:'var(--c-text)', fontSize:14, outline:'none',
        transition:'border-color 0.2s',
      }}
      onFocus={e=>e.target.style.borderColor='var(--c-primary)'}
      onBlur={e=>e.target.style.borderColor='var(--c-border)'}
    />
  )
}

function SourceBadge({ source, t }) {
  const MAP = {
    wechat: { bg:'#07C160', color:'#fff', label:'WeChat' },
    alipay: { bg:'#1677FF', color:'#fff', label:'Alipay' },
    manual: { bg:'var(--c-primary-xl)', color:'var(--c-primary)', label:t.srcManual },
  }
  const s = MAP[source] || MAP.manual
  return <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:s.bg, color:s.color, whiteSpace:'nowrap' }}>{s.label}</span>
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────

function AuthScreen({ lang, t, onLogin }) {
  const [mode, setMode]   = useState('login')   // 'login' | 'register'
  const [user, setUser]   = useState('')
  const [pwd, setPwd]     = useState('')
  const [cpwd, setCpwd]   = useState('')
  const [err, setErr]     = useState('')
  const [loading, setLoading] = useState(false)
  const [mood, setMood]   = useState('happy')

  function reset() { setUser(''); setPwd(''); setCpwd(''); setErr('') }

  async function handleSubmit() {
    setErr('')
    if (!user.trim() || !pwd) { setErr(t.fillAll); return }
    if (user.trim().length < 3) { setErr(t.userMin); return }
    if (pwd.length < 6) { setErr(t.pwdMin); return }
    if (mode === 'register' && pwd !== cpwd) { setErr(t.pwdMismatch); return }

    setLoading(true); setMood('thinking')
    try {
      if (mode === 'register') {
        if (isConfigured()) {
          await register(user.trim(), pwd)
        }
        // store locally too for demo
        const users = LS.get('pf_users') || {}
        if (users[user.trim().toLowerCase()]) { setErr(t.userExists); setLoading(false); setMood('sad'); return }
        users[user.trim().toLowerCase()] = { pwd: btoa(pwd) }
        LS.set('pf_users', users)
        setMood('excited')
        setMode('login')
        reset()
        setErr('✅ ' + t.registered)
      } else {
        let token = 'local_token'
        if (isConfigured()) {
          const res = await loginUser(user.trim(), pwd)
          token = res.token || 'local_token'
        } else {
          // local auth fallback
          const users = LS.get('pf_users') || {}
          const u = user.trim().toLowerCase()
          if (!users[u]) { setErr(t.userNotFound); setLoading(false); setMood('sad'); return }
          if (atob(users[u].pwd) !== pwd) { setErr(t.wrongPwd); setLoading(false); setMood('sad'); return }
        }
        setMood('excited')
        LS.set('pf_session', { username: user.trim().toLowerCase(), token })
        onLogin(user.trim().toLowerCase(), token)
      }
    } catch(e) {
      const msg = e.message || ''
      if (msg.includes('exists'))     setErr(t.userExists)
      else if (msg.includes('found')) setErr(t.userNotFound)
      else if (msg.includes('wrong') || msg.includes('pwd')) setErr(t.wrongPwd)
      else setErr(msg || t.sheetErr)
      setMood('sad')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight:'100vh', background:'var(--c-bg)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'24px 16px',
    }}>
      {/* Card */}
      <div style={{
        background:'var(--c-surface)', border:'1.5px solid var(--c-border)',
        borderRadius:24, padding:'36px 32px', width:'100%', maxWidth:400,
        boxShadow:'0 12px 48px var(--c-shadow)', animation:'popIn 0.4s ease',
      }}>
        {/* Logo area */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Mascot size={100} mood={mood} animate color='var(--c-primary)'/>
          <h1 style={{ fontSize:22, fontWeight:800, color:'var(--c-text)', margin:'10px 0 4px', letterSpacing:-0.5 }}>
            Personal Finance
          </h1>
          <p style={{ color:'var(--c-text2)', fontSize:13 }}>
            {mode === 'register' ? t.createAccount : t.appSlogan}
          </p>
        </div>

        {/* Form */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Field label={t.username}>
            <Input value={user} onChange={e=>setUser(e.target.value)} placeholder={t.username} autoFocus />
          </Field>
          <Field label={t.password}>
            <Input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="••••••"
              onKeyDown={e=>{ if(e.key==='Enter' && mode==='login') handleSubmit() }} />
          </Field>
          {mode === 'register' && (
            <Field label={t.confirmPwd}>
              <Input type="password" value={cpwd} onChange={e=>setCpwd(e.target.value)} placeholder="••••••"
                onKeyDown={e=>{ if(e.key==='Enter') handleSubmit() }} />
            </Field>
          )}
        </div>

        {err && (
          <div style={{
            marginTop:12, padding:'10px 14px', borderRadius:9, fontSize:13,
            background: err.startsWith('✅') ? 'var(--c-primary-xl)' : '#FEF2F2',
            color: err.startsWith('✅') ? 'var(--c-primary)' : '#DC2626',
            border:`1px solid ${err.startsWith('✅') ? 'var(--c-primary-lt)' : '#FECACA'}`,
          }}>{err}</div>
        )}

        <Btn onClick={handleSubmit} disabled={loading} variant="primary" size="lg"
          style={{ width:'100%', marginTop:20 }}>
          {loading ? <><Spinner size={15} color="#fff"/> {t.btnSaving}</> : (mode==='register' ? t.btnCreate : t.btnLogin)}
        </Btn>

        <p style={{ textAlign:'center', marginTop:18, fontSize:13, color:'var(--c-text2)' }}>
          {mode === 'login' ? t.noAccount : t.haveAccount}
          <button onClick={()=>{ setMode(mode==='login'?'register':'login'); reset(); setMood('happy') }}
            style={{ background:'none', border:'none', color:'var(--c-primary)', fontWeight:700, cursor:'pointer', fontSize:13 }}>
            {mode === 'login' ? t.createAccount : t.login}
          </button>
        </p>
      </div>

      {/* Not configured notice */}
      {!isConfigured() && (
        <div style={{ marginTop:16, fontSize:11, color:'var(--c-text2)', textAlign:'center', maxWidth:340 }}>
          ⚠️ Google Sheet ยังไม่ได้เชื่อม — ใช้โหมด local demo
        </div>
      )}
    </div>
  )
}

// ─── Settings Panel ───────────────────────────────────────────────────────────

function SettingsPanel({ t, lang, setLang, theme, setTheme, onClose }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:400,
      display:'flex', alignItems:'flex-end', justifyContent:'center',
    }} onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{
        background:'var(--c-surface)', borderRadius:'24px 24px 0 0',
        padding:'24px 24px 36px', width:'100%', maxWidth:500,
        boxShadow:'0 -8px 40px var(--c-shadow)', animation:'slideIn 0.3s ease',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <h3 style={{ fontSize:17, fontWeight:800, color:'var(--c-text)' }}>⚙️ {t.settings}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, color:'var(--c-text2)', cursor:'pointer' }}>✕</button>
        </div>

        {/* Language */}
        <div style={{ marginBottom:22 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--c-text2)', marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>{t.language}</div>
          <div style={{ display:'flex', gap:8 }}>
            {LANGS.map(l => (
              <button key={l.code} onClick={()=>setLang(l.code)} style={{
                flex:1, padding:'10px 8px', borderRadius:12, border:`2px solid ${lang===l.code ? 'var(--c-primary)' : 'var(--c-border)'}`,
                background: lang===l.code ? 'var(--c-primary-xl)' : 'var(--c-surface2)',
                color: lang===l.code ? 'var(--c-primary)' : 'var(--c-text2)',
                fontWeight:700, fontSize:13, cursor:'pointer', transition:'all 0.2s',
              }}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme color pad */}
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--c-text2)', marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>{t.themeColor}</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10 }}>
            {THEMES.map(th => (
              <button key={th.id} onClick={()=>setTheme(th.id)} style={{
                padding:'12px 8px', borderRadius:14, border:`2.5px solid ${theme===th.id ? th.color : 'transparent'}`,
                background: th.id==='dark' ? '#0F1117' : `${th.color}18`,
                cursor:'pointer', transition:'all 0.2s', position:'relative',
                display:'flex', flexDirection:'column', alignItems:'center', gap:6,
              }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:th.color, boxShadow: theme===th.id ? `0 0 0 3px ${th.color}44` : 'none' }} />
                <span style={{ fontSize:11, fontWeight:600, color: th.id==='dark'?'#E2E8F0':'var(--c-text)', lineHeight:1.2 }}>
                  {th.label[lang] || th.label.en}
                </span>
                {theme===th.id && <div style={{ position:'absolute', top:6, right:8, fontSize:10, color:th.color }}>✓</div>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Add Transaction Modal ────────────────────────────────────────────────────

function AddModal({ t, onClose, onAdd, saving, cats }) {
  const [form, setForm] = useState({ date:TODAY(), amount:'', category:'food', note:'', source:'manual', type:'expense' })
  const [err, setErr]   = useState('')

  function set(k,v) { setForm(p=>({...p,[k]:v})); setErr('') }

  function submit() {
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) { setErr(t.validAmt); return }
    if (!form.date) { setErr(t.validDate); return }
    const amt = parseFloat(form.amount) * (form.type==='expense' ? -1 : 1)
    onAdd({ id:String(Date.now()), date:form.date, amount:amt,
      category: form.type==='income' ? 'income' : form.category,
      note:form.note.trim(), source:form.source, createdAt:new Date().toISOString() })
  }

  const inputSx = { width:'100%', background:'var(--c-surface2)', border:'1.5px solid var(--c-border)', borderRadius:10, padding:'11px 14px', color:'var(--c-text)', fontSize:14, outline:'none' }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{
        background:'var(--c-surface)', borderRadius:24, padding:'28px 24px',
        width:'100%', maxWidth:420, boxShadow:'0 20px 60px var(--c-shadow)',
        animation:'slideIn 0.3s ease', maxHeight:'90vh', overflowY:'auto',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ fontSize:17, fontWeight:800, color:'var(--c-text)' }}>{t.modalAdd}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, color:'var(--c-text2)', cursor:'pointer' }}>✕</button>
        </div>

        {/* Type toggle */}
        <div style={{ display:'flex', background:'var(--c-surface2)', borderRadius:12, padding:4, marginBottom:18 }}>
          {['expense','income'].map(tp=>(
            <button key={tp} onClick={()=>set('type',tp)} style={{
              flex:1, padding:'10px 0', border:'none', borderRadius:9, fontSize:13,
              fontWeight:700, cursor:'pointer', transition:'all 0.2s',
              background: form.type===tp ? (tp==='expense' ? '#DC2626' : '#059669') : 'transparent',
              color: form.type===tp ? '#fff' : 'var(--c-text2)',
            }}>{tp==='expense' ? t.typeExpense : t.typeIncome}</button>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Field label={t.fieldDate}>
            <input type="date" style={inputSx} value={form.date} onChange={e=>set('date',e.target.value)}/>
          </Field>
          <Field label={t.fieldAmt}>
            <input type="number" min="0" step="0.01" placeholder="0.00" style={inputSx} value={form.amount} onChange={e=>set('amount',e.target.value)}/>
          </Field>
          {form.type==='expense' && (
            <Field label={t.fieldCat}>
              <select style={inputSx} value={form.category} onChange={e=>set('category',e.target.value)}>
                {cats.filter(c=>c.id!=='income').map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
          )}
          <Field label={t.fieldSrc}>
            <select style={inputSx} value={form.source} onChange={e=>set('source',e.target.value)}>
              <option value="manual">✏️ {t.srcManual}</option>
              <option value="wechat">🟢 WeChat Pay 微信支付</option>
              <option value="alipay">🔵 Alipay 支付宝</option>
            </select>
          </Field>
          <Field label={t.fieldNote}>
            <input type="text" placeholder={t.notePlh} style={inputSx} value={form.note}
              onChange={e=>set('note',e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') submit() }}/>
          </Field>
        </div>

        {err && <div style={{ marginTop:12, padding:'9px 13px', borderRadius:9, background:'#FEF2F2', color:'#DC2626', fontSize:12, border:'1px solid #FECACA' }}>⚠️ {err}</div>}

        <div style={{ display:'flex', gap:10, marginTop:22 }}>
          <Btn onClick={onClose} variant="ghost" style={{ flex:1 }}>{t.btnCancel}</Btn>
          <Btn onClick={submit} disabled={saving} variant="primary" style={{ flex:2 }}>
            {saving ? <><Spinner size={14} color="#fff"/>{t.btnSaving}</> : t.btnSave}
          </Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteModal({ tx, t, cats, onConfirm, onCancel, deleting }) {
  const cat = cats.find(c=>c.id===tx.category) || cats[0]
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e=>{ if(e.target===e.currentTarget) onCancel() }}>
      <div style={{ background:'var(--c-surface)', borderRadius:24, padding:32, width:'100%', maxWidth:360, textAlign:'center', boxShadow:'0 20px 60px rgba(220,38,38,0.2)', animation:'slideIn 0.3s ease' }}>
        <div style={{ fontSize:44, marginBottom:10 }}>🗑️</div>
        <div style={{ fontWeight:800, fontSize:17, color:'var(--c-text)', marginBottom:8 }}>{t.deleteQ}</div>
        <div style={{ background:'var(--c-surface2)', borderRadius:10, padding:'10px 14px', color:'var(--c-text2)', fontSize:13, marginBottom:24 }}>
          {tx.note||'—'} · <span style={{ color:cat.color, fontWeight:700 }}>¥{Math.abs(tx.amount).toFixed(2)}</span>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Btn onClick={onCancel} variant="ghost" style={{ flex:1 }}>{t.btnCancel}</Btn>
          <Btn onClick={onConfirm} disabled={deleting} variant="danger" style={{ flex:1 }}>
            {deleting ? <><Spinner size={14} color="#fff"/>{t.deleting}</> : t.btnDelete}
          </Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCards({ txs, t }) {
  const inc = txs.filter(x=>x.amount>0).reduce((s,x)=>s+x.amount,0)
  const exp = txs.filter(x=>x.amount<0).reduce((s,x)=>s+Math.abs(x.amount),0)
  const bal = inc-exp
  const fmt = n=>'¥'+n.toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2})
  const cards = [
    { label:t.balance, val:fmt(bal), color:bal>=0?'var(--c-income)':'var(--c-expense)', bg:bal>=0?'var(--c-income-lt)':'var(--c-expense-lt)', icon:'💼' },
    { label:t.income,  val:fmt(inc), color:'var(--c-income)',  bg:'var(--c-income-lt)',  icon:'📈' },
    { label:t.expense, val:fmt(exp), color:'var(--c-expense)', bg:'var(--c-expense-lt)', icon:'📉' },
  ]
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
      {cards.map((c,i)=>(
        <div key={c.label} style={{
          background:c.bg, borderRadius:16, padding:'14px 10px', textAlign:'center',
          animation:`fadeUp 0.4s ease ${i*0.08}s both`,
        }}>
          <div style={{ fontSize:20, marginBottom:4 }}>{c.icon}</div>
          <div style={{ fontSize:10, fontWeight:700, color:c.color, opacity:0.75, textTransform:'uppercase', letterSpacing:0.4, marginBottom:3 }}>{c.label}</div>
          <div style={{ fontSize:13, fontWeight:800, color:c.color, fontVariantNumeric:'tabular-nums', lineHeight:1.2 }}>{c.val}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Category Chart ───────────────────────────────────────────────────────────

function CategoryChart({ txs, t, cats }) {
  const total = txs.filter(x=>x.amount<0).reduce((s,x)=>s+Math.abs(x.amount),0)
  if (!total) return null
  const rows = cats
    .map(c=>({ ...c, sum:txs.filter(x=>x.category===c.id&&x.amount<0).reduce((s,x)=>s+Math.abs(x.amount),0) }))
    .filter(c=>c.sum>0).sort((a,b)=>b.sum-a.sum).slice(0,5)
  return (
    <div style={{ background:'var(--c-surface)', border:'1.5px solid var(--c-border)', borderRadius:16, padding:18, marginBottom:16 }}>
      <div style={{ fontSize:12, fontWeight:700, color:'var(--c-text2)', textTransform:'uppercase', letterSpacing:0.4, marginBottom:14 }}>{t.chartTitle}</div>
      {rows.map(c=>(
        <div key={c.id} style={{ marginBottom:11 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:13 }}>{c.label}</span>
            <span style={{ fontSize:13, fontWeight:700, color:c.color }}>
              ¥{c.sum.toFixed(2)} <span style={{ color:'var(--c-text2)', fontWeight:400, fontSize:11 }}>({((c.sum/total)*100).toFixed(0)}%)</span>
            </span>
          </div>
          <div style={{ height:6, background:c.bg||'var(--c-surface2)', borderRadius:99 }}>
            <div style={{ height:'100%', borderRadius:99, background:c.color, width:`${Math.min((c.sum/total)*100,100)}%`, animation:'barGrow 0.8s ease' }}/>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TxRow({ tx, t, cats, onDelete, idx }) {
  const cat = cats.find(c=>c.id===tx.category)||cats[cats.length-1]
  return (
    <div style={{
      background:'var(--c-surface)', border:'1.5px solid var(--c-border)', borderRadius:14,
      padding:'13px 14px', marginBottom:8, display:'flex', alignItems:'center', gap:12,
      animation:`fadeUp 0.3s ease ${Math.min(idx,8)*0.03}s both`,
      transition:'box-shadow 0.2s, transform 0.15s',
    }}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 18px var(--c-shadow)';e.currentTarget.style.transform='translateY(-1px)'}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none'}}
    >
      <div style={{ width:40, height:40, borderRadius:11, background:cat.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
        {cat.label.split(' ')[0]}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap', marginBottom:3 }}>
          <span style={{ fontSize:14, fontWeight:600, color:'var(--c-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{tx.note||'—'}</span>
          <SourceBadge source={tx.source} t={t}/>
        </div>
        <div style={{ fontSize:11, color:'var(--c-text2)' }}>
          {tx.date} · <span style={{ color:cat.color, fontWeight:600 }}>{cat.label}</span>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        <span style={{ fontSize:15, fontWeight:800, color:tx.amount<0?'var(--c-expense)':'var(--c-income)', fontVariantNumeric:'tabular-nums' }}>
          {tx.amount<0?'−':'+'}¥{Math.abs(tx.amount).toFixed(2)}
        </span>
        <button onClick={()=>onDelete(tx)} style={{
          background:'none', border:'1.5px solid var(--c-border)', borderRadius:8,
          color:'var(--c-border)', padding:'4px 8px', cursor:'pointer', fontSize:13, transition:'all 0.18s',
        }}
          onMouseEnter={e=>{e.currentTarget.style.background='#FEF2F2';e.currentTarget.style.color='#DC2626';e.currentTarget.style.borderColor='#FECACA'}}
          onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='var(--c-border)';e.currentTarget.style.borderColor='var(--c-border)'}}
        >🗑</button>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ username, token, lang, setLang, theme, setTheme, t, onLogout }) {
  const cats = getCats(t)
  const [txs, setTxs]           = useState([])
  const [loading, setLoading]   = useState(false)
  const [modal, setModal]       = useState(null)   // 'add' | 'settings' | null
  const [pendingDelete, setPendingDelete] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast]       = useState({ msg:'', type:'' })
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')
  const [mood, setMood]         = useState('happy')
  const toastRef                = useRef(null)

  function showToast(msg, type='success') {
    setToast({ msg, type })
    clearTimeout(toastRef.current)
    toastRef.current = setTimeout(()=>setToast({msg:'',type:''}), 3000)
  }

  // Load transactions
  useEffect(()=>{
    const cached = LS.get(`pf_tx_${username}`)
    if (cached) setTxs(cached)
    if (isConfigured()) {
      setLoading(true); setMood('thinking')
      getTx(username, token)
        .then(data=>{ const d=data.length?data:DEMO_TX; setTxs(d); LS.set(`pf_tx_${username}`,d); setMood('excited'); showToast(t.loaded); setTimeout(()=>setMood('happy'),2000) })
        .catch(()=>{ if(!cached) setTxs(DEMO_TX); setMood('sad'); showToast(t.sheetErr,'error'); setTimeout(()=>setMood('happy'),2500) })
        .finally(()=>setLoading(false))
    } else {
      if (!cached) setTxs(DEMO_TX)
    }
  }, [username])

  async function handleAdd(tx) {
    setSaving(true)
    if (isConfigured()) {
      try { await addTx(username, token, tx) } catch { showToast(t.saveErr,'error') }
    }
    const next = [tx, ...txs]
    setTxs(next); LS.set(`pf_tx_${username}`, next)
    setSaving(false); setModal(null)
    showToast(t.saved)
    setMood('excited'); setTimeout(()=>setMood('happy'),2000)
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    if (isConfigured()) {
      try { await deleteTx(username, token, pendingDelete.id) } catch {}
    }
    const next = txs.filter(x=>x.id!==pendingDelete.id)
    setTxs(next); LS.set(`pf_tx_${username}`, next)
    setDeleting(false); setPendingDelete(null)
    showToast(t.deleted)
    setMood('sad'); setTimeout(()=>setMood('happy'),1800)
  }

  const displayed = txs
    .filter(x=>filter==='all'||x.source===filter)
    .filter(x=>!search||x.note.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>new Date(b.date)-new Date(a.date))

  const filterBtns = [
    { k:'all',    l:t.filterAll },
    { k:'wechat', l:t.filterWechat },
    { k:'alipay', l:t.filterAlipay },
    { k:'manual', l:t.filterManual },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'var(--c-bg)' }}>

      {/* ── Top Nav ── */}
      <header style={{
        background:'var(--c-surface)', borderBottom:'1.5px solid var(--c-border)',
        padding:'12px 16px', position:'sticky', top:0, zIndex:100,
        display:'flex', alignItems:'center', gap:12,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
          <Mascot size={40} mood={loading?'loading':mood} animate={false} color='var(--c-primary)'/>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:'var(--c-text)', lineHeight:1.1 }}>Personal Finance</div>
            <div style={{ fontSize:11, color:'var(--c-text2)' }}>@{username}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {/* Lang switcher compact */}
          <div style={{ display:'flex', gap:3, background:'var(--c-surface2)', borderRadius:99, padding:3 }}>
            {LANGS.map(l=>(
              <button key={l.code} onClick={()=>setLang(l.code)} style={{
                padding:'4px 8px', borderRadius:99, border:'none', fontSize:11, fontWeight:700, cursor:'pointer',
                background: lang===l.code ? 'var(--c-primary)' : 'transparent',
                color: lang===l.code ? '#fff' : 'var(--c-text2)',
              }}>{l.flag}</button>
            ))}
          </div>
          <button onClick={()=>setModal('settings')} style={{ background:'var(--c-surface2)', border:'1.5px solid var(--c-border)', borderRadius:10, padding:'7px 10px', fontSize:16, cursor:'pointer' }}>⚙️</button>
          <button onClick={onLogout} style={{ background:'none', border:'1.5px solid var(--c-border)', borderRadius:10, padding:'7px 10px', fontSize:11, fontWeight:600, color:'var(--c-text2)', cursor:'pointer' }}>{t.logout}</button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={{ maxWidth:700, margin:'0 auto', padding:'16px 14px 80px' }}>

        {/* Hero */}
        <div style={{
          background:`linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dk) 100%)`,
          borderRadius:20, padding:'20px 22px', marginBottom:16,
          display:'flex', alignItems:'center', gap:16, overflow:'hidden', position:'relative',
        }}>
          <div style={{ position:'absolute', top:-20, right:100, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.07)' }}/>
          <div style={{ position:'absolute', bottom:-30, right:40, width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }}/>
          <Mascot size={90} mood={loading?'loading':mood} animate color='var(--c-primary)'/>
          <div style={{ flex:1, zIndex:1 }}>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:2 }}>
              {t.welcomeBack}, <b style={{ color:'#fff' }}>@{username}</b>
            </div>
            <div style={{ fontSize:20, fontWeight:800, color:'#fff', whiteSpace:'pre-line', lineHeight:1.4 }}>
              {t.mascotLine}
            </div>
          </div>
          <div style={{
            position:'absolute', top:12, right:14,
            background:'#fff', borderRadius:'12px 12px 0 12px',
            padding:'7px 12px', fontSize:11, color:'var(--c-primary)', fontWeight:700,
            boxShadow:'0 4px 12px rgba(0,0,0,0.15)', maxWidth:140, lineHeight:1.5,
          }}>
            {t.appSlogan}
            <div style={{ position:'absolute', bottom:-7, right:0, borderLeft:'7px solid transparent', borderTop:'7px solid #fff' }}/>
          </div>
        </div>

        {/* Summary */}
        <SummaryCards txs={txs} t={t}/>

        {/* Chart */}
        <CategoryChart txs={txs} t={t} cats={cats}/>

        {/* Filter + Search + Add */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', marginBottom:10 }}>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', flex:1 }}>
            {filterBtns.map(f=>(
              <button key={f.k} onClick={()=>setFilter(f.k)} style={{
                padding:'7px 13px', borderRadius:99, border:`1.5px solid ${filter===f.k?'var(--c-primary)':'var(--c-border)'}`,
                background: filter===f.k?'var(--c-primary)':'var(--c-surface)',
                color: filter===f.k?'#fff':'var(--c-text2)',
                fontWeight:600, fontSize:12, cursor:'pointer', transition:'all 0.2s',
              }}>{f.l}</button>
            ))}
          </div>
          <input type="text" placeholder={t.search} value={search} onChange={e=>setSearch(e.target.value)}
            style={{ padding:'7px 13px', borderRadius:99, border:'1.5px solid var(--c-border)', background:'var(--c-surface)', color:'var(--c-text)', fontSize:12, outline:'none', minWidth:130 }}
            onFocus={e=>e.target.style.borderColor='var(--c-primary)'}
            onBlur={e=>e.target.style.borderColor='var(--c-border)'}
          />
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <span style={{ fontSize:12, color:'var(--c-text2)', fontWeight:500 }}>{t.txCount(displayed.length)}</span>
          <Btn onClick={()=>setModal('add')} variant="primary" size="sm">
            <span className="hide-mobile">{t.addTx}</span>
            <span className="show-mobile" style={{ fontSize:18, fontWeight:800 }}>＋</span>
          </Btn>
        </div>

        {/* Tx list */}
        {displayed.length===0
          ? <div style={{ textAlign:'center', padding:'48px 0', color:'var(--c-text2)' }}><div style={{ fontSize:44, marginBottom:10 }}>📭</div>{t.noTx}</div>
          : displayed.map((tx,i)=><TxRow key={tx.id} tx={tx} t={t} cats={cats} onDelete={setPendingDelete} idx={i}/>)
        }

        {/* Export hint */}
        <div style={{ marginTop:20, padding:'13px 16px', background:'var(--c-primary-xl)', border:'1.5px solid var(--c-primary-lt)', borderRadius:14, fontSize:12, color:'var(--c-text2)', lineHeight:1.8 }}>
          {t.exportHint}
        </div>
      </main>

      {/* FAB on mobile */}
      <button onClick={()=>setModal('add')} className="show-mobile" style={{
        position:'fixed', bottom:24, right:22, width:56, height:56, borderRadius:'50%',
        background:'var(--c-primary)', border:'none', color:'#fff', fontSize:26,
        boxShadow:'0 6px 20px var(--c-shadow)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center',
      }}>＋</button>

      {/* Modals */}
      {modal==='add'      && <AddModal t={t} cats={cats} onClose={()=>setModal(null)} onAdd={handleAdd} saving={saving}/>}
      {modal==='settings' && <SettingsPanel t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} onClose={()=>setModal(null)}/>}
      {pendingDelete      && <DeleteModal tx={pendingDelete} t={t} cats={cats} onConfirm={handleDelete} onCancel={()=>setPendingDelete(null)} deleting={deleting}/>}
      <Toast msg={toast.msg} type={toast.type}/>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [lang,  setLang]  = useState(()=>LS.get('pf_lang')||'th')
  const [theme, setTheme] = useState(()=>LS.get('pf_theme')||'blue')
  const [auth,  setAuth]  = useState(()=>LS.get('pf_session'))  // { username, token } | null

  const t = useT(lang)

  // Persist lang + theme
  useEffect(()=>{ LS.set('pf_lang',lang) }, [lang])
  useEffect(()=>{
    LS.set('pf_theme',theme)
    document.documentElement.setAttribute('data-theme', theme==='blue'?'':theme)
  }, [theme])

  // Apply saved theme on load
  useEffect(()=>{
    if (theme && theme!=='blue') document.documentElement.setAttribute('data-theme', theme)
  }, [])

  function handleLogin(username, token) {
    const session = { username, token }
    setAuth(session)
    LS.set('pf_session', session)
  }

  function handleLogout() {
    setAuth(null)
    LS.del('pf_session')
  }

  if (!auth) {
    return <AuthScreen lang={lang} t={t} onLogin={handleLogin}/>
  }

  return (
    <Dashboard
      username={auth.username} token={auth.token}
      lang={lang} setLang={setLang}
      theme={theme} setTheme={setTheme}
      t={t} onLogout={handleLogout}
    />
  )
}
