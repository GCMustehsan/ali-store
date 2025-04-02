const mongoose = require("mongoose")

const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.01, "Quantity must be greater than 0"],
  },
  purchasePrice: {
    type: Number,
    required: true,
  },
  salePrice: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
})

const saleSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    items: [saleItemSchema],
    total: {
      type: Number,
      required: true,
    },
    profit: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash", "Card", "Bank Transfer"],
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Sale", saleSchema)

