const express = require('express');
const { addToCart, viewCart } = require('../Controller/cartController');

const router = express.Router();

router.post('/add', addToCart);
router.get('/:userId', viewCart);

module.exports = router;
