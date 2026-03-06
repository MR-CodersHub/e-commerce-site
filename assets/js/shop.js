
document.addEventListener('DOMContentLoaded', () => {
    // Initialize storage
    if (!localStorage.getItem('cart')) localStorage.setItem('cart', JSON.stringify([]));
    if (!localStorage.getItem('wishlist')) localStorage.setItem('wishlist', JSON.stringify([]));

    updateCartCount();
    updateWishlistCount();

    // Event listeners for Add to Cart and Wishlist buttons
    // We use delegation to handle dynamically added elements if any, or just consistent handling
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
    });

    // Page specific renders
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
        renderWishlistPage();
    }

    if (window.location.pathname.includes('wishlist.html')) {
        renderWishlistPage();
    }

    // Check wishlist status on page load (for heart icons)
    updateHeartIcons();
});

function getProductData(card) {
    return {
        id: card.dataset.id,
        name: card.dataset.name,
        price: card.dataset.price,
        image: card.dataset.image
    };
}

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        product.quantity = 1;
        cart.push(product);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast('Added to Cart!');
}

function toggleWishlist(product, btn) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist'));
    const index = wishlist.findIndex(item => item.id === product.id);

    if (index > -1) {
        wishlist.splice(index, 1);
        btn.querySelector('i').classList.replace('ph-fill', 'ph-bold'); // Outline
        showToast('Removed from Wishlist');
    } else {
        wishlist.push(product);
        btn.querySelector('i').classList.replace('ph-bold', 'ph-fill'); // Filled
        showToast('Added to Wishlist');
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
}

function updateHeartIcons() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist'));
    const buttons = document.querySelectorAll('.wishlist-btn');

    buttons.forEach(btn => {
        const card = btn.closest('.product-card');
        if (card) {
            const id = card.dataset.id;
            const inWishlist = wishlist.some(item => item.id === id);
            const icon = btn.querySelector('i');
            if (inWishlist) {
                icon.classList.replace('ph-bold', 'ph-fill');
            } else {
                icon.classList.replace('ph-fill', 'ph-bold');
            }
        }
    });
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartPage();
    updateCartCount();
}

function removeFromWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist'));
    wishlist = wishlist.filter(item => item.id !== id);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderWishlistPage();
    updateWishlistCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    // Find cart icon badge or create it (Assuming structured in header)
    // Detailed implementation depends on HTML structure, for now just simple log/noop if badge missing
    // You might want to add a badge to the header cart icon
}

function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist'));
    // Similar to cart count
}


function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const totalElem = document.getElementById('cart-total');
    if (!container) return;

    const cart = JSON.parse(localStorage.getItem('cart'));
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Your cart is empty.</td></tr>';
        if (totalElem) totalElem.textContent = '$0.00';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        const itemTotal = parseFloat(item.price.replace('$', '')) * item.quantity;
        total += itemTotal;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                    <span>${item.name}</span>
                </div>
            </td>
            <td>${item.price}</td>
            <td>${item.quantity}</td>
            <td>$${itemTotal.toFixed(2)}</td>
            <td><button class="btn-icon remove-cart-item" data-id="${item.id}" style="color: #e74c3c;"><i class="ph-bold ph-trash"></i></button></td>
        `;
        container.appendChild(row);
    });

    if (totalElem) totalElem.textContent = '$' + total.toFixed(2);
}

function renderWishlistPage() {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

    const wishlist = JSON.parse(localStorage.getItem('wishlist'));
    container.innerHTML = '';

    if (wishlist.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Your wishlist is empty.</p>';
        return;
    }

    wishlist.forEach(item => {
        const col = document.createElement('div');
        col.className = 'product-card';
        // Reconstruct card
        col.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="product-info" style="margin-top:15px;">
                <h3>${item.name}</h3>
                <div class="product-footer">
                    <span class="price">${item.price}</span>
                     <div style="display: flex; gap: 10px;">
                        <button class="add-btn add-cart-btn" onclick="addToCartFromWishlist('${item.id}')"><i class="ph-bold ph-shopping-cart"></i></button>
                        <button class="add-btn remove-wishlist-item" data-id="${item.id}" style="background: #fee2e2; color: #ef4444;"><i class="ph-bold ph-trash"></i></button>
                     </div>
                </div>
            </div>
        `;
        // Hacky pass to make cart button work via delegation or we just add data attributes
        col.dataset.id = item.id;
        col.dataset.name = item.name;
        col.dataset.price = item.price;
        col.dataset.image = item.image;

        container.appendChild(col);
    });
}

// Helper to quickly move from wishlist to cart
window.addToCartFromWishlist = function (id) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist'));
    const product = wishlist.find(item => item.id === id);
    if (product) {
        addToCart(product);
    }
}


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
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function animateButton(btn) {
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 200);
}
