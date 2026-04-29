import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import './App.css'

// ─── Airplane SVG (top-down, pointing right, centered at 0,0) ─────────────
function PlaneIcon() {
  return (
    <g>
      <g transform="translate(0.8,0.8)" opacity="0.35">
        <path d="M16,0 C14,-1.5 9,-2.8 1,-2.8 L-12,-2.2 L-17,-1.2 L-17,1.2 L-12,2.2 L1,2.8 C9,2.8 14,1.5 16,0 Z" fill="white"/>
        <polygon points="-3,-2.8 -9,-15 -16,-15 -10,-2.8" fill="white"/>
        <polygon points="-3,2.8 -9,15 -16,15 -10,2.8" fill="white"/>
      </g>
      <path d="M16,0 C14,-1.5 9,-2.8 1,-2.8 L-12,-2.2 L-17,-1.2 L-17,1.2 L-12,2.2 L1,2.8 C9,2.8 14,1.5 16,0 Z" fill="#3b0764"/>
      <polygon points="-3,-2.8 -9,-15 -16,-15 -10,-2.8" fill="#3b0764"/>
      <polygon points="-3,2.8 -9,15 -16,15 -10,2.8" fill="#3b0764"/>
      <polygon points="-13,-1.8 -16,-7 -20,-7 -17,-1.8" fill="#3b0764"/>
      <polygon points="-13,1.8 -16,7 -20,7 -17,1.8" fill="#3b0764"/>
    </g>
  )
}

// ─── Heart path (two loops, small then large) ─────────────────────────────
const HEART_PATH = `M 15,198 C 50,192 88,175 118,150
  C 100,136 80,118 84,98
  C 88,78 108,72 118,88
  C 128,72 148,78 152,98
  C 156,118 136,136 118,150
  C 148,136 195,132 248,155
  C 222,134 192,102 198,72
  C 204,42 232,34 248,58
  C 264,34 292,42 298,72
  C 304,102 274,134 248,155
  C 288,138 348,88 408,38`

// ─── Login page ───────────────────────────────────────────────────────────
function LoginPage({ email, setEmail, password, setPassword, onSignIn }) {
  const maskRef  = useRef(null)
  const planeRef = useRef(null)
  const [formReady, setFormReady] = useState(false)

  useEffect(() => {
    const maskPath = maskRef.current
    const plane    = planeRef.current
    if (!maskPath || !plane) return

    const totalLen = maskPath.getTotalLength()
    maskPath.style.strokeDasharray  = `${totalLen} ${totalLen}`
    maskPath.style.strokeDashoffset = totalLen

    const DURATION = 3800
    let t0 = null, rafId

    const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2

    const tick = ts => {
      if (!t0) { t0 = ts; plane.style.opacity = '1' }
      const raw = Math.min((ts - t0) / DURATION, 1)
      const len = ease(raw) * totalLen

      maskPath.style.strokeDashoffset = totalLen - len

      const pt  = maskPath.getPointAtLength(len)
      const ptF = maskPath.getPointAtLength(Math.min(len + 3, totalLen))
      const ang = Math.atan2(ptF.y - pt.y, ptF.x - pt.x) * 180 / Math.PI
      plane.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(${ang})`)

      if (raw < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        plane.style.opacity = '0'
        setTimeout(() => setFormReady(true), 300)
      }
    }

    const timer = setTimeout(() => { rafId = requestAnimationFrame(tick) }, 500)
    return () => { clearTimeout(timer); cancelAnimationFrame(rafId) }
  }, [])

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* Animation stage */}
        <div className="login-stage">
          <svg viewBox="0 0 430 210" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <mask id="heartMask" maskUnits="userSpaceOnUse">
                <path
                  ref={maskRef}
                  d={HEART_PATH}
                  fill="none" stroke="white" strokeWidth="8"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </mask>
            </defs>

            {/* dashed heart trail */}
            <path
              d={HEART_PATH}
              fill="none"
              stroke="#5b21b6"
              strokeWidth="2.2"
              strokeDasharray="8 6"
              strokeLinecap="round"
              strokeLinejoin="round"
              mask="url(#heartMask)"
            />

            {/* airplane */}
            <g ref={planeRef} style={{ opacity: 0 }}>
              <PlaneIcon />
            </g>
          </svg>
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
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
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

  // Maths
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
      {/* Header */}
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

        {/* Summary */}
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

        {/* Add expense */}
        <section>
          <p className="section-title">Add expense</p>
          <form onSubmit={addExpense} className="expense-form">
            <div className="form-field">
              <label className="field-label">Description</label>
              <input
                type="text"
                className="field-input"
                placeholder="What was it?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="expense-form-row">
              <div className="form-field">
                <label className="field-label">Category</label>
                <select
                  className="field-input"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="field-label">Amount</label>
                <input
                  type="number"
                  className="field-input"
                  placeholder="$0.00"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="expense-form-row">
              <div className="form-field">
                <label className="field-label">Paid by</label>
                <select
                  className="field-input"
                  value={paidBy}
                  onChange={e => setPaidBy(e.target.value)}
                >
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

        {/* Expense list */}
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
                <button
                  className="btn-delete"
                  onClick={() => deleteExpense(expense.id)}
                  aria-label="Delete expense"
                >✕</button>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}

export default App
