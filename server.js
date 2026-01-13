console.log("🔥 SERVER.JS SQLITE (BETTER) CARGADO 🔥");

const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
app.use(express.json());

// ================== DATABASE ==================
const db = new Database(path.join(__dirname, "valyon.db"));

// TABLAS
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT,
    email TEXT UNIQUE,
    password TEXT,
    created_at TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    owner TEXT,
    created_at TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer TEXT,
    seller TEXT,
    product TEXT,
    price REAL,
    status TEXT,
    created_at TEXT,
    released_at TEXT
  )
`).run();

// ================== FRONTEND ==================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ================== SIGNUP ==================
app.post("/api/signup", (req, res) => {
  const { name, role, email, password } = req.body;

  try {
    db.prepare(`
      INSERT INTO users (name, role, email, password, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, role, email, password, new Date().toISOString());

    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Usuario ya existe" });
  }
});

// ================== LOGIN ==================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare(`
    SELECT name, role, email, password FROM users WHERE email = ?
  `).get(email);

  if (!user) return res.status(401).json({ error: "Usuario no existe" });
  if (user.password !== password)
    return res.status(401).json({ error: "Contraseña incorrecta" });

  res.json({
    success: true,
    user: {
      name: user.name,
      role: user.role,
      email: user.email
    }
  });
});

// ================== PRODUCTS ==================
app.post("/api/products", (req, res) => {
  const { name, price, owner } = req.body;

  db.prepare(`
    INSERT INTO products (name, price, owner, created_at)
    VALUES (?, ?, ?, ?)
  `).run(name, price, owner, new Date().toISOString());

  res.json({ success: true });
});

app.get("/api/products", (req, res) => {
  const products = db.prepare(`SELECT * FROM products`).all();
  res.json(products);
});

// ================== ORDERS ==================
app.post("/api/orders", (req, res) => {
  const { buyer, seller, product, price } = req.body;

  db.prepare(`
    INSERT INTO orders (buyer, seller, product, price, status, created_at)
    VALUES (?, ?, ?, ?, 'retenido', ?)
  `).run(buyer, seller, product, price, new Date().toISOString());

  res.json({ success: true });
});

app.get("/api/orders", (req, res) => {
  const orders = db.prepare(`SELECT * FROM orders`).all();
  res.json(orders);
});

app.post("/api/orders/release", (req, res) => {
  const { orderId } = req.body;

  db.prepare(`
    UPDATE orders SET status = 'liberado', released_at = ?
    WHERE id = ?
  `).run(new Date().toISOString(), orderId);

  res.json({ success: true });
});

// ================== SERVER ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Valyon activo en puerto ${PORT}`);
});
