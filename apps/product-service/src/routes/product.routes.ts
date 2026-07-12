import express, { Router } from "express";
import { createDiscountCodes, createProduct, deleteDiscountCode, deleteProduct, deleteProductImage, getAllProducts, getCategories, getDiscountCodes, restoreProduct, uploadProductImage } from "../controllers/product.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";


const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.get("/get-discount-codes",isAuthenticated, getDiscountCodes);
router.post("/create-discount-codes",isAuthenticated, createDiscountCodes);
router.delete("/delete-discount-code/:id",isAuthenticated, deleteDiscountCode);
router.post("/upload-product-image",isAuthenticated, uploadProductImage);
router.delete("/delete-product-image",isAuthenticated, deleteProductImage);
router.post("/create-product",isAuthenticated, createProduct);
router.get("/get-all-products",isAuthenticated, getAllProducts);
router.delete("/delete-product/:productId",isAuthenticated, deleteProduct)
router.put("/restore-product/:productId",isAuthenticated, restoreProduct)

export default router;