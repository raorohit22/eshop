"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { ChevronRight, Plus, Trash, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import Input from "packages/components/input";
import { AxiosError } from "axios";
import DeleteDiscountCodeModel from "apps/seller-ui/src/shared/components/models/delete.discount-codes";

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
      return res?.data?.discount_codes || [];
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: "",
      discountType: "percentage",
      discountValue: "",
      discountCode: "",
    },
  });

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data) => {
      await axiosInstance.post("/product/api/create-discount-codes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shop-discounts"],
      });
      reset();
      setShowModal(false);
      toast.success("Discount code created successfully");
    },
  });

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (discountId: string) => {
      await axiosInstance.delete(
        `/product/api/delete-discount-code/${discountId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shop-discounts"],
      });
      setShowDeleteModal(false);
      toast.success("Discount code deleted successfully");
    },
  });

  const handleDeleteClick = async (discount: any) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  };

  const onSubmit = async (data: any) => {
    if (discountCodes.length >= 8) {
      toast.error("You can only create up to 8 discount codes");
      return;
    }
    createDiscountCodeMutation.mutate(data);
  };

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">Discount Codes</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Create Discount
        </button>
      </div>
      {/* Breadcrumbs */}
      <div className="flex items-center text-white">
        <Link href={"/dashboard"} className="text-[#80Deea] cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Discount Codes</span>
      </div>

      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount codes
        </h3>
        {isLoading ? (
          <p className="text-gray-400 text-center">Loading discounts...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-3 text-left font-semibold">Title</th>
                <th className="p-3 text-left font-semibold">Type</th>
                <th className="p-3 text-left font-semibold">Value</th>
                <th className="p-3 text-left font-semibold">Code</th>
                <th className="p-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes?.map((discount: any) => (
                <tr
                  key={discount?.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="p-3">{discount?.public_name}</td>
                  <td className="p-3 capitalize">
                    {discount?.discountType === "percentage"
                      ? "Percentage (%)"
                      : "Flat ($)"}
                  </td>
                  <td className="p-3">
                    {discount.discountType === "percentage"
                      ? `${discount.discountValue}%`
                      : `$${discount.discountValue}`}
                  </td>
                  <td className="p-3">{discount.discountCode}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteClick(discount)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && discountCodes?.length === 0 && (
          <p className="text-center text-gray-400 pt-6 block w-full">
            No discount codes available!
          </p>
        )}
      </div>

      {/* Create Discount modal */}
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-lg font-semibold text-white">
                Create Discount Code
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
              <Input
                label="Title (Public Name)"
                {...register("public_name", { required: "Title is required" })}
              />
              {errors.public_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.public_name.message}
                </p>
              )}

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Discount Type
                </label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent text-gray-400 p-2 rounded-md"
                    >
                      <option value="percentage" className="bg-black">
                        Percentage (%)
                      </option>
                      <option value="flat" className="bg-black">
                        Flat Amount ($)
                      </option>
                    </select>
                  )}
                />
              </div>

              <div className="mt-2">
                <Input
                  label="Discount Value"
                  {...register("discountValue", {
                    required: "Discount value is required",
                  })}
                  type="number"
                />
                {errors.discountValue && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discountValue.message}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Discount Code"
                  {...register("discountCode", {
                    required: "Discount code is required",
                  })}
                />
                {errors.discountCode && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discountCode.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                {createDiscountCodeMutation.isPending
                  ? "Creating..."
                  : "Create Discount Code"}
              </button>

              {createDiscountCodeMutation.isError && (
                <p className="text-red-500 text-xs mt-1">
                  {(
                    createDiscountCodeMutation.error as AxiosError<{
                      message: string;
                    }>
                  )?.response?.data?.message || "Something went wrong"}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountCodeModel
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            deleteDiscountCodeMutation.mutate(selectedDiscount?.id);
          }}
          discount={selectedDiscount}
        />
      )}
    </div>
  );
};

export default Page;
