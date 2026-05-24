const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const User = require("./models/User");
const Product = require("./models/Product");
const Cart = require("./models/Cart");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= MONGODB CONNECTION ================= */
/*
IMPORTANT:
Replace YOUR_PASSWORD_HERE with your MongoDB Atlas password
*/

const DB_PASSWORD = "YOUR_PASSWORD_HERE";

const DB_URL =
`mongodb+srv://geop1223_db_user:${DB_PASSWORD}@cluster0.eapg09a.mongodb.net/monze-ecommerce?retryWrites=true&w=majority`;

mongoose.connect(DB_URL)
.then(() => console.log("MongoDB Atlas Connected"))
.catch(err => console.log("MongoDB Error:", err));

/* ================= HOME ================= */
app.get("/", (req, res) => {
    res.send("Monze Ecommerce API Running 🚀");
});

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        const exists = await User.findOne({ username });
        if (exists) return res.send("User already exists");

        const hashed = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            password: hashed
        });

        await user.save();

        res.send("User registered successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send("Register error");
    }
});

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.send("Invalid credentials");

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send("Invalid credentials");

        res.send("Login successful");
    } catch (err) {
        console.log(err);
        res.status(500).send("Login error");
    }
});

/* ================= PRODUCTS ================= */

// ADD PRODUCT
app.post("/add-product", async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.send("Product added");
    } catch (err) {
        console.log(err);
        res.status(500).send("Error adding product");
    }
});

// GET PRODUCTS
app.get("/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error loading products");
    }
});

/* ================= CART ================= */

// ADD TO CART
app.post("/cart/add", async (req, res) => {
    try {
        const cart = new Cart(req.body);
        await cart.save();
        res.send("Added to cart");
    } catch (err) {
        console.log(err);
        res.status(500).send("Cart error");
    }
});

// GET CART
app.get("/cart/:username", async (req, res) => {
    try {
        const cart = await Cart.find({
            username: req.params.username
        }).populate("productId");

        res.json(cart);
    } catch (err) {
        console.log(err);
        res.status(500).send("Cart load error");
    }
});

/* ================= SERVER (FIXED FOR DEPLOYMENT) ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});