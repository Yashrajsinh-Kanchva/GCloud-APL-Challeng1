import { shops } from './menu.js';
import {
    getApprovedShops,
    getPendingRequests,
    addRequest,
    initStoreWithDefaults,
    clearRole
} from './storeManager.js';

import { getRole } from './storeManager.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!getRole()) {
        window.location.href = '/pages/role-select.html';
        return;
    }
    
    initStoreWithDefaults(shops);
    initNavigation();
    populateShopSelect();
    setupShopSubmit();
    setupItemSubmit();
    renderStatus();
});

// ─── Navigation ──────────────────────────────────────────
function initNavigation() {
    const handleHash = () => {
        const hash = window.location.hash || '#register';
        document.querySelectorAll('.sa-tab-content').forEach(c => c.classList.add('hidden'));
        
        if (hash === '#items') {
            const tab = document.getElementById('tabItems');
            if (tab) tab.classList.remove('hidden');
            populateShopSelect();
        } else if (hash === '#status') {
            const tab = document.getElementById('tabStatus');
            if (tab) tab.classList.remove('hidden');
            renderStatus();
        } else {
            // Default to register
            const tab = document.getElementById('tabRegister');
            if (tab) tab.classList.remove('hidden');
        }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
}

// ─── Populate Shop Select ────────────────────────────────
function populateShopSelect() {
    const select = document.getElementById('saItemShopSelect');
    if (!select) return;
    const current = getApprovedShops() || shops;
    select.innerHTML = '<option value="" class="bg-[#02040a]">Select Shop...</option>';
    current.forEach(shop => {
        const opt = document.createElement('option');
        opt.value = shop.id;
        opt.textContent = `${shop.icon || ''} ${shop.shopName}`;
        opt.className = 'bg-[#02040a]';
        select.appendChild(opt);
    });
}

// ─── Submit Shop Request ─────────────────────────────────
function setupShopSubmit() {
    const btn = document.getElementById('saSubmitShopBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const name = document.getElementById('saShopName').value.trim();
        const tagline = document.getElementById('saShopTagline').value.trim();
        const category = document.getElementById('saShopCategory').value.trim();
        const icon = document.getElementById('saShopIcon').value.trim() || '🏪';
        if (!name) return;

        const newShop = {
            id: 'shop_' + Date.now(),
            shopName: name,
            tagline: tagline,
            category: category || 'Custom',
            icon: icon,
            themeBg: 'group-hover:bg-accent/10',
            themeText: 'group-hover:text-accent',
            crowd: 'LOW CROWD',
            items: []
        };

        addRequest({ type: 'shop', data: newShop });

        // Clear form
        document.getElementById('saShopName').value = '';
        document.getElementById('saShopTagline').value = '';
        document.getElementById('saShopCategory').value = '';
        document.getElementById('saShopIcon').value = '';

        // Visual feedback
        btn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> REQUEST SENT';
        btn.classList.add('opacity-70');
        setTimeout(() => {
            btn.innerHTML = 'SUBMIT REQUEST <i class="fa-solid fa-paper-plane ml-2"></i>';
            btn.classList.remove('opacity-70');
        }, 2000);
    });
}

// ─── Submit Item Request ─────────────────────────────────
function setupItemSubmit() {
    const btn = document.getElementById('saSubmitItemBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const shopId = document.getElementById('saItemShopSelect').value;
        const name = document.getElementById('saItemName').value.trim();
        const price = parseInt(document.getElementById('saItemPrice').value);
        const icon = document.getElementById('saItemIcon').value.trim() || '🍽️';
        if (!shopId || !name || !price) return;

        const current = getApprovedShops() || shops;
        const shop = current.find(s => s.id === shopId);

        addRequest({
            type: 'item',
            data: {
                shopId: shopId,
                shopName: shop ? shop.shopName : shopId,
                item: {
                    id: Date.now() + Math.floor(Math.random() * 100),
                    name, price, icon
                }
            }
        });

        // Clear form
        document.getElementById('saItemName').value = '';
        document.getElementById('saItemPrice').value = '';
        document.getElementById('saItemIcon').value = '';

        // Visual feedback
        btn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> REQUEST SENT';
        btn.classList.add('opacity-70');
        setTimeout(() => {
            btn.innerHTML = 'SUBMIT ITEM REQUEST <i class="fa-solid fa-paper-plane ml-2"></i>';
            btn.classList.remove('opacity-70');
        }, 2000);
    });
}

// ─── Render Status ───────────────────────────────────────
function renderStatus() {
    const list = document.getElementById('saStatusList');
    const noReq = document.getElementById('saNoRequests');
    if (!list) return;

    const requests = getPendingRequests();

    if (requests.length === 0) {
        list.classList.add('hidden');
        noReq.classList.remove('hidden');
        return;
    }

    list.classList.remove('hidden');
    noReq.classList.add('hidden');
    list.innerHTML = '';

    // Show newest first
    [...requests].reverse().forEach(req => {
        const card = document.createElement('div');
        card.className = 'glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center gap-4 justify-between';

        let statusBadge = '';
        let statusGlow = '';
        if (req.status === 'pending') {
            statusBadge = '<span class="badge badge-warning text-[9px]"><i class="fa-solid fa-clock mr-1"></i> Pending</span>';
            statusGlow = 'border-l-4 border-l-amber-500';
        } else if (req.status === 'approved') {
            statusBadge = '<span class="badge badge-success text-[9px]"><i class="fa-solid fa-check mr-1"></i> Approved</span>';
            statusGlow = 'border-l-4 border-l-emerald-500';
        } else {
            statusBadge = '<span class="badge badge-danger text-[9px]"><i class="fa-solid fa-xmark mr-1"></i> Rejected</span>';
            statusGlow = 'border-l-4 border-l-red-500';
        }

        card.classList.add(...statusGlow.split(' '));

        let details = '';
        if (req.type === 'shop') {
            details = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl">${req.data.icon || '🏪'}</div>
                    <div>
                        <p class="text-white font-bold text-sm">${req.data.shopName}</p>
                        <p class="text-[0.6rem] text-slate-400">Shop Registration · ${req.data.category || ''}</p>
                    </div>
                </div>
            `;
        } else if (req.type === 'item') {
            details = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl">${req.data.item.icon || '🍽️'}</div>
                    <div>
                        <p class="text-white font-bold text-sm">${req.data.item.name} — ₹${req.data.item.price}</p>
                        <p class="text-[0.6rem] text-slate-400">Item for <span class="text-emerald-400">${req.data.shopName || req.data.shopId}</span></p>
                    </div>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="flex-1">${details}</div>
            <div>${statusBadge}</div>
        `;
        list.appendChild(card);
    });
}


