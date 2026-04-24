require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api', apiRoutes);

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Handle port-in-use gracefully instead of crashing
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error(`   Run this to free it:  Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
        console.error(`   Then try npm start again.\n`);
        process.exit(1);
    } else {
        throw err;
    }
});

// Graceful shutdown — frees the port properly on Ctrl+C
process.on('SIGINT',  () => { server.close(() => { console.log('\nServer stopped.'); process.exit(0); }); });
process.on('SIGTERM', () => { server.close(() => { console.log('\nServer stopped.'); process.exit(0); }); });

