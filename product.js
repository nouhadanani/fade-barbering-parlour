/**
 * fadeflex barbering parlour - E-commerce Engine & Tracking Module
 * Production Script v2.1 (Updated: 2026)
 */

// ---------- PRODUCT DATABASE ----------
const products = [
    { id: 1, name: "dread&twist", brand: "fadeflex barbering parlour", price: 100, image: "image/dreadatwist.jpeg" },
    { id: 2, name: "haircut with black dye", brand: "fadeflex baring parlour", price: 70, image: "image/haircut with black dye styles.jpeg" },
    { id: 3, name: "haircut with coloured dye", brand: "fadeflex barbering parlour", price: 100, image: "image/haircutwithcoloreddye.jpeg" },
    { id: 4, name: "pedicure", brand: "fadeflex barbering parlour", price: 100,  image: "image/pedicure.jpeg" }
];

// cart state: array of { id, name, price, image, quantity }
    let cart = [];

// ==========================================
// BREVO E-COMMERCE TRACKING
// ==========================================

function trackBrevoCart(cartItems, customerEmail = null) {

    if (!window.Brevo) {
        console.warn("Brevo Tracker is not loaded yet.");
        return;
    }

    const total = cartItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    );

    const items = cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        url: `${window.location.origin}/product.html`,
        image: `${window.location.origin}/${item.image}`
    }));

    const properties = {};

    if (customerEmail) {
        properties.email = customerEmail;
    }

    const eventData = {
        id: "cart:" + Date.now(),
        data: {
            total: total,
            currency: "GHS",
            url: window.location.href,
            items: items
        }
    };

    Brevo.push([
        "track",
        "cart_updated",
        properties,
        eventData
    ]);

    console.log("Brevo cart_updated sent:", eventData);
}




function identifyBrevoCustomer(name, email) {

    if (!window.Brevo || !email) {
        return;
    }

    Brevo.push([
        "identify",
        {
            identifiers: {
                email_id: email
            },
            attributes: {
                FIRSTNAME: name
            }
        }
    ]);

    console.log("Brevo customer identified:", email);
}


    
   
    function saveCart() { localStorage.setItem('Fadeflex_cart', JSON.stringify(cart)); }
    function loadCart() { const saved = localStorage.getItem('Fadeflex_cart'); cart = saved ? JSON.parse(saved) : []; updateCartUI(); }
    
    // Track helpers (use global with consent)
    function trackAddToCart(product, qty) {
        if (window.trackEcommerceEvent) {
            window.trackEcommerceEvent('add_to_cart', {
                currency: 'GHS',
                value: product.price * qty,
                items: [{ item_id: product.id.toString(), item_name: product.name, price: product.price, quantity: qty, brand: product.brand || 'Fadeflex' }]
            });
        }
    }
    function trackRemoveFromCart(product, qty) {
        if (window.trackEcommerceEvent) {
            window.trackEcommerceEvent('remove_from_cart', {
                currency: 'GHS',
                value: product.price * qty,
                items: [{ item_id: product.id.toString(), item_name: product.name, price: product.price, quantity: qty }]
            });
        }
    }
    function trackBeginCheckout(items, total) {
        if (window.trackEcommerceEvent) {
            const formatted = items.map(i => ({ item_id: i.id.toString(), item_name: i.name, price: i.price, quantity: i.quantity }));
            window.trackEcommerceEvent('begin_checkout', { currency: 'GHS', value: total, items: formatted });
        }
    }

    function updateCartUI() {
        const count = cart.reduce((sum, i) => sum + i.quantity, 0);
        document.getElementById('cartCountBadge').innerText = count;
        const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        document.getElementById('cartTotalPrice').innerHTML = `Total: ₵${total.toFixed(2)}`;
        const container = document.getElementById('cartItemsList');
        if (!cart.length) { container.innerHTML = '<div class="empty-cart-msg">Your cart is empty.</div>'; return; }
        container.innerHTML = '';
        cart.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML = `
                <img class="cart-item-img" src="${item.image}" onerror="this.src='https://placehold.co/80x80?haircut=styles'">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₵${item.price}</div>
                    <div class="cart-item-actions">
                        <button class="qty-btn" data-id="${item.id}" data-delta="-1">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
                        <span class="remove-item" data-id="${item.id}">Remove</span>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const delta = parseInt(btn.dataset.delta);
                const idx = cart.findIndex(i => i.id === id);
                if (idx === -1) return;
                const newQty = cart[idx].quantity + delta;
                if (newQty <= 0) {
                    const removed = { ...cart[idx] };
                    cart.splice(idx, 1);
                    trackRemoveFromCart(removed, removed.quantity);
                } else {
                    cart[idx].quantity = newQty;
                    if (delta === 1) trackAddToCart({ id: cart[idx].id, name: cart[idx].name, price: cart[idx].price, brand: cart[idx].brand }, 1);
                    else trackRemoveFromCart({ id: cart[idx].id, name: cart[idx].name, price: cart[idx].price }, 1);
                }
                updateCartUI();
                saveCart();

                // Brevo
               trackBrevoCart(cart);
            });
        });
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const idx = cart.findIndex(i => i.id === id);
                if (idx !== -1) {

    const removed = { ...cart[idx] };

    cart.splice(idx, 1);

    // GA4
    trackRemoveFromCart(
        removed,
        removed.quantity
    );

    updateCartUI();
    saveCart();

    // Brevo
    if (cart.length > 0) {
        trackBrevoCart(cart);
    } else {
        trackBrevoCart([]);
    }
}
            });
        });
        saveCart();
    }

   function addToCart(product, qty = 1) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({
            ...product,
            quantity: qty
        });
    }

    // GA4
    trackAddToCart(product, qty);

    // Brevo
    trackBrevoCart(cart);

    updateCartUI();
    saveCart();
}

    function renderProducts() {
        const container = document.getElementById('productsContainer');
        container.innerHTML = '';
        products.forEach(p => {
            const card = document.createElement('div');
            card.classList.add('product-card');
            card.innerHTML = `
                <div class="product-image"><img src="${p.image}" onerror="this.src='https://placehold.co/400x500?text=Haircut+Styles'"></div>
                <div class="product-info">
                    <div class="brand">${p.brand}</div>
                    <div class="product-name">${p.name}</div>
                    <div class="prices">
                        <span class="current-price">₵${p.price}</span>
                        <span class="original-price">₵${p.originalPrice}</span>
                        <span class="discount-price">${p.discount}</span>
                    </div>
                    <div class="cart-controls">
                        <button class="add-to-cart-btn" data-id="${p.id}">Add to Cart 🛒</button>
                        <button class="buy-now-btn" data-id="${p.id}">Buy Now</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prod = products.find(p => p.id === parseInt(btn.dataset.id));
                if (prod) { addToCart(prod, 1); document.getElementById('cartSidebar').classList.add('open'); document.getElementById('cartOverlay').classList.add('active'); }
            });
        });
        document.querySelectorAll('.buy-now-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prod = products.find(p => p.id === parseInt(btn.dataset.id));
                if (!prod) return;
                document.getElementById('selectedProductImage').src = prod.image;
                document.getElementById('selectedProductName').innerText = prod.name;
                document.getElementById('selectedProductPrice').innerText = `Price: ₵${prod.price}`;
                window.currentBuyNowProduct = prod;
                document.getElementById('purchaseForm').style.display = 'block';
                document.getElementById('thankYou').style.display = 'none';
                document.getElementById('purchaseForm').scrollIntoView({ behavior: 'smooth' });
                trackBeginCheckout([{ id: prod.id, name: prod.name, price: prod.price, quantity: 1 }], prod.price);
            });
        });
    }

    // Cart UI events
    document.getElementById('cartIconBtn').addEventListener('click', () => {
        document.getElementById('cartSidebar').classList.add('open');
        document.getElementById('cartOverlay').classList.add('active');
        const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        if (cart.length && window.trackEcommerceEvent) window.trackEcommerceEvent('view_cart', { currency: 'GHS', value: total });
    });
    document.getElementById('closeCartBtn').addEventListener('click', () => { document.getElementById('cartSidebar').classList.remove('open'); document.getElementById('cartOverlay').classList.remove('active'); });
    document.getElementById('cartOverlay').addEventListener('click', () => { document.getElementById('cartSidebar').classList.remove('open'); document.getElementById('cartOverlay').classList.remove('active'); });
    document.getElementById('proceedCheckoutFromCart').addEventListener('click', () => {
        if (!cart.length) { alert("Cart is empty."); return; }
        const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        trackBeginCheckout(cart, total);
        const first = cart[0];
        document.getElementById('selectedProductImage').src = first.image;
        document.getElementById('selectedProductName').innerHTML = `Cart (${cart.length} items)`;
        document.getElementById('selectedProductPrice').innerHTML = `Total: ₵${total}`;
        window.cartForCheckout = [...cart];
        document.getElementById('purchaseForm').style.display = 'block';
        document.getElementById('thankYou').style.display = 'none';
        document.getElementById('cartSidebar').classList.remove('open');
        document.getElementById('cartOverlay').classList.remove('active');
        document.getElementById('purchaseForm').scrollIntoView({behavior:'smooth'});
    });
        // Email checkout
    document.getElementById('checkoutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value, email = document.getElementById('email').value, address = document.getElementById('address').value, phone = document.getElementById('phone').value;
        let orderDetails = '', totalOrder = 0;
        if (window.cartForCheckout && window.cartForCheckout.length) {
             trackBrevoCart( window.cartForCheckout,email);
            orderDetails = window.cartForCheckout.map(i => `${i.name} x${i.quantity} = ₵${i.price * i.quantity}`).join('\n');
            totalOrder = window.cartForCheckout.reduce((s, i) => s + (i.price * i.quantity), 0);
        } else if (window.currentBuyNowProduct) {
            trackBrevoCart([{...window.currentBuyNowProduct,quantity: 1}],email
    );
            orderDetails = `${window.currentBuyNowProduct.name} x1 = ₵${window.currentBuyNowProduct.price}`;
            totalOrder = window.currentBuyNowProduct.price;
        } else { orderDetails = 'No product'; }
        const subject = `New Order from ${name}`;
        const body = `Hello fadeflex,\n\nI would like to place an order:\n\n${orderDetails}\n\nTotal: ₵${totalOrder}\n\nMy details:\n- Name: ${name}\n- Email: ${email}\n- Address: ${address}\n- Phone: ${phone}\n\nPlease confirm.`;
        window.location.href = `mailto:nouhahadani3@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        if (window.trackEcommerceEvent) window.trackEcommerceEvent('generate_lead', { currency: 'GHS', value: totalOrder });
        document.getElementById('purchaseForm').style.display = 'none';
        document.getElementById('thankYou').style.display = 'block';
        if (window.cartForCheckout) { cart = []; updateCartUI(); saveCart(); window.cartForCheckout = null; }
        else { window.currentBuyNowProduct = null; }
    });

    document.getElementById("year").textContent = new Date().getFullYear();
    loadCart();
    renderProducts();
    