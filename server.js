// server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const materialRoutes = require('./routes/materialRoutes');
const studentRoutes = require('./routes/studentRoutes');
const onlyMaterials = require('./routes/OnlymaterialsRoutes');
const signupCodesRoutes = require('./routes/signupCodesRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Allowed frontend origins for production and local development
const allowedOrigins = [
    'http://localhost:3000',
    'https://kass-checking.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or server-to-server curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,                    // allows cookies/authorization headers to be sent
}));

app.use(cookieParser());
app.use(express.json());

app.use('/api/v1', materialRoutes);
app.use('/api/v1', studentRoutes);
app.use('/api/v1', onlyMaterials);
app.use('/api/v1', signupCodesRoutes);
app.use('/api/v1', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`KASS Discipline Server running on port ${PORT}`);
});