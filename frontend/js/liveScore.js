export function initLiveScore() {
    const container = document.getElementById('liveMatchContainer');
    const contentDiv = document.getElementById('liveMatchContent');
    const lastUpdatedLabel = document.getElementById('lastUpdatedLabel');
    if (!container || !contentDiv) return;

    let secondsSinceUpdate = 0;
    let secInterval = null;

    const fetchScore = async () => {
        try {
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
        }
    };

    const renderScore = (data, container, contentDiv) => {
        // Show container if hidden (animation handles the slide)
        container.classList.remove('hidden', '-translate-y-full');

        contentDiv.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                    <span class="text-white font-black tracking-tight">${data.teamA}</span>
                    <span class="text-accent font-black text-lg">${data.scoreA}</span>
                </div>
                <span class="text-slate-600 font-bold text-[0.6rem] uppercase tracking-widest">vs</span>
                <div class="flex items-center gap-2">
                    <span class="text-white font-black tracking-tight">${data.teamB}</span>
                    <span class="text-white/60 font-black text-lg">${data.scoreB}</span>
                </div>
                <div class="h-4 w-[1px] bg-white/10 mx-2"></div>
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-baseball text-muted text-[0.6rem]"></i>
                    <span class="text-[0.7rem] font-bold text-secondary uppercase tracking-wider">${data.overs} OVERS</span>
                </div>
            </div>
        `;
        
        // Small "flash" animation
        contentDiv.animate([
            { opacity: 0.5 },
            { opacity: 1 }
        ], { duration: 300 });
    };

    const renderError = (contentDiv) => {
        contentDiv.innerHTML = `<div class="text-[0.7rem] font-bold text-red-400 uppercase tracking-widest"><i class="fa-solid fa-circle-exclamation mr-2"></i> Live stream unavailable</div>`;
    };

    // Initial load
    fetchScore();

    // Auto-refresh every 15s
    setInterval(fetchScore, 15000);

    // Update the "Last updated" text
    if (secInterval) clearInterval(secInterval);
    secInterval = setInterval(() => {
        secondsSinceUpdate++;
        if (lastUpdatedLabel) {
            lastUpdatedLabel.textContent = `Sync: ${secondsSinceUpdate}s ago`;
        }
    }, 1000);
}
