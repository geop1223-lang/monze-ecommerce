const API = "https://monze-ecommerce-4.onrender.com";

/* ================= PRODUCTS ================= */

const productsDiv = document.getElementById("products");

if (productsDiv) {

    fetch(API + "/products")
    .then(res => res.json())
    .then(products => {

        if (products.length === 0) {
            productsDiv.innerHTML = "<p>No products available</p>";
            return;
        }

        products.forEach(product => {

            productsDiv.innerHTML += `
                <div class="card">
                    <h3>${product.name}</h3>

                    <p>${product.description || "Good quality product"}</p>

                    <h2>K${product.price}</h2>

                    <button onclick="addToCart('${product._id}')">
                        Add To Cart
                    </button>
                </div>
            `;
        });

    })
    .catch(err => {
        console.log(err);
    });
}

/* ================= REGISTER ================= */

function register() {

    const username =
        document.getElementById("registerUsername").value;

    const password =
        document.getElementById("registerPassword").value;

    fetch(API + "/register", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username,
            password
        })

    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);

        if (msg.includes("success")) {
            window.location.href = "login.html";
        }
    });
}

/* ================= LOGIN ================= */

function login() {

    const username =
        document.getElementById("loginUsername").value;

    const password =
        document.getElementById("loginPassword").value;

    fetch(API + "/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username,
            password
        })

    })
    .then(res => res.text())
    .then(msg => {

        alert(msg);

        if (msg.includes("successful")) {

            localStorage.setItem("username", username);

            window.location.href = "index.html";
        }
    });
}

/* ================= ADD TO CART ================= */

function addToCart(productId) {

    const username = localStorage.getItem("username") || "guest";

    fetch(API + "/cart/add", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username,
            productId,
            quantity: 1
        })

    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
    });
}

/* ================= LOAD CART ================= */

const cartDiv = document.getElementById("cartItems");

if (cartDiv) {

    const username =
        localStorage.getItem("username") || "guest";

    fetch(API + "/cart/" + username)
    .then(res => res.json())
    .then(items => {

        if (items.length === 0) {
            cartDiv.innerHTML = "<p>Cart is empty</p>";
            return;
        }

        items.forEach(item => {

            cartDiv.innerHTML += `
                <div class="card">
                    <h3>${item.productId.name}</h3>

                    <p>Quantity: ${item.quantity}</p>

                    <h2>K${item.productId.price}</h2>
                </div>
            `;
        });

    });
}