import { initClock, showToast } from './utils.js';
import { fetchCrowdData } from './api.js';
import { startCanvasAnimation, updateHeatmapData } from './heatmap.js';
import { initDashboard, updateDashboard } from './dashboard.js';
import { initFoodMenu, updateCartDrawer } from './food.js';
import { initNavigation } from './navigation.js';
import { initLiveScore } from './liveScore.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initial State
    initClock();
    const initialData = await fetchCrowdData();

    // 2. Page Specific Init
    const path = window.location.pathname;

    // Check path for specific initials
    if (path.includes('dashboard')) {
        initDashboard(initialData);
    } else if (path.includes('heatmap')) {
        startCanvasAnimation('heatmapCanvas', 'heatmap', initialData);
    } else if (path.includes('food')) {
        initFoodMenu();
        updateCartDrawer();
    } else if (path.includes('navigation')) {
        startCanvasAnimation('findSeatCanvas', 'find-seat', initialData);
        initNavigation();
    } else if (path === '/' || path.includes('index.html')) {
        initLiveScore();
    }

    // 3. Polling for Live Telemetry
    setInterval(async () => {
        const newData = await fetchCrowdData();
        if (!newData) return;

        if (path.includes('dashboard')) updateDashboard(newData);
        if (path.includes('heatmap')) {
            updateHeatmapData(newData);
        }
        if (path.includes('navigation')) updateHeatmapData(newData);
    }, 8000);

    // 4. Global UI Listeners
    setupGlobalListeners();
});

function setupGlobalListeners() {
    // Cart Toggle
    const cartToggle = document.querySelectorAll('.cart-toggle');
    const cartDrawer = document.getElementById('cartDrawerOverlay');
    cartToggle.forEach(btn => {
        btn.addEventListener('click', () => {
            if (cartDrawer) cartDrawer.classList.toggle('hidden');
        });
    });

    // Mobile Menu
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('hidden');
            navLinks.classList.toggle('flex');
        });
    }

    // Navigation Redraw Listener
    window.addEventListener('navigationUpdate', () => {
        const initialData = window.crowdDataCache; // If we made it global, or just let the interval handle it
    });
}

export function updateCartCount(count) {
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
        b.textContent = count;
        b.classList.remove('scale-100');
        b.classList.add('scale-125');
        setTimeout(() => b.classList.remove('scale-125'), 200);
    });
}

// Global checkout expose for simplicity in this prototype
window.checkout = () => {
    const cart = JSON.parse(localStorage.getItem('stadiumFlow_cart') || '[]');
    if (cart.length === 0) {
        showToast("⚠️ Your cart is empty!");
        return;
    }
    const orderId = 'SF' + Math.floor(Math.random() * 1000000);
    showToast(`🎉 Order ${orderId} placed! Pickup at Counter 3.`);
    localStorage.removeItem('stadiumFlow_cart');
    updateCartCount(0);
    location.reload(); // Simple refresh for demo
};
