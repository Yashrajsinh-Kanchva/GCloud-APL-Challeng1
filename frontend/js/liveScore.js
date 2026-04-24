export function initLiveScore() {
    const container = document.getElementById('liveMatchContainer');
    const contentDiv = document.getElementById('liveMatchContent');
    const lastUpdatedLabel = document.getElementById('lastUpdatedLabel');
    if (!container || !contentDiv) return;

    let secondsSinceUpdate = 0;
    
    // Timer interval ID
    let secInterval = null;

    const fetchScore = async () => {
        try {
            contentDiv.classList.add('opacity-50', 'transition-opacity', 'duration-300'); // subtle loading state
            const res = await fetch('/api/live-score');
            if (res.ok) {
                const data = await res.json();
                renderScore(data, container, contentDiv);
                secondsSinceUpdate = 0;
            } else {
                renderError(contentDiv);
            }
        } catch (e) {
            console.error("Live scoreboard error:", e);
            renderError(contentDiv);
        } finally {
            contentDiv.classList.remove('opacity-50');
        }
    };

    const renderScore = (data, container, contentDiv) => {
        // Status styling map
        let badgeClass = 'badge-danger text-red-500 border border-red-500/20 bg-red-500/10';
        let statusCircle = '<span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>';
        let borderClass = 'border-l-red-500';
        
        const statLower = (data.status || '').toLowerCase();
        
        if (statLower.includes('upcoming')) {
            badgeClass = 'text-amber-500 border border-amber-500/20 bg-amber-500/10';
            statusCircle = '<span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>';
            borderClass = 'border-l-amber-500';
        } else if (statLower.includes('finished') || statLower.includes('won')) {
            badgeClass = 'bg-white/10 text-gray-300 border border-white/20';
            statusCircle = '<span class="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>';
            borderClass = 'border-l-gray-500';
        }

        // Apply border color 
        container.classList.remove('border-l-red-500', 'border-l-amber-500', 'border-l-gray-500', 'border-l-white/20');
        container.classList.add(borderClass);

        // Header (Status)
        const headerStatus = container.querySelector('#liveStatusBadge');
        if (headerStatus) {
            headerStatus.className = `text-[0.55rem] font-bold tracking-widest uppercase px-2 py-1 flex items-center gap-1.5 rounded-full ${badgeClass}`;
            headerStatus.innerHTML = `${statusCircle} ${data.status.toUpperCase()}`;
        }

        contentDiv.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <div class="text-xl font-black text-white tracking-tight">${data.teamA} <span class="text-sm font-medium text-secondary mx-1">vs</span> ${data.teamB}</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mt-3">
                <div class="flex flex-col">
                    <span class="text-[0.65rem] uppercase tracking-widest text-muted mb-0.5">${data.teamA}</span>
                    <div class="font-bold text-accent text-xl leading-none">${data.scoreA}</div>
                </div>
                <div class="flex flex-col items-end">
                    <span class="text-[0.65rem] uppercase tracking-widest text-muted mb-0.5">${data.teamB}</span>
                    <div class="font-bold text-white opacity-90 text-xl leading-none">${data.scoreB}</div>
                </div>
            </div>
            
            <div class="mt-3 pt-2 border-t border-white/5 flex justify-between items-center">
                <div class="text-[0.65rem] text-secondary font-medium"><i class="fa-solid fa-baseball text-muted mr-1"></i> ${data.overs} overs</div>
            </div>
        `;
        
        // Small "flash" animation
        contentDiv.animate([
            { transform: 'scale(0.99)' },
            { transform: 'scale(1)' }
        ], { duration: 200, easing: 'ease-out' });
    };

    const renderError = (contentDiv) => {
        contentDiv.innerHTML = `<div class="text-xs text-red-400 py-2"><i class="fa-solid fa-circle-exclamation mr-1"></i> Live score unavailable</div>`;
    };

    // Initial load
    fetchScore();

    // Auto-refresh every 15s
    setInterval(fetchScore, 15000);

    // Update the "Last updated: X sec ago" text every second
    if (secInterval) clearInterval(secInterval);
    secInterval = setInterval(() => {
        secondsSinceUpdate++;
        if (lastUpdatedLabel) {
            lastUpdatedLabel.textContent = `Updated ${secondsSinceUpdate} sec ago`;
        }
    }, 1000);
}
