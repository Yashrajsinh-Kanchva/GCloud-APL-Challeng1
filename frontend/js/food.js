import { menuItems, shops } from './menu.js';
import { updateCartCount } from './main.js';
import { getApprovedShops, initStoreWithDefaults } from './storeManager.js';

let cart = [];

function getActiveShops() {
    return getApprovedShops() || shops;
}

function getActiveMenuItems() {
    const active = getActiveShops();
    return active.flatMap(shop => 
        shop.items.map(item => ({ ...item, shopId: shop.id }))
    );
}

export function initFoodMenu() {
    initStoreWithDefaults(shops);
    renderShopCards();

    const backBtn = document.getElementById('backToShopsBtn');
    const shopCardsContainer = document.getElementById('shopCardsContainer');
    const itemsViewContainer = document.getElementById('itemsViewContainer');
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            itemsViewContainer.classList.add('hidden');
            shopCardsContainer.classList.remove('hidden');
        });
    }

    // Dynamic Crowd Updater
    setInterval(() => {
        const statuses = ['HIGH CROWD', 'MED CROWD', 'LOW CROWD'];
        shops.forEach(shop => {
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const badgeContainer = document.getElementById(`crowd-badge-${shop.id}`);
            if(badgeContainer) {
                // Add a small scale bump for transition effect
                badgeContainer.style.transform = 'scale(1.1)';
                setTimeout(() => { if (badgeContainer) badgeContainer.style.transform = 'scale(1)'; }, 300);
                badgeContainer.innerHTML = getCrowdHTML(newStatus);
            }
        });
    }, 8500);
}

function getCrowdHTML(status) {
    if (status === 'HIGH CROWD') {
        return `<span class="badge-danger text-[10px] px-2 py-1 rounded-md flex items-center gap-1 border border-red-500/20 bg-red-500/10 text-red-500 font-bold tracking-widest transition-all duration-300"><span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> HIGH CROWD</span>`;
    } else if (status === 'MED CROWD') {
        return `<span class="text-[10px] px-2 py-1 rounded-md flex items-center gap-1 border border-amber-500/20 bg-amber-500/10 text-amber-500 font-bold tracking-widest transition-all duration-300"><span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> MED CROWD</span>`;
    } else {
        return `<span class="text-[10px] px-2 py-1 rounded-md flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 font-bold tracking-widest transition-all duration-300"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> LOW CROWD</span>`;
    }
}

function renderShopCards() {
    const shopCardsContainer = document.getElementById('shopCardsContainer');
    if (!shopCardsContainer) return;
    
    shopCardsContainer.innerHTML = '';
    
    getActiveShops().forEach(shop => {
        const btn = document.createElement('button');
        btn.className = 'shop-card glass-panel p-6 rounded-2xl flex flex-col items-start shadow-md hover:shadow-2xl hover:scale-105 transition-all group outline-none border border-white/5 w-full text-left';
        btn.setAttribute('data-shop', shop.id);
        
        btn.innerHTML = `
            <div class="flex justify-between items-start w-full mb-4">
                <div class="w-14 h-14 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-3xl ${shop.themeBg} transition-colors">${shop.icon}</div>
                <div id="crowd-badge-${shop.id}" class="transition-transform duration-300">${getCrowdHTML(shop.crowd)}</div>
            </div>
            <h3 class="text-xl font-bold tracking-tight text-white mb-1 ${shop.themeText} transition-colors">${shop.shopName}</h3>
            <p class="text-[0.75rem] text-secondary font-medium tracking-wide">${shop.tagline}</p>
        `;
        
        btn.addEventListener('click', () => {
            openShop(shop);
        });
        
        shopCardsContainer.appendChild(btn);
    });
}

function openShop(shop) {
    const shopCardsContainer = document.getElementById('shopCardsContainer');
    const itemsViewContainer = document.getElementById('itemsViewContainer');
    const currentShopTitle = document.getElementById('currentShopTitle');
    
    shopCardsContainer.classList.add('hidden');
    itemsViewContainer.classList.remove('hidden');
    
    if (currentShopTitle) {
        currentShopTitle.textContent = shop.shopName;
    }
    
    renderShopItems(shop);
}

export function renderShopItems(shop) {
    const grid = document.getElementById('productGrid');
    if(!grid) return;
    grid.innerHTML = '';
    
    const shopItems = shop.items;
    if (shopItems.length === 0) return;

    shopItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'glass-panel p-6 flex flex-col items-center text-center group bg-white/[0.01] hover:bg-white/[0.03] transition-all hover:-translate-y-1';
        div.innerHTML = `
            <div class="w-full h-32 bg-[#02040a]/40 rounded-2xl flex items-center justify-center text-6xl mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner border border-white/5">
                ${item.icon}
            </div>
            <div class="text-[0.6rem] text-accent font-black tracking-[0.2em] mb-1 uppercase opacity-60">${shop.shopName}</div>
            <h3 class="text-white font-bold text-lg mb-1">${item.name}</h3>
            <p class="text-slate-400 text-xs mb-6">Fresh from the counter</p>
            <div class="flex items-center justify-between w-full mt-auto pt-4 border-t border-white/5">
                <span class="text-xl font-black text-white">₹${item.price}</span>
                <button class="add-to-cart-btn w-10 h-10 rounded-xl bg-accent text-dark flex items-center justify-center hover:scale-110 transition-transform shadow-[0_4px_15px_rgba(0,229,255,0.2)]" data-id="${item.id}">
                    <i class="fa-solid fa-plus pointer-events-none"></i>
                </button>
            </div>
        `;
        grid.appendChild(div);
    });

    // Add cart listeners
    grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            addToCart(id, e.currentTarget);
        });
    });
}

function addToCart(id, btn) {
    const item = getActiveMenuItems().find(i => i.id === id);
    const existing = cart.find(i => i.id === id);
    if(existing) existing.qty += 1;
    else cart.push({...item, qty: 1});
    
    // Animation feedback
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.classList.replace('bg-accent', 'bg-emerald-500');
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
            btn.classList.replace('bg-emerald-500', 'bg-accent');
        }, 1000);
    }
    
    localStorage.setItem('stadiumFlow_cart', JSON.stringify(cart));
    updateCartCount(cart.reduce((sum, item) => sum + item.qty, 0));
    updateCartDrawer();
}

export function updateCartDrawer() {
    const cartItems = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotal');
    if(!cartItems) return;
    
    const saved = localStorage.getItem('stadiumFlow_cart');
    if(saved) cart = JSON.parse(saved);

    cartItems.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="flex flex-col items-center justify-center h-48 opacity-20">
                <i class="fa-solid fa-basket-shopping text-6xl mb-4"></i>
                <p class="font-bold uppercase tracking-widest text-xs">Cart is Empty</p>
            </div>
        `;
        totalEl.textContent = `$0.00`;
        return;
    }

    cart.forEach(item => {
        total += item.price * item.qty;
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center py-4 group animate-fade-in';
        div.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl">${item.icon}</div>
                <div>
                    <h4 class="text-white font-bold text-sm tracking-tight">${item.name}</h4>
                    <p class="text-slate-500 text-[0.7rem] font-bold uppercase tracking-widest">₹${item.price}</p>
                </div>
            </div>
            <div class="flex items-center gap-4 bg-white/[0.03] p-1 rounded-xl border border-white/5">
                <button class="w-6 h-6 rounded-lg text-slate-500 hover:text-white" onclick="changeQty(${item.id}, -1)">-</button>
                <span class="text-white font-bold text-xs w-4 text-center">${item.qty}</span>
                <button class="w-6 h-6 rounded-lg text-slate-500 hover:text-white" onclick="changeQty(${item.id}, 1)">+</button>
            </div>
        `;
        cartItems.appendChild(div);
    });
    
    totalEl.textContent = `₹${total.toFixed(2)}`;
}

window.changeQty = (id, delta) => {
    const existing = cart.find(i => i.id === id);
    if(!existing) return;
    existing.qty += delta;
    if(existing.qty <= 0) cart = cart.filter(i => i.id !== id);
    localStorage.setItem('stadiumFlow_cart', JSON.stringify(cart));
    updateCartCount(cart.reduce((sum, item) => sum + item.qty, 0));
    updateCartDrawer();
};
