"use client";

import { deleteProduct } from "@/actions/productActions";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

interface DeleteProductProps {
  productId: number;
  numOfResultsOnCurPage: number;
  isCompact?: boolean;
}

function DeleteProduct({ productId, numOfResultsOnCurPage, isCompact = false }: DeleteProductProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteProduct(productId);
      if (result.error) {
        toast.error(`Error: ${result.error}`);
        return;
      }
      
      toast.success("Product deleted successfully!");
      
      // If this was the last item on the page, go to previous page
      if (numOfResultsOnCurPage === 1) {
        const pageNo = Number(searchParams.get("page")) || 1;
        if (pageNo > 1) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", `${pageNo - 1}`);
          router.push(`${pathname}?${params.toString()}`);
          return;
        }
      }
      
      // Refresh the current page
      router.refresh();
    } catch (error) {
      toast.error("An unexpected error occurred while deleting the product");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isCompact) {
    return (
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="bg-red-600 text-white p-2 rounded-full text-xs font-medium hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete Product"
      >
        {isDeleting ? "⏳" : "🗑️"}
      </button>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full bg-red-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}

export default DeleteProduct;
