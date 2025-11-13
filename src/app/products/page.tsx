import { getProducts } from "@/actions/productActions";
import { DEFAULT_PAGE_SIZE } from "../../../constant";
import PaginationSection from "@/components/PaginationSection";
import SortBy from "@/components/SortBy";
import Filter from "@/components/Filter";
import ProductTable from "@/components/ProductTable";
import { Suspense } from "react";
import { getCategories } from "@/actions/categoryActions";
import { getBrands } from "@/actions/brandActions";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  old_price: number;
  discount: number;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
  gender: 'boy' | 'girl' | 'men' | 'women';
  occasion: string;
  colors: string;
  brands: string;
  rating: number;
  categories?: Array<{ id: number; name: string }>;
  [key: string]: any;
}

interface ProductsResponse {
  products: Product[];
  count: number;
  lastPage: number;
  numOfResultsOnCurPage: number;
}

interface SearchParams {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  categoryId?: string | string[];
  brandId?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  occasion?: string | string[];
  minDiscount?: string;
  maxDiscount?: string;
  gender?: string;
}

export default async function Products({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = Math.max(1, parseInt(searchParams.page as string) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.pageSize as string) || DEFAULT_PAGE_SIZE));
  
  const [sortField, sortOrder] = (searchParams.sortBy || 'created_at-desc').split('-') as [string, 'asc' | 'desc'];
  
  const categoryId = Array.isArray(searchParams.categoryId) 
    ? searchParams.categoryId 
    : searchParams.categoryId?.split(',').filter(Boolean) || [];
    
  const brandId = Array.isArray(searchParams.brandId)
    ? searchParams.brandId
    : searchParams.brandId?.split(',').filter(Boolean) || [];
    
  const occasion = Array.isArray(searchParams.occasion)
    ? searchParams.occasion
    : searchParams.occasion?.split(',').filter(Boolean) || [];

  const priceRange = searchParams.minPrice && searchParams.maxPrice
    ? { 
        min: parseFloat(searchParams.minPrice),
        max: parseFloat(searchParams.maxPrice)
      }
    : undefined;

  const discountRange = searchParams.minDiscount && searchParams.maxDiscount
    ? {
        min: parseFloat(searchParams.minDiscount),
        max: parseFloat(searchParams.maxDiscount)
      }
    : undefined;

  const response = await getProducts(
    page,
    pageSize,
    {
      categoryId,
      brandId,
      priceRange,
      occasion,
      discountRange,
      gender: searchParams.gender,
    },
    { field: sortField, order: sortOrder }
  ) as ProductsResponse;

  const products = response.products || [];
  const { lastPage, numOfResultsOnCurPage, count } = response;

  const brands = await getBrands();
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Our Products</h1>
        <div className="w-full md:w-auto">
          <SortBy />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <Filter categories={categories} brands={brands} />
        </aside>

        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(page * pageSize, count)}
              </span>{' '}
              of <span className="font-medium">{count}</span> results
            </p>
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg animate-pulse h-80" />
              ))}
            </div>
          }>
            <ProductTable
              products={products}
              numOfResultsOnCurPage={numOfResultsOnCurPage}
            />
          </Suspense>

          {Array.isArray(products) && products.length > 0 && (
            <div className="mt-8">
              <PaginationSection
                lastPage={lastPage}
                pageNo={page}
                pageSize={pageSize}
                totalItems={count}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
