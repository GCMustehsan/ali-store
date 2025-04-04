const express = require("express")
const router = express.Router()
const {
  getSales,
  getSale,
  createSale,
  updateSale,
  getSalesByDateRange,
  getTodaySales,
  deleteSale,
  createManualSale,
  getManualSales,
} = require("../controllers/saleController")

router.route("/").get(getSales).post(createSale)

router.route("/:id").get(getSale).put(updateSale).delete(deleteSale)

router.get("/date-range", getSalesByDateRange)
router.get("/today", getTodaySales)
router.post("/manual", createManualSale)
router.get("/manual", getManualSales)

module.exports = router




// // const express = require("express")
// // const router = express.Router()
// // const {
// //   getSales,
// //   getSale,
// //   createSale,
// //   getSalesByDateRange,
// //   getTodaySales,
// //   deleteSale,
// // } = require("../controllers/saleController")

// // router.route("/").get(getSales).post(createSale)

// // router.route("/:id").get(getSale).delete(deleteSale)

// // router.get("/date-range", getSalesByDateRange)
// // router.get("/today", getTodaySales)

// // module.exports = router

// const express = require("express")
// const router = express.Router()
// const {
//   getSales,
//   getSale,
//   createSale,
//   updateSale,
//   getSalesByDateRange,
//   getTodaySales,
//   deleteSale,
// } = require("../controllers/saleController")

// router.route("/").get(getSales).post(createSale)

// router.route("/:id").get(getSale).put(updateSale).delete(deleteSale)

// router.get("/date-range", getSalesByDateRange)
// router.get("/today", getTodaySales)

// module.exports = router

