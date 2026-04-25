import { loginWithGoogle, logout, subscribeToAuthChanges } from './auth.js';
import { getRole, clearRole } from './storeManager.js';

document.addEventListener('DOMContentLoaded', () => {
    loadComponent('/components/navbar.html', 'navbar', () => {
        applyRoleBasedNavbar();
        initNavbar();
        setupAuthHandler();
    });
    loadComponent('/components/footer.html', 'footer');
});

async function loadComponent(url, elementId, callback) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        if (callback) callback();
    } catch (error) {
        console.error(`Error loading component from ${url}:`, error);
    }
}

function applyRoleBasedNavbar() {
    const role = getRole() || 'audience';
    const navLinks = document.getElementById('navLinks');
    const mobileMenu = document.getElementById('mobileMenu');
    
    let desktopHTML = '';
    let mobileHTML = '';
    
    if (role === 'admin') {
        desktopHTML = `
            <a href="/pages/admin-dashboard.html#admin-home" data-nav="home" class="nav-link">Home</a>
            <a href="/pages/admin-dashboard.html#admin-dashboard" data-nav="dashboard" class="nav-link">Dashboard</a>
            <a href="/pages/admin-dashboard.html#admin-heatmap" data-nav="heatmap" class="nav-link">Heatmap</a>
            <a href="/pages/admin-dashboard.html#manage-shops" data-nav="admin-shops" class="nav-link">Manage Shops</a>
            <a href="/pages/admin-dashboard.html#requests" data-nav="admin-requests" class="nav-link">Requests</a>
        `;
        mobileHTML = `
            <a href="/pages/admin-dashboard.html#admin-home" class="text-4xl font-black text-slate-300 hover:text-accent transition-colors tracking-tighter">Home</a>
            <a href="/pages/admin-dashboard.html#admin-dashboard" class="text-4xl font-black text-slate-300 hover:text-accent transition-colors tracking-tighter">Dashboard</a>
            <a href="/pages/admin-dashboard.html#admin-heatmap" class="text-4xl font-black text-slate-300 hover:text-accent transition-colors tracking-tighter">Heatmap</a>
            <a href="/pages/admin-dashboard.html#manage-shops" class="text-4xl font-black text-slate-300 hover:text-accent transition-colors tracking-tighter">Manage Shops</a>
            <a href="/pages/admin-dashboard.html#requests" class="text-4xl font-black text-slate-300 hover:text-accent transition-colors tracking-tighter">Requests</a>
        `;
    } else if (role === 'shop_admin') {
        desktopHTML = `
            <a href="/pages/shop-admin.html#register" data-nav="shop-register" class="nav-link">Register Shop</a>
            <a href="/pages/shop-admin.html#items" data-nav="shop-items" class="nav-link">Add Item</a>
            <a href="/pages/shop-admin.html#status" data-nav="shop-status" class="nav-link">Request Status</a>
        `;
        mobileHTML = `
            <a href="/pages/shop-admin.html#register" class="text-4xl font-black text-slate-300 hover:text-accent transition-colors tracking-tighter">Register Shop</a>
            <a href="/pages/shop-admin.html#items" class="text-4xl font-black text-slate-300 hover:text-accent transition-colors tracking-tighter">Add Item</a>
            <a href="/pages/shop-admin.html#status" class="text-4xl font-black text-slate-300 hover:text-accent transition-colors tracking-tighter">Request Status</a>
        `;
    } else {
        // Default Audience
        desktopHTML = `
            <a href="/pages/home.html" data-nav="home" class="nav-link">Home</a>
            <a href="/pages/dashboard.html" data-nav="dashboard" class="nav-link">Dashboard</a>
            <a href="/pages/heatmap.html" data-nav="heatmap" class="nav-link">Heatmap</a>
            <a href="/pages/navigation.html" data-nav="navigation" class="nav-link">Find My Seat</a>
            <a href="/pages/food-order.html" data-nav="food" class="nav-link">Food Order</a>
        `;
        mobileHTML = `
            <a href="/pages/home.html" class="text-4xl font-black text-slate-300 hover:text-accent transition-colors tracking-tighter">Home</a>
            <a href="/pages/dashboard.html" class="text-4xl font-black text-slate-300 hover:text-accent transition-colors tracking-tighter">Dashboard</a>
            <a href="/pages/heatmap.html" class="text-4xl font-black text-slate-300 hover:text-accent transition-colors tracking-tighter">Heatmap</a>
            <a href="/pages/navigation.html" class="text-4xl font-black text-slate-300 hover:text-accent transition-colors tracking-tighter">Find My Seat</a>
            <a href="/pages/food-order.html" class="text-4xl font-black text-slate-300 hover:text-accent transition-colors tracking-tighter">Food Order</a>
        `;
    }
    
    if (navLinks) {
        navLinks.innerHTML = desktopHTML;
    }
    
    if (mobileMenu) {
        const bottomSection = mobileMenu.querySelector('.mt-auto');
        mobileMenu.innerHTML = mobileHTML;
        if(bottomSection) mobileMenu.appendChild(bottomSection);
    }
}

function setupAuthHandler() {
    const authContainer = document.getElementById('authContainer');
    const role = getRole();

    if (role === 'admin' || role === 'shop_admin') {
        const roleName = role === 'admin' ? 'Admin Node' : 'Merchant Node';
        const roleColor = role === 'admin' ? 'text-indigo-400' : 'text-emerald-400';
        const roleBg = role === 'admin' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-emerald-500/10 border-emerald-500/20';
        
        if (authContainer) {
            authContainer.innerHTML = `
                <div class="flex items-center gap-4 bg-white/[0.02] border border-white/5 pl-4 pr-2 py-1.5 rounded-full shadow-inner">
                    <div class="flex flex-col items-start leading-tight">
                        <span class="text-[0.55rem] font-black text-muted uppercase tracking-[0.2em]">Protocol</span>
                        <span class="text-[0.65rem] font-black ${roleColor} uppercase tracking-widest">${roleName}</span>
                    </div>
                    <button id="roleLogoutBtn" class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/5 hover:border-red-500/20 shadow-lg group" title="Terminate Session">
                        <i class="fa-solid fa-power-off text-[0.7rem] group-hover:scale-110 transition-transform"></i>
                    </button>
                </div>
            `;
            const logoutTrigger = document.getElementById('roleLogoutBtn');
            if(logoutTrigger) logoutTrigger.addEventListener('click', () => {
                import('./storeManager.js').then(({ clearRole }) => clearRole());
                window.location.href = '/pages/role-select.html';
            });
        }
        return;
    }

    subscribeToAuthChanges((user) => {
        if (!authContainer) return;

        if (user) {
            authContainer.innerHTML = `
                <div class="flex items-center gap-3 bg-white/[0.02] border border-white/5 pl-4 pr-1.5 py-1.5 rounded-full shadow-inner group">
                    <div class="flex flex-col items-end leading-tight">
                        <span class="text-[0.65rem] font-black text-white uppercase tracking-tighter">${user.displayName}</span>
                        <button id="logoutBtn" class="text-[0.5rem] font-black text-accent hover:text-white uppercase tracking-[0.2em] transition-colors">Sign Out</button>
                    </div>
                    <div class="relative">
                        <img src="${user.photoURL}" class="w-8 h-8 rounded-full border border-white/10 group-hover:border-accent/40 transition-all shadow-lg" alt="Profile">
                        <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#02040a] shadow-sm"></div>
                    </div>
                </div>
            `;
            const logoutTrigger = document.getElementById('logoutBtn');
            if(logoutTrigger) logoutTrigger.addEventListener('click', async (e) => {
                e.stopPropagation();
                import('./storeManager.js').then(({ clearRole }) => clearRole());
                await logout();
                window.location.href = '/pages/role-select.html';
            });
        } else {
            const isGuest = sessionStorage.getItem('sf_guest_mode') === 'true';
            if (isGuest) {
                 authContainer.innerHTML = `
                    <div class="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-4 py-1.5 rounded-full shadow-inner">
                        <div class="flex flex-col items-start leading-tight">
                            <span class="text-[0.55rem] font-black text-muted uppercase tracking-[0.2em]">Access</span>
                            <span class="text-[0.65rem] font-black text-slate-300 uppercase tracking-widest">Guest Node</span>
                        </div>
                        <button id="guestExit" class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-accent hover:bg-accent/10 transition-all border border-white/5 hover:border-accent/20 shadow-lg group" title="Exit Guest Mode">
                            <i class="fa-solid fa-person-walking-arrow-right text-[0.7rem] group-hover:scale-110 transition-transform"></i>
                        </button>
                    </div>
                `;
                const exitTrigger = document.getElementById('guestExit');
                if(exitTrigger) exitTrigger.addEventListener('click', () => {
                    sessionStorage.removeItem('sf_guest_mode');
                    import('./storeManager.js').then(({ clearRole }) => clearRole());
                    window.location.href = '/pages/role-select.html';
                });
            } else if (!window.location.pathname.includes('role-select.html') && !window.location.pathname.includes('admin-dashboard.html') && !window.location.pathname.includes('shop-admin.html')) {
                window.location.href = '/pages/role-select.html';
            }
        }
    });
}

function initNavbar() {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const links = document.querySelectorAll('#navLinks a, #mobileMenu a');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        let isActive = false;
        
        if (href.includes('#')) {
            const [hrefPath, hrefHash] = href.split('#');
            if (path === hrefPath) {
                if (hash) {
                    isActive = hash === '#' + hrefHash;
                } else {
                    // Default tabs if no hash is present
                    isActive = (path.includes('admin-dashboard') && hrefHash === 'admin-dashboard') || 
                               (path.includes('shop-admin') && hrefHash === 'register');
                }
            }
        } else {
            isActive = path === href || (path === '/' && href === '/pages/home.html') || (path.includes(href) && href !== '/pages/home.html');
        }

        if (isActive) {
            link.classList.add('text-white', 'border-b-2', 'border-accent');
            link.classList.remove('text-slate-400');
        } else {
            link.classList.remove('text-white', 'border-b-2', 'border-accent');
            link.classList.add('text-slate-400');
        }
    });

    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    // Only attach listener once
    if (mobileBtn && mobileMenu && !mobileBtn.hasAttribute('data-listener-attached')) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        mobileBtn.setAttribute('data-listener-attached', 'true');
    }

    if (path.includes('food-order')) {
        const cartBtn = document.getElementById('cartToggleNav');
        if (cartBtn) cartBtn.classList.remove('hidden');
    }
}

// Add event listener to update navbar styling on hash change dynamically
window.addEventListener('hashchange', initNavbar);

// ─── Demo Disclaimer ─────────────────────────────────────
function showDemoDisclaimer() {
    // Only show if not dismissed in this session
    if (sessionStorage.getItem('sf_disclaimer_dismissed')) return;
    
    // Don't show on role-select page
    if (window.location.pathname.includes('role-select.html')) return;

    const banner = document.createElement('div');
    banner.id = 'demoDisclaimer';
    // Positioning it top-right, just below the premium navbar
    banner.className = 'fixed top-24 right-6 z-[9999] animate-fade-in-up pointer-events-none';
    banner.innerHTML = `
        <div class="glass-panel py-3 px-5 rounded-2xl flex items-center gap-4 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl bg-black/40 max-w-sm pointer-events-auto border-l-2 border-l-accent/50">
            <div class="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <i class="fa-solid fa-circle-info text-xs"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-[0.65rem] font-medium text-slate-300 leading-tight">
                    Demo Mode: Authentication and advanced validation (username, password, role-based security) can be implemented as needed.
                </p>
            </div>
            <button id="closeDisclaimer" class="text-slate-500 hover:text-white transition-colors p-1 ml-2">
                <i class="fa-solid fa-xmark text-sm"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(banner);
    
    const closeBtn = document.getElementById('closeDisclaimer');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(10px)';
            banner.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                banner.remove();
                sessionStorage.setItem('sf_disclaimer_dismissed', 'true');
            }, 500);
        });
    }
}

// Call disclaimer after a short delay
setTimeout(showDemoDisclaimer, 1000);

