const supabase = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'session_token';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // requires HTTPS in prod
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

// CREATE: Sign up a new user (no signup code required)
// body: { full_name, email, password, role }  -> role optional, defaults to 'displineofficer'
exports.signup = async (req, res) => {
    try {
        const { full_name, email, password, role = 'displineofficer' } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ error: 'full_name, email and password are all required' });
        }

        // Make sure the email isn't already registered
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        // Hash the password and create the user
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

// LOGIN: Verify credentials and issue an httpOnly JWT cookie
// body: { email, password }
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

        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie(COOKIE_NAME, token, cookieOptions);

        const { password: _pw, ...safeUser } = user;
        res.status(200).json({ message: 'Logged in successfully', user: safeUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LOGOUT: Clear the session cookie
exports.logout = (req, res) => {
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.status(200).json({ message: 'Logged out successfully' });
};

// ME: Return the currently logged-in user, based on the session cookie
// (requires the `authenticate` middleware to have run first)
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

// UPDATE: Edit a user's details (full_name, email, role, and optionally password)
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