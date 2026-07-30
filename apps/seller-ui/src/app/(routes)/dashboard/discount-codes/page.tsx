"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { ChevronRight, Plus, Trash, X, TicketPercent } from "lucide-react";
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
    <div className="w-full p-4 md:p-6 lg:p-8">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <div className="flex items-center text-sm font-medium mb-2">
            <Link href={"/dashboard"} className="text-slate-400 hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <ChevronRight size={16} className="text-slate-600 mx-1" />
            <span className="text-slate-200">Discount Codes</span>
          </div>
          <h2 className="text-3xl text-white font-bold tracking-tight">Discount Codes</h2>
          <p className="text-slate-400 mt-1">Manage promotional codes and special offers</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
        >
          <Plus size={18} strokeWidth={2.5} />
          Create Discount
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-[#0f1115] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#13161a]">
          <h3 className="text-lg font-semibold text-white">Active Codes</h3>
          <div className="text-sm font-medium text-slate-400">
            {discountCodes.length} / 8 <span className="text-slate-500 font-normal">used</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-medium">Loading discounts...</p>
            </div>
          ) : discountCodes?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <TicketPercent size={32} className="text-slate-500 transform -rotate-12" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">No discount codes</h3>
              <p className="text-slate-400 max-w-sm mb-6">Create promotional codes to offer your customers special deals.</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-slate-700"
              >
                <Plus size={16} /> Create your first code
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#15181c] border-b border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Title</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Value</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Code</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {discountCodes?.map((discount: any) => (
                  <tr
                    key={discount?.id}
                    className="hover:bg-[#15181c] transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-200">{discount?.public_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        discount?.discountType === "percentage" 
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {discount?.discountType === "percentage" ? "Percentage" : "Flat Amount"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-white">
                        {discount.discountType === "percentage"
                          ? `${discount.discountValue}%`
                          : `$${discount.discountValue}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center px-3 py-1 bg-slate-900 border border-slate-700 rounded-md font-mono text-sm text-blue-400 tracking-wide select-all">
                        {discount.discountCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteClick(discount)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Delete code"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Discount Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#13161a] p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TicketPercent className="text-blue-500" size={24} />
                Create Discount Code
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Input
                  label="Title (Public Name) *"
                  placeholder="e.g. Summer Sale 2024"
                  {...register("public_name", { required: "Title is required" })}
                />
                {errors.public_name && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.public_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Discount Type *
                </label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full bg-slate-900 border border-slate-700 text-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="percentage" className="bg-slate-900 text-white">Percentage (%)</option>
                      <option value="flat" className="bg-slate-900 text-white">Flat Amount ($)</option>
                    </select>
                  )}
                />
              </div>

              <div>
                <Input
                  label="Discount Value *"
                  placeholder="e.g. 20"
                  type="number"
                  {...register("discountValue", {
                    required: "Discount value is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Must be at least 1" }
                  })}
                />
                {errors.discountValue && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.discountValue.message}</p>
                )}
              </div>

              <div>
                <Input
                  label="Discount Code *"
                  placeholder="e.g. SUMMER20"
                  {...register("discountCode", {
                    required: "Discount code is required",
                    pattern: {
                      value: /^[A-Z0-9_-]+$/,
                      message: "Uppercase letters, numbers, hyphens and underscores only"
                    }
                  })}
                />
                {errors.discountCode && (
                  <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.discountCode.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={createDiscountCodeMutation.isPending}
                >
                  {createDiscountCodeMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} strokeWidth={2.5} />
                      Create Discount Code
                    </>
                  )}
                </button>
              </div>

              {createDiscountCodeMutation.isError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium text-center">
                  {(createDiscountCodeMutation.error as AxiosError<{ message: string }>)?.response?.data?.message || "Something went wrong"}
                </div>
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
