import express, { Router } from "express";
import { createDiscountCodes, createProduct, deleteDiscountCode, deleteProduct, deleteProductImage, getAllProducts, getAllShopProducts, getCategories, getDiscountCodes, restoreProduct, uploadProductImage } from "../controllers/product.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.get("/get-discount-codes", isAuthenticated, isSeller, getDiscountCodes);
router.post("/create-discount-codes", isAuthenticated, isSeller, createDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, isSeller, deleteDiscountCode);
router.post("/upload-product-image", isAuthenticated, isSeller, uploadProductImage);
router.delete("/delete-product-image", isAuthenticated, isSeller, deleteProductImage);
router.post("/create-product", isAuthenticated, isSeller, createProduct);
router.get("/get-shop-products",isAuthenticated, getAllShopProducts);
router.delete("/delete-product/:productId",isAuthenticated, deleteProduct)
router.put("/restore-product/:productId",isAuthenticated, restoreProduct)
router.get("/get-all-products", isAuthenticated, getAllProducts)
export default router;