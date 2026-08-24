const supabase = require('../db');
const crypto = require('crypto');

// Helper: generate a random, human-friendly code e.g. "A1B2-C3D4"
function generateCode() {
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 chars
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

// CREATE: Generate one or more signup codes
// body: { role, count, expires_at }  -> role/expires_at optional, count optional (default 1)
exports.createSignupCode = async (req, res) => {
    try {
        const { role = 'student', count = 1, expires_at = null } = req.body;

        const codesToInsert = Array.from({ length: Math.max(1, Number(count) || 1) }, () => ({
            code: generateCode(),
            role,
            expires_at,
        }));

        const { data, error } = await supabase
            .from('signup_codes')
            .insert(codesToInsert)
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'Signup code(s) created successfully', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ: Get all signup codes (optionally filter by ?used=true/false or ?role=)
exports.getAllSignupCodes = async (req, res) => {
    try {
        let query = supabase.from('signup_codes').select('*').order('created_at', { ascending: false });

        if (req.query.used !== undefined) {
            query = query.eq('is_used', req.query.used === 'true');
        }
        if (req.query.role) {
            query = query.eq('role', req.query.role);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ: Get a single signup code by id
exports.getSignupCodeById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('signup_codes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ: Verify a code is valid/unused/unexpired without consuming it
// GET /signup-codes/verify/:code
exports.verifySignupCode = async (req, res) => {
    try {
        const { code } = req.params;
        const { data, error } = await supabase
            .from('signup_codes')
            .select('*')
            .eq('code', code)
            .single();

        if (error || !data) {
            return res.status(404).json({ valid: false, message: 'Signup code not found' });
        }
        if (data.is_used) {
            return res.status(400).json({ valid: false, message: 'Signup code has already been used' });
        }
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            return res.status(400).json({ valid: false, message: 'Signup code has expired' });
        }

        res.status(200).json({ valid: true, role: data.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE: Edit a signup code (role, expiry, or manually reset/mark as used)
exports.updateSignupCode = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, expires_at, is_used, used_by } = req.body;

        const updates = {};
        if (role !== undefined) updates.role = role;
        if (expires_at !== undefined) updates.expires_at = expires_at;
        if (is_used !== undefined) updates.is_used = is_used;
        if (used_by !== undefined) updates.used_by = used_by;

        const { data, error } = await supabase
            .from('signup_codes')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json({ message: 'Signup code updated successfully', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE: Remove a signup code
exports.deleteSignupCode = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('signup_codes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Signup code deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};