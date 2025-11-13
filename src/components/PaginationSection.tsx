"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface PaginationSectionProps {
  lastPage: number;
  pageNo: number;
  pageSize: number;
  totalItems?: number;
}

function PaginationSection({
  lastPage,
  pageNo,
  pageSize,
  totalItems = 0,
}: PaginationSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateUrl = useCallback((updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    
    if ('pageSize' in updates) {
      params.set('page', '1');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl({ pageSize: e.target.value });
  };

  const goToPage = (page: number) => {
    updateUrl({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pageNo - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(lastPage, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < lastPage) {
      if (endPage < lastPage - 1) {
        pages.push('...');
      }
      pages.push(lastPage);
    }

    return pages;
  };

  if (lastPage <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{(pageNo - 1) * pageSize + 1}</span> to{' '}
        <span className="font-medium">
          {Math.min(pageNo * pageSize, totalItems)}
        </span>{' '}
        of <span className="font-medium">{totalItems}</span> results
      </div>
      
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {[10, 25, 50].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
        
        <nav className="flex items-center gap-1">
          <button
            onClick={() => goToPage(1)}
            disabled={pageNo === 1}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="First page"
          >
            «
          </button>
          <button
            onClick={() => goToPage(Math.max(1, pageNo - 1))}
            disabled={pageNo === 1}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            ‹
          </button>
          
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && goToPage(page)}
              disabled={page === '...' || page === pageNo}
              className={`px-3 py-1.5 rounded-md border text-sm font-medium ${
                page === pageNo
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              } ${page === '...' ? 'cursor-default' : ''}`}
              aria-current={page === pageNo ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => goToPage(Math.min(lastPage, pageNo + 1))}
            disabled={pageNo === lastPage}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            ›
          </button>
          <button
            onClick={() => goToPage(lastPage)}
            disabled={pageNo === lastPage}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Last page"
          >
            »
          </button>
        </nav>
      </div>
    </div>
  );
}

export default PaginationSection;
