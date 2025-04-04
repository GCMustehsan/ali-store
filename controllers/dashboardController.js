const Product = require("../models/Product")
const Sale = require("../models/Sale")

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total products
    const totalProducts = await Product.countDocuments()

    // Get low stock products
    const lowStockProducts = await Product.countDocuments({
      $or: [{ status: "Low" }, { status: "Critical" }],
    })

    // Get total sales
    const totalSales = await Sale.countDocuments()

    // Get total revenue
    const salesData = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalProfit: { $sum: "$profit" },
        },
      },
    ])

    const totalRevenue = salesData.length > 0 ? salesData[0].totalRevenue : 0
    const totalProfit = salesData.length > 0 ? salesData[0].totalProfit : 0

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        lowStockProducts,
        totalSales,
        totalRevenue,
        totalProfit,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    })
  }
}

// Get sales chart data
exports.getSalesChartData = async (req, res) => {
  try {
    const { period } = req.query
    let dateFormat
    let startDate

    // Determine date format and start date based on period
    switch (period) {
      case "week":
        dateFormat = "%Y-%m-%d"
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)
        break
      case "month":
        dateFormat = "%Y-%m-%d"
        startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case "year":
        dateFormat = "%Y-%m"
        startDate = new Date()
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        dateFormat = "%Y-%m-%d"
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)
    }

    const salesData = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$date" } },
          sales: { $sum: "$total" },
          profit: { $sum: "$profit" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          sales: 1,
          profit: 1,
        },
      },
    ])

    // If we're looking at daily data, make sure we have entries for all days
    if (dateFormat === "%Y-%m-%d") {
      const result = []
      const endDate = new Date()
      const currentDate = new Date(startDate)

      // Create a map of existing data
      const dataMap = {}
      salesData.forEach((item) => {
        dataMap[item.date] = item
      })

      // Fill in all dates
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0]
        if (dataMap[dateStr]) {
          result.push(dataMap[dateStr])
        } else {
          result.push({
            date: dateStr,
            sales: 0,
            profit: 0,
          })
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }

      res.status(200).json({
        success: true,
        data: result,
      })
    } else {
      res.status(200).json({
        success: true,
        data: salesData,
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    })
  }
}

// Get stock chart data
exports.getStockChartData = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $or: [{ status: "Low" }, { status: "Critical" }],
    })
      .select("name stock unit status minimumStock")
      .limit(10)

    res.status(200).json({
      success: true,
      data: lowStockProducts,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    })
  }
}

// Get category distribution
exports.getCategoryDistribution = async (req, res) => {
  try {
    const categoryData = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$stock", "$purchasePrice"] } },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
          totalValue: 1,
        },
      },
    ])

    res.status(200).json({
      success: true,
      data: categoryData,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    })
  }
}

// Get daily sales data
exports.getDailySalesData = async (req, res) => {
  try {
    // Get sales data for the last 30 days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const dailySales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          sales: { $sum: "$total" },
          profit: { $sum: "$profit" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          sales: 1,
          profit: 1,
          count: 1,
        },
      },
    ])

    // Fill in missing dates with zero values
    const result = []
    const endDate = new Date()
    const currentDate = new Date(startDate)

    // Create a map of existing data
    const dataMap = {}
    dailySales.forEach((item) => {
      dataMap[item.date] = item
    })

    // Fill in all dates
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0]
      if (dataMap[dateStr]) {
        result.push(dataMap[dateStr])
      } else {
        result.push({
          date: dateStr,
          sales: 0,
          profit: 0,
          count: 0,
        })
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    })
  }
}


// const Product = require("../models/Product")
// const Sale = require("../models/Sale")

// // Get dashboard stats
// exports.getDashboardStats = async (req, res) => {
//   try {
//     // Get total products
//     const totalProducts = await Product.countDocuments()

//     // Get low stock products
//     const lowStockProducts = await Product.countDocuments({
//       $or: [{ status: "Low" }, { status: "Critical" }],
//     })

//     // Get total sales
//     const totalSales = await Sale.countDocuments()

//     // Get total revenue
//     const salesData = await Sale.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalRevenue: { $sum: "$total" },
//           totalProfit: { $sum: "$profit" },
//         },
//       },
//     ])

//     const totalRevenue = salesData.length > 0 ? salesData[0].totalRevenue : 0
//     const totalProfit = salesData.length > 0 ? salesData[0].totalProfit : 0

//     res.status(200).json({
//       success: true,
//       data: {
//         totalProducts,
//         lowStockProducts,
//         totalSales,
//         totalRevenue,
//         totalProfit,
//       },
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     })
//   }
// }

// // Get sales chart data
// exports.getSalesChartData = async (req, res) => {
//   try {
//     const { period } = req.query
//     let dateFormat
//     let startDate

//     // Determine date format and start date based on period
//     switch (period) {
//       case "week":
//         dateFormat = "%Y-%m-%d"
//         startDate = new Date()
//         startDate.setDate(startDate.getDate() - 7)
//         break
//       case "month":
//         dateFormat = "%Y-%m-%d"
//         startDate = new Date()
//         startDate.setMonth(startDate.getMonth() - 1)
//         break
//       case "year":
//         dateFormat = "%Y-%m"
//         startDate = new Date()
//         startDate.setFullYear(startDate.getFullYear() - 1)
//         break
//       default:
//         dateFormat = "%Y-%m-%d"
//         startDate = new Date()
//         startDate.setDate(startDate.getDate() - 7)
//     }

//     const salesData = await Sale.aggregate([
//       {
//         $match: {
//           date: { $gte: startDate },
//         },
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: dateFormat, date: "$date" } },
//           sales: { $sum: "$total" },
//           profit: { $sum: "$profit" },
//         },
//       },
//       {
//         $sort: { _id: 1 },
//       },
//       {
//         $project: {
//           _id: 0,
//           date: "$_id",
//           sales: 1,
//           profit: 1,
//         },
//       },
//     ])

//     res.status(200).json({
//       success: true,
//       data: salesData,
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     })
//   }
// }

// // Get stock chart data
// exports.getStockChartData = async (req, res) => {
//   try {
//     const lowStockProducts = await Product.find({
//       $or: [{ status: "Low" }, { status: "Critical" }],
//     })
//       .select("name stock unit status")
//       .limit(10)

//     res.status(200).json({
//       success: true,
//       data: lowStockProducts,
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     })
//   }
// }

// // Get category distribution
// exports.getCategoryDistribution = async (req, res) => {
//   try {
//     const categoryData = await Product.aggregate([
//       {
//         $group: {
//           _id: "$category",
//           count: { $sum: 1 },
//           totalValue: { $sum: { $multiply: ["$stock", "$purchasePrice"] } },
//         },
//       },
//       {
//         $sort: { count: -1 },
//       },
//       {
//         $project: {
//           _id: 0,
//           category: "$_id",
//           count: 1,
//           totalValue: 1,
//         },
//       },
//     ])

//     res.status(200).json({
//       success: true,
//       data: categoryData,
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message,
//     })
//   }
// }

