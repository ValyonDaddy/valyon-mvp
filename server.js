console.log("🔥 SERVER.JS SQLITE CARGADO 🔥");

const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());

// ================== DATABASE ==================
const db = new sqlite3.Database(
  path.join(__dirname, "valyon.db")
);

// Crear tablas si no existen
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      role TEXT,
      email TEXT UNIQUE,
      password TEXT,
      created_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      owner TEXT,
      created_at TEXT
    )
  `);

  db.run(`
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
  `);
});

// ================== FRONTEND ==================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ================== SIGNUP ==================
app.post("/api/signup", (req, res) => {
  const { name, role, email, password } = req.body;

  if (!name || !role || !email || !password) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  db.run(
    `INSERT INTO users (name, role, email, password, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [name, role, email, password, new Date().toISOString()],
    function (err) {
      if (err) {
        return res.status(400).json({ error: "Usuario ya existe" });
      }
      res.json({ success: true });
    }
  );
});

// ================== LOGIN ==================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Credenciales incompletas" });
  }

  db.get(
    `SELECT name, role, email, password FROM users WHERE email = ?`,
    [email],
    (err, user) => {
      if (!user) {
        return res.status(401).json({ error: "Usuario no existe" });
      }

      if (user.password !== password) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      res.json({
        success: true,
        user: {
          name: user.name,
          role: user.role,
          email: user.email
        }
      });
    }
  );
});

// ================== PRODUCTS ==================
app.post("/api/products", (req, res) => {
  const { name, price, owner } = req.body;

  if (!name || !price || !owner) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  db.run(
    `INSERT INTO products (name, price, owner, created_at)
     VALUES (?, ?, ?, ?)`,
    [name, price, owner, new Date().toISOString()],
    () => res.json({ success: true })
  );
});

app.get("/api/products", (req, res) => {
  db.all(`SELECT * FROM products`, [], (err, rows) => {
    res.json(rows);
  });
});

// ================== ORDERS ==================
app.post("/api/orders", (req, res) => {
  const { buyer, seller, product, price } = req.body;

  if (!buyer || !seller || !product || !price) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  db.run(
    `INSERT INTO orders (buyer, seller, product, price, status, created_at)
     VALUES (?, ?, ?, ?, 'retenido', ?)`,
    [buyer, seller, product, price, new Date().toISOString()],
    () => res.json({ success: true })
  );
});

app.get("/api/orders", (req, res) => {
  db.all(`SELECT * FROM orders`, [], (err, rows) => {
    res.json(rows);
  });
});

// ================== RELEASE PAYMENT ==================
app.post("/api/orders/release", (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: "orderId requerido" });
  }

  db.run(
    `UPDATE orders
     SET status = 'liberado', released_at = ?
     WHERE id = ?`,
    [new Date().toISOString(), orderId],
    function () {
      res.json({ success: true });
    }
  );
});

// ================== SERVER ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Valyon activo en http://localhost:${PORT}`);
});
