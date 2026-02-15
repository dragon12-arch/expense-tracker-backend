require("dotenv").config()
const jwt = require("jsonwebtoken")
const express = require("express")
const sqlite3 = require("sqlite3")
const { open } = require("sqlite")
const path = require("path")
const cors = require("cors")


const app = express()
app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, "database.db")
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    console.log("Database Connected ✅")

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      );
    `)

    await db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        amount INTEGER,
        category TEXT,
        date TEXT
      );
    `)

    console.log("Tables Created ✅")

    app.listen(process.env.PORT || 3001, () => {
      console.log("Server Running 🚀")
    })

  } catch (error) {
    console.log("Error:", error.message)
  }
}

initializeDBAndServer()

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]

  if (!authHeader) {
    return res.status(401).send("Invalid JWT Token")
  }

  const token = authHeader.split(" ")[1]

  jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
    if (error) {
      return res.status(401).send("Invalid JWT Token")
    }

    req.userId = payload.userId
    next()
  })
}

app.get("/profile", authenticateToken, async (req, res) => {
  const user = await db.get(
    `SELECT id, username FROM users WHERE id = ?`,
    [req.userId]
  )

  res.send(user)
})



app.get("/", (req, res) => {
  res.send("Expense Tracker Backend Running 🚀")
})

const bcrypt = require("bcrypt")

app.post("/register", async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).send("Username and Password required")
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    await db.run(
      `INSERT INTO users (username, password)
       VALUES (?, ?)`,
      [username, hashedPassword]
    )

    res.status(201).send("User Created Successfully")
  } catch (error) {
    if (error.message.includes("UNIQUE")) {
      res.status(400).send("User already exists")
    } else {
      res.status(500).send("Server Error")
    }
  }
})

app.post("/login", async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).send("Username and Password required")
  }

  const user = await db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username]
  )

  if (!user) {
    return res.status(400).send("Invalid User")
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password
  )

  if (!isPasswordMatched) {
    return res.status(400).send("Invalid Password")
  }

  const payload = {
    userId: user.id,
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET)

  res.send({ jwtToken: token })
})

app.post("/transactions", authenticateToken, async (req, res) => {
  const { title, amount, category, date } = req.body

  if (!title || !amount || !category || !date) {
    return res.status(400).send("All fields required")
  }

  await db.run(
    `INSERT INTO transactions (user_id, title, amount, category, date)
     VALUES (?, ?, ?, ?, ?)`,
    [req.userId, title, amount, category, date]
  )

  res.status(201).send("Transaction Added Successfully")
})

app.get("/transactions", authenticateToken, async (req, res) => {
  const { category, startDate, endDate } = req.query

  let query = `SELECT * FROM transactions WHERE user_id = ?`
  const params = [req.userId]

  if (category) {
    query += ` AND category = ?`
    params.push(category)
  }

  if (startDate && endDate) {
    query += ` AND date BETWEEN ? AND ?`
    params.push(startDate, endDate)
  }

  const transactions = await db.all(query, params)

  res.send(transactions)
})


app.delete("/transactions/:id", authenticateToken, async (req, res) => {
  const { id } = req.params

  await db.run(
    `DELETE FROM transactions WHERE id = ? AND user_id = ?`,
    [id, req.userId]
  )

  res.send("Transaction Deleted Successfully")
})
