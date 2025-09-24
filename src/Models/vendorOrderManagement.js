const mongoose = require("mongoose");

const orderManagementSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    orderDate: {
      type: Date,
      default: Date.now,
    },
    shipmentMethod: {
      type: String,
      required: true,
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    trackingNumber: String,
    labels: [String],
    notes: String,
  },
  { timestamps: true }
);

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    // Creating a simple order number format: ORD-YYYYMMDD-XXXX (where XXXX is a random number)
    const date = new Date();
    const dateStr =
      date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, "0") +
      String(date.getDate()).padStart(2, "0");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${dateStr}-${randomNum}`;
  }
  next();
});

const VendorOrder = mongoose.model("Order", orderManagementSchema);

module.exports = VendorOrder;
