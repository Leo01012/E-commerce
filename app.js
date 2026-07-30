document.addEventListener('DOMContentLoaded', () => {
    // --- Cart Data State ---
    let cart = [];

    // --- DOM Elements ---
    // Image Gallery
    const mainProductImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    
    // Color Swatches
    const colorSwatches = document.querySelectorAll('.swatch-item');
    const colorNameLabel = document.getElementById('color-name');
    
    // Quantity Selectors
    const qtyDecrement = document.getElementById('qty-decrement');
    const qtyIncrement = document.getElementById('qty-increment');
    const qtyNumber = document.getElementById('qty-number');
    
    // Call to Action
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const quickAddBtns = document.querySelectorAll('.quick-add-btn');
    
    // Cart Drawer Elements
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBadgeCount = document.getElementById('cart-badge-count');
    const emptyCartState = document.getElementById('empty-cart-state');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalValue = document.getElementById('cart-total-value');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Tabs Elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const viewReviewsLink = document.getElementById('view-reviews-link');
    
    // Toast Alert
    const cartToast = document.getElementById('cart-toast');
    const toastMessage = cartToast.querySelector('.toast-message');

    // Maps color names to image paths for easy reference
    const colorImages = {
        'Midnight Black': 'assets/headphone-black.png',
        'Arctic Silver': 'assets/headphone-silver.png',
        'Champagne Gold': 'assets/headphone-gold.png'
    };

    // --- Image Gallery & Swatch Functionality ---

    // Handler to switch the active main image
    function updateMainImage(imageSrc) {
        if (!imageSrc) return;
        mainProductImage.style.opacity = '0';
        setTimeout(() => {
            mainProductImage.src = imageSrc;
            mainProductImage.style.opacity = '1';
        }, 150); // Small fade-out/in transition
    }

    // Handles thumbnail clicks
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            thumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
            
            const imageSrc = thumbnail.getAttribute('data-img');
            updateMainImage(imageSrc);

            // Sync color picker if thumbnail matches a variant
            for (const [colorName, path] of Object.entries(colorImages)) {
                if (imageSrc.includes(path)) {
                    colorSwatches.forEach(swatch => {
                        if (swatch.getAttribute('data-color') === colorName) {
                            colorSwatches.forEach(s => s.classList.remove('active'));
                            swatch.classList.add('active');
                            colorNameLabel.textContent = colorName;
                        }
                    });
                    break;
                }
            }
        });
    });

    // Handles color swatch clicks
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            colorSwatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            
            const colorName = swatch.getAttribute('data-color');
            const imageSrc = swatch.getAttribute('data-img');
            
            colorNameLabel.textContent = colorName;
            updateMainImage(imageSrc);

            // Sync with corresponding thumbnail
            thumbnails.forEach(thumbnail => {
                thumbnail.classList.remove('active');
                if (thumbnail.getAttribute('data-img') === imageSrc) {
                    thumbnail.classList.add('active');
                }
            });
        });
    });

    // --- Product Quantity Counter ---

    qtyDecrement.addEventListener('click', () => {
        let currentQty = parseInt(qtyNumber.value, 10);
        if (currentQty > 1) {
            qtyNumber.value = currentQty - 1;
        }
    });

    qtyIncrement.addEventListener('click', () => {
        let currentQty = parseInt(qtyNumber.value, 10);
        qtyNumber.value = currentQty + 1;
    });

    // --- Tabs Switching Logic ---

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Deactivate all tabs
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            // Activate current tab
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');

            // Toggle corresponding panel
            const panelId = button.getAttribute('aria-controls') || button.id.replace('tab-', 'panel-');
            tabPanels.forEach(panel => {
                if (panel.id === panelId) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });
        });
    });

    // Handle "Reviews" click at top
    if (viewReviewsLink) {
        viewReviewsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const reviewsTab = document.getElementById('tab-reviews');
            if (reviewsTab) {
                reviewsTab.click();
                reviewsTab.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // --- Cart Open / Close Drawer Actions ---

    function openCart() {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden'; // Disable page scrolling
    }

    function closeCart() {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
        document.body.style.overflow = ''; // Restore scrolling
    }

    openCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // --- Cart System Backend ---

    // Show dynamic success toast alert
    function showToast(message) {
        toastMessage.textContent = message;
        cartToast.classList.add('show');
        setTimeout(() => {
            cartToast.classList.remove('show');
        }, 3000);
    }

    // Helper to calculate totals & badge state
    function updateCartTotals() {
        let totalCount = 0;
        let totalPrice = 0;
        
        cart.forEach(item => {
            totalCount += item.quantity;
            totalPrice += item.price * item.quantity;
        });

        // Update badge count with animation
        cartBadgeCount.textContent = totalCount;
        cartBadgeCount.classList.add('bump');
        setTimeout(() => {
            cartBadgeCount.classList.remove('bump');
        }, 300);

        // Update footer subtotal price
        cartTotalValue.textContent = `$${totalPrice.toFixed(2)}`;
    }

    // Render HTML elements inside the cart drawer
    function renderCartItems() {
        if (cart.length === 0) {
            emptyCartState.style.display = 'flex';
            cartItemsList.style.display = 'none';
            cartItemsList.innerHTML = '';
        } else {
            emptyCartState.style.display = 'none';
            cartItemsList.style.display = 'flex';
            cartItemsList.innerHTML = ''; // Clear prior list

            cart.forEach((item, index) => {
                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'cart-item';
                cartItemEl.innerHTML = `
                    <div class="cart-item-img">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="cart-item-info">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <p class="cart-item-variant">Variant: ${item.color}</p>
                        <div class="cart-item-qty">
                            <button class="cart-qty-btn decrease-qty-btn" data-index="${index}" aria-label="Decrease quantity">&minus;</button>
                            <input type="text" class="cart-qty-input" value="${item.quantity}" readonly aria-label="Product quantity">
                            <button class="cart-qty-btn increase-qty-btn" data-index="${index}" aria-label="Increase quantity">&plus;</button>
                        </div>
                    </div>
                    <div class="cart-item-price-col">
                        <button class="cart-item-remove" data-index="${index}" aria-label="Remove item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                        </button>
                        <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `;

                cartItemsList.appendChild(cartItemEl);
            });

            // Attach event listeners to quantity adjusts and deletes inside cart
            attachCartItemListeners();
        }
        
        updateCartTotals();
    }

    // Listens to actions inside individual cart cards
    function attachCartItemListeners() {
        // Decrease quantity
        document.querySelectorAll('.decrease-qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'), 10);
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    // Remove item if quantity falls to 0
                    cart.splice(index, 1);
                }
                renderCartItems();
            });
        });

        // Increase quantity
        document.querySelectorAll('.increase-qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'), 10);
                cart[index].quantity += 1;
                renderCartItems();
            });
        });

        // Remove item from cart
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'), 10);
                const removedItem = cart[index];
                cart.splice(index, 1);
                renderCartItems();
                showToast(`Removed ${removedItem.title} from cart.`);
            });
        });
    }

    // Add item to cart
    function addItemToCart(productId, productTitle, price, colorName, imageSrc, quantity) {
        // Unique key based on product ID and selected variant color
        const cartItemId = `${productId}-${colorName.toLowerCase().replace(' ', '-')}`;
        
        const existingItem = cart.find(item => item.id === cartItemId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: cartItemId,
                title: productTitle,
                price: price,
                color: colorName,
                image: imageSrc,
                quantity: quantity
            });
        }

        renderCartItems();
        showToast(`Added ${quantity}x ${productTitle} (${colorName}) to cart.`);
        openCart(); // Auto-open drawer for feedback
    }

    // --- Event Listeners for Cart Buttons ---

    // Main Product Add to Cart Button Click
    addToCartBtn.addEventListener('click', () => {
        const activeSwatch = document.querySelector('.swatch-item.active');
        const colorName = activeSwatch ? activeSwatch.getAttribute('data-color') : 'Midnight Black';
        const imageSrc = activeSwatch ? activeSwatch.getAttribute('data-img') : 'assets/headphone-black.png';
        const quantity = parseInt(qtyNumber.value, 10);

        // Perform micro-animation on main button
        const btnText = addToCartBtn.querySelector('span');
        const originalText = btnText.textContent;
        addToCartBtn.style.pointerEvents = 'none'; // Temporarily disable clicks
        btnText.textContent = 'Added!';
        
        addItemToCart('aerosound-max', 'AeroSound Max Wireless', 349.99, colorName, imageSrc, quantity);

        setTimeout(() => {
            btnText.textContent = originalText;
            addToCartBtn.style.pointerEvents = '';
        }, 1500);
    });

    // Related Products Quick Add Buttons
    quickAddBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-id');
            const productTitle = btn.getAttribute('data-title');
            const price = parseFloat(btn.getAttribute('data-price'));
            const imageSrc = btn.getAttribute('data-img');

            addItemToCart(productId, productTitle, price, 'Default', imageSrc, 1);
        });
    });

    // Checkout button callback
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        
        alert('Thank you for purchasing! Proceeding to simulated checkout...');
        
        // Reset Cart
        cart = [];
        renderCartItems();
        closeCart();
    });
});
