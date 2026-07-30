"use client";
import { useQuery } from "@tanstack/react-query";
import ImagePlaceholder from "apps/seller-ui/src/shared/components/image-placeholder";
import { enhancements } from "apps/seller-ui/src/utils/AI.enhancement";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { ChevronRight, Wand, X, Save, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ColorSelector from "packages/components/color-selector";
import CustomProperties from "packages/components/custom-properties";
import CustomSpecifications from "packages/components/custom-specifications";
import Input from "packages/components/input";
import RichTextEditor from "packages/components/rich-text-editor";
import SizeSelector from "packages/components/size-selector";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";

interface UploadedImage {
  fileId: string;
  file_url: string;
}

const Page = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(true);
  const [pictureUploadingLoader, setPictureUploadingLoader] =
    useState<boolean>(false);
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-categories");
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
      return res?.data?.discount_codes || [];
    },
  });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const subcategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await axiosInstance.post("/product/api/create-product", data);
      router.push("/dashboard/all-products");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    setPictureUploadingLoader(true);
    try {
      const fileName = await convertFileToBase64(file);

      const response = await axiosInstance.post(
        "/product/api/upload-product-image",
        { fileName },
      );

      const updatedImages = [...images];
      const uploadedImage: UploadedImage = {
        file_url: response.data.file_url,
        fileId: response.data.fileId,
      };
      updatedImages[index] = uploadedImage;

      if (index === images.length - 1 && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    } finally {
      setPictureUploadingLoader(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const updatedImages = [...images];

      const imageToDelete = updatedImages[index];
      if (imageToDelete && typeof imageToDelete === "object") {
        await axiosInstance.delete("/product/api/delete-product-image", {
          data: {
            fileId: imageToDelete.fileId,
          },
        });
      }
      updatedImages.splice(index, 1);

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    }
  };

  const applyTransformation = async (transformation: string) => {
    if (!selectedImage || processing) return;
    setProcessing(true);
    setActiveEffect(transformation);

    try {
      const transformUrl = `${selectedImage}?tr=${transformation}`;
      setSelectedImage(transformUrl);
    } catch (error) {
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <div className="w-full p-4">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col mb-4">
        <div className="flex items-center text-sm font-medium mb-2">
          <Link href={"/dashboard"} className="text-slate-400 hover:text-blue-400 transition-colors">
            Dashboard
          </Link>
          <ChevronRight size={16} className="text-slate-600 mx-1" />
          <Link href={"/dashboard/all-products"} className="text-slate-400 hover:text-blue-400 transition-colors">
            Products
          </Link>
          <ChevronRight size={16} className="text-slate-600 mx-1" />
          <span className="text-slate-200">Create New</span>
        </div>
        <h2 className="text-3xl text-white font-bold tracking-tight">Create Product</h2>
        <p className="text-slate-400 mt-1">Add a new product to your inventory</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Main Card */}
        <div className="bg-[#0f1115] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Content Layout */}
          <div className="p-4 md:p-6 w-full flex flex-col lg:flex-row gap-6">
            {/* Left Column (Images) */}
            <div className="w-full lg:w-[35%] flex flex-col gap-4">
              <div className="bg-[#13161a] p-4 rounded-xl border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-4">Product Images</h3>
                {images?.length > 0 && (
                  <div className="mb-4">
                    <ImagePlaceholder
                      setOpenImageModal={setOpenImageModal}
                      size="765 x 850"
                      small={false}
                      images={images}
                      index={0}
                      pictureUploadingLoader={pictureUploadingLoader}
                      onImageChange={handleImageChange}
                      setSelectedImage={setSelectedImage}
                      onRemove={handleRemoveImage}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {images?.slice(1).map((_, index) => (
                    <ImagePlaceholder
                      setOpenImageModal={setOpenImageModal}
                      size="765 x 850"
                      small={true}
                      images={images}
                      key={index}
                      index={index + 1}
                      pictureUploadingLoader={pictureUploadingLoader}
                      onImageChange={handleImageChange}
                      setSelectedImage={setSelectedImage}
                      onRemove={handleRemoveImage}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-4 text-center">First image will be used as the thumbnail.</p>
              </div>
            </div>

            {/* Right Side (Form Fields) */}
            <div className="w-full lg:w-[65%] flex flex-col md:flex-row gap-6">
              
              {/* Column 1 */}
              <div className="w-full md:w-1/2 flex flex-col gap-5">
                <div>
                  <Input
                    label="Product Title *"
                    type="text"
                    placeholder="E.g. Premium Wireless Headphones"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.title.message as string}</p>
                  )}
                </div>

                <div>
                  <Input
                    type="textarea"
                    rows={6}
                    cols={10}
                    label="Short Description * (Max 150 words)"
                    placeholder="Quick overview for product cards..."
                    {...register("short_description", {
                      required: "Description is required",
                      validate: (value) => {
                        const wordCount = value.trim().split(/\s+/).length;
                        return wordCount <= 150 || `Exceeds 150 words limit (Current: ${wordCount})`;
                      },
                    })}
                  />
                  {errors.short_description && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.short_description.message as string}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Tags *"
                    placeholder="electronics, wireless, audio"
                    {...register("tags", { required: "Tags are required" })}
                  />
                  {errors.tags && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.tags.message as string}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Warranty"
                    placeholder="e.g. 1 Year Manufacturer Warranty"
                    {...register("warranty", { required: "Warranty is required" })}
                  />
                  {errors.warranty && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.warranty.message as string}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="URL Slug *"
                    placeholder="premium-wireless-headphones"
                    {...register("slug", {
                      required: "Slug is required",
                      pattern: {
                        value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                        message: "Lowercase letters, numbers and hyphens only",
                      },
                      minLength: { value: 3, message: "Min 3 characters" },
                      maxLength: { value: 50, message: "Max 50 characters" },
                    })}
                  />
                  {errors.slug && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.slug.message as string}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Brand *"
                    placeholder="e.g. Sony"
                    {...register("brand", { required: "Brand is required" })}
                  />
                  {errors.brand && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.brand.message as string}</p>
                  )}
                </div>

                <div className="pt-2">
                  <ColorSelector control={control} errors={errors} />
                </div>

                <div className="pt-2">
                  <CustomSpecifications control={control} errors={errors} />
                </div>

                <div className="pt-2">
                  <CustomProperties control={control} errors={errors} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Cash on Delivery *
                  </label>
                  <select
                    {...register("cash_on_delivery", { required: "Required" })}
                    defaultValue="yes"
                    className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="yes" className="bg-slate-900 text-white">Yes, allow COD</option>
                    <option value="no" className="bg-slate-900 text-white">No, prepaid only</option>
                  </select>
                  {errors.cash_on_delivery && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.cash_on_delivery.message as string}</p>
                  )}
                </div>
              </div>

              {/* Column 2 */}
              <div className="w-full md:w-1/2 flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Category *
                  </label>
                  {isLoading ? (
                    <div className="animate-pulse h-11 bg-slate-800 rounded-lg w-full"></div>
                  ) : isError ? (
                    <p className="text-red-400 text-sm">Failed to load categories</p>
                  ) : (
                    <Controller
                      name="category"
                      control={control}
                      rules={{ required: "Category is required" }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="" className="bg-slate-900 text-slate-400">Select category</option>
                          {categories?.map((category: string) => (
                            <option key={category} value={category} className="bg-slate-900 text-white">
                              {category}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  )}
                  {errors.category && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.category.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Sub Category *
                  </label>
                  {isLoading ? (
                    <div className="animate-pulse h-11 bg-slate-800 rounded-lg w-full"></div>
                  ) : isError ? (
                    <p className="text-red-400 text-sm">Failed to load sub categories</p>
                  ) : (
                    <Controller
                      name="subcategory"
                      control={control}
                      rules={{ required: "Sub Category is required" }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                          disabled={!selectedCategory}
                        >
                          <option value="" className="bg-slate-900 text-slate-400">Select subcategory</option>
                          {subcategories?.map((subcategory: string) => (
                            <option key={subcategory} value={subcategory} className="bg-slate-900 text-white">
                              {subcategory}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  )}
                  {errors.subcategory && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.subcategory.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Detailed Description * (Min 100 words)
                  </label>
                  <div className="rounded-lg overflow-hidden border border-slate-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <Controller
                      name="detailed_description"
                      control={control}
                      rules={{
                        required: "Detailed Description is required",
                        validate: (value: string) => {
                          const text = value?.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
                          const wordCount = text?.split(/\s+/).filter((word: string) => word.length > 0).length;
                          return wordCount >= 100 || `Minimum 100 words required (Current: ${wordCount || 0})`;
                        },
                      }}
                      render={({ field }) => (
                        <RichTextEditor value={field.value} onChange={field.onChange} />
                      )}
                    />
                  </div>
                  {errors.detailed_description && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.detailed_description.message as string}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Video Demo URL"
                    placeholder="https://www.youtube.com/embed/..."
                    {...register("video_url", {
                      pattern: {
                        value: /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                        message: "Invalid format. Expected: https://www.youtube.com/embed/xyz123",
                      },
                    })}
                  />
                  {errors.video_url && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.video_url.message as string}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Regular Price ($)"
                      placeholder="e.g. 199.99"
                      {...register("regular_price", {
                        valueAsNumber: true,
                        min: { value: 1, message: "Min price is $1" },
                        validate: (value) => !isNaN(value) || "Must be a number",
                      })}
                    />
                    {errors.regular_price && (
                      <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.regular_price.message as string}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Sale Price ($)"
                      placeholder="e.g. 149.99"
                      {...register("sale_price", {
                        valueAsNumber: true,
                        min: { value: 1, message: "Min price is $1" },
                        validate: (value) => {
                          if (isNaN(value)) return "Must be a number";
                          if (regularPrice && value >= regularPrice) return "Must be less than regular price";
                          return true;
                        },
                      })}
                    />
                    {errors.sale_price && (
                      <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.sale_price.message as string}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Input
                    label="Available Stock *"
                    placeholder="e.g. 50"
                    {...register("stock", {
                      required: "Stock is required",
                      valueAsNumber: true,
                      min: { value: 1, message: "Min stock is 1" },
                      max: { value: 10000, message: "Max stock is 10000" },
                      validate: (value) => {
                        if (isNaN(value)) return "Must be a number";
                        if (!Number.isInteger(value)) return "Must be a whole number";
                        return true;
                      },
                    })}
                  />
                  {errors.stock && (
                    <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.stock.message as string}</p>
                  )}
                </div>

                <div className="pt-2">
                  <SizeSelector control={control} errors={errors} />
                </div>

                <div className="bg-[#13161a] border border-slate-800 rounded-xl p-4 mt-1">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Active Discount Codes
                  </label>
                  {discountLoading ? (
                    <div className="animate-pulse h-8 bg-slate-800 rounded-lg w-1/2"></div>
                  ) : discountCodes.length === 0 ? (
                    <p className="text-slate-500 text-sm">No discount codes available.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {discountCodes?.map((code: any) => {
                        const isSelected = watch("discountCodes")?.includes(code?.id);
                        return (
                          <button
                            type="button"
                            key={code?.id}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                              isSelected 
                                ? "bg-blue-600/20 text-blue-400 border-blue-500/30" 
                                : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                            }`}
                            onClick={() => {
                              const currentSelection = watch("discountCodes") || [];
                              const updatedSelection = isSelected
                                ? currentSelection.filter((id: string) => id !== code.id)
                                : [...currentSelection, code.id];
                              setValue("discountCodes", updatedSelection);
                            }}
                          >
                            {code?.public_name} ({code.discountvalue}{code.discountType === "percentage" ? "%" : "$"})
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
          
          {/* Footer Action Bar */}
          <div className="px-6 py-5 border-t border-slate-800 bg-[#13161a] flex items-center justify-end gap-4">
            {isChanged && (
              <button
                type="button"
                className="px-6 py-2.5 flex items-center gap-2 bg-transparent border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white rounded-lg font-medium transition-all"
                onClick={handleSaveDraft}
              >
                <Save size={18} />
                Save Draft
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <Plus size={18} strokeWidth={2.5} />
                  Publish Product
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* AI Image Enhancement Modal */}
      {openImageModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
          <div className="bg-[#13161a] border border-slate-700 p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Wand className="text-blue-500" size={24} />
                AI Magic Enhancement
              </h2>
              <button 
                onClick={() => setOpenImageModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="relative w-full h-[300px] rounded-xl overflow-hidden bg-black border border-slate-800">
              {processing && (
                <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
              <Image
                src={selectedImage || ""}
                alt="Product preview"
                fill
                className="object-contain"
              />
            </div>
            
            {selectedImage && (
              <div className="mt-5">
                <p className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
                  Apply Transformation
                </p>
                <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {enhancements.map(({ label, value }) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => applyTransformation(value)}
                      disabled={processing}
                      className={`px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50
                        ${activeEffect === value 
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.15)]" 
                          : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
