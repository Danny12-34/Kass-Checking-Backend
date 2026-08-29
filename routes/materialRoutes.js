// routes/materialRoutes.js
const express = require('express');
const router = express.Router();

const materialController = require('../controllers/materialController');

// Routes for materials matrix tracking and updates
router.get('/students', materialController.getStudentsWithMaterials);
router.post('/check-materials', materialController.updateMaterialCheck);
router.get('/get-students-materials', materialController.getStudentsWithMaterials);

module.exports = router;