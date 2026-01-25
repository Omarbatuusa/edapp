const { verifyToken } = require('./src/middleware/authMiddleware');
const rbacController = require('./src/controllers/rbacController');

console.log('verifyToken type:', typeof verifyToken);
console.log('rbacController type:', typeof rbacController);
console.log('rbacController.getMyContext type:', typeof rbacController.getMyContext);

if (typeof verifyToken !== 'function') {
    console.error('FAIL: verifyToken is not a function');
}
if (typeof rbacController.getMyContext !== 'function') {
    console.error('FAIL: rbacController.getMyContext is not a function');
}
