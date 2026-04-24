const { analyzeCrowdData } = require('../services/aiService');
const { findOptimalRoute, findMultipleRoutes } = require('../services/routingService');
const { saveCheckData, getHistoryData } = require('../services/dbService');
const { z } = require('zod');

const VALID_GATES = ['Gate 1', 'Gate 2', 'Gate 3', 'Gate 4'];
const VALID_SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

// Schema for input validation
const checkSchema = z.object({
    userId: z.string().optional(),
    gate: z.string().trim().refine((value) => VALID_GATES.includes(value), {
        message: `Gate must be one of: ${VALID_GATES.join(', ')}`
    }),
    section: z.string().trim().refine((value) => VALID_SECTIONS.includes(value), {
        message: `Section must be one of: ${VALID_SECTIONS.join(', ')}`
    }),
    timestamp: z.string().optional()
});

const aiRequestSchema = z.object({
    goal: z.string().trim().min(1).max(200).optional()
});

const generateSimulatedData = () => {
    const randomTime = () => Math.floor(Math.random() * 20) + 1;
    const zones = {
        gates: { "Gate 1": randomTime(), "Gate 2": randomTime(), "Gate 3": randomTime(), "Gate 4": randomTime() },
        restrooms: { "Men 1": randomTime(), "Men 2": randomTime(), "Women 1": randomTime(), "Women 2": randomTime() },
        foodCourts: { "Food Court A": randomTime(), "Food Court B": randomTime(), "Food Court C": randomTime() },
        merchandise: { "Store 1": randomTime(), "Store 2": randomTime() },
        sections: { 
            "Section A": randomTime(), "Section B": randomTime(), "Section C": randomTime(),
            "Section D": randomTime(), "Section E": randomTime(), "Section F": randomTime(),
            "Section G": randomTime(), "Section H": randomTime(), "Section I": randomTime(),
            "Section J": randomTime(), "Section K": randomTime(), "Section L": randomTime(),
            "Section M": randomTime(), "Section N": randomTime()
        }
    };

    let maxC = { area: '', wait: -1 };
    let minP = { area: '', wait: 99 };
    let bestR = { area: '', wait: 99 };

    for(const k in zones.gates) if(zones.gates[k] > maxC.wait) maxC = { area: k, wait: zones.gates[k] };
    for(const k in zones.gates) if(zones.gates[k] < minP.wait) minP = { area: k, wait: zones.gates[k] };
    for(const k in zones.restrooms) if(zones.restrooms[k] < bestR.wait) bestR = { area: k, wait: zones.restrooms[k] };

    return {
        timestamp: new Date().toISOString(),
        highestCongestion: maxC,
        clearestPath: minP,
        bestRestroom: bestR,
        zones: zones
    };
};

// Cached telemetry (simplified for hackathon live feel)
let currentTelemetry = generateSimulatedData();
setInterval(() => { currentTelemetry = generateSimulatedData(); }, 10000); // 10s for more dynamic demo

exports.getCrowdData = async (req, res) => {
    res.json(currentTelemetry);
};

exports.aiPredict = async (req, res) => {
    try {
        const { goal } = aiRequestSchema.parse(req.body || {});
        const result = await analyzeCrowdData(currentTelemetry, goal);
        res.json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues.map((issue) => issue.message).join('; ') });
        }
        res.status(500).json({ error: "AI Analysis Failed" });
    }
};

exports.calculateRoute = async (req, res) => {
    try {
        const start = typeof req.query.start === 'string' ? req.query.start.trim() : '';
        const end = typeof req.query.end === 'string' ? req.query.end.trim() : '';

        if (!start || !end) {
            return res.status(400).json({ error: "Query params 'start' and 'end' are required." });
        }

        if (!VALID_GATES.includes(start)) {
            return res.status(400).json({ error: `Invalid start gate. Allowed values: ${VALID_GATES.join(', ')}` });
        }

        if (!VALID_SECTIONS.includes(end)) {
            return res.status(400).json({ error: `Invalid destination section. Allowed values: ${VALID_SECTIONS.join(', ')}` });
        }

        const result = findOptimalRoute(start, end, currentTelemetry);
        if (!result || !Array.isArray(result.path) || result.path.length === 0 || !Number.isFinite(result.totalWeight)) {
            return res.status(400).json({ error: "Unable to calculate route for the provided inputs." });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Route calculation failed" });
    }
};

exports.calculateMultiRoutes = async (req, res) => {
    try {
        const start = typeof req.query.start === 'string' ? req.query.start.trim() : '';
        const end = typeof req.query.end === 'string' ? req.query.end.trim() : '';

        if (!start || !end) {
            return res.status(400).json({ error: "Query params 'start' and 'end' are required." });
        }

        if (!VALID_GATES.includes(start)) {
            return res.status(400).json({ error: `Invalid start gate. Allowed values: ${VALID_GATES.join(', ')}` });
        }

        if (!VALID_SECTIONS.includes(end)) {
            return res.status(400).json({ error: `Invalid destination section. Allowed values: ${VALID_SECTIONS.join(', ')}` });
        }

        const result = findMultipleRoutes(start, end, currentTelemetry);

        // Basic sanity check — all routes must have a valid path
        if (!result || !Array.isArray(result.routes) || result.routes.length === 0) {
            return res.status(400).json({ error: "Unable to calculate multi-route for the provided inputs." });
        }

        res.json(result);
    } catch (error) {
        console.error('Multi-route error:', error);
        res.status(500).json({ error: "Multi-route calculation failed" });
    }
};

exports.saveCheck = async (req, res) => {
    try {
        const validated = checkSchema.parse(req.body);
        const result = await saveCheckData(validated);
        res.status(201).json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues.map((issue) => issue.message).join('; ') });
        }
        res.status(400).json({ error: "Invalid Input" });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await getHistoryData();
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
};

exports.getFirebaseConfig = (req, res) => {
    res.json({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    });
};
