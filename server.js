const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const materialRoutes = require('./routes/materialRoutes');
const studentRoutes = require('./routes/studentRoutes');
const onlyMaterials = require('./routes/OnlymaterialsRoutes')
const signupCodesRoutes = require('./routes/signupCodesRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // your frontend's exact origin
    credentials: true,               // allows the httpOnly cookie to be sent/received
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