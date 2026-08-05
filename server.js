const express = require('express');
const cors = require('cors');
require('dotenv').config();

const materialRoutes = require('./routes/materialRoutes');
const studentRoutes = require('./routes/studentRoutes');
const onlyMaterials = require('./routes/OnlymaterialsRoutes')

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1', materialRoutes);
app.use('/api/v1', studentRoutes);
app.use('/api/v1', onlyMaterials);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`KASS Discipline Server running on port ${PORT}`);
});