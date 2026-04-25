/**
 * StoreManager — Central state management for multi-role system.
 * Uses localStorage to simulate persistent state without a backend.
 */

const KEYS = {
    ROLE: 'sf_user_role',           // 'audience' | 'admin' | 'shop_admin'
    APPROVED_SHOPS: 'sf_approved_shops',
    PENDING_REQUESTS: 'sf_pending_requests',
};

// ─── Role ────────────────────────────────────────────────
export function getRole() {
    return localStorage.getItem(KEYS.ROLE) || null;
}

export function setRole(role) {
    localStorage.setItem(KEYS.ROLE, role);
}

export function clearRole() {
    localStorage.removeItem(KEYS.ROLE);
}

// ─── Approved Shops (mirrors menu.js structure) ──────────
function _defaultApprovedShops() {
    // Import the original shops from menu.js as the baseline
    // We store a copy so admin edits don't mutate the module
    return null; // null means "use defaults from menu.js"
}

export function getApprovedShops() {
    const raw = localStorage.getItem(KEYS.APPROVED_SHOPS);
    return raw ? JSON.parse(raw) : null;
}

export function setApprovedShops(shops) {
    localStorage.setItem(KEYS.APPROVED_SHOPS, JSON.stringify(shops));
}

export function addApprovedShop(shop) {
    const { shops: defaultShops } = _getMenuDefaults();
    const current = getApprovedShops() || [...defaultShops];
    // Avoid duplicates
    if (!current.find(s => s.id === shop.id)) {
        current.push(shop);
    }
    setApprovedShops(current);
    return current;
}

export function removeApprovedShop(shopId) {
    const { shops: defaultShops } = _getMenuDefaults();
    let current = getApprovedShops() || [...defaultShops];
    current = current.filter(s => s.id !== shopId);
    setApprovedShops(current);
    return current;
}

export function addItemToApprovedShop(shopId, item) {
    const { shops: defaultShops } = _getMenuDefaults();
    const current = getApprovedShops() || JSON.parse(JSON.stringify(defaultShops));
    const shop = current.find(s => s.id === shopId);
    if (shop) {
        if (!shop.items.find(i => i.id === item.id)) {
            shop.items.push(item);
        }
        setApprovedShops(current);
    }
    return current;
}

export function removeItemFromApprovedShop(shopId, itemId) {
    const { shops: defaultShops } = _getMenuDefaults();
    const current = getApprovedShops() || JSON.parse(JSON.stringify(defaultShops));
    const shop = current.find(s => s.id === shopId);
    if (shop) {
        shop.items = shop.items.filter(i => i.id !== itemId);
        setApprovedShops(current);
    }
    return current;
}

// ─── Pending Requests ────────────────────────────────────
export function getPendingRequests() {
    const raw = localStorage.getItem(KEYS.PENDING_REQUESTS);
    return raw ? JSON.parse(raw) : [];
}

export function savePendingRequests(requests) {
    localStorage.setItem(KEYS.PENDING_REQUESTS, JSON.stringify(requests));
}

/**
 * @param {Object} request
 * @param {string} request.type — 'shop' | 'item'
 * @param {Object} request.data — shop object or { shopId, item }
 */
export function addRequest(request) {
    const requests = getPendingRequests();
    requests.push({
        id: 'REQ_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        type: request.type,
        data: request.data,
        status: 'pending', // pending | approved | rejected
        createdAt: new Date().toISOString(),
    });
    savePendingRequests(requests);
    return requests;
}

export function updateRequestStatus(requestId, newStatus) {
    const requests = getPendingRequests();
    const req = requests.find(r => r.id === requestId);
    if (req) {
        req.status = newStatus;
        savePendingRequests(requests);
    }
    return requests;
}

// ─── Helpers ─────────────────────────────────────────────
let _menuCache = null;

function _getMenuDefaults() {
    // We can't async import here so we cache on first use
    if (_menuCache) return _menuCache;
    // This will be populated by whoever calls initStoreWithDefaults
    return { shops: [] };
}

/**
 * Call once on page load so the store knows about the default menu.
 * @param {Array} defaultShops — the shops array from menu.js
 */
export function initStoreWithDefaults(defaultShops) {
    _menuCache = { shops: defaultShops };
}
