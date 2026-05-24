console.log("Starting server...");

const express = require("express");
const cors = require("cors");

const app = express();

// MIDDLEWARE (IMPORTANT - must be here)
app.use(cors());
app.use(express.json());

// PRODUCTS
let products = [
    {
        id: 1,
        name: "Phone",
        price: 2000,
        image: "https://via.placeholder.com/300"
    }
];

// USERS (PUT THIS HERE)
let users = [];

/* =========================
   REGISTER ROUTE
========================= */
app.post("/register", (req, res) => {
    const { username, password } = req.body;

    users.push({ username, password });

    res.send("User registered successfully");
});

/* =========================
   LOGIN ROUTE
========================= */
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        return res.send("Invalid credentials");
    }

    res.send("Login successful 🚀");
});

/* =========================
   PRODUCTS API
========================= */
app.get("/products", (req, res) => {
    res.json(products);
});

/* =========================
   START SERVER
========================= */
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});