const supabase = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const COOKIE_NAME = 'session_token';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none', // Required for cross-site Vercel frontend/backend setups
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

// CREATE: Sign up a new user
exports.signup = async (req, res) => {
    try {
        const { full_name, email, password, role = 'displineofficer' } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ error: 'full_name, email and password are required' });
        }

        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{
                full_name,
                email,
                password: hashedPassword,
                role,
            }])
            .select('id, full_name, email, role, created_at')
            .single();

        if (insertError) throw insertError;

        res.status(201).json({ message: 'Account created successfully', user: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LOGIN: Verify credentials, create a database session, and issue an httpOnly cookie pointer
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('id, full_name, email, password, role')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // 1. Generate a secure random session ID token
        const sessionId = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // 2. Insert the session record directly into Supabase database (user.id is UUID)
        const { error: sessionError } = await supabase
            .from('sessions')
            .insert([{
                id: sessionId,
                user_id: user.id,
                expires_at: expiresAt.toISOString()
            }]);

        if (sessionError) throw sessionError;

        // 3. Set the database session pointer in an httpOnly cookie
        res.cookie(COOKIE_NAME, sessionId, cookieOptions);

        const { password: _pw, ...safeUser } = user;
        res.status(200).json({ message: 'Logged in successfully', user: safeUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LOGOUT: Remove the session from the database and clear the cookie
exports.logout = async (req, res) => {
    try {
        const sessionId = req.cookies[COOKIE_NAME];
        if (sessionId) {
            await supabase
                .from('sessions')
                .delete()
                .eq('id', sessionId);
        }

        res.clearCookie(COOKIE_NAME, cookieOptions);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ME: Return the current user using the database session validated by middleware
exports.getCurrentUser = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, full_name, email, role, created_at')
            .eq('id', req.userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ: Get all users (optionally filter by ?role=)
exports.getAllUsers = async (req, res) => {
    try {
        let query = supabase
            .from('users')
            .select('id, full_name, email, role, created_at')
            .order('created_at', { ascending: false });

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

// READ: Get a single user by id
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('users')
            .select('id, full_name, email, role, created_at')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE: Edit a user's details
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, role, password } = req.body;

        const updates = {};
        if (full_name !== undefined) updates.full_name = full_name;
        if (email !== undefined) updates.email = email;
        if (role !== undefined) updates.role = role;
        if (password) updates.password = await bcrypt.hash(password, 10);

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields provided to update' });
        }

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select('id, full_name, email, role, created_at');

        if (error) throw error;
        res.status(200).json({ message: 'User updated successfully', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE: Remove a user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};