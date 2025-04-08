const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String }
});

const ShippingDetailsSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true }
});

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingDetails: ShippingDetailsSchema,
  status: { 
    type: String, 
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);