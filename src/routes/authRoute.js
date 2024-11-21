const express = require('express');
const passport = require('passport');
const { oauthCallback } = require('../Controller/authController.js');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), oauthCallback);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), oauthCallback);

module.exports = router;
