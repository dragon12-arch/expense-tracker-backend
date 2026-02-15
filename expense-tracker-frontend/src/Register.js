import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "./Register.css"

function Register() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleRegister = async () => {
    const response = await fetch("http://localhost:3001/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      alert("Registered Successfully")
      navigate("/")
    } else {
      alert("User already exists")
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>

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

        <button onClick={handleRegister} className="register-btn">
          Register
        </button>

        <p className="login-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register

