import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getRecommendedProducts,
  toggleFeatured,
} from "../controllers/product.controller.js";
import { adminProtect, authProtect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/")
  .get(authProtect, adminProtect, getAllProducts)
  .post(authProtect, adminProtect, upload.single("image"), createProduct);
router.get("/featured", getFeaturedProducts);
router.get("/recommended", getRecommendedProducts);
router.get("/category/:category", getProductsByCategory);
router
  .route("/:productId")
  .delete(authProtect, adminProtect, deleteProduct)
  .patch(authProtect, adminProtect, toggleFeatured);

export default router;
