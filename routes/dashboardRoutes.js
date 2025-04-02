const express = require("express")
const router = express.Router()
const {
  getDashboardStats,
  getSalesChartData,
  getStockChartData,
  getCategoryDistribution,
} = require("../controllers/dashboardController")

router.get("/stats", getDashboardStats)
router.get("/sales-chart", getSalesChartData)
router.get("/stock-chart", getStockChartData)
router.get("/category-distribution", getCategoryDistribution)

module.exports = router

