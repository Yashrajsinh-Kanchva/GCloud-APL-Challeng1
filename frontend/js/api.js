export const API_BASE = '/api';

export async function fetchCrowdData() {
    try {
        const res = await fetch(`${API_BASE}/crowd-data`);
        if(!res.ok) throw new Error('API Error');
        return await res.json();
    } catch (error) {
        console.error("Error fetching crowd data:", error);
        return null; 
    }
}

export async function fetchOptimalRoute(start, end) {
    try {
        const res = await fetch(`${API_BASE}/route?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
        if(!res.ok) throw new Error('Routing API Error');
        return await res.json();
    } catch (error) {
        console.error("Error fetching route:", error);
        return null;
    }
}

/**
 * Fetch all 3 route variants (fastest / least_crowded / balanced)
 * plus a smart recommendation from the backend.
 */
export async function fetchMultiRoutes(start, end) {
    try {
        const res = await fetch(`${API_BASE}/routes?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
        if(!res.ok) throw new Error('Multi-Route API Error');
        return await res.json();
    } catch (error) {
        console.error("Error fetching multi-routes:", error);
        return null;
    }
}

export async function getAIPrediction(goal) {
    try {
        const res = await fetch(`${API_BASE}/ai/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goal })
        });
        if(!res.ok) throw new Error('AI API Error');
        return await res.json();
    } catch (error) {
        console.error("AI Error:", error);
        return { error: "AI Service Offline" };
    }
}
