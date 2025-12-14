const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
// vendorId: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "User",
//   required: true,
//   validate: {
//     validator: async function(value) {
//       const User = mongoose.model('User');
//       const user = await User.findById(value);
//       return user && user.role === 'vendor';
//     },
//     message: 'The referenced user must have a vendor role'
//   }
// } ,
 category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  description: { type: String, default: "" },
  imageUrl: { type: String, required: true },
  stock: { type: Number, default: 0 },
});

module.exports = mongoose.model("Item", ItemSchema);
