import { useState } from "react"
import "./Login.css"
import { useNavigate, Link } from "react-router-dom"



function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    const response = await fetch("https://expense-tracker-backend.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      const data = await response.json()
      localStorage.setItem("jwtToken", data.jwtToken)
      navigate("/dashboard")
    } else {
      alert("Login Failed")
    }
  }

  return (
  <div className="login-container">
    <div className="login-card">
      <h2>Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={handleLogin} className="login-btn">
        Login
      </button>
      <p className="register-link">
        Don't have an account? <Link to="/register">Register</Link>
      </p>

    </div>
  </div>
)

}

export default Login
