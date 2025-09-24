// const mongoose = require('mongoose');

// const OrderItemSchema = new mongoose.Schema({
//   product: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
//   name: { type: String, required: true },
//   price: { type: Number, required: true },
//   quantity: { type: Number, required: true, min: 1 },
//   image: { type: String }
// });

// const ShippingDetailsSchema = new mongoose.Schema({
//   phoneNumber: { type: String, required: true },
//   address: { type: String, required: true }
// });

// const OrderSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   items: [OrderItemSchema],
//   totalAmount: { type: Number, required: true },
//   shippingDetails: ShippingDetailsSchema,
//     reference: { type: String, unique: true },
//   status: {
//     type: String,
//     enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
//     default: 'Processing'
//   },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Order', OrderSchema);

const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const ShippingDetailsSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
});

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  // shippingDetails: ShippingDetailsSchema,
  reference: { type: String, unique: true, sparse: true }, // sparse allows null values
  status: {
    type: String,
    enum: ["Processing", "Paid", "Failed", "Shipped", "Delivered", "Cancelled"],
    default: "Processing",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add index for reference field properly
// OrderSchema.index({ reference: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Order", OrderSchema);
