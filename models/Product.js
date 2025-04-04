const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0, "Purchase price cannot be negative"],
    },
    salePrice: {
      type: Number,
      required: [true, "Sale price is required"],
      min: [0, "Sale price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
    },
    minimumStock: {
      type: Number,
      default: 2,
      min: [0, "Minimum stock cannot be negative"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      enum: ["count", "kg", "grams"],
      default: "count",
    },
    status: {
      type: String,
      enum: ["Normal", "Low", "Critical"],
      default: "Normal",
    },
  },
  {
    timestamps: true,
  },
)

// Calculate status based on stock level and minimum stock threshold
productSchema.pre("save", function (next) {
  if (this.stock <= 0) {
    this.status = "Critical"
  } else if (this.stock <= this.minimumStock) {
    this.status = "Low"
  } else {
    this.status = "Normal"
  }
  next()
})

module.exports = mongoose.model("Product", productSchema)



// const mongoose = require("mongoose")

// const productSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Product name is required"],
//       trim: true,
//     },
//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       trim: true,
//     },
//     purchasePrice: {
//       type: Number,
//       required: [true, "Purchase price is required"],
//       min: [0, "Purchase price cannot be negative"],
//     },
//     salePrice: {
//       type: Number,
//       required: [true, "Sale price is required"],
//       min: [0, "Sale price cannot be negative"],
//     },
//     stock: {
//       type: Number,
//       required: [true, "Stock quantity is required"],
//       min: [0, "Stock cannot be negative"],
//     },
//     unit: {
//       type: String,
//       required: [true, "Unit is required"],
//       enum: ["count", "kg", "grams"],
//       default: "count",
//     },
//     status: {
//       type: String,
//       enum: ["Normal", "Low", "Critical"],
//       default: "Normal",
//     },
//   },
//   {
//     timestamps: true,
//   },
// )

// // Calculate status based on stock level
// productSchema.pre("save", function (next) {
//   if (this.stock <= 2) {
//     this.status = "Critical"
//   } else if (this.stock <= 10) {
//     this.status = "Low"
//   } else {
//     this.status = "Normal"
//   }
//   next()
// })

// module.exports = mongoose.model("Product", productSchema)

