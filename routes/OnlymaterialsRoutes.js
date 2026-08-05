const express = require('express');
const router = express.Router();
const materialsController = require('../controllers/OnlymaterialsController');

// Route to get students and their materials
router.get('/students', materialsController.getStudentsWithMaterials);

// Route to create a new material
router.post('/create', materialsController.createMaterial);

// Route to update a material by ID
router.put('/update/:id', materialsController.updateMaterial);

// Route to get all materials
router.get('/getall', materialsController.getAllMaterials);

// Route to delete a material by ID
router.delete('/delete/:id', materialsController.deleteMaterial);

// Route to get a single material by ID
router.get('/getbyId/:id', materialsController.getMaterialById);

module.exports = router;