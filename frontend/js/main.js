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
    } else if (path === '/' || path.includes('home.html')) {
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

const scanStyle = document.createElement('style');
scanStyle.innerHTML = `
@keyframes scan {
    0% { transform: translateY(0); }
    50% { transform: translateY(176px); }
    100% { transform: translateY(0); }
}
`;
document.head.appendChild(scanStyle);

// Global checkout expose for simplicity in this prototype
window.checkout = () => {
    const cart = JSON.parse(localStorage.getItem('stadiumFlow_cart') || '[]');
    if (cart.length === 0) {
        showToast("⚠️ Your cart is empty!");
        return;
    }
    
    // Hide Cart Drawer
    const cartDrawer = document.getElementById('cartDrawerOverlay');
    if (cartDrawer) cartDrawer.classList.add('hidden');

    // Show Payment Modal
    renderPaymentSelection();
};

window.renderPaymentSelection = () => {
    const overlay = document.getElementById('paymentModalOverlay');
    const modal = document.getElementById('paymentModal');
    if (!overlay || !modal) return;

    overlay.classList.remove('hidden');
    overlay.classList.add('flex');

    modal.innerHTML = `
        <div class="p-8">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-2xl font-black tracking-tighter text-white">Payment Method</h2>
                <button onclick="closePaymentModal()" class="text-muted hover:text-white text-xl transition-colors"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <div class="space-y-4">
                <!-- Cash Option -->
                <button onclick="processCashPayment()" class="w-full glass-panel p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group flex items-center gap-6 text-left">
                    <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <i class="fa-solid fa-money-bill-wave"></i>
                    </div>
                    <div>
                        <h3 class="text-white font-bold text-lg mb-1">Pay with Cash</h3>
                        <p class="text-[0.7rem] text-slate-400 font-medium">Pay at counter during pickup</p>
                    </div>
                    <i class="fa-solid fa-chevron-right ml-auto text-muted group-hover:text-emerald-500 transition-colors"></i>
                </button>

                <!-- QR Option -->
                <button onclick="renderQRPayment()" class="w-full glass-panel p-6 rounded-2xl border border-white/5 hover:border-accent/30 hover:bg-accent/5 transition-all group flex items-center gap-6 text-left">
                    <div class="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,229,255,0.1)] group-hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                        <i class="fa-solid fa-qrcode"></i>
                    </div>
                    <div>
                        <h3 class="text-white font-bold text-lg mb-1">Pay via QR Code</h3>
                        <p class="text-[0.7rem] text-slate-400 font-medium">Scan & Pay using any UPI app</p>
                    </div>
                    <i class="fa-solid fa-chevron-right ml-auto text-muted group-hover:text-emerald-500 transition-colors"></i>
                </button>
            </div>
        </div>
    `;
};

window.closePaymentModal = () => {
    const overlay = document.getElementById('paymentModalOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
    }
};

window.processCashPayment = () => {
    const orderId = 'SF' + Math.floor(Math.random() * 1000000);
    renderOrderSuccess(orderId, "Order placed successfully. Please pay at the counter.");
};

window.renderQRPayment = () => {
    const modal = document.getElementById('paymentModal');
    if (!modal) return;

    modal.innerHTML = `
        <div class="p-8 flex flex-col items-center text-center animate-fade-in">
            <div class="flex justify-between items-center w-full mb-6">
                <button onclick="renderPaymentSelection()" class="text-muted hover:text-white transition-colors text-lg"><i class="fa-solid fa-arrow-left"></i></button>
                <h2 class="text-xl font-black tracking-tighter text-white">UPI Payment</h2>
                <button onclick="closePaymentModal()" class="text-muted hover:text-white transition-colors text-lg"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <p class="text-[0.75rem] text-slate-400 mb-8 font-medium">Scan this QR to pay via any UPI app</p>
            
            <!-- Animated QR Container -->
            <div class="relative w-48 h-48 mb-8 p-4 bg-white rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.15)] flex items-center justify-center group overflow-hidden border-2 border-white">
                <!-- Scanner Line Animation -->
                <div class="absolute top-0 left-0 w-full h-1.5 bg-[#00e5ff] shadow-[0_0_20px_#00e5ff] animate-[scan_2s_ease-in-out_infinite] z-10"></div>
                <!-- Dummy QR Pattern -->
                <div class="w-full h-full grid grid-cols-5 grid-rows-5 gap-1 opacity-90">
                    <div class="col-span-2 row-span-2 border-[5px] border-black rounded-lg p-1"><div class="w-full h-full bg-black rounded-sm"></div></div>
                    <div class="col-start-4 col-span-2 row-span-2 border-[5px] border-black rounded-lg p-1"><div class="w-full h-full bg-black rounded-sm"></div></div>
                    <div class="col-span-2 row-start-4 row-span-2 border-[5px] border-black rounded-lg p-1"><div class="w-full h-full bg-black rounded-sm"></div></div>
                    
                    <div class="col-start-3 row-start-1 bg-black rounded-sm"></div>
                    <div class="col-start-3 row-start-2 bg-black rounded-sm"></div>
                    <div class="col-start-1 row-start-3 bg-black rounded-sm"></div>
                    <div class="col-start-2 row-start-3 bg-black rounded-sm"></div>
                    <div class="col-start-4 row-start-3 bg-black rounded-sm"></div>
                    <div class="col-start-5 row-start-3 bg-black rounded-sm"></div>
                    <div class="col-start-3 row-start-4 bg-black rounded-sm"></div>
                    <div class="col-start-4 row-start-4 bg-black rounded-sm"></div>
                    <div class="col-start-5 row-start-4 bg-black rounded-sm"></div>
                    <div class="col-start-3 row-start-5 bg-black rounded-sm"></div>
                    <div class="col-start-4 row-start-5 bg-black rounded-sm"></div>
                </div>
            </div>
            
            <p class="text-[0.65rem] text-accent/80 font-bold uppercase tracking-widest mb-8 border border-accent/20 bg-accent/5 px-4 py-2 rounded-lg">This is a demo payment (no real transaction)</p>
            
            <button id="simulatePaymentBtn" onclick="simulatePaymentProcess()" class="btn btn-primary w-full py-4 text-xs font-black shadow-[0_15px_30px_rgba(0,229,255,0.25)] flex items-center justify-center gap-3 transition-all">
                <span>SIMULATE PAYMENT</span>
                <i class="fa-solid fa-bolt text-dark"></i>
            </button>
        </div>
    `;
};

window.simulatePaymentProcess = () => {
    const btn = document.getElementById('simulatePaymentBtn');
    if(btn) {
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin text-lg"></i> <span class="ml-2">Processing...</span>`;
        btn.classList.add('opacity-80', 'cursor-not-allowed');
        btn.disabled = true;
    }
    
    // Simulate network delay
    setTimeout(() => {
        const orderId = 'SF' + Math.floor(Math.random() * 1000000);
        renderOrderSuccess(orderId, "Payment Successful ✅", true);
    }, 2500);
};

window.renderOrderSuccess = async (orderId, message, isPaid = false) => {
    const modal = document.getElementById('paymentModal');
    if (!modal) return;
    
    // Get cart items before deleting
    const cart = JSON.parse(localStorage.getItem('stadiumFlow_cart') || '[]');
    
    const icon = isPaid ? '<i class="fa-solid fa-circle-check text-6xl text-emerald-500 mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]"></i>' 
                        : '<i class="fa-solid fa-receipt text-6xl text-accent mb-6 drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]"></i>';

    // Build smart pickup message
    let pickupContent = '';
    if (cart.length > 0) {
        try {
            const { shops } = await import('./menu.js');
            const shopMap = {};
            shops.forEach(s => shopMap[s.id] = s.shopName);
            
            const grouped = {};
            cart.forEach(item => {
                if(!grouped[item.shopId]) grouped[item.shopId] = [];
                grouped[item.shopId].push(item.name);
            });
            
            pickupContent = `<div class="mt-5 pt-5 border-t border-white/10 w-full text-left">
                <p class="text-[0.65rem] text-muted font-black uppercase tracking-widest mb-4 flex items-center gap-2"><i class="fa-solid fa-location-dot ${isPaid ? 'text-emerald-500' : 'text-accent'}"></i> Multi-Shop Pickup Plan</p>
                <ul class="space-y-4">`;
                
            for (const [sId, items] of Object.entries(grouped)) {
                const shopName = shopMap[sId] || 'Stadium Vendor';
                pickupContent += `
                    <li class="flex items-start gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        <div class="mt-1.5 w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-accent shadow-[0_0_10px_#00e5ff]'}"></div>
                        <div>
                            <p class="text-xs text-white font-bold leading-relaxed">${items.join(', ')}</p>
                            <p class="text-[0.65rem] text-slate-400 font-medium mt-0.5">from <span class="text-white/80">${shopName}</span></p>
                        </div>
                    </li>
                `;
            }
            pickupContent += `</ul></div>`;
        } catch(e) {
            console.error("Failed to load menu shops", e);
        }
    }

    if (!pickupContent) {
        pickupContent = `<p class="text-xs text-slate-400 mt-2 font-medium flex items-center gap-2">
            <i class="fa-solid fa-location-dot ${isPaid ? 'text-emerald-500' : 'text-accent'}"></i> Pickup at Designated Counters
        </p>`;
    }

    modal.innerHTML = `
        <div class="p-10 flex flex-col items-center text-center animate-fade-in">
            ${icon}
            <h2 class="text-3xl font-black tracking-tighter text-white mb-2">Order Confirmed!</h2>
            <p class="text-sm text-slate-400 font-medium mb-8">${message}</p>
            
            <div class="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 relative overflow-hidden text-left shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div class="absolute top-0 left-0 w-2 h-full ${isPaid ? 'bg-emerald-500' : 'bg-accent'}"></div>
                <div class="pl-4">
                    <p class="text-[0.65rem] text-muted font-black uppercase tracking-widest mb-1">Order ID</p>
                    <p class="text-2xl font-black text-white tracking-widest">${orderId}</p>
                    ${pickupContent}
                </div>
            </div>
            
            <p class="text-[0.65rem] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Please collect your order from the respective shop(s)</p>

            <button onclick="finishCheckout()" class="btn ${isPaid ? 'bg-emerald-500 text-dark hover:bg-emerald-400 shadow-[0_15_30px_rgba(16,185,129,0.25)]' : 'btn-primary'} w-full py-4 text-xs font-black flex items-center justify-center gap-3 transition-all group">
                <span>BACK TO HOME</span>
                <i class="fa-solid fa-house text-[0.7rem] group-hover:scale-110 transition-transform"></i>
            </button>
        </div>
    `;
    
    // Clear cart upon successful order generation
    localStorage.removeItem('stadiumFlow_cart');
    import('./food.js').then(module => {
        if(module.updateCartDrawer) module.updateCartDrawer();
    }).catch(e => console.error(e));
    updateCartCount(0);
};

window.finishCheckout = () => {
    closePaymentModal();
    showToast("Order complete. Redirecting to home...");
    setTimeout(() => {
        window.location.href = '/pages/home.html';
    }, 1000);
};
