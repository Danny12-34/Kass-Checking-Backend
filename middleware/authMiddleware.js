const supabase = require('../db');

const COOKIE_NAME = 'session_token';

const authenticate = async (req, res, next) => {
    try {
        const sessionId = req.cookies[COOKIE_NAME];
        if (!sessionId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Query the database sessions table
        const { data: session, error } = await supabase
            .from('sessions')
            .select('user_id, expires_at')
            .eq('id', sessionId)
            .single();

        if (error || !session) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        // Check if session has expired
        if (new Date() > new Date(session.expires_at)) {
            await supabase.from('sessions').delete().eq('id', sessionId);
            return res.status(401).json({ error: 'Session expired' });
        }

        // Attach user ID (UUID) to request object for downstream controllers
        req.userId = session.user_id;
        next();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { authenticate };