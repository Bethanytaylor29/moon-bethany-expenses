import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import './App.css'

// ─── Heart path points (parametric) ──────────────────────────────────────
const N = 600
function heartPt(t) {
  const a = t * Math.PI * 2
  const x = 16 * Math.pow(Math.sin(a), 3)
  const y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))
  return { x: 150 + x * 5.5, y: 80 + y * 5.2 + 8 }
}
const HEART_PTS = Array.from({ length: N }, (_, i) => heartPt(i / N))

// ─── Draw airplane silhouette on canvas context ───────────────────────────
function drawPlane(ctx) {
  // fuselage
  ctx.beginPath()
  ctx.moveTo(16, 0)
  ctx.bezierCurveTo(14, -1.4, 8, -2.5, 1, -2.5)
  ctx.lineTo(-11, -2); ctx.lineTo(-15, -1); ctx.lineTo(-15, 1)
  ctx.lineTo(-11, 2); ctx.lineTo(1, 2.5)
  ctx.bezierCurveTo(8, 2.5, 14, 1.4, 16, 0)
  ctx.closePath(); ctx.fill()
  // left wing
  ctx.beginPath(); ctx.moveTo(-2, -2.5); ctx.lineTo(-8, -13)
  ctx.lineTo(-14, -13); ctx.lineTo(-9, -2.5); ctx.closePath(); ctx.fill()
  // right wing
  ctx.beginPath(); ctx.moveTo(-2, 2.5); ctx.lineTo(-8, 13)
  ctx.lineTo(-14, 13); ctx.lineTo(-9, 2.5); ctx.closePath(); ctx.fill()
  // left tail
  ctx.beginPath(); ctx.moveTo(-11, -1.6); ctx.lineTo(-14, -6)
  ctx.lineTo(-18, -6); ctx.lineTo(-15, -1.6); ctx.closePath(); ctx.fill()
  // right tail
  ctx.beginPath(); ctx.moveTo(-11, 1.6); ctx.lineTo(-14, 6)
  ctx.lineTo(-18, 6); ctx.lineTo(-15, 1.6); ctx.closePath(); ctx.fill()
}

// ─── Login page ───────────────────────────────────────────────────────────
function LoginPage({ email, setEmail, password, setPassword, onSignIn }) {
  const canvasRef   = useRef(null)
  const formShownRef = useRef(false)
  const [formReady, setFormReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 300, H = 160
    canvas.width = W; canvas.height = H

    const LOOP_MS = 4200
    let t0 = null, rafId

    function drawFrame(upTo) {
      ctx.clearRect(0, 0, W, H)

      // gradient background
      const grad = ctx.createLinearGradient(0, 0, W, H)
      grad.addColorStop(0,    '#f8dce8')
      grad.addColorStop(0.35, '#f6efe7')
      grad.addColorStop(1,    '#d8c3f0')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      if (upTo < 2) return

      // dashed trail
      ctx.save()
      ctx.strokeStyle = '#5b21b6'
      ctx.lineWidth   = 2.5
      ctx.lineCap     = 'round'
      ctx.setLineDash([14, 9])
      ctx.beginPath()
      ctx.moveTo(HEART_PTS[0].x, HEART_PTS[0].y)
      for (let i = 1; i <= upTo && i < N; i++) {
        ctx.lineTo(HEART_PTS[i].x, HEART_PTS[i].y)
      }
      ctx.stroke()
      ctx.restore()

      // airplane at trail tip
      const i  = Math.min(upTo, N - 1)
      const p  = HEART_PTS[i]
      const pf = HEART_PTS[(i + 3) % N]
      const ang = Math.atan2(pf.y - p.y, pf.x - p.x)

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(ang)
      ctx.scale(1.15, 1.15)

      // shadow
      ctx.save()
      ctx.translate(0.8, 0.8)
      ctx.globalAlpha = 0.25
      ctx.fillStyle = 'white'
      drawPlane(ctx)
      ctx.restore()

      // plane
      ctx.fillStyle = '#3b0764'
      drawPlane(ctx)
      ctx.restore()
    }

    function tick(ts) {
      if (!t0) t0 = ts
      const elapsed  = ts - t0
      const loopFrac = (elapsed % LOOP_MS) / LOOP_MS
      const idx      = Math.floor(loopFrac * N)
      drawFrame(idx)

      if (elapsed > LOOP_MS && !formShownRef.current) {
        formShownRef.current = true
        setFormReady(true)
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* Canvas animation stage */}
        <div className="login-stage">
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 'auto' }} />
        </div>

        {/* Login form */}
        <div className={`login-form ${formReady ? 'visible' : ''}`}>
          <p className="login-eyebrow">✈️ Expense Tracker</p>
          <h1 className="login-title">Moon & Bethany</h1>
          <p className="login-trip">go to China 🇨🇳</p>
          <p className="login-sub">Sign in to track your trip</p>

          <form onSubmit={onSignIn}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn-primary">Sign in</button>
          </form>
        </div>

      </div>
    </div>
  )
}

// ─── Category icons ───────────────────────────────────────────────────────
const CATEGORY_ICON = {
  Dining: '🍽️', Hotel: '🏨', Flights: '✈️', Shopping: '🛍️',
  Spa: '🧖‍♀️', Transportation: '🚗', Groceries: '🛒',
  Entertainment: '🎀', Misc: '✦'
}
const CATEGORIES = Object.keys(CATEGORY_ICON)

// ─── Main app ─────────────────────────────────────────────────────────────
function App() {
  const [session,     setSession]     = useState(null)
  const [expenses,    setExpenses]    = useState([])
  const [description, setDescription] = useState('')
  const [category,    setCategory]    = useState('Dining')
  const [amount,      setAmount]      = useState('')
  const [paidBy,      setPaidBy]      = useState('Moon')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    fetchExpenses()
    const channel = supabase
      .channel('expenses-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, fetchExpenses)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [session])

  async function fetchExpenses() {
    const { data, error } = await supabase
      .from('expenses').select('*').order('created_at', { ascending: false })
    if (!error) setExpenses(data)
  }

  async function signIn(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  async function signOut() { await supabase.auth.signOut() }

  async function addExpense(e) {
    e.preventDefault()
    const { error } = await supabase.from('expenses').insert([{
      description, category, amount, paid_by: paidBy
    }])
    if (!error) { setDescription(''); setCategory('Dining'); setAmount(''); fetchExpenses() }
  }

  async function deleteExpense(id) {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (!error) fetchExpenses()
  }

  const totalSpent  = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const moonPaid    = expenses.filter(e => e.paid_by === 'Moon').reduce((s, e) => s + Number(e.amount), 0)
  const bethanyPaid = expenses.filter(e => e.paid_by === 'Bethany').reduce((s, e) => s + Number(e.amount), 0)
  const eachShare   = totalSpent / 2
  const moonOwes    = Math.max(0, eachShare - moonPaid)
  const bethanyOwes = Math.max(0, eachShare - bethanyPaid)
  const isEven      = moonOwes === 0 && bethanyOwes === 0

  const settleText = moonOwes > 0
    ? `Moon owes Bethany $${moonOwes.toFixed(2)}`
    : bethanyOwes > 0
    ? `Bethany owes Moon $${bethanyOwes.toFixed(2)}`
    : 'All settled up ✓'

  if (!session) {
    return (
      <LoginPage
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        onSignIn={signIn}
      />
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div>
            <p className="header-eyebrow">Moon & Bethany go to China 🇨🇳</p>
            <h1 className="header-title">Expense Tracker</h1>
          </div>
          <button className="btn-ghost" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <main className="app-main">

        <div className="summary-grid">
          <div className="summary-card">
            <span className="card-label">Total spent</span>
            <strong className="card-value">${totalSpent.toFixed(2)}</strong>
          </div>
          <div className="summary-card">
            <span className="card-label">Moon paid</span>
            <strong className="card-value">${moonPaid.toFixed(2)}</strong>
          </div>
          <div className="summary-card">
            <span className="card-label">Bethany paid</span>
            <strong className="card-value">${bethanyPaid.toFixed(2)}</strong>
          </div>
          <div className={`summary-card settle-card ${isEven ? 'settled' : ''}`}>
            <span className="card-label">Settle up</span>
            <strong className="settle-value">{settleText}</strong>
          </div>
        </div>

        <section>
          <p className="section-title">Add expense</p>
          <form onSubmit={addExpense} className="expense-form">
            <div className="form-field">
              <label className="field-label">Description</label>
              <input
                type="text" className="field-input" placeholder="What was it?"
                value={description} onChange={e => setDescription(e.target.value)} required
              />
            </div>
            <div className="expense-form-row">
              <div className="form-field">
                <label className="field-label">Category</label>
                <select className="field-input" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="field-label">Amount</label>
                <input
                  type="number" className="field-input" placeholder="$0.00"
                  step="0.01" min="0" value={amount}
                  onChange={e => setAmount(e.target.value)} required
                />
              </div>
            </div>
            <div className="expense-form-row">
              <div className="form-field">
                <label className="field-label">Paid by</label>
                <select className="field-input" value={paidBy} onChange={e => setPaidBy(e.target.value)}>
                  <option>Moon</option>
                  <option>Bethany</option>
                </select>
              </div>
              <div className="form-field" style={{ justifyContent: 'flex-end' }}>
                <label className="field-label">&nbsp;</label>
                <button type="submit" className="btn-primary">Add expense</button>
              </div>
            </div>
          </form>
        </section>

        <section>
          <p className="section-title">
            Expenses <span className="count">{expenses.length}</span>
          </p>
          <div className="expense-list">
            {expenses.length === 0 && (
              <div className="empty-state">No expenses yet — add one above ✦</div>
            )}
            {expenses.map(expense => (
              <div key={expense.id} className="expense-row">
                <span className="expense-icon">{CATEGORY_ICON[expense.category] ?? '✦'}</span>
                <div className="expense-desc">
                  <p className="expense-name">{expense.description}</p>
                  <p className="expense-meta">{expense.category}</p>
                </div>
                <div className="expense-right">
                  <span className="expense-amount">${Number(expense.amount).toFixed(2)}</span>
                  <span className={`expense-payer ${expense.paid_by === 'Moon' ? 'payer-moon' : 'payer-bethany'}`}>
                    {expense.paid_by}
                  </span>
                </div>
                <button className="btn-delete" onClick={() => deleteExpense(expense.id)} aria-label="Delete">✕</button>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}

export default App
