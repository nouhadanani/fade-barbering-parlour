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

// Active State Trackers
let cart = [];
window.currentBuyNowProduct = null;
window.cartForCheckout = null;

// ---------- LOCAL STORAGE STATE ----------
function saveCart() {
    localStorage.setItem('fadeflex_cart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('juicebyevelyn_cart');
    try {
        cart = saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Failed to parse cart metadata state, resetting...", e);
        cart = [];
    }
    updateCartUI();
}

// ---------- GA4 ECOMMERCE MONITORING ENGINE ----------
function trackAddToCart(product, quantity) {
    if (typeof window.trackEcommerceEvent === 'function') {
        window.trackEcommerceEvent('add_to_cart', {
            currency: 'GHS',
            value: product.price * quantity,
            items: [{
                item_id: product.id.toString(),
                item_name: product.name,
                price: product.price,
                quantity: quantity,
                item_brand: product.brand || 'Fadeflex'
            }]
        });
    }
}

function trackRemoveFromCart(product, quantity) {
    if (typeof window.trackEcommerceEvent === 'function') {
        window.trackEcommerceEvent('remove_from_cart', {
            currency: 'GHS',
            value: product.price * quantity,
            items: [{
                item_id: product.id.toString(),
                item_name: product.name,
                price: product.price,
                quantity: quantity,
                item_brand: product.brand || 'Fadeflex'
            }]
        });
    }
}

function trackBeginCheckout(cartItems, totalValue) {
    if (typeof window.trackEcommerceEvent === 'function') {
        const items = cartItems.map(item => ({
            item_id: item.id.toString(),
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
            item_brand: item.brand || 'Fadeflex'
        }));
        window.trackEcommerceEvent('begin_checkout', {
            currency: 'GHS',
            value: totalValue,
            items: items
        });
    }
}

// ---------- CORE CART RENDER PROCESSOR ----------
function updateCartUI() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badgeElement = document.getElementById('cartCountBadge');
    if (badgeElement) badgeElement.innerText = cartCount;

    const cartContainer = document.getElementById('cartItemsList');
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const priceDisplay = document.getElementById('cartTotalPrice');
    if (priceDisplay) priceDisplay.innerHTML = `Total: ₵${totalPrice.toFixed(2)}`;
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty. Add some haircut style! </div>';
        return;
    }
    
    cartContainer.innerHTML = '';
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');
        itemDiv.innerHTML = `
            <img class="cart-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/80x80?text=haircut'">
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
        cartContainer.appendChild(itemDiv);
    });
    
    attachCartEventHandlers();
    saveCart();
}

function attachCartEventHandlers() {
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.onclick = (e) => {
            const id = parseInt(e.target.dataset.id);
            const delta = parseInt(e.target.dataset.delta);
            updateItemQuantity(id, delta);
        };
    });
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.onclick = (e) => {
            const id = parseInt(e.target.dataset.id);
            removeItemFromCart(id);
        };
    });
}

function updateItemQuantity(productId, delta) {
    const idx = cart.findIndex(item => item.id === productId);
    if (idx !== -1) {
        const newQty = cart[idx].quantity + delta;
        if (newQty <= 0) {
            const removedItem = { ...cart[idx] };
            cart.splice(idx, 1);
            trackRemoveFromCart(removedItem, removedItem.quantity);
        } else {
            cart[idx].quantity = newQty;
            if (delta === 1) {
                trackAddToCart({ ...cart[idx] }, 1);
            } else if (delta === -1) {
                trackRemoveFromCart({ ...cart[idx] }, 1);
            }
        }
        updateCartUI();
    }
}

function removeItemFromCart(productId) {
    const idx = cart.findIndex(item => item.id === productId);
    if (idx !== -1) {
        const removed = { ...cart[idx] };
        cart.splice(idx, 1);
        trackRemoveFromCart(removed, removed.quantity);
        updateCartUI();
    }
}

function addToCart(product, quantity = 1) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            brand: product.brand,
            quantity: quantity
        });
    }
    updateCartUI();
    trackAddToCart(product, quantity);
}

// ---------- RENDER PRODUCTS INTO OVERVIEW GRID ----------
function renderProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    products.forEach(prod => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
            <div class="product-image">
                <img src="${prod.image}" alt="${prod.name}" onerror="this.src='https://placehold.co/400x500?text=haircut+pedicure'">
            </div>
            <div class="product-info">
                <div class="brand">${prod.brand}</div>
                <div class="product-name">${prod.name}</div>
                <div class="prices">
                    <span class="current-price">₵${prod.price}</span>
                    <span class="original-price">₵${prod.originalPrice}</span>
                    <span class="discount-price">${prod.discount}</span>
                </div>
                <div class="cart-controls">
                    <button class="add-to-cart-btn" data-id="${prod.id}">Add to Cart 🛒</button>
                    <button class="buy-now-btn" data-id="${prod.id}">Buy Now</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    
    attachProductGridHandlers();
}

function attachProductGridHandlers() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.onclick = (e) => {
            const prodId = parseInt(e.target.dataset.id);
            const product = products.find(p => p.id === prodId);
            if (product) addToCart(product, 1);
            
            document.getElementById('cartSidebar')?.classList.add('open');
            document.getElementById('cartOverlay')?.classList.add('active');
        };
    });

    document.querySelectorAll('.buy-now-btn').forEach(btn => {
        btn.onclick = (e) => {
            const prodId = parseInt(e.target.dataset.id);
            const product = products.find(p => p.id === prodId);
            if (product) {
                // Clear state conflicts
                window.cartForCheckout = null;
                window.currentBuyNowProduct = product;

                // Update Single View Checkout Summary
                const displayImg = document.getElementById('selectedProductImage');
                const displayName = document.getElementById('selectedProductName');
                const displayPrice = document.getElementById('selectedProductPrice');
                
                if (displayImg) displayImg.src = product.image;
                if (displayName) displayName.innerText = product.name;
                if (displayPrice) displayPrice.innerText = `Price: ₵${product.price}`;
                
                const purchaseBlock = document.getElementById('purchaseForm');
                if (purchaseBlock) {
                    purchaseBlock.style.display = 'block';
                    purchaseBlock.scrollIntoView({ behavior: 'smooth' });
                }
                
                const thankYouBlock = document.getElementById('thankYou');
                if (thankYouBlock) thankYouBlock.style.display = 'none';

                if (typeof window.trackEcommerceEvent === 'function') {
                    window.trackEcommerceEvent('begin_checkout', {
                        currency: 'GHS',
                        value: product.price,
                        items: [{ item_id: product.id.toString(), item_name: product.name, price: product.price, quantity: 1 }]
                    });
                }
            }
        };
    });
}

// ---------- UI ELEMENT TOGGLES ----------
document.getElementById('cartIconBtn')?.addEventListener('click', () => {
    document.getElementById('cartSidebar')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('active');
    
    const totalVal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cart.length && typeof window.trackEcommerceEvent === 'function') {
        window.trackEcommerceEvent('view_cart', { currency: 'GHS', value: totalVal });
    }
});

const closeCartElements = ['closeCartBtn', 'cartOverlay'];
closeCartElements.forEach(elemId => {
    document.getElementById(elemId)?.addEventListener('click', () => {
        document.getElementById('cartSidebar')?.classList.remove('open');
        document.getElementById('cartOverlay')?.classList.remove('active');
    });
});

// ---------- SYSTEM CHECKOUT FROM SIDEBAR DRAWER ----------
document.getElementById('proceedCheckoutFromCart')?.addEventListener('click', () => {
    if (cart.length === 0) {
        alert("Your cart is empty. Add some healthy items first!");
        return;
    }
    
    // Lock state logic
    window.currentBuyNowProduct = null;
    window.cartForCheckout = [...cart];
    
    const totalCart = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    trackBeginCheckout(cart, totalCart);
    
    // Inject Multi-Item Summary Block explicitly inside HTML element markup layout wrapper
    const summaryBlock = document.getElementById('orderSummaryContainer');
    if (summaryBlock) {
        summaryBlock.innerHTML = `
            <div style="width: 100%;">
                <h3 style="margin-bottom: 10px; color: #2c5538;">Order Summary (${cart.length} items)</h3>
                <ul style="list-style: none; padding: 0; max-height: 150px; overflow-y: auto;">
                    ${cart.map(item => `
                        <li style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem;">
                            <span>${item.name} <strong>x${item.quantity}</strong></span>
                            <span>₵${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    `).join('')}
                </ul>
                <div style="text-align: right; margin-top: 10px; font-weight: bold; border-top: 1px solid #ddd; padding-top: 8px;">
                    Total Order Value: ₵${totalCart.toFixed(2)}
                </div>
            </div>
        `;
    }

    const purchaseBlock = document.getElementById('purchaseForm');
    if (purchaseBlock) {
        purchaseBlock.style.display = 'block';
        purchaseBlock.scrollIntoView({ behavior: 'smooth' });
    }
    
    document.getElementById('thankYou').style.display = 'none';
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('active');
});

// ---------- EMAIL PARSING SUBMISSION CONTROLLER ----------
const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        
        let orderDetails = '';
        let totalOrder = 0;
        
        if (window.cartForCheckout && window.cartForCheckout.length) {
            orderDetails = window.cartForCheckout.map(item => `- ${item.name} (x${item.quantity}) = ₵${(item.price * item.quantity).toFixed(2)}`).join('\n');
            totalOrder = window.cartForCheckout.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        } else if (window.currentBuyNowProduct) {
            orderDetails = `- ${window.currentBuyNowProduct.name} (x1) = ₵${window.currentBuyNowProduct.price.toFixed(2)}`;
            totalOrder = window.currentBuyNowProduct.price;
        } else {
            orderDetails = 'No structural product items configured.';
            totalOrder = 0;
        }
        
        const subject = `New Juice Order from ${name}`;
        const body = `Hello Juice by Evelyn,\n\nI would like to place an order details:\n\n${orderDetails}\n\nTotal: ₵${totalOrder.toFixed(2)}\n\nDelivery Information Details:\n- Customer Name: ${name}\n- Email: ${email}\n- Delivery Address/Landmark: ${address}\n- Phone Contact: ${phone}\n\nPlease contact me back to confirm production delivery scheduling. Thanks!`;
        
        const mailtoLink = `mailto:support@juicebyevelyn.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Open the email app
        window.location.href = mailtoLink;
        
        if (typeof window.trackEcommerceEvent === 'function') {
            window.trackEcommerceEvent('generate_lead', { currency: 'GHS', value: totalOrder });
        }
        
        document.getElementById('purchaseForm').style.display = 'none';
        document.getElementById('thankYou').style.display = 'block';
        
        // Post-Order State Resets
        if (window.cartForCheckout && window.cartForCheckout.length) {
            cart = [];
            updateCartUI();
            saveCart();
            window.cartForCheckout = null;
        } else {
            window.currentBuyNowProduct = null;
        }
    });
}

// ---------- INITIALIZATION INITIAL STATE LAUNCH ----------
document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    loadCart();
    
    // Enforce localized structural current dynamic year stamp 
    const yearElem = document.getElementById('year');
    if (yearElem) yearElem.textContent = new Date().getFullYear();
});