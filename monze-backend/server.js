require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   DATABASE CONNECTION
========================= */

mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log("DB Error:", err));

/* =========================
   MODELS
========================= */

const UserSchema = new mongoose.Schema({
username: String,
password: String,
role: { type: String, default: "user" }
});

const ProductSchema = new mongoose.Schema({
name: String,
price: Number,
image: String
});

const OrderSchema = new mongoose.Schema({
username: String,
items: Array,
status: { type: String, default: "pending" },
date: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
const Product = mongoose.model("Product", ProductSchema);
const Order = mongoose.model("Order", OrderSchema);

/* =========================
   AUTH
========================= */

app.post("/register", async (req,res)=>{

const {username,password,role} = req.body;

const exists = await User.findOne({username});
if(exists) return res.json({success:false,message:"User exists"});

const hashed = await bcrypt.hash(password,10);

await User.create({
username,
password: hashed,
role: role || "user"
});

res.json({success:true,message:"Registered"});
});

app.post("/login", async (req,res)=>{

const {username,password} = req.body;

const user = await User.findOne({username});
if(!user) return res.json({success:false,message:"User not found"});

const match = await bcrypt.compare(password,user.password);
if(!match) return res.json({success:false,message:"Wrong password"});

const token = jwt.sign(
{ username:user.username, role:user.role },
process.env.JWT_SECRET,
{ expiresIn:"1d" }
);

res.json({
success:true,
token,
role:user.role,
message:"Login successful"
});
});

/* =========================
   MIDDLEWARE
========================= */

function auth(req,res,next){

const token = req.headers.authorization;
if(!token) return res.json({message:"No token"});

try{
req.user = jwt.verify(token, process.env.JWT_SECRET);
next();
}catch(err){
res.json({message:"Invalid token"});
}

}

function adminOnly(req,res,next){
if(req.user.role !== "admin"){
return res.json({message:"Access denied"});
}
next();
}

/* =========================
   PRODUCTS
========================= */

app.get("/products", async (req,res)=>{
const data = await Product.find();
res.json(data);
});

app.post("/products", auth, adminOnly, async (req,res)=>{
await Product.create(req.body);
res.json({message:"Product added"});
});

app.delete("/products/:id", auth, adminOnly, async (req,res)=>{
await Product.findByIdAndDelete(req.params.id);
res.json({message:"Deleted"});
});

/* =========================
   ORDERS
========================= */

app.post("/order", async (req,res)=>{
await Order.create(req.body);
res.json({message:"Order placed"});
});

app.get("/admin/orders", auth, adminOnly, async (req,res)=>{
const orders = await Order.find();
res.json(orders);
});

app.put("/admin/orders/:id", auth, adminOnly, async (req,res)=>{
await Order.findByIdAndUpdate(req.params.id, req.body);
res.json({message:"Updated"});
});

/* =========================
   ANALYTICS
========================= */

app.get("/admin/analytics", auth, adminOnly, async (req,res)=>{

const users = await User.countDocuments();
const products = await Product.countDocuments();
const orders = await Order.countDocuments();

const pending = await Order.countDocuments({status:"pending"});
const delivered = await Order.countDocuments({status:"delivered"});

let all = await Order.find();
let revenue = 0;

all.forEach(o=>{
o.items.forEach(i=>{
revenue += (i.quantity || 1) * 100;
});
});

res.json({
users,
products,
orders,
pending,
delivered,
revenue
});

});

/* =========================
   START SERVER
========================= */

app.listen(process.env.PORT || 3000, ()=>{
console.log("Server running on port", process.env.PORT || 3000);
});