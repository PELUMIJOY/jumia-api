const express = require('express');
const { requestOtp, verifyOtp } = require('../Controller/otpController.js');

const router = express.Router();

router.post('/request', requestOtp);
router.post('/verify', verifyOtp);

module.exports = router;