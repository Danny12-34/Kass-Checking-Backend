const express = require('express');
const router = express.Router();

const signupCodesController = require('../controllers/signupCodesController');

// CRUD for signup codes
router.post('/signup-codes', signupCodesController.createSignupCode);          // create (single or bulk)
router.get('/signup-codes', signupCodesController.getAllSignupCodes);          // read all (?used=&role=)
router.get('/signup-codes/verify/:code', signupCodesController.verifySignupCode); // check validity without consuming
router.get('/signup-codes/:id', signupCodesController.getSignupCodeById);      // read one
router.put('/signup-codes/:id', signupCodesController.updateSignupCode);       // update
router.delete('/signup-codes/:id', signupCodesController.deleteSignupCode);    // delete

module.exports = router;