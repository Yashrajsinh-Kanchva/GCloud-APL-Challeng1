const express = require('express');
const router = express.Router();
const crowdController = require('../controllers/crowdController');
const matchController = require('../controllers/matchController'); // new live score controller
const rateLimit = require('express-rate-limit');

// Security: Rate limiting for AI endpoints
const aiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 50, // limit each IP to 50 requests per windowMs
    message: { error: "Too many AI requests, please try again later." }
});

router.get('/crowd-data', crowdController.getCrowdData);
router.get('/route', crowdController.calculateRoute);          // existing single-route (backward compat)
router.get('/routes', crowdController.calculateMultiRoutes);   // multi-route comparison
router.post('/ai/predict', aiLimiter, crowdController.aiPredict);
router.post('/save-check', crowdController.saveCheck);
router.get('/history', crowdController.getHistory);

router.get('/config/firebase', crowdController.getFirebaseConfig);

// NEW: Live IPL Score feature
router.get('/live-score', matchController.getLiveScore);

module.exports = router;
