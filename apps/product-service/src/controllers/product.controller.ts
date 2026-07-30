import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { Request, Response, NextFunction } from "express";
import imageKit from "@packages/libs/imagekit";
import { Prisma } from "@prisma/client";

//  get Product categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.site_config.findFirst();
    if (!config) {
      return res.status(404).json({
        message: "No config found",
      });
    }
    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error: any) {
    next(error);
  }
};

// create discount codes
export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: {
        discountCode,
      },
    });

    if (isDiscountCodeExist) {
      return next(
        new ValidationError(
          "Discount code already available please use a different code!",
        ),
      );
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id,
      },
    });

    return res.status(201).json({
      message: "Discount code created successfully",
      success: true,
      discount_code,
    });
  } catch (error: any) {
    next(error);
  }
};

// get discount codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
    });
    return res.status(200).json({
      message: "Discount codes fetched successfully",
      success: true,
      discount_codes,
    });
  } catch (error: any) {
    next(error);
  }
};

// delete discount codes
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller.id;

    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: {
        id,
      },
      select: { id: true, sellerId: true },
    });

    if (!isDiscountCodeExist) {
      return next(new NotFoundError("Discount code not found"));
    }

    if (isDiscountCodeExist.sellerId !== sellerId) {
      return next(new ValidationError("Unauthorized access"));
    }

    await prisma.discount_codes.delete({
      where: {
        id,
      },
    });
    return res.status(200).json({
      message: "Discount code deleted successfully",
      success: true,
    });
  } catch (error: any) {
    next(error);
  }
};

// upload product image
export const uploadProductImage = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileName } = req.body;
    const response = await imageKit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: "/products",
    });
    return res.status(201).json({
      message: "Product image uploaded successfully",
      success: true,
      file_url: response.url,
      fileId: response.fileId,
    });
  } catch (error: any) {
    next(error);
  }
};

// delete product image
export const deleteProductImage = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileId } = req.body;
    await imageKit.deleteFile(fileId);
    return res.status(200).json({
      message: "Product image deleted successfully",
      success: true,
    });
  } catch (error: any) {
    next(error);
  }
};

//create product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      category,
      subcategory,
      brand,
      stock,
      price,
      tags,
      cash_on_delivery,
      video_url,
      colors = [],
      sizes = [],
      discountCodes,
      discount,
      stock_alert,
      variants,
      product_variants,
      warranty,
      custom_specifications,
      slug,
      sale_price,
      regular_price,
      customProperties = [],
      images = [],
    } = req.body;

    if (!title || !category) {
      return next(new ValidationError("All fields are required"));
    }

    if (!req.seller.id) {
      return next(new AuthError("Only seller can create products!"));
    }

    if (!req.seller.shop) {
      return next(
        new ValidationError(
          "You need to create a shop before adding products!",
        ),
      );
    }

    const slugChecking = await prisma.products.findUnique({
      where: {
        slug,
      },
    });

    if (slugChecking) {
      return next(new ValidationError("Slug already exists!"));
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        category,
        subCategory: subcategory,
        brand,
        stock: parseInt(stock),
        price,
        tags: Array.isArray(tags) ? tags : tags.split(","),
        cash_on_delivery,
        video_url,
        colors: colors || [],
        sizes: sizes || [],
        discount_codes: discountCodes.map((codeId: string) => codeId),
        discount,
        stock_alert,
        variants,
        product_variants,
        warranty,
        custom_specifications,
        slug,
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        customProperties: customProperties || {},
        description: detailed_description || "",
        images: {
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((image: any) => ({
              file_id: image.fileId,
              url: image.file_url,
            })),
        },

        shopId: req.seller.shop.id,
      },
      include: { images: true },
    });

    res.status(201).json({
      message: "Product created successfully",
      success: true,
      newProduct,
    });
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error);
    next(error);
  }
};

// get all shop products
export const getAllShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        shopId: req?.seller?.shop?.id,
      },
      include: {
        images: true,
      },
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error: any) {
    next(error);
  }
};

// delete product
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;
    const product = await prisma.products.findUnique({
      where: {
        id: productId,
      },
      select: { id: true, shopId: true, isDeleted: true },
    });
    if (!product) {
      return next(new ValidationError("Product not found"));
    }
    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized access"));
    }
    if (product.isDeleted) {
      return next(new ValidationError("Product is already deleted"));
    }

    const deletedProduct = await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() * 24 * 60 * 60 * 1000),
      },
    });
    return res.status(200).json({
      message: "Product deleted successfully",
      success: true,
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error: any) {
    next(error);
  }
};

// restore product
export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;
    const product = await prisma.products.findUnique({
      where: {
        id: productId,
      },
      select: { id: true, shopId: true, isDeleted: true },
    });
    if (!product) {
      return next(new ValidationError("Product not found"));
    }
    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized access"));
    }
    if (!product.isDeleted) {
      return res
        .status(400)
        .json({ message: "Product is not in deleted state", success: false });
    }

    await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
    return res.status(200).json({
      message: "Product restored successfully",
      success: true,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error restoring product",
      error,
    });
  }
};

//get all products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const type = req.query.type;

    // Safety check: Fetch valid shop IDs to filter out orphaned products
    // (products with a shopId that doesn't correspond to a real shop).
    // This prevents Prisma from throwing an "Inconsistent query result" error.
    const validShops = await prisma.shops.findMany({ select: { id: true } });
    const validShopIds = validShops.map((s) => s.id);

    // MongoDB quirk: { field: null } does NOT match documents where the field
    // is absent/missing — only where it's explicitly stored as null.
    // Your products never write starting_date/ending_date, so the fields are
    // absent. Use NOT + isSet to exclude only time-limited promotions.
    const baseFilter: Prisma.productsWhereInput = {
      isDeleted: { not: true },
      shopId: { in: validShopIds },
      NOT: {
        AND: [
          { starting_date: { isSet: true } },
          { ending_date: { isSet: true } },
        ],
      },
    };

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === "latest"
        ? { createdAt: "desc" as Prisma.SortOrder }
        : { totalSales: "desc" as Prisma.SortOrder };

    const [products, total, top10Products] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: {
          images: true,
          shop: true,
        },
        where: baseFilter,
        orderBy,
      }),

      prisma.products.count({
        where: baseFilter,
      }),

      prisma.products.findMany({
        take: 10,
        where: baseFilter,
        orderBy,
      }),
    ]);

    res.status(200).json({
      success: true,
      products,
      top10By: type === "latest" ? "latest" : "topSales",
      top10Products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("[getAllProducts] Error:", error?.message || error);
    next(error);
  }
};
