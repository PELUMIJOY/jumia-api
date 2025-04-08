const express = require('express');
const { addToCart, viewCart, removeFromCart, updateQuantity, clearCart } = require('../controller/cartController');
const { checkout } = require('./categoryRoute');

const router = express.Router();

router.post('/add', addToCart);
router.get('/:userId', viewCart);
router.delete('/:userId/item/:productId', removeFromCart);
router.put('/:userId/item/:productId', updateQuantity);
router.delete('/:userId/clear', clearCart);
router.post('/:userId/checkout', checkout);

module.exports = router;
