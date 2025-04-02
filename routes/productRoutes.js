const express = require("express")
const router = express.Router()
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} = require("../controllers/productController")

router.route("/").get(getProducts).post(createProduct)

router.route("/:id").get(getProduct).put(updateProduct).delete(deleteProduct)

router.get("/low-stock", getLowStockProducts)

module.exports = router

