const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // Handles multipart/form-data for Excel/CSV/PDF uploads

const studentController = require('../controllers/studentController');

// Routes for student directory and registration
router.post('/student', studentController.addStudent);
router.post('/students/upload-excel', upload.single('file'), studentController.uploadStudentsExcel);
router.get('/students-list', studentController.getAllStudents);
router.delete('/student/:id', studentController.deleteStudent);

// NEW: Fetch all unique classes
router.get('/classes', studentController.getClasses);
module.exports = router;