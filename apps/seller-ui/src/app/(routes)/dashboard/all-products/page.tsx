"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Search,
  Pencil,
  Trash,
  Eye,
  Plus,
  BarChart,
  Star,
  ChevronRight,
  PackageOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DeleteConfirmationModal from "apps/seller-ui/src/shared/components/models/delete.conformation.modal";

const fetchProducts = async () => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  return res?.data?.products;
};

const deleteProduct = async (productId: string) => {
  await axiosInstance.delete(`/product/api/delete-product/${productId}`);
};

const restoreProduct = async (productId: string) => {
  await axiosInstance.patch(`/product/api/restore-product/${productId}`);
};

const ProductList = () => {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["all-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
    },
    onError: (error: any) => {
      console.log(error);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
    },
    onError: (error: any) => {
      console.log(error);
    },
  });

  const openAnalytics = (product: any) => {
    setAnalyticsData(product);
    setShowAnalytics(true);
  };

  const openDeleteModal = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Product",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden border border-slate-700 shadow-sm shrink-0">
              {row.original.images?.[0]?.url ? (
                <Image
                  src={row.original.images[0].url}
                  alt={row.original.title}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <PackageOpen size={20} />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <Link
                href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                className="text-slate-200 font-medium hover:text-blue-400 transition-colors line-clamp-1"
                title={row.original.title}
              >
                {row.original.title}
              </Link>
              <span className="text-xs text-slate-500">ID: {row.original._id?.slice(-6).toUpperCase()}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => (
          <span className="font-medium text-slate-200">${row.original.sale_price?.toFixed(2) || '0.00'}</span>
        ),
      },
      {
        accessorKey: "stock",
        header: "Inventory",
        cell: ({ row }: any) => {
          const stock = row.original.stock || 0;
          const isLow = stock < 10;
          const isOut = stock === 0;
          return (
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              isOut ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
              isLow ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
              'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }`}>
              {isOut ? 'Out of Stock' : `${stock} in stock`}
            </div>
          )
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }: any) => (
          <span className="inline-block px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-md border border-slate-700">
            {row.original.category || 'Uncategorized'}
          </span>
        ),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1.5 bg-slate-800/50 w-fit px-2 py-1 rounded-md border border-slate-700/50">
            <Star fill="#eab308" className="text-yellow-500" size={14} />
            <span className="text-slate-300 text-sm font-medium">{row.original.rating || '5.0'}</span>
          </div>
        ),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`/dashboard/all-products/${row.original._id}`)}
              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
              title="View Details"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => router.push(`/dashboard/all-products/${row.original._id}`)}
              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
              title="Edit Product"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => openAnalytics(row.original)}
              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors"
              title="View Analytics"
            >
              <BarChart size={18} />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1"></div>
            <button
              onClick={() => openDeleteModal(row.original)}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
              title="Delete Product"
            >
              <Trash size={18} />
            </button>
          </div>
        ),
      },
    ],
    [router],
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center text-sm font-medium mb-2">
            <Link href={"/dashboard"} className="text-slate-400 hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <ChevronRight size={16} className="text-slate-600 mx-1" />
            <span className="text-slate-200">Products</span>
          </div>
          <h2 className="text-3xl text-white font-bold tracking-tight">Product Inventory</h2>
        </div>

        <Link
          href="/dashboard/create-product"
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
        >
          <Plus size={18} strokeWidth={2.5} />
          New Product
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-[#0f1115] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#13161a]">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search products by name or ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
          <div className="text-sm font-medium text-slate-400">
            Showing <span className="text-white">{table.getRowModel().rows.length}</span> products
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-medium">Loading inventory...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <PackageOpen size={32} className="text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">No products found</h3>
              <p className="text-slate-400 max-w-sm">Get started by creating your first product to see it listed here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-[#15181c] border-b border-slate-800">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody className="divide-y divide-slate-800">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#15181c] transition-colors duration-150 group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showDeleteModal && selectedProduct && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
          onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
        />
      )}
    </div>
  );
};

export default ProductList;
