import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();
    if (!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: [
            "Electronics",
            "Fashion",
            "Home & Kitchen",
            "Beauty & Personal Care",
            "Sports & Fitness",
            "Toys & Hobbies",
            "Automotive",
            "Other",
          ],
          subCategories: {
            Electronics: [
              "Mobile Phones",
              "Laptops",
              "Tablets",
              "Audio & Headphones",
              "Camera & Photo",
              "Wearable Technology",
              "Gaming Consoles",
              "Computer Components",
              "Printers & Scanners",
              "Office Electronics",
            ],
            Fashion: [
              "Men's Clothing",
              "Women's Clothing",
              "Kids' Clothing",
              "Accessories",
              "Footwear",
              "Jewelry",
              "Watches",
              "Bags",
              "Sunglasses",
              "Lingerie",
            ],
            "Home & Kitchen": [
              "Furniture",
              "Bedding",
              "Bath",
              "Home Decor",
              "Kitchenware",
              "Dining",
              "Storage & Organization",
              "Home Appliances",
              "Lamps & Lighting",
              "Rugs & Carpets",
            ],
            "Beauty & Personal Care": [
              "Skincare",
              "Makeup",
              "Haircare",
              "Fragrances",
              "Grooming",
              "Personal Care Appliances",
              "Bath & Body",
              "Health Care",
              "Oral Care",
              "Feminine Care",
            ],
            "Sports & Fitness": [
              "Fitness Equipment",
              "Sports Apparel",
              "Sports Accessories",
              "Team Sports",
              "Outdoor Recreation",
              "Cycling",
              "Water Sports",
              "Winter Sports",
              "Martial Arts",
              "Yoga & Pilates",
            ],
            "Toys & Hobbies": [
              "Action Figures",
              "Dolls & Accessories",
              "Building Toys",
              "Puzzles",
              "Board Games",
              "Art Supplies",
              "Craft Kits",
              "Model Kits",
              "Educational Toys",
              "Outdoor Toys",
            ],
            Automotive: [
              "Car Parts",
              "Car Care",
              "Electronics",
              "Accessories",
              "Tools",
              "Motorcycle & Powersports",
              "Tires & Wheels",
              "GPS & Navigation",
              "Audio & Video",
              "Safety & Security",
            ],
            Other: ["Pets", "Books", "Stationery", "Other"],
          },
        },
      });
    }
  } catch (error) {
    console.error("Error initializing config:", error);
  }
};

export default initializeSiteConfig;
