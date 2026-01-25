const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

exports.searchTenant = async (req, res) => {
    try {
        const { code, domain } = req.query;

        // Domain Resolution Strategy:
        // 1. If 'domain' param is provided, check 'tenant_domains' registry.
        // 2. If 'code' param is provided, check 'tenants' table directly.
        // 3. Fallback: check 'tenants.domain' (Legacy)

        if (!code && !domain) {
            return res.status(400).json({ error: "Tenant code or domain is required" });
        }

        let tenant = null;
        let branch = null;

        if (domain) {
            // STEP 1: Check Domain Registry
            const domainQuery = `
                SELECT td.tenant_id, td.branch_id, td.type as portal_type, 
                       t.name as tenant_name, t.code as tenant_code, t.logo_url, t.config as tenant_config,
                       b.name as branch_name, b.code as branch_code, b.config as branch_config
                FROM tenant_domains td
                JOIN tenants t ON td.tenant_id = t.id
                LEFT JOIN branches b ON td.branch_id = b.id
                WHERE td.hostname = $1
                LIMIT 1
            `;
            const domainResult = await pool.query(domainQuery, [domain.toLowerCase()]);

            if (domainResult.rows.length > 0) {
                const row = domainResult.rows[0];
                tenant = {
                    id: row.tenant_id,
                    name: row.tenant_name,
                    code: row.tenant_code,
                    logo_url: row.logo_url,
                    domain: domain,
                    config: row.tenant_config,
                    portalType: row.portal_type // [NEW] Capture type
                };
                if (row.branch_id) {
                    branch = {
                        id: row.branch_id,
                        name: row.branch_name,
                        code: row.branch_code,
                        config: row.branch_config
                    };
                }
            } else {
                // Fallback to legacy check on tenants table
                const legacyQuery = "SELECT * FROM tenants WHERE domain = $1 LIMIT 1";
                const legacyResult = await pool.query(legacyQuery, [domain.toLowerCase()]);
                if (legacyResult.rows.length > 0) {
                    tenant = legacyResult.rows[0];
                }
            }
        } else if (code) {
            const codeQuery = "SELECT * FROM tenants WHERE code = $1 LIMIT 1";
            const codeResult = await pool.query(codeQuery, [code.toUpperCase()]);
            if (codeResult.rows.length > 0) {
                tenant = codeResult.rows[0];
            }
        }

        if (!tenant) {
            return res.status(404).json({ error: "Tenant not found" });
        }

        // Merge Branch Config into Tenant Config if Branch exists
        let finalConfig = tenant.config || { modules: [] };
        if (branch) {
            // Overlay branch config? Or just return branch info?
            // For now, let's include branch info in the response
            finalConfig = {
                ...finalConfig,
                branch: {
                    id: branch.id,
                    name: branch.name,
                    code: branch.code
                }
            };
        }

        const responseData = {
            id: tenant.id,
            name: branch ? `${tenant.name} - ${branch.name}` : tenant.name, // Composite name for UI
            code: tenant.code,
            logoUrl: tenant.logo_url,
            domain: tenant.domain, // Or request domain
            themeColor: finalConfig.themeColor || "#135bec",
            config: finalConfig,
            portalType: tenant.portalType || 'login' // [NEW] Return portal type
        };

        res.json(responseData);

    } catch (err) {
        console.error("Search Tenant Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
