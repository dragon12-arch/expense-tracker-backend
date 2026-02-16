import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Dashboard.css"


function Dashboard() {
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState([])
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState("")

  const token = localStorage.getItem("jwtToken")

useEffect(() => {
  const token = localStorage.getItem("jwtToken")

  if (!token) {
    navigate("/")
    return
  }

  const fetchTransactions = async () => {
    const response = await fetch("https://expense-tracker-backend.onrender.com/transactions",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (response.ok) {
      const data = await response.json()
      setTransactions(data)
    }
  }

  fetchTransactions()
}, [navigate])


  const fetchTransactions = async () => {
    const response = await fetch("https://expense-tracker-backend.onrender.com/transactions",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (response.ok) {
      const data = await response.json()
      setTransactions(data)
    }
  }

  const handleDelete = async (id) => {
  const response = await fetch(`https://expense-tracker-backend.onrender.com/transactions/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (response.ok) {
    fetchTransactions()
  }
}

const handleLogout = () => {
  localStorage.removeItem("jwtToken")
  navigate("/")
}
  


  const handleAddTransaction = async () => {
    const response = await fetch("https://expense-tracker-backend.onrender.com/transactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          amount,
          category,
          date,
        }),
      }
    )

    if (response.ok) {
      setTitle("")
      setAmount("")
      setCategory("")
      setDate("")
      fetchTransactions()
    }
  }

const totalIncome = transactions
  .filter(t => t.category === "INCOME")
  .reduce((acc, curr) => acc + Number(curr.amount), 0)

const totalExpense = transactions
  .filter(t => t.category === "EXPENSE")
  .reduce((acc, curr) => acc + Number(curr.amount), 0)

const balance = totalIncome - totalExpense



return (
  <div className="dashboard-container">
    <div className="top-bar">
      <h2>Expense Tracker</h2>
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>

    <div className="summary-container">
     <div className="summary-card income">
     <h4>Total Income</h4>
     <p>₹{totalIncome}</p>
     </div>

     <div className="summary-card expense">
      <h4>Total Expense</h4>
      <p>₹{totalExpense}</p>
     </div>

    <div className="summary-card balance">
       <h4>Balance</h4>
       <p>₹{balance}</p>
       </div>
    </div>


    <div className="card add-card">
      <h3>Add Transaction</h3>

      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      <select
  value={category}
  onChange={e => setCategory(e.target.value)}
>
  <option value="">Select Type</option>
  <option value="INCOME">Income</option>
  <option value="EXPENSE">Expense</option>
</select>


      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      <button onClick={handleAddTransaction} className="primary-btn">
        Add
      </button>
    </div>

    <div className="card list-card">
      <h3>Your Transactions</h3>

      <ul className="transaction-list">
        {transactions.map(each => (
          <li key={each.id} className="transaction-item">
            <div>
              <strong>{each.title}</strong>
              <p>{each.category}</p>
            </div>

            <div>
              ₹{each.amount}
              <button
                onClick={() => handleDelete(each.id)}
                className="delete-btn"
              >
                ❌
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
)

}

export default Dashboard


