import { useState, useEffect, useRef } from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatCNY = (n) =>
  new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(n);

const CATEGORIES = [
  { id: "food", label: "🍜 อาหาร", color: "#FF6B6B" },
  { id: "transport", label: "🚗 เดินทาง", color: "#4ECDC4" },
  { id: "shopping", label: "🛍 ช้อปปิ้ง", color: "#FFE66D" },
  { id: "health", label: "💊 สุขภาพ", color: "#A8E6CF" },
  { id: "entertainment", label: "🎮 บันเทิง", color: "#C9B1FF" },
  { id: "income", label: "💰 รายรับ", color: "#6BCB77" },
  { id: "other", label: "📦 อื่นๆ", color: "#FFB347" },
];

const SEED_DATA = [
  { id: 1, date: "2026-04-20", amount: -48.5, category: "food", note: "ข้าวกลางวัน", source: "wechat" },
  { id: 2, date: "2026-04-21", amount: -128, category: "transport", note: "Didi ไปออฟฟิศ", source: "alipay" },
  { id: 3, date: "2026-04-22", amount: 15000, category: "income", note: "เงินเดือน", source: "manual" },
  { id: 4, date: "2026-04-23", amount: -299, category: "shopping", note: "เสื้อผ้า Taobao", source: "alipay" },
  { id: 5, date: "2026-04-24", amount: -55, category: "food", note: "กาแฟ + เค้ก", source: "wechat" },
  { id: 6, date: "2026-04-25", amount: -180, category: "health", note: "ยา", source: "manual" },
];

// ─── Mini Components ─────────────────────────────────────────────────────────
const SourceBadge = ({ source }) => {
  const map = {
    wechat: { label: "微信支付", bg: "#07C160", text: "#fff" },
    alipay: { label: "支付宝", bg: "#1677FF", text: "#fff" },
    manual: { label: "Manual", bg: "#3D3D3D", text: "#aaa" },
    ai: { label: "AI Import", bg: "#9333ea", text: "#fff" },
  };
  const s = map[source] || map.manual;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
      background: s.bg, color: s.text, letterSpacing: 0.3,
    }}>{s.label}</span>
  );
};

const CategoryDot = ({ cat }) => {
  const c = CATEGORIES.find((x) => x.id === cat);
  return <span style={{ color: c?.color, fontWeight: 700 }}>{c?.label || cat}</span>;
};

// ─── AI Import Modal ──────────────────────────────────────────────────────────
function AIImportModal({ onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleFile = (f) => {
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const runAI = async () => {
    if (!file || !preview) return;
    setLoading(true);
    setError(null);
    try {
      const base64 = preview.split(",")[1];
      const mediaType = file.type || "image/jpeg";

      const body = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              {
                type: "text",
                text: `You are a financial data extractor. Look at this payment screenshot (WeChat Pay / Alipay / bank statement).
Extract all transactions visible and return ONLY a JSON array like:
[{"date":"YYYY-MM-DD","amount":-50.0,"note":"description","category":"food","source":"wechat"}]

Rules:
- amount is negative for expenses, positive for income
- category must be one of: food, transport, shopping, health, entertainment, income, other
- source: "wechat" if WeChat Pay, "alipay" if Alipay, "manual" otherwise
- If no transactions visible, return []
- Return ONLY the JSON array, no extra text.`,
              },
            ],
          },
        ],
      };

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      const raw = data.content?.find((b) => b.type === "text")?.text || "[]";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setError("ไม่สามารถอ่านข้อมูลได้ กรุณาลองใหม่หรือ import ด้วยตนเอง");
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#1A1A2E", border: "1px solid #2D2D4A", borderRadius: 16,
        padding: 28, width: 460, maxWidth: "95vw", maxHeight: "85vh",
        overflowY: "auto", color: "#E0E0E0",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: "#C9B1FF" }}>🤖 AI Import จาก Screenshot</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* Upload area */}
        <div
          onClick={() => fileRef.current.click()}
          style={{
            border: "2px dashed #3D3D6A", borderRadius: 12, padding: "24px",
            textAlign: "center", cursor: "pointer", marginBottom: 16,
            background: file ? "#12122A" : "transparent",
            transition: "all 0.2s",
          }}
        >
          {preview ? (
            <img src={preview} alt="preview" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }} />
          ) : (
            <>
              <div style={{ fontSize: 36 }}>📸</div>
              <div style={{ color: "#888", fontSize: 13, marginTop: 8 }}>
                คลิกหรือลาก Screenshot จาก WeChat Pay / Alipay มาวางที่นี่
              </div>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />

        <button
          onClick={runAI}
          disabled={!file || loading}
          style={{
            width: "100%", padding: "12px", borderRadius: 10, border: "none",
            background: loading ? "#3D3D6A" : "linear-gradient(135deg,#9333ea,#C9B1FF)",
            color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
            marginBottom: 16,
          }}
        >
          {loading ? "⏳ กำลังวิเคราะห์..." : "🔍 วิเคราะห์ด้วย AI"}
        </button>

        {error && <div style={{ background: "#3D1515", border: "1px solid #FF6B6B", borderRadius: 8, padding: 12, color: "#FF6B6B", fontSize: 13, marginBottom: 12 }}>{error}</div>}

        {result && (
          <div>
            <div style={{ fontSize: 13, color: "#aaa", marginBottom: 10 }}>
              พบ {result.length} รายการ — ตรวจสอบก่อน Import:
            </div>
            {result.length === 0 ? (
              <div style={{ color: "#888", fontSize: 13 }}>ไม่พบธุรกรรมในภาพ</div>
            ) : (
              result.map((tx, i) => (
                <div key={i} style={{
                  background: "#12122A", borderRadius: 8, padding: "10px 14px", marginBottom: 8,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  border: "1px solid #2D2D4A",
                }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#E0E0E0" }}>{tx.note}</div>
                    <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{tx.date} · <CategoryDot cat={tx.category} /></div>
                  </div>
                  <div style={{ color: tx.amount < 0 ? "#FF6B6B" : "#6BCB77", fontWeight: 700 }}>
                    {tx.amount < 0 ? "-" : "+"}¥{Math.abs(tx.amount)}
                  </div>
                </div>
              ))
            )}
            {result.length > 0 && (
              <button
                onClick={() => { onImport(result); onClose(); }}
                style={{
                  width: "100%", marginTop: 8, padding: 12, borderRadius: 10, border: "none",
                  background: "#6BCB77", color: "#0A0A1A", fontWeight: 700, fontSize: 14, cursor: "pointer",
                }}
              >
                ✅ Import {result.length} รายการ
              </button>
            )}
          </div>
        )}

        <div style={{ fontSize: 11, color: "#555", marginTop: 16, borderTop: "1px solid #2D2D4A", paddingTop: 12 }}>
          💡 วิธี Export จาก App: WeChat → Me → Services → Wallet → Bill Detail → Export | Alipay → My Account → Transaction History → Export
        </div>
      </div>
    </div>
  );
}

// ─── Add Transaction Modal ────────────────────────────────────────────────────
function AddTxModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], amount: "", category: "food", note: "", source: "manual", type: "expense" });

  const submit = () => {
    if (!form.amount || isNaN(form.amount)) return;
    const amt = parseFloat(form.amount) * (form.type === "expense" ? -1 : 1);
    onAdd({ ...form, amount: amt, id: Date.now() });
    onClose();
  };

  const input = (field, props) => (
    <input
      {...props}
      value={form[field]}
      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
      style={{ width: "100%", background: "#12122A", border: "1px solid #2D2D4A", borderRadius: 8, padding: "10px 12px", color: "#E0E0E0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
    />
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1A1A2E", border: "1px solid #2D2D4A", borderRadius: 16, padding: 28, width: 380, maxWidth: "95vw", color: "#E0E0E0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "#FFE66D" }}>➕ เพิ่มรายการ</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* Type toggle */}
        <div style={{ display: "flex", background: "#12122A", borderRadius: 10, padding: 3, marginBottom: 16 }}>
          {["expense", "income"].map((t) => (
            <button key={t} onClick={() => setForm({ ...form, type: t })} style={{
              flex: 1, padding: 9, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13,
              background: form.type === t ? (t === "expense" ? "#FF6B6B" : "#6BCB77") : "transparent",
              color: form.type === t ? "#0A0A1A" : "#666",
            }}>{t === "expense" ? "💸 รายจ่าย" : "💰 รายรับ"}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>{input("date", { type: "date" })}</div>
          <div>{input("amount", { type: "number", placeholder: "จำนวนเงิน (¥)" })}</div>
          <div>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ width: "100%", background: "#12122A", border: "1px solid #2D2D4A", borderRadius: 8, padding: "10px 12px", color: "#E0E0E0", fontSize: 14, outline: "none" }}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
              style={{ width: "100%", background: "#12122A", border: "1px solid #2D2D4A", borderRadius: 8, padding: "10px 12px", color: "#E0E0E0", fontSize: 14, outline: "none" }}>
              <option value="manual">Manual</option>
              <option value="wechat">微信支付 WeChat Pay</option>
              <option value="alipay">支付宝 Alipay</option>
            </select>
          </div>
          <div>{input("note", { placeholder: "หมายเหตุ" })}</div>
        </div>

        <button onClick={submit} style={{
          width: "100%", marginTop: 20, padding: 13, borderRadius: 10, border: "none",
          background: "linear-gradient(135deg,#FFE66D,#FFB347)", color: "#0A0A1A",
          fontWeight: 700, fontSize: 15, cursor: "pointer",
        }}>บันทึก</button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function FinanceTracker() {
  const [txs, setTxs] = useState(SEED_DATA);
  const [modal, setModal] = useState(null); // null | "add" | "ai"
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = txs
    .filter((t) => filter === "all" || t.source === filter)
    .filter((t) => !search || t.note.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalIncome = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const catStats = CATEGORIES.map((c) => ({
    ...c,
    total: txs.filter((t) => t.category === c.id && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
  })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

  const addTxs = (list) => {
    const newTxs = list.map((t, i) => ({ ...t, id: Date.now() + i, source: t.source || "ai" }));
    setTxs((prev) => [...prev, ...newTxs]);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A1A",
      fontFamily: "'Noto Sans Thai', 'Noto Sans SC', sans-serif",
      color: "#E0E0E0", padding: "20px 16px",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;700&family=Noto+Sans+SC:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0A0A1A; }
        ::-webkit-scrollbar-thumb { background: #2D2D4A; border-radius: 4px; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#FFE66D", letterSpacing: 1 }}>
            💴 บัญชีส่วนตัว
          </h1>
          <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>Personal Finance · 个人财务</div>
        </div>

        {/* Balance Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "ยอดคงเหลือ", value: balance, color: balance >= 0 ? "#6BCB77" : "#FF6B6B", icon: "💼" },
            { label: "รายรับ", value: totalIncome, color: "#6BCB77", icon: "📈" },
            { label: "รายจ่าย", value: totalExpense, color: "#FF6B6B", icon: "📉" },
          ].map((c) => (
            <div key={c.label} style={{
              background: "#1A1A2E", border: "1px solid #2D2D4A", borderRadius: 14,
              padding: "14px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: c.color }}>
                ¥{Math.abs(c.value).toLocaleString("zh-CN", { minimumFractionDigits: 1 })}
              </div>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        {catStats.length > 0 && (
          <div style={{ background: "#1A1A2E", border: "1px solid #2D2D4A", borderRadius: 14, padding: "16px", marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>รายจ่ายตามหมวด</div>
            {catStats.map((c) => (
              <div key={c.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span>{c.label}</span>
                  <span style={{ color: c.color }}>¥{c.total.toFixed(1)}</span>
                </div>
                <div style={{ height: 5, background: "#2D2D4A", borderRadius: 99 }}>
                  <div style={{
                    height: "100%", borderRadius: 99, background: c.color,
                    width: `${Math.min((c.total / totalExpense) * 100, 100)}%`,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button onClick={() => setModal("add")} style={{
            flex: 1, padding: "12px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#FFE66D,#FFB347)", color: "#0A0A1A",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>➕ เพิ่มรายการ</button>
          <button onClick={() => setModal("ai")} style={{
            flex: 1, padding: "12px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#9333ea,#C9B1FF)", color: "#fff",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>🤖 AI Import</button>
        </div>

        {/* Filter & Search */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {["all", "wechat", "alipay", "manual"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 14px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: filter === f ? "#FFE66D" : "#1A1A2E",
              color: filter === f ? "#0A0A1A" : "#666",
              border: "1px solid " + (filter === f ? "#FFE66D" : "#2D2D4A"),
            }}>
              {{ all: "ทั้งหมด", wechat: "微信支付", alipay: "支付宝", manual: "Manual" }[f]}
            </button>
          ))}
          <input
            placeholder="🔍 ค้นหา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              marginLeft: "auto", padding: "6px 14px", borderRadius: 99, background: "#1A1A2E",
              border: "1px solid #2D2D4A", color: "#E0E0E0", fontSize: 12, outline: "none",
            }}
          />
        </div>

        {/* Transactions */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#555", padding: 40, fontSize: 14 }}>ไม่มีรายการ</div>
          ) : filtered.map((t) => (
            <div key={t.id} style={{
              background: "#1A1A2E", border: "1px solid #2D2D4A", borderRadius: 12,
              padding: "14px 16px", marginBottom: 8,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{t.note || "—"}</span>
                  <SourceBadge source={t.source} />
                </div>
                <div style={{ fontSize: 11, color: "#555" }}>
                  {t.date} · <CategoryDot cat={t.category} />
                </div>
              </div>
              <div style={{
                fontSize: 17, fontWeight: 700,
                color: t.amount < 0 ? "#FF6B6B" : "#6BCB77",
                minWidth: 80, textAlign: "right",
              }}>
                {t.amount < 0 ? "-" : "+"}¥{Math.abs(t.amount).toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modal === "add" && <AddTxModal onClose={() => setModal(null)} onAdd={(tx) => { setTxs((p) => [...p, tx]); setModal(null); }} />}
      {modal === "ai" && <AIImportModal onClose={() => setModal(null)} onImport={addTxs} />}
    </div>
  );
}
