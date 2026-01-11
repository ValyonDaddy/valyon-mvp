console.log("🔥 SERVER.JS CORRECTO CARGADO 🔥");

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// ================== ARCHIVOS ==================
const USERS_FILE = path.join(__dirname, "users.json");
const PRODUCTS_FILE = path.join(__dirname, "products.json");
const ORDERS_FILE = path.join(__dirname, "orders.json");

// Crear archivos si no existen
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
if (!fs.existsSync(PRODUCTS_FILE)) fs.writeFileSync(PRODUCTS_FILE, "[]");
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");

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

  const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "Usuario ya existe" });
  }

  users.push({
    name,
    role,
    email,
    password, // texto plano SOLO MVP
    date: new Date().toISOString()
  });

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

// ================== LOGIN ==================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Credenciales incompletas" });
  }

  const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  const user = users.find(u => u.email === email);

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
});

// ================== PRODUCTS ==================
app.post("/api/products", (req, res) => {
  const { name, price, owner } = req.body;

  if (!name || !price || !owner) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));

  products.push({
    id: Date.now(),
    name,
    price,
    owner,
    date: new Date().toISOString()
  });

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  res.json({ success: true });
});

app.get("/api/products", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8")));
});

// ================== ORDERS ==================
app.post("/api/orders", (req, res) => {
  const { buyer, seller, product, price } = req.body;

  if (!buyer || !seller || !product || !price) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));

  orders.push({
    id: Date.now(),
    buyer,
    seller,
    product,
    price,
    status: "retenido",
    date: new Date().toISOString()
  });

  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  res.json({ success: true });
});

app.get("/api/orders", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8")));
});

// ================== RELEASE PAYMENT ==================
app.post("/api/orders/release", (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: "orderId requerido" });
  }

  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ error: "Orden no encontrada" });
  }

  order.status = "liberado";
  order.releasedAt = new Date().toISOString();

  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  res.json({ success: true });
});

// ================== SERVER ==================
app.listen(3000, () => {
  console.log("🚀 Valyon activo en http://localhost:3000");
});

