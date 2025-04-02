// const Sale = require("../models/Sale")
// const Product = require("../models/Product")
// const mongoose = require("mongoose")

// // Get all sales
// exports.getSales = async (req, res) => {
//   try {
//     const sales = await Sale.find().sort({ date: -1 })

//     res.status(200).json({
//       success: true,
//       count: sales.length,
//       data: sales,
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     })
//   }
// }

// // Get single sale
// exports.getSale = async (req, res) => {
//   try {
//     const sale = await Sale.findById(req.params.id)

//     if (!sale) {
//       return res.status(404).json({
//         success: false,
//         message: "Sale not found",
//       })
//     }

//     res.status(200).json({
//       success: true,
//       data: sale,
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     })
//   }
// }

// // Create new sale
// exports.createSale = async (req, res) => {
//   const session = await mongoose.startSession()
//   session.startTransaction()

//   try {
//     const { items, paymentMethod } = req.body

//     // Validate items
//     if (!items || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Sale must include at least one item",
//       })
//     }

//     // Calculate total and profit
//     let total = 0
//     let profit = 0

//     // Check stock and update products
//     for (const item of items) {
//       const product = await Product.findById(item.productId).session(session)

//       if (!product) {
//         await session.abortTransaction()
//         session.endSession()
//         return res.status(404).json({
//           success: false,
//           message: `Product with ID ${item.productId} not found`,
//         })
//       }

//       if (product.stock < item.quantity) {
//         await session.abortTransaction()
//         session.endSession()
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
//         })
//       }

//       // Update product stock
//       product.stock -= item.quantity

//       // Update status based on new stock level
//       if (product.stock <= 3) {
//         product.status = "Critical"
//       } else if (product.stock <= 10) {
//         product.status = "Low"
//       } else {
//         product.status = "Normal"
//       }

//       await product.save({ session })

//       // Calculate item total and profit
//       const itemTotal = item.salePrice * item.quantity
//       const itemProfit = (item.salePrice - item.purchasePrice) * item.quantity

//       total += itemTotal
//       profit += itemProfit
//     }

//     // Create sale record
//     const sale = await Sale.create(
//       [
//         {
//           items,
//           total,
//           profit,
//           paymentMethod,
//           date: new Date(),
//         },
//       ],
//       { session },
//     )

//     await session.commitTransaction()
//     session.endSession()

//     res.status(201).json({
//       success: true,
//       data: sale[0],
//     })
//   } catch (error) {
//     await session.abortTransaction()
//     session.endSession()

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((val) => val.message)

//       return res.status(400).json({
//         success: false,
//         message: "Validation Error",
//         error: messages,
//       })
//     }

//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     })
//   }
// }

// // Get sales by date range
// exports.getSalesByDateRange = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query

//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Start date and end date are required",
//       })
//     }

//     const start = new Date(startDate)
//     const end = new Date(endDate)
//     end.setHours(23, 59, 59, 999) // Set to end of day

//     const sales = await Sale.find({
//       date: {
//         $gte: start,
//         $lte: end,
//       },
//     }).sort({ date: -1 })

//     res.status(200).json({
//       success: true,
//       count: sales.length,
//       data: sales,
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     })
//   }
// }

// // Get today's sales
// exports.getTodaySales = async (req, res) => {
//   try {
//     const today = new Date()
//     today.setHours(0, 0, 0, 0)

//     const tomorrow = new Date(today)
//     tomorrow.setDate(tomorrow.getDate() + 1)

//     const sales = await Sale.find({
//       date: {
//         $gte: today,
//         $lt: tomorrow,
//       },
//     })

//     res.status(200).json({
//       success: true,
//       count: sales.length,
//       data: sales,
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     })
//   }
// }

// // Delete sale
// exports.deleteSale = async (req, res) => {
//   const session = await mongoose.startSession()
//   session.startTransaction()

//   try {
//     const sale = await Sale.findById(req.params.id).session(session)

//     if (!sale) {
//       await session.abortTransaction()
//       session.endSession()
//       return res.status(404).json({
//         success: false,
//         message: "Sale not found",
//       })
//     }

//     // Restore product stock
//     for (const item of sale.items) {
//       const product = await Product.findById(item.productId).session(session)

//       if (product) {
//         // Restore stock
//         product.stock += item.quantity

//         // Update status based on new stock level
//         if (product.stock <= 3) {
//           product.status = "Critical"
//         } else if (product.stock <= 10) {
//           product.status = "Low"
//         } else {
//           product.status = "Normal"
//         }

//         await product.save({ session })
//       }
//     }

//     // Delete the sale
//     await Sale.findByIdAndDelete(req.params.id).session(session)

//     await session.commitTransaction()
//     session.endSession()

//     res.status(200).json({
//       success: true,
//       data: {},
//     })
//   } catch (error) {
//     await session.abortTransaction()
//     session.endSession()

//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     })
//   }
// }

const Sale = require("../models/Sale")
const Product = require("../models/Product")
const mongoose = require("mongoose")

// Get all sales
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 })

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    })
  }
}

// Get single sale
exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      })
    }

    res.status(200).json({
      success: true,
      data: sale,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    })
  }
}

// Create new sale
exports.createSale = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { items, paymentMethod } = req.body

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Sale must include at least one item",
      })
    }

    // Calculate total and profit
    let total = 0
    let profit = 0

    // Check stock and update products
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session)

      if (!product) {
        await session.abortTransaction()
        session.endSession()
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        })
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction()
        session.endSession()
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        })
      }

      // Update product stock
      product.stock -= item.quantity

      // Update status based on new stock level
      if (product.stock <= 3) {
        product.status = "Critical"
      } else if (product.stock <= 10) {
        product.status = "Low"
      } else {
        product.status = "Normal"
      }

      await product.save({ session })

      // Calculate item total and profit
      const itemTotal = item.salePrice * item.quantity
      const itemProfit = (item.salePrice - item.purchasePrice) * item.quantity

      total += itemTotal
      profit += itemProfit
    }

    // Create sale record
    const sale = await Sale.create(
      [
        {
          items,
          total,
          profit,
          paymentMethod,
          date: new Date(),
        },
      ],
      { session },
    )

    await session.commitTransaction()
    session.endSession()

    res.status(201).json({
      success: true,
      data: sale[0],
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message)

      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: messages,
      })
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    })
  }
}

// Get sales by date range
exports.getSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // Set to end of day

    const sales = await Sale.find({
      date: {
        $gte: start,
        $lte: end,
      },
    }).sort({ date: -1 })

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    })
  }
}

// Get today's sales
exports.getTodaySales = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const sales = await Sale.find({
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    })

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    })
  }
}

// Delete sale
exports.deleteSale = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const sale = await Sale.findById(req.params.id).session(session)

    if (!sale) {
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      })
    }

    // Restore product stock
    for (const item of sale.items) {
      const product = await Product.findById(item.productId).session(session)

      if (product) {
        // Restore stock
        product.stock += item.quantity

        // Update status based on new stock level
        if (product.stock <= 3) {
          product.status = "Critical"
        } else if (product.stock <= 10) {
          product.status = "Low"
        } else {
          product.status = "Normal"
        }

        await product.save({ session })
      }
    }

    // Delete the sale
    await Sale.findByIdAndDelete(req.params.id).session(session)

    await session.commitTransaction()
    session.endSession()

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    })
  }
}

// Update sale
exports.updateSale = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { items, paymentMethod } = req.body
    const saleId = req.params.id

    // Find the original sale
    const originalSale = await Sale.findById(saleId).session(session)

    if (!originalSale) {
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      })
    }

    // Restore original product stock first
    for (const item of originalSale.items) {
      const product = await Product.findById(item.productId).session(session)
      if (product) {
        // Restore stock
        product.stock += item.quantity

        // Update status based on new stock level
        if (product.stock <= 2) {
          product.status = "Critical"
        } else if (product.stock <= 10) {
          product.status = "Low"
        } else {
          product.status = "Normal"
        }

        await product.save({ session })
      }
    }

    // Validate items
    if (!items || items.length === 0) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({
        success: false,
        message: "Sale must include at least one item",
      })
    }

    // Calculate total and profit
    let total = 0
    let profit = 0

    // Check stock and update products
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session)

      if (!product) {
        await session.abortTransaction()
        session.endSession()
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`,
        })
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction()
        session.endSession()
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        })
      }

      // Update product stock
      product.stock -= item.quantity

      // Update status based on new stock level
      if (product.stock <= 2) {
        product.status = "Critical"
      } else if (product.stock <= 10) {
        product.status = "Low"
      } else {
        product.status = "Normal"
      }

      await product.save({ session })

      // Calculate item total and profit
      const itemTotal = item.salePrice * item.quantity
      const itemProfit = (item.salePrice - item.purchasePrice) * item.quantity

      total += itemTotal
      profit += itemProfit
    }

    // Update sale record
    const updatedSale = await Sale.findByIdAndUpdate(
      saleId,
      {
        items,
        total,
        profit,
        paymentMethod,
      },
      { new: true, session },
    )

    await session.commitTransaction()
    session.endSession()

    res.status(200).json({
      success: true,
      data: updatedSale,
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message)

      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: messages,
      })
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    })
  }
}

