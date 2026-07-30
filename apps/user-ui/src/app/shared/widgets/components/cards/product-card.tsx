"use client";

import React, { useState, useEffect } from "react";
import { Heart, Eye, Star, Store, ShoppingCart, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductDetailsCard from "./product-details.card";

const ProductCard = ({
  product,
  isEvent,
}: {
  product: any;
  isEvent?: boolean;
}) => {
  const imageUrl = product?.images?.[0]?.url || "";
  const title = product?.title || "Untitled Product";
  const category = product?.category || "Category";
  const brand = product?.brand || "";
  const shopName = product?.shop?.name || "Unknown Shop";

  // Handle pricing logic correctly
  const regularPrice = product?.regular_price || 0;
  const salePrice = product?.sale_price || 0;
  const hasDiscount = regularPrice > salePrice && salePrice > 0;
  const displayPrice = hasDiscount ? salePrice : regularPrice;

  // Calculate discount percentage
  const discountPercentage = hasDiscount
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;

  const ratings = product?.ratings || 0;
  const isLowStock =
    typeof product?.stock === "number" &&
    product.stock > 0 &&
    product.stock <= 5;
  const isInStock = typeof product?.stock === "number" && product.stock > 0;

  // Time Left Logic for Events
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  // Quick View State
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isEvent || !product?.ending_date) return;

    const calculateTimeLeft = () => {
      const difference =
        new Date(product.ending_date).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft("Event Ended");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else {
        // Show seconds if less than a day
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s left`);
      }
    };

    // Initial calculation
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [isEvent, product?.ending_date]);

  return (
    <>
    
    <div className="group flex flex-col w-full bg-white dark:bg-[#111] rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-gray-200 dark:hover:border-white/10 transition-all duration-300 cursor-pointer overflow-hidden relative border border-gray-100 dark:border-white/5">
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {hasDiscount && (
          <span className="px-2 py-0.5 bg-rose-500/90 text-white text-[10px] font-medium uppercase tracking-wider rounded shadow-sm">
            -{discountPercentage}%
          </span>
        )}
        {isEvent && (
          <span className="px-2 py-0.5 bg-violet-600/90 text-white text-[10px] font-medium uppercase tracking-wider rounded shadow-sm">
            Event
          </span>
        )}
        {isLowStock && (
          <span className="px-2 py-0.5 bg-amber-100/90 text-amber-800 text-[10px] font-medium uppercase tracking-wider rounded shadow-sm flex items-center gap-1.5 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-600"></span>
            </span>
            Only {product.stock} Left
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="w-full aspect-[4/5] relative overflow-hidden bg-gray-50/50 dark:bg-zinc-900/30">
        <Link
          href={`/product/${product?.slug}`}
          className="block w-full h-full"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">
              No Image
            </div>
          )}
        </Link>

        {/* Hover Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
          <button
            className="w-8 h-8 bg-white/80 dark:bg-black/60 backdrop-blur-md text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-black rounded-full flex items-center justify-center shadow-sm transition-all duration-200"
            aria-label="Add to wishlist"
          >
            <Heart size={15} strokeWidth={2} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
            className="w-8 h-8 bg-white/80 dark:bg-black/60 backdrop-blur-md text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-black rounded-full flex items-center justify-center shadow-sm transition-all duration-200"
            aria-label="Quick view"
          >
            <Eye size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Live Countdown Overlay for Events */}
        {isEvent && timeLeft && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] bg-black/60 backdrop-blur-md text-white text-[11px] font-medium py-1.5 px-3 rounded flex items-center justify-center gap-1.5 shadow-sm border border-white/10 z-10">
            <Clock size={12} className="opacity-80" />
            <span className="tracking-wide">{timeLeft}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow bg-white dark:bg-[#111]">
        {/* Category, Brand & Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400 truncate pr-2">
            {category} {brand && <span className="opacity-70">| {brand}</span>}
          </span>
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 px-1.5 py-0.5 rounded flex-shrink-0">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 leading-none pt-[1px]">
              {ratings.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link
          href={`/product/${product?.slug}`}
          className="block group/link mb-1.5"
        >
          <h2
            className="font-medium text-gray-800 dark:text-gray-100 text-sm leading-relaxed line-clamp-2 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors"
            title={title}
          >
            {title}
          </h2>
        </Link>

        {/* Shop Info & Stock */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 mb-4 mt-auto">
          <div className="flex items-center gap-1.5">
            <Store size={13} className="opacity-60" />
            <span
              className="font-medium truncate max-w-[100px]"
              title={shopName}
            >
              {shopName}
            </span>
          </div>
          {isInStock && !isLowStock && (
            <span className="text-[9px] uppercase tracking-wider text-green-600 dark:text-green-500 font-medium">
              In Stock
            </span>
          )}
        </div>

        {/* Price & Action Section */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 mt-auto">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[11px] text-gray-400 dark:text-gray-500 line-through leading-none mb-1 font-medium">
                ${regularPrice.toFixed(2)}
              </span>
            )}
            <span className="font-semibold text-lg text-gray-900 dark:text-white leading-none">
              ${displayPrice.toFixed(2)}
            </span>
          </div>

          <button
            className="flex items-center justify-center w-8 h-8 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-200"
            aria-label="Add to cart"
          >
            <ShoppingCart size={15} strokeWidth={2} className="ml-[-1px]" />
          </button>
        </div>
      </div>

    </div>
      {open && <ProductDetailsCard data={product} setOpen={setOpen} />}
      </>
  );
};

export default ProductCard;
