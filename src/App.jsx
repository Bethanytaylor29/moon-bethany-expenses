import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './App.css'

function App() {
  const [expenses, setExpenses] = useState([])
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Dining')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('Moon')

  useEffect(() => {
    fetchExpenses()
  }, [])

  async function fetchExpenses() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setExpenses(data)
    }
  }

  async function addExpense(e) {
    e.preventDefault()

    const { error } = await supabase.from('expenses').insert([
      {
        description,
        category,
        amount,
        paid_by: paidBy,
      },
    ])

    if (!error) {
      setDescription('')
      setCategory('Dining')
      setAmount('')
      fetchExpenses()
    }
  }

  async function deleteExpense(id) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchExpenses()
    }
  }

  const totalSpent = expenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  )

  const moonPaid = expenses
    .filter((e) => e.paid_by === 'Moon')
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const bethanyPaid = expenses
    .filter((e) => e.paid_by === 'Bethany')
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const eachShare = totalSpent / 2
  const moonOwes = Math.max(0, eachShare - moonPaid)
  const bethanyOwes = Math.max(0, eachShare - bethanyPaid)

  return (
    <div className="container">
      <div className="app-header">
  <div className="sparkle">✦</div>
  <h1>Moon & Bethany Expenses</h1>
  <p>Shared spending, but make it pretty</p>
</div>

      <div className="summary-grid">
        <div className="summary-card">
          <h2>Total Spent</h2>
          <p>${totalSpent.toFixed(2)}</p>
        </div>

        <div className="summary-card">
          <h2>Moon Paid</h2>
          <p>${moonPaid.toFixed(2)}</p>
        </div>

        <div className="summary-card">
          <h2>Bethany Paid</h2>
          <p>${bethanyPaid.toFixed(2)}</p>
        </div>

        <div className="summary-card">
          <h2>Settle Up</h2>
          <p>
            {moonOwes > 0
              ? `Moon owes Bethany $${moonOwes.toFixed(2)}`
              : bethanyOwes > 0
              ? `Bethany owes Moon $${bethanyOwes.toFixed(2)}`
              : 'Even'}
          </p>
        </div>
      </div>

      <form onSubmit={addExpense} className="expense-form">
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Dining</option>
          <option>Hotel</option>
          <option>Flights</option>
          <option>Shopping</option>
          <option>Spa</option>
          <option>Transportation</option>
          <option>Groceries</option>
          <option>Entertainment</option>
          <option>Misc</option>
        </select>

        <input
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          <option>Moon</option>
          <option>Bethany</option>
        </select>

        <button type="submit">Add Expense</button>
      </form>

      <div className="expense-list">
        {expenses.map((expense) => (
          <div key={expense.id} className="expense-card">
            <h3>
  {expense.category === 'Dining' && '🍽️ '}
  {expense.category === 'Hotel' && '🏨 '}
  {expense.category === 'Flights' && '✈️ '}
  {expense.category === 'Shopping' && '🛍️ '}
  {expense.category === 'Spa' && '🧖‍♀️ '}
  {expense.category === 'Transportation' && '🚗 '}
  {expense.category === 'Groceries' && '🛒 '}
  {expense.category === 'Entertainment' && '🎀 '}
  {expense.category === 'Misc' && '✨ '}
  {expense.description}
</h3>
            <div className={`category-pill ${expense.category.toLowerCase()}`}>
  {expense.category}
</div>
            <p>${expense.amount}</p>
            <span>{expense.paid_by}</span>

            <button
              className="delete-button"
              onClick={() => deleteExpense(expense.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App