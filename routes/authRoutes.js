const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// Auth routes - all handled on the backend against the users table
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authenticate, authController.getCurrentUser);

router.get('/users', authenticate, authController.getAllUsers);
router.put('/user/:id', authenticate, authController.updateUser);
router.delete('/user/:id', authenticate, authController.deleteUser);

module.exports = router;