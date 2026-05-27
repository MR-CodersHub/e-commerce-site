document.addEventListener('DOMContentLoaded', () => {
    // We wrap everything in init but keep DOMContentLoaded wrapper for back compatibility.
    // However, we run it safely below.
});

// Helper functions for safe localStorage parsing
function getCart() {
    try {
        const cart = localStorage.getItem('cart');
        if (!cart) return [];
        const parsed = JSON.parse(cart);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function getWishlist() {
    try {
        const wishlist = localStorage.getItem('wishlist');
        if (!wishlist) return [];
        const parsed = JSON.parse(wishlist);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
        console.error("Failed to save cart to localStorage", e);
    }
}

function saveWishlist(wishlist) {
    try {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (e) {
        console.error("Failed to save wishlist to localStorage", e);
    }
}

function getProductData(card) {
    return {
        id: card.dataset.id,
        name: card.dataset.name,
        price: card.dataset.price,
        image: card.dataset.image
    };
}

function addToCart(product) {
    const cart = getCart();
    const existingItem = cart.find(item => String(item.id) === String(product.id));

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Clone object to avoid side-effects
        const newProduct = { ...product, quantity: 1 };
        cart.push(newProduct);
    }

    saveCart(cart);
    updateCartCount();
    showToast('Added to Cart!');

    // Re-render cart page if currently on it
    const isCartPage = window.location.pathname.includes('cart.html') || window.location.href.includes('cart.html');
    if (isCartPage) {
        renderCartPage();
    }
}

function toggleWishlist(product, btn) {
    const wishlist = getWishlist();
    const index = wishlist.findIndex(item => String(item.id) === String(product.id));
    const icon = btn.querySelector('i');

    if (index > -1) {
        wishlist.splice(index, 1);
        if (icon) icon.classList.replace('ph-fill', 'ph-bold'); // Outline icon
        showToast('Removed from Wishlist');
    } else {
        wishlist.push(product);
        if (icon) icon.classList.replace('ph-bold', 'ph-fill'); // Filled icon
        showToast('Added to Wishlist');
    }

    saveWishlist(wishlist);
    updateWishlistCount();

    const isCartPage = window.location.pathname.includes('cart.html') || window.location.href.includes('cart.html');
    const isWishlistPage = window.location.pathname.includes('wishlist.html') || window.location.href.includes('wishlist.html');

    if (isCartPage || isWishlistPage) {
        renderWishlistPage();
    }
}

function updateHeartIcons() {
    const wishlist = getWishlist();
    const buttons = document.querySelectorAll('.wishlist-btn');

    buttons.forEach(btn => {
        const card = btn.closest('.product-card');
        if (card) {
            const id = card.dataset.id;
            const inWishlist = wishlist.some(item => String(item.id) === String(id));
            const icon = btn.querySelector('i');
            if (icon) {
                if (inWishlist) {
                    icon.classList.replace('ph-bold', 'ph-fill');
                } else {
                    icon.classList.replace('ph-fill', 'ph-bold');
                }
            }
        }
    });
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => String(item.id) !== String(id));
    saveCart(cart);
    renderCartPage();
    updateCartCount();
}

function removeFromWishlist(id) {
    let wishlist = getWishlist();
    wishlist = wishlist.filter(item => String(item.id) !== String(id));
    saveWishlist(wishlist);
    renderWishlistPage();
    updateWishlistCount();
    updateHeartIcons();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Find all links to cart.html to add/update badge
    const cartLinks = document.querySelectorAll('a[href="cart.html"]');
    cartLinks.forEach(link => {
        let badge = link.querySelector('.badge');
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'badge cart-badge';
                badge.style.background = 'var(--primary-green)';
                badge.style.color = 'var(--white)';
                badge.style.borderRadius = '50%';
                badge.style.padding = '2px 6px';
                badge.style.fontSize = '0.7rem';
                badge.style.position = 'absolute';
                badge.style.top = '-5px';
                badge.style.right = '-10px';
                badge.style.fontWeight = '700';
                link.style.position = 'relative';
                link.appendChild(badge);
            }
            badge.textContent = count;
        } else {
            if (badge) {
                badge.remove();
            }
        }
    });
}

function updateWishlistCount() {
    const wishlist = getWishlist();
    const count = wishlist.length;
    
    const wishlistLinks = document.querySelectorAll('a[href="wishlist.html"]');
    wishlistLinks.forEach(link => {
        let badge = link.querySelector('.badge');
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'badge wishlist-badge';
                badge.style.background = '#e74c3c';
                badge.style.color = 'var(--white)';
                badge.style.borderRadius = '50%';
                badge.style.padding = '2px 6px';
                badge.style.fontSize = '0.7rem';
                badge.style.position = 'absolute';
                badge.style.top = '-5px';
                badge.style.right = '-10px';
                badge.style.fontWeight = '700';
                link.style.position = 'relative';
                link.appendChild(badge);
            }
            badge.textContent = count;
        } else {
            if (badge) {
                badge.remove();
            }
        }
    });
}

function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const totalElem = document.getElementById('cart-total');
    if (!container) return;

    const cart = getCart();
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<tr><td colspan="5" class="empty-cart-cell" style="text-align:center; padding: 30px; color: var(--text-light);">Your cart is empty.</td></tr>';
        if (totalElem) totalElem.textContent = '$0.00';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        const priceStr = String(item.price || '$0.00');
        const cleanPrice = parseFloat(priceStr.replace('$', '')) || 0;
        const itemTotal = cleanPrice * item.quantity;
        total += itemTotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${item.image || 'assets/images/placeholder.png'}" alt="${item.name || 'Product'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; box-shadow: var(--shadow-sm);">
                    <span style="font-weight: 500;">${item.name || 'Product'}</span>
                </div>
            </td>
            <td>${priceStr}</td>
            <td>${item.quantity}</td>
            <td>$${itemTotal.toFixed(2)}</td>
            <td>
                <button class="btn-icon remove-cart-item" data-id="${item.id}" style="color: #e74c3c;">
                    <i class="ph-bold ph-trash"></i>
                </button>
            </td>
        `;
        container.appendChild(row);
    });

    if (totalElem) totalElem.textContent = '$' + total.toFixed(2);
}

function renderWishlistPage() {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

    const wishlist = getWishlist();
    container.innerHTML = '';

    if (wishlist.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--text-light); padding: 20px;">Your wishlist is empty.</p>';
        return;
    }

    wishlist.forEach(item => {
        const col = document.createElement('div');
        col.className = 'product-card';
        col.innerHTML = `
            <img src="${item.image || 'assets/images/placeholder.png'}" alt="${item.name || 'Product'}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
            <div class="product-info" style="margin-top:15px;">
                <h3 style="font-size:1.1rem; margin-bottom:5px;">${item.name || 'Product'}</h3>
                <div class="product-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top: 10px;">
                    <span class="price" style="font-weight: 700; color: var(--primary-green);">${item.price || '$0.00'}</span>
                    <div style="display: flex; gap: 10px;">
                        <button class="add-btn add-cart-btn" onclick="addToCartFromWishlist('${item.id}')">
                            <i class="ph-bold ph-shopping-cart"></i>
                        </button>
                        <button class="add-btn remove-wishlist-item" data-id="${item.id}" style="background: #fee2e2; color: #ef4444;">
                            <i class="ph-bold ph-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        col.dataset.id = item.id;
        col.dataset.name = item.name;
        col.dataset.price = item.price;
        col.dataset.image = item.image;

        container.appendChild(col);
    });
}

window.addToCartFromWishlist = function (id) {
    const wishlist = getWishlist();
    const product = wishlist.find(item => String(item.id) === String(id));
    if (product) {
        addToCart(product);
    }
};

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function animateButton(btn) {
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 200);
}

// Robust execution block
function init() {
    // Initialize storage structure if missing/corrupted
    const currentCart = localStorage.getItem('cart');
    const currentWishlist = localStorage.getItem('wishlist');

    try {
        if (!currentCart || !Array.isArray(JSON.parse(currentCart))) saveCart([]);
    } catch(e) { saveCart([]); }

    try {
        if (!currentWishlist || !Array.isArray(JSON.parse(currentWishlist))) saveWishlist([]);
    } catch(e) { saveWishlist([]); }

    updateCartCount();
    updateWishlistCount();

    // Event delegation click handler
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        if (btn.classList.contains('add-cart-btn')) {
            const card = btn.closest('.product-card');
            if (card) {
                const product = getProductData(card);
                addToCart(product);
                animateButton(btn);
            }
        }

        if (btn.classList.contains('wishlist-btn')) {
            const card = btn.closest('.product-card');
            if (card) {
                const product = getProductData(card);
                toggleWishlist(product, btn);
            }
        }

        if (btn.classList.contains('remove-cart-item')) {
            const id = btn.dataset.id;
            removeFromCart(id);
        }

        if (btn.classList.contains('remove-wishlist-item')) {
            const id = btn.dataset.id;
            removeFromWishlist(id);
        }

        if (btn.id === 'checkout-btn') {
            const cart = getCart();
            if (cart.length === 0) {
                showToast('Your cart is empty!');
                return;
            }
            btn.disabled = true;
            btn.textContent = 'Processing...';
            showToast('Order placed successfully! Redirecting...');
            saveCart([]);
            updateCartCount();
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 1500);
        }
    });

    // Page specific checks
    const isCartPage = window.location.pathname.includes('cart.html') || window.location.href.includes('cart.html');
    const isWishlistPage = window.location.pathname.includes('wishlist.html') || window.location.href.includes('wishlist.html');

    if (isCartPage) {
        renderCartPage();
        renderWishlistPage();
    }

    if (isWishlistPage) {
        renderWishlistPage();
    }

    updateHeartIcons();
}

// Safely execute init block immediately or on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
