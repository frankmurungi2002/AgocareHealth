/**
 * Agocare Mobile Responsive Navigation
 * Handles hamburger menu, mobile sidebar, and responsive behavior
 */
(function() {
    'use strict';

    let mobileSidebar = null;
    let mobileOverlay = null;
    let hamburgerBtn = null;

    function initMobileNav() {
        // Don't re-initialize
        if (document.getElementById('mobile-sidebar')) return;

        // Create hamburger button if not present
        hamburgerBtn = document.querySelector('.hamburger-btn');
        if (!hamburgerBtn) {
            hamburgerBtn = document.createElement('button');
            hamburgerBtn.className = 'hamburger-btn';
            hamburgerBtn.setAttribute('aria-label', 'Open menu');
            hamburgerBtn.innerHTML = '<span></span><span></span><span></span>';
            
            // Insert into header as first child of header
            const header = document.querySelector('header');
            if (header) {
                const firstChild = header.firstElementChild;
                header.insertBefore(hamburgerBtn, firstChild);
            }
        }

        // Create overlay
        mobileOverlay = document.createElement('div');
        mobileOverlay.className = 'mobile-sidebar-overlay';
        mobileOverlay.id = 'mobile-overlay';
        document.body.appendChild(mobileOverlay);

        // Create mobile sidebar
        mobileSidebar = document.createElement('nav');
        mobileSidebar.className = 'mobile-sidebar';
        mobileSidebar.id = 'mobile-sidebar';

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'mobile-sidebar-close';
        closeBtn.setAttribute('aria-label', 'Close menu');
        closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M18 6L6 18M6 6l12 12"/></svg>';
        mobileSidebar.appendChild(closeBtn);

        // Clone sidebar navigation items from desktop sidebar
        const desktopSidebar = document.querySelector('.desktop-sidebar') || 
                               document.querySelector('.main-layout > aside:first-child') ||
                               document.querySelector('aside.scroll-section');
        
        if (desktopSidebar) {
            // Clone all nav sections
            const sections = desktopSidebar.querySelectorAll('div[style*="padding: 8px 12px"]');
            sections.forEach(function(section) {
                // Get section title
                const titleEl = section.querySelector('div[style*="text-transform: uppercase"]');
                if (titleEl) {
                    const sectionTitle = document.createElement('div');
                    sectionTitle.className = 'nav-section-title';
                    sectionTitle.textContent = titleEl.textContent;
                    mobileSidebar.appendChild(sectionTitle);
                }

                // Clone nav items
                const navItems = section.querySelectorAll('a.nav-item');
                navItems.forEach(function(item) {
                    const clone = item.cloneNode(true);
                    clone.className = 'nav-item' + (item.classList.contains('active') ? ' active' : '');
                    mobileSidebar.appendChild(clone);
                });

                // Add divider between sections
                const divider = document.createElement('div');
                divider.className = 'nav-divider';
                mobileSidebar.appendChild(divider);
            });
        }

        // Add mobile search to sidebar
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = 'padding: 12px 16px;';
        searchContainer.innerHTML = '<input type="text" placeholder="Search..." style="width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 14px; outline: none;">';
        mobileSidebar.insertBefore(searchContainer, mobileSidebar.children[1]);

        document.body.appendChild(mobileSidebar);

        // Event listeners
        hamburgerBtn.addEventListener('click', toggleMobileSidebar);
        mobileOverlay.addEventListener('click', closeMobileSidebar);
        closeBtn.addEventListener('click', closeMobileSidebar);

        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeMobileSidebar();
        });

        // Close sidebar on nav item click
        mobileSidebar.querySelectorAll('.nav-item').forEach(function(item) {
            item.addEventListener('click', function() {
                closeMobileSidebar();
            });
        });
    }

    function toggleMobileSidebar() {
        if (mobileSidebar && mobileOverlay) {
            var isActive = mobileSidebar.classList.contains('active');
            if (isActive) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }
        }
    }

    function openMobileSidebar() {
        if (mobileSidebar && mobileOverlay && hamburgerBtn) {
            mobileSidebar.classList.add('active');
            mobileOverlay.classList.add('active');
            mobileOverlay.style.display = 'block';
            hamburgerBtn.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMobileSidebar() {
        if (mobileSidebar && mobileOverlay && hamburgerBtn) {
            mobileSidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
            hamburgerBtn.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(function() {
                if (mobileOverlay) mobileOverlay.style.display = 'none';
            }, 300);
        }
    }

    // Add responsive classes to existing elements
    function addResponsiveClasses() {
        // Mark header
        var header = document.querySelector('header');
        if (header && !header.classList.contains('site-header')) {
            header.classList.add('site-header');
        }

        // Mark search container in header
        var headerChildren = header ? header.children : [];
        for (var i = 0; i < headerChildren.length; i++) {
            var child = headerChildren[i];
            // Find the search div (has max-width: 400px or contains search input)
            if (child.querySelector && child.querySelector('input[placeholder*="Search"]')) {
                child.classList.add('header-search');
            }
        }

        // Mark the right section of header
        var rightDivs = header ? header.querySelectorAll(':scope > div') : [];
        if (rightDivs.length > 0) {
            var lastDiv = rightDivs[rightDivs.length - 1];
            if (lastDiv.querySelector('#guest-section, #user-section, #doctorAvatar, #patientAvatar')) {
                lastDiv.classList.add('header-right');
            }
        }

        // Mark "Ask Question" button text spans
        var askBtns = document.querySelectorAll('button');
        askBtns.forEach(function(btn) {
            if (btn.textContent.trim().includes('Ask Question')) {
                var textNodes = btn.childNodes;
                for (var j = 0; j < textNodes.length; j++) {
                    if (textNodes[j].nodeType === Node.TEXT_NODE && textNodes[j].textContent.trim() === 'Ask Question') {
                        var span = document.createElement('span');
                        span.className = 'ask-question-btn-text';
                        span.textContent = textNodes[j].textContent;
                        btn.replaceChild(span, textNodes[j]);
                    }
                }
            }
        });

        // Mark the main grid layout
        var mainGrids = document.querySelectorAll('div[style*="grid-template-columns"]');
        mainGrids.forEach(function(grid) {
            var style = grid.getAttribute('style') || '';
            if (style.includes('260px') || style.includes('1fr') && style.includes('300px') || style.includes('320px')) {
                grid.classList.add('main-layout');
                
                // Mark sidebars
                var children = grid.children;
                for (var k = 0; k < children.length; k++) {
                    if (children[k].tagName === 'ASIDE') {
                        if (k === 0) {
                            children[k].classList.add('desktop-sidebar');
                        }
                    }
                }
            }
        });

        // Mark stat cards grid
        var statGrids = document.querySelectorAll('div[style*="repeat(5, 1fr)"]');
        statGrids.forEach(function(g) {
            g.classList.add('stat-cards-grid');
        });

        // Mark bottom 2-column grids (Quick Actions + Alerts)
        var twoColGrids = document.querySelectorAll('div[style*="grid-template-columns: 1fr 1fr"]');
        twoColGrids.forEach(function(g) {
            if (!g.classList.contains('role-selector')) {
                g.classList.add('bottom-grid');
            }
        });

        // Mark content wrapper
        var wrappers = document.querySelectorAll('div[style*="max-width: 1400px"], div[style*="max-width: 1600px"]');
        wrappers.forEach(function(w) {
            w.classList.add('content-wrapper');
        });

        // Mark post creation area (dark background card in patient dashboard)
        var darkCards = document.querySelectorAll('div[style*="background: #1f2937"]');
        darkCards.forEach(function(c) {
            c.classList.add('post-creation-area');
            // Mark action buttons row
            var btnRows = c.querySelectorAll('div[style*="justify-content: space-around"]');
            btnRows.forEach(function(r) {
                r.classList.add('post-action-buttons');
            });
        });

        // Mark filter controls
        var filterDivs = document.querySelectorAll('div[style*="display: flex"][style*="gap: 8px"]');
        filterDivs.forEach(function(fd) {
            if (fd.querySelector('.sort-btn') || fd.querySelector('button[onclick*="filter"]')) {
                fd.classList.add('filter-controls');
            }
            if (fd.querySelector('.sort-btn') || fd.querySelector('button[data-sort]')) {
                fd.classList.add('sort-controls');
            }
        });
    }

    // Handle window resize
    function handleResize() {
        if (window.innerWidth > 768) {
            closeMobileSidebar();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            addResponsiveClasses();
            initMobileNav();
            window.addEventListener('resize', handleResize);
        });
    } else {
        addResponsiveClasses();
        initMobileNav();
        window.addEventListener('resize', handleResize);
    }
})();
