require('dotenv').config({ path: './deployment_config/.env' });
try {
    console.log('--- AuthMiddleware Check ---');
    const mw = require('./src/middleware/authMiddleware');
    console.log('verifyToken type:', typeof mw.verifyToken);

    console.log('--- AuthController Check ---');
    const ctrl = require('./src/controllers/authController');
    console.log('Controller Loaded Successfully');
    console.log('Exports keys:', Object.keys(ctrl));
    console.log('login type:', typeof ctrl.login);
    console.log('getMe type:', typeof ctrl.getMe);
} catch (e) {
    console.error('Error requiring module:', e);
}
