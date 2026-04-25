import { shops } from './menu.js';
import {
    getApprovedShops, setApprovedShops,
    getPendingRequests, updateRequestStatus,
    addApprovedShop, addItemToApprovedShop,
    removeApprovedShop, removeItemFromApprovedShop,
    initStoreWithDefaults, clearRole
} from './storeManager.js';

import { getRole } from './storeManager.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!getRole()) {
        window.location.href = '/pages/role-select.html';
        return;
    }
    
    initStoreWithDefaults(shops);
    initNavigation();
    renderShops();
    renderRequests();
    setupAddShop();
    setupItemModal();
});

// ─── Navigation & SPA Loading ────────────────────────────
const loadedSections = {};
let pollingInterval = null;

async function loadSectionContent(url, containerId, callback) {
    if (loadedSections[containerId]) {
        if (callback) callback();
        return;
    }
    try {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const mainContent = doc.querySelector('main');
        if (mainContent) {
            document.getElementById(containerId).innerHTML = mainContent.innerHTML;
            loadedSections[containerId] = true;
            if (callback) callback();
        }
    } catch (e) {
        console.error('Failed to load', url, e);
    }
}

function initNavigation() {
    const handleHash = async () => {
        const hash = window.location.hash || '#admin-dashboard';
        
        // Hide all admin sections
        document.querySelectorAll('.admin-section').forEach(c => c.classList.add('hidden'));
        
        // Hide/Show the admin header 
        const header = document.getElementById('adminHeader');
        if (['#manage-shops', '#requests'].includes(hash)) {
            if (header) header.classList.remove('hidden');
        } else {
            if (header) header.classList.add('hidden');
        }

        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }

        if (hash === '#requests') {
            const reqTab = document.getElementById('requests');
            if (reqTab) reqTab.classList.remove('hidden');
            renderRequests();
        } else if (hash === '#manage-shops') {
            const shopsTab = document.getElementById('manage-shops');
            if (shopsTab) shopsTab.classList.remove('hidden');
            renderShops();
        } else if (hash === '#admin-home') {
            const homeTab = document.getElementById('admin-home');
            if (homeTab) homeTab.classList.remove('hidden');
            await loadSectionContent('/pages/home.html', 'admin-home', async () => {
                const { initLiveScore } = await import('./liveScore.js');
                initLiveScore();
            });
        } else if (hash === '#admin-dashboard') {
            const dashTab = document.getElementById('admin-dashboard');
            if (dashTab) dashTab.classList.remove('hidden');
            await loadSectionContent('/pages/dashboard.html', 'admin-dashboard', async () => {
                const { initDashboard, updateDashboard } = await import('./dashboard.js');
                const { fetchCrowdData } = await import('./api.js');
                const { initClock } = await import('./utils.js');
                initClock();
                const data = await fetchCrowdData();
                initDashboard(data);
                pollingInterval = setInterval(async () => {
                    const newData = await fetchCrowdData();
                    if(newData) updateDashboard(newData);
                }, 8000);
            });
        } else if (hash === '#admin-heatmap') {
            const heatTab = document.getElementById('admin-heatmap');
            if (heatTab) heatTab.classList.remove('hidden');
            await loadSectionContent('/pages/heatmap.html', 'admin-heatmap', async () => {
                const { startCanvasAnimation, updateHeatmapData } = await import('./heatmap.js');
                const { fetchCrowdData } = await import('./api.js');
                const { initClock } = await import('./utils.js');
                initClock();
                const data = await fetchCrowdData();
                startCanvasAnimation('heatmapCanvas', 'heatmap', data);
                pollingInterval = setInterval(async () => {
                    const newData = await fetchCrowdData();
                    if(newData) updateHeatmapData(newData);
                }, 8000);
            });
        }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
}

// ─── Render Shops ────────────────────────────────────────
function renderShops() {
    const grid = document.getElementById('adminShopsGrid');
    if (!grid) return;
    const current = getApprovedShops() || JSON.parse(JSON.stringify(shops));
    grid.innerHTML = '';

    current.forEach(shop => {
        const card = document.createElement('div');
        card.className = 'glass-panel p-6 rounded-2xl border border-white/5';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-2xl">${shop.icon || '🏪'}</div>
                    <div>
                        <h3 class="text-lg font-bold text-white tracking-tight">${shop.shopName}</h3>
                        <p class="text-[0.65rem] text-slate-400 font-medium">${shop.tagline || ''}</p>
                    </div>
                </div>
                <button data-delete-shop="${shop.id}" class="text-red-500/60 hover:text-red-500 transition-colors text-sm" title="Delete Shop">
                    <i class="fa-solid fa-trash pointer-events-none"></i>
                </button>
            </div>
            <div class="mb-4">
                <p class="text-[0.6rem] text-muted font-black uppercase tracking-widest mb-3">${shop.items.length} Items</p>
                <div class="space-y-2 max-h-40 overflow-y-auto">
                    ${shop.items.map(item => `
                        <div class="flex justify-between items-center py-2 px-3 bg-white/[0.02] rounded-lg border border-white/5 group">
                            <span class="text-xs text-white font-medium flex items-center gap-2">${item.icon || ''} ${item.name}</span>
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-accent font-bold">₹${item.price}</span>
                                <button data-delete-item="${item.id}" data-shop-id="${shop.id}" class="text-red-500/40 hover:text-red-500 transition-colors text-[10px] opacity-0 group-hover:opacity-100">
                                    <i class="fa-solid fa-xmark pointer-events-none"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <button data-add-item-to="${shop.id}" class="btn w-full py-2.5 text-[0.6rem] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-slate-400 hover:border-accent/30 hover:text-accent transition-all rounded-xl">
                <i class="fa-solid fa-plus mr-2"></i> Add Item
            </button>
        `;
        grid.appendChild(card);
    });

    // Delete shop handlers
    grid.querySelectorAll('[data-delete-shop]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const shopId = e.currentTarget.getAttribute('data-delete-shop');
            removeApprovedShop(shopId);
            renderShops();
        });
    });

    // Delete item handlers
    grid.querySelectorAll('[data-delete-item]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = parseInt(e.currentTarget.getAttribute('data-delete-item'));
            const shopId = e.currentTarget.getAttribute('data-shop-id');
            removeItemFromApprovedShop(shopId, itemId);
            renderShops();
        });
    });

    // Add item modal triggers
    grid.querySelectorAll('[data-add-item-to]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const shopId = e.currentTarget.getAttribute('data-add-item-to');
            document.getElementById('modalShopId').value = shopId;
            document.getElementById('addItemModal').classList.remove('hidden');
        });
    });
}

// ─── Add Shop (Admin direct) ─────────────────────────────
function setupAddShop() {
    const btn = document.getElementById('adminAddShopBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const name = document.getElementById('adminShopName').value.trim();
        const tagline = document.getElementById('adminShopTagline').value.trim();
        const icon = document.getElementById('adminShopIcon').value.trim() || '🏪';
        if (!name) return;

        const newShop = {
            id: 'shop_' + Date.now(),
            shopName: name,
            tagline: tagline,
            category: 'Custom',
            icon: icon,
            themeBg: 'group-hover:bg-accent/10',
            themeText: 'group-hover:text-accent',
            crowd: 'LOW CROWD',
            items: []
        };
        addApprovedShop(newShop);
        document.getElementById('adminShopName').value = '';
        document.getElementById('adminShopTagline').value = '';
        document.getElementById('adminShopIcon').value = '';
        renderShops();
    });
}

// ─── Item Modal ──────────────────────────────────────────
function setupItemModal() {
    const modal = document.getElementById('addItemModal');
    const closeBtn = document.getElementById('closeItemModal');
    const addBtn = document.getElementById('modalAddItemBtn');

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const shopId = document.getElementById('modalShopId').value;
            const name = document.getElementById('modalItemName').value.trim();
            const price = parseInt(document.getElementById('modalItemPrice').value);
            const icon = document.getElementById('modalItemIcon').value.trim() || '🍽️';
            if (!name || !price) return;

            const newItem = {
                id: Date.now() + Math.floor(Math.random() * 100),
                name, price, icon
            };
            addItemToApprovedShop(shopId, newItem);
            document.getElementById('modalItemName').value = '';
            document.getElementById('modalItemPrice').value = '';
            document.getElementById('modalItemIcon').value = '';
            modal.classList.add('hidden');
            renderShops();
        });
    }
}

// ─── Render Requests ─────────────────────────────────────
function renderRequests() {
    const list = document.getElementById('requestsList');
    const noReq = document.getElementById('noRequests');
    const badge = document.getElementById('requestBadge');
    if (!list) return;

    const requests = getPendingRequests();
    const pending = requests.filter(r => r.status === 'pending');

    if (badge) {
        if (pending.length > 0) {
            badge.textContent = pending.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    if (requests.length === 0) {
        list.classList.add('hidden');
        noReq.classList.remove('hidden');
        return;
    }

    list.classList.remove('hidden');
    noReq.classList.add('hidden');
    list.innerHTML = '';

    requests.forEach(req => {
        const card = document.createElement('div');
        card.className = 'glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center gap-4 justify-between';

        let statusBadge = '';
        if (req.status === 'pending') statusBadge = '<span class="badge badge-warning text-[9px]"><i class="fa-solid fa-clock mr-1"></i> Pending</span>';
        else if (req.status === 'approved') statusBadge = '<span class="badge badge-success text-[9px]"><i class="fa-solid fa-check mr-1"></i> Approved</span>';
        else statusBadge = '<span class="badge badge-danger text-[9px]"><i class="fa-solid fa-xmark mr-1"></i> Rejected</span>';

        let details = '';
        if (req.type === 'shop') {
            details = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl">${req.data.icon || '🏪'}</div>
                    <div>
                        <p class="text-white font-bold text-sm">${req.data.shopName}</p>
                        <p class="text-[0.6rem] text-slate-400">New Shop Request · ${req.data.tagline || ''}</p>
                    </div>
                </div>
            `;
        } else if (req.type === 'item') {
            details = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl">${req.data.item.icon || '🍽️'}</div>
                    <div>
                        <p class="text-white font-bold text-sm">${req.data.item.name} — ₹${req.data.item.price}</p>
                        <p class="text-[0.6rem] text-slate-400">Item Request for <span class="text-accent">${req.data.shopName || req.data.shopId}</span></p>
                    </div>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="flex-1">${details}</div>
            <div class="flex items-center gap-3">
                ${statusBadge}
                ${req.status === 'pending' ? `
                    <button data-approve="${req.id}" class="btn px-4 py-2 text-[0.6rem] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-all">
                        <i class="fa-solid fa-check mr-1"></i> Approve
                    </button>
                    <button data-reject="${req.id}" class="btn px-4 py-2 text-[0.6rem] font-black bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 rounded-lg transition-all">
                        <i class="fa-solid fa-xmark mr-1"></i> Reject
                    </button>
                ` : ''}
            </div>
        `;
        list.appendChild(card);
    });

    // Approve handlers
    list.querySelectorAll('[data-approve]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reqId = e.currentTarget.getAttribute('data-approve');
            const req = requests.find(r => r.id === reqId);
            if (req) {
                updateRequestStatus(reqId, 'approved');
                // Actually add the shop/item to approved list
                if (req.type === 'shop') {
                    addApprovedShop(req.data);
                } else if (req.type === 'item') {
                    addItemToApprovedShop(req.data.shopId, req.data.item);
                }
                renderRequests();
                renderShops();
            }
        });
    });

    // Reject handlers
    list.querySelectorAll('[data-reject]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reqId = e.currentTarget.getAttribute('data-reject');
            updateRequestStatus(reqId, 'rejected');
            renderRequests();
        });
    });
}


