import { fetchMultiRoutes } from './api.js';

// ─── Congestion helpers ──────────────────────────────────────────────────────

function congestionLevel(score) {
    if (score <= 15) return { label: 'Low',    text: 'text-emerald-400', badge: 'crowd-low'    };
    if (score <= 40) return { label: 'Medium', text: 'text-amber-400',   badge: 'crowd-medium' };
    return              { label: 'High',   text: 'text-red-400',     badge: 'crowd-high'   };
}

const ROUTE_META = {
    fastest:       { icon: '🚀', name: 'Fastest',       desc: 'Shortest walking distance to your seat.' },
    least_crowded: { icon: '🧘', name: 'Least Crowded', desc: 'Avoids high-congestion areas — longer but comfortable.' },
    balanced:      { icon: '⚖️', name: 'Balanced',      desc: 'Best combined score of speed and comfort.' },
};

const REC_REASON = {
    fastest:       'Shortest path — low crowd conditions detected.',
    least_crowded: 'Avoids high congestion for a smoother journey.',
    balanced:      'Best mix of walking speed and comfort right now.',
};

// ─── Entry point ─────────────────────────────────────────────────────────────

export function initNavigation() {
    const form = document.getElementById('seatForm');
    if (!form) return;

    renderState({ title: 'Ready', message: 'Choose your gate and seating section to compare route options.' });

    const savedGate = localStorage.getItem('targetGate');
    const savedSec  = localStorage.getItem('targetSection');
    if (savedGate) document.getElementById('gateSelect').value = savedGate;
    if (savedSec)  document.getElementById('sectionSelect').value = savedSec;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const g = document.getElementById('gateSelect').value;
        const s = document.getElementById('sectionSelect').value;
        localStorage.setItem('targetGate', g);
        localStorage.setItem('targetSection', s);
        renderState({ title: 'Calculating…', message: 'Analysing 3 route options across the stadium graph.' });
        await solveMultiRoute(g, s);
        window.dispatchEvent(new Event('navigationUpdate'));
    });

    if (savedGate && savedSec) {
        renderState({ title: 'Calculating…', message: 'Restoring your last saved route options.' });
        solveMultiRoute(savedGate, savedSec);
    }
}

// ─── Core resolver ───────────────────────────────────────────────────────────

async function solveMultiRoute(gate, section) {
    try {
        const data = await fetchMultiRoutes(gate, section);
        if (data && Array.isArray(data.routes) && data.routes.length > 0) {
            renderRouteCards(data);
            const rec = data.routes.find(r => r.type === data.recommended) || data.routes[0];
            window.currentOptimalPath = rec.path;
            return;
        }
    } catch (err) {
        console.error('Multi-route error:', err);
    }
    window.currentOptimalPath = null;
    renderState({ title: 'Route unavailable', message: 'Could not load route options. Please try again.', tone: 'text-amber-400' });
}

// ─── UI renderers ────────────────────────────────────────────────────────────

function renderRouteCards({ routes, recommended }) {
    const display = document.getElementById('distanceDisplay');
    if (!display) return;

    const reason = REC_REASON[recommended] || 'Smart pick for current conditions.';
    const recMeta = ROUTE_META[recommended] || { name: recommended };

    display.innerHTML = `
        <div class="rec-banner">
            <span class="rec-star">⭐</span>
            <div>
                <div class="rec-label">Recommended</div>
                <div class="rec-name">${recMeta.name}</div>
                <div class="rec-reason">${reason}</div>
            </div>
        </div>
        <div class="route-card-list">
            ${routes.map(r => buildRouteCard(r, recommended)).join('')}
        </div>
    `;

    // Wire card clicks → update canvas path
    routes.forEach(r => {
        const card = document.getElementById(`routeCard_${r.type}`);
        if (card) {
            card.addEventListener('click', () => {
                window.currentOptimalPath = r.path;
                window.dispatchEvent(new Event('navigationUpdate'));
                document.querySelectorAll('.route-option-card').forEach(c => c.classList.remove('card-selected'));
                card.classList.add('card-selected');
            });
        }
    });
}

function buildRouteCard(route, recommended) {
    const meta   = ROUTE_META[route.type] || { icon: '📍', name: route.type, desc: '' };
    const cong   = congestionLevel(route.congestion);
    const isRec  = route.type === recommended;
    const metres = Math.max(1, Math.floor(route.distance * 5));

    return `
        <div id="routeCard_${route.type}"
             class="route-option-card${isRec ? ' card-selected' : ''}"
             title="Click to preview this route on the map">

            <!-- Row 1: icon + name + recommended badge -->
            <div class="card-header">
                <div class="card-title-group">
                    <span class="card-icon">${meta.icon}</span>
                    <span class="card-name">${meta.name}</span>
                </div>
                ${isRec ? '<span class="badge-rec">⭐ Recommended</span>' : ''}
            </div>

            <!-- Row 2: crowd badge -->
            <div class="card-crowd-row">
                <span class="badge-crowd ${cong.badge}">${cong.label} Crowd</span>
                <span class="card-desc">${meta.desc}</span>
            </div>

            <!-- Row 3: metrics -->
            <div class="card-metrics">
                <div class="metric">
                    <div class="metric-label">ETA</div>
                    <div class="metric-value">${route.eta}<span class="metric-unit"> min</span></div>
                </div>
                <div class="metric">
                    <div class="metric-label">Distance</div>
                    <div class="metric-value">~${metres}<span class="metric-unit">m</span></div>
                </div>
                <div class="metric">
                    <div class="metric-label">Crowd Score</div>
                    <div class="metric-value ${cong.text}">${route.congestion}</div>
                </div>
            </div>

            <!-- Row 4: path nodes -->
            <div class="card-path">
                ${route.path.map(node => `<span class="path-node">${node}</span>`).join('<span class="path-sep">›</span>')}
            </div>
        </div>
    `;
}

function renderState({ title, message, tone = 'text-white' }) {
    const display = document.getElementById('distanceDisplay');
    if (!display) return;
    display.innerHTML = `
        <div class="state-wrapper">
            <div class="text-slate-400 text-[0.6rem] uppercase font-black tracking-widest mb-2">Guidance Status</div>
            <div class="text-lg font-black tracking-tight ${tone}">${title}</div>
            <p class="text-[0.75rem] text-slate-400 leading-relaxed mt-3">${message}</p>
        </div>
    `;
}
