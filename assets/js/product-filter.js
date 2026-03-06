document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    // Function to filter products
    function filterProducts(category) {
        // Normalize category for comparison (case-insensitive)
        const normalize = str => str.toLowerCase().trim();
        const targetCategory = normalize(category);

        productCards.forEach(card => {
            const cardCategory = normalize(card.dataset.category || '');

            if (targetCategory === 'all' || cardCategory === targetCategory) {
                card.style.display = 'block';
                // Add a small animation for appearance
                card.style.animation = 'fadeIn 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });

        // Update active button state
        filterButtons.forEach(btn => {
            if (normalize(btn.textContent) === targetCategory) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Check URL parameters on load
    const params = new URLSearchParams(window.location.search);
    const urlCategory = params.get('category');

    if (urlCategory) {
        filterProducts(urlCategory);
    }

    // Add click event listeners to filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.textContent;
            filterProducts(category);

            // Optional: Update URL without reloading (pushState) to allow sharing
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('category', category);
            window.history.pushState({}, '', newUrl);
        });
    });

    // Add keyframes for animation if not exists
    if (!document.querySelector('#filter-animation-style')) {
        const style = document.createElement('style');
        style.id = 'filter-animation-style';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
});
