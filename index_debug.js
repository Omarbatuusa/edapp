require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

console.error('--- DEBUG: INDEX.JS STARTING ---');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Database Connection
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Routes
console.error('--- DEBUG: LOADING ROUTES ---');
try {
    const studentRoutes = require('./routes/students');
    app.use('/v1/students', studentRoutes);
} catch (e) { console.error('Error loading students:', e); }

try {
    const policyRoutes = require('./routes/policies');
    app.use('/v1/policies', policyRoutes);
} catch (e) { console.error('Error loading policies:', e); }

try {
    const disciplineRoutes = require('./routes/discipline');
    app.use('/v1/discipline', disciplineRoutes);
} catch (e) { console.error('Error loading discipline:', e); }

// AUTH & RBAC LOADING
console.error('--- DEBUG: REQUIRING AUTH ---');
try {
    const authRoutes = require('./routes/auth');
    console.error('--- DEBUG: AUTH REQUIRED SUCCESS ---');
    app.use('/v1/auth', authRoutes);
} catch (e) {
    console.error('--- DEBUG: FATAL AUTH ERROR ---', e);
    // Do not crash, let it continue logging
}

console.error('--- DEBUG: REQUIRING RBAC ---');
try {
    const rbacRoutes = require('./routes/rbac');
    console.error('--- DEBUG: RBAC REQUIRED SUCCESS ---');
    app.use('/v1/rbac', rbacRoutes);
} catch (e) {
    console.error('--- DEBUG: FATAL RBAC ERROR ---', e);
}


// Safe load of Tenant routes to prevent crash if module fails
try {
    const tenantRoutes = require('./routes/tenants');
    app.use('/v1/tenants', tenantRoutes);
    console.log('Tenant routes loaded successfully');
} catch (err) {
    console.error('Failed to load Tenant Routes:', err);
}

try {
    app.use('/v1/behaviour', require('./routes/behaviour'));
} catch (err) {
    console.error('Failed to load Behaviour Routes:', err);
}

// Start Server
app.listen(PORT, () => {
    console.error(`[Backend] SERVER STARTED on port ${PORT}`);
});
