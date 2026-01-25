const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verifyToken = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = verified; // Contains { id: '...' }

        // Fetch User's Tenant ID (Primary)
        // In a real multi-tenant app, user might switch tenants, but usually they have a home tenant.
        // We'll fetch the one from 'profiles'.
        const profileRes = await db.query('SELECT tenant_id FROM profiles WHERE id = $1', [req.user.id]);
        if (profileRes.rows.length > 0) {
            req.user.tenantId = profileRes.rows[0].tenant_id;
        }

        // Fetch User's Active Role and Capabilities
        // CRITICAL: Restrict capabilities to the current tenant context (and global platform roles)
        // This prevents "Tenant Admin" in Tenant A from having admin rights in Tenant B.

        const currentTenantId = req.headers['x-tenant-id'] || req.user.tenantId; // Allow header override for context switching
        const currentBranchId = req.user.branchId; // From Token (Strict - cannot override via header for now unless we implement branch switcher)

        // Logic:
        // 1. If User has Branch Context (e.g. Learner/Staff at LIA), they can ONLY see things scoped to that Branch OR Tenant-Global.
        // 2. If User is Tenant Admin (No Branch Context), they see everything in Tenant.

        let sql = `
            SELECT DISTINCT c.slug
            FROM user_role_assignments ura
            JOIN roles r ON ura.role_id = r.id
            JOIN role_capabilities rc ON r.id = rc.role_id
            JOIN capabilities c ON rc.capability_id = c.id
            WHERE ura.user_id = $1 
              AND ura.is_active = true
              AND (
                  ura.tenant_id = $2       -- Match current tenant
                  OR ura.tenant_id IS NULL -- Or Global Platform Role
              )
        `;

        const params = [req.user.id, currentTenantId];

        // If user is strictly bound to a branch (Learner/Staff), filter by Branch Scope
        if (currentBranchId) {
            sql += ` AND (ura.scope = 'branch' AND ura.scope_id = $3 OR ura.scope = 'tenant' OR ura.scope_id IS NULL) `;
            // Note: This logic allows a "Tenant Role" to still apply to a branch user.
            // Strict interpretation of user request: "all tenant data treated separated".
            // If checking strict data ownership, checking against 'branch_id' column in data tables is key.
            // For CAPABILITIES, we usually want them to inherit tenant roles too (like "Allied Student" is verified by Tenant).
            // But let's add the param.
            params.push(currentBranchId);
        }

        const result = await db.query(sql, params);
        const capabilities = result.rows.map(row => row.slug);

        req.user.capabilities = capabilities;

        next();
    } catch (err) {
        console.error('Initial Token Verify Error:', err);
        // Fallback for demo: If DB fails or dev token, allow basic request but no caps
        if (process.env.NODE_ENV === 'development') {
            req.user = { id: 'dev-user', capabilities: [] };
            return next();
        }
        res.status(400).json({ error: 'Invalid token' });
    }
};

const requireCapability = (capability) => {
    return (req, res, next) => {
        if (!req.user || !req.user.capabilities || !req.user.capabilities.includes(capability)) {
            return res.status(403).json({ error: 'Forbidden: Missing Capability ' + capability });
        }
        next();
    };
};

module.exports = { verifyToken, requireCapability };
