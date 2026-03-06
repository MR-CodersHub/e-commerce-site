
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinksContainer) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');

            // Initial Icon state
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinksContainer.classList.contains('active')) {
                icon.classList.replace('ph-list', 'ph-x');
            } else {
                icon.classList.replace('ph-x', 'ph-list');
            }
        });
    }

    // Dynamic Navigation Highlighting
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        // Handle root / or index.html
        if (pageName === 'index.html' || pageName === '') {
            if (linkPath === 'index.html') link.classList.add('active');
            else link.classList.remove('active');
        } else {
            if (linkPath === pageName) link.classList.add('active');
            else link.classList.remove('active');
        }
    });

    // User account icon dropdown — select elements here so they are always found
    const userDropdownToggle = document.querySelector('.user-dropdown-toggle');
    const userDropdownMenu = document.querySelector('.user-dropdown-menu');

    if (userDropdownToggle && userDropdownMenu) {
        userDropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdownMenu.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userDropdownToggle.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                userDropdownMenu.classList.remove('show');
            }
        });
    }

    // Dashboard Sidebar Off-canvas Logic
    const initSidebar = () => {
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');

        if (!sidebar) return;

        // Create overlay if it doesn't exist
        let sidebarOverlay = document.querySelector('.sidebar-overlay');
        if (!sidebarOverlay) {
            sidebarOverlay = document.createElement('div');
            sidebarOverlay.className = 'sidebar-overlay';
            document.body.appendChild(sidebarOverlay);
        }

        // Create close button if it doesn't exist
        let sidebarClose = document.querySelector('.sidebar-close');
        if (!sidebarClose) {
            sidebarClose = document.createElement('div');
            sidebarClose.className = 'sidebar-close';
            sidebarClose.innerHTML = '<i class="ph ph-x"></i>';
            sidebar.prepend(sidebarClose);
        }

        // iOS-safe scroll lock: save position before locking, restore on unlock
        let savedScrollY = 0;

        const openSidebar = () => {
            savedScrollY = window.scrollY;
            document.body.style.top = `-${savedScrollY}px`;
            sidebar.classList.add('open');
            sidebarOverlay.classList.add('active');
            document.body.classList.add('sidebar-open');
        };

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
            // Restore scroll position after unlocking (iOS fix)
            document.body.style.top = '';
            window.scrollTo(0, savedScrollY);
        };

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', (e) => {
                e.preventDefault();
                openSidebar();
            });
        }

        sidebarOverlay.addEventListener('click', closeSidebar);
        sidebarClose.addEventListener('click', closeSidebar);

        // ESC key closes the sidebar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });

        // Close on sidebar link click (navigation)
        const sidebarLinks = sidebar.querySelectorAll('.sidebar-menu a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', closeSidebar);
        });
    };

    if (document.body.classList.contains('dashboard-layout')) {
        initSidebar();
    }
});
