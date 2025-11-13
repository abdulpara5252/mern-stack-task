"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const sortingOptions = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "created_at-desc", label: "Newest Arrivals" },
  { value: "created_at-asc", label: "Oldest First" },
  { value: "rating-desc", label: "Top Rated" },
  { value: "rating-asc", label: "Lowest Rated" },
];

function SortBy() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentSort = searchParams.get('sortBy') || '';

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    params.set('page', '1');
    
    if (newSort) {
      params.set('sortBy', newSort);
    } else {
      params.delete('sortBy');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="sorting" className="text-gray-700 text-sm font-medium whitespace-nowrap">
        Sort by:
      </label>
      <select
        id="sorting"
        value={currentSort}
        onChange={handleSortChange}
        className="bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
      >
        <option value="">Featured</option>
        {sortingOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SortBy;
