/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { MultiSelect } from "react-multi-select-component";
import "rc-slider/assets/index.css";
import { occasionOptions } from "../../constant";
import { useMemo } from "react";
import dynamic from "next/dynamic";
const Select = dynamic(() => import("react-select"), { ssr: false });

const discountOptions = [
  { value: "", label: "None" },
  { value: "0-5", label: "From 0% to 5%" },
  { value: "6-10", label: "From 6% to 10%" },
  { value: "11-15", label: "From 11 to 15%" },
];

function Filter({ categories, brands }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const brandsOption: any[] = useMemo(() => {
    return brands.map((brand: any) => ({
      value: brand.id,
      label: brand.name,
    }));
  }, [brands]);

  const categoriesOption: any[] = useMemo(() => {
    return categories.map((category: any) => ({
      value: category.id,
      label: category.name,
    }));
  }, [categories]);

  const occasionOption: any[] = useMemo(() => {
    return occasionOptions.map((item) => {
      return {
        value: item,
        label: item,
      };
    });
  }, []);

  // Url Helper Function
  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    params.set('page', '1'); // Reset to first page when filtering
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const [categoriesSelected, setCategoriesSelected] = useState(() => {
    const categoryIds = searchParams.get("categoryId");
    if (categoryIds) {
      return categoryIds
        .split(",")
        .map((categoryId) => {
          const category = categoriesOption.find(
            (option) => option.value === +categoryId
          );
          return category ? {
            value: +categoryId,
            label: category.label,
          } : null;
        })
        .filter(Boolean);
    }
    return [];
  });
  
  const [selectedGender, setSelectedGender] = useState(
    () => searchParams.get("gender") || ""
  );
  
  const [minPrice, setMinPrice] = useState(
    () => searchParams.get("minPrice") || "100"
  );
  
  const [maxPrice, setMaxPrice] = useState(
    () => searchParams.get("maxPrice") || "2000"
  );

  const [priceChanged, setPriceChanged] = useState(false);

  const initialDiscountOptions = useMemo(() => {
    const minDiscount = searchParams.get("minDiscount");
    const maxDiscount = searchParams.get("maxDiscount");
    if (minDiscount && maxDiscount) {
      const value = `${minDiscount}-${maxDiscount}`;
      return { value, label: `From ${minDiscount}% to ${maxDiscount}%` };
    }
    return discountOptions[0];
  }, [searchParams]);

  const [selectedBrands, setSelectedBrands] = useState(() => {
    const brandIds = searchParams.get("brandId");
    if (brandIds) {
      return brandIds
        .split(",")
        .map((brandId) => {
          const brand = brandsOption.find((option) => option.value === +brandId);
          return brand ? {
            value: +brandId,
            label: brand.label,
          } : null;
        })
        .filter(Boolean);
    }
    return [];
  });

  const initialOccasionOptions = useMemo(() => {
    const occasions = searchParams.get("occasion");
    if (occasions) {
      return occasions
        .split(",")
        .map((item) => ({ value: item, label: item }));
    }
    return [];
  }, [searchParams]);

  useEffect(() => {
    if (priceChanged) {
      const handler = setTimeout(() => {
        updateUrl({
          minPrice: minPrice,
          maxPrice: maxPrice
        });
        setPriceChanged(false);
      }, 500);

      return () => clearTimeout(handler);
    }
  }, [minPrice, maxPrice, priceChanged, updateUrl]);

  const handleBrandsSelect = useCallback((selectedOptions: any) => {
    setSelectedBrands(selectedOptions || []);
    const brandIds = selectedOptions?.map((option: any) => option.value).join(',') || '';
    updateUrl({ brandId: brandIds || null });
  }, [updateUrl]);

  const handleCategoriesSelected = useCallback((selectedOptions: any) => {
    setCategoriesSelected(selectedOptions);
    const categoryIds = selectedOptions?.map((option: any) => option.value).join(',') || '';
    updateUrl({ categoryId: categoryIds || null });
  }, [updateUrl]);

  const handleMinPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
    setPriceChanged(true);
  }, []);

  const handleMaxPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
    setPriceChanged(true);
  }, []);

  const handleGenderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const gender = e.target.value;
    setSelectedGender(gender);
    updateUrl({ gender: gender || null });
  }, [updateUrl]);

  const handleOccasions = useCallback((selectedOptions: any) => {
    const occasions = selectedOptions?.map((option: any) => option.value).join(',') || '';
    updateUrl({ occasion: occasions || null });
  }, [updateUrl]);

  const handleDiscount = useCallback((selectedOption: any) => {
    if (selectedOption?.value && selectedOption.value !== '') {
      const [min, max] = selectedOption.value.split('-');
      updateUrl({ 
        minDiscount: min,
        maxDiscount: max
      });
    } else {
      updateUrl({ 
        minDiscount: null,
        maxDiscount: null
      });
    }
  }, [updateUrl]);

  const handleClearAll = useCallback(() => {
    setCategoriesSelected([]);
    setSelectedBrands([]);
    setSelectedGender('');
    setMinPrice('100');
    setMaxPrice('2000');
    updateUrl({
      categoryId: null,
      brandId: null,
      minPrice: null,
      maxPrice: null,
      gender: null,
      occasion: null,
      minDiscount: null,
      maxDiscount: null
    });
  }, [updateUrl]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6 sticky top-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
        <button 
          onClick={handleClearAll}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Brands Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Brands</label>
        <Select
          className="text-black"
          options={brandsOption}
          isMulti
          name="brands"
          onChange={handleBrandsSelect}
          value={selectedBrands}
          placeholder="Select brands..."
        />
      </div>

      {/* Categories Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Categories</label>
        <MultiSelect
          className="text-black"
          options={categoriesOption}
          value={categoriesSelected as []}
          labelledBy="categories select"
          hasSelectAll={false}
          onChange={handleCategoriesSelected}
        />
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Price Range</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Min Price</label>
            <input
              type="number"
              min="0"
              max="10000"
              value={minPrice}
              onChange={handleMinPriceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Min"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Max Price</label>
            <input
              type="number"
              min="0"
              max="10000"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Max"
            />
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Range: ${minPrice} - ${maxPrice}
        </div>
      </div>

      {/* Gender Filter */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Gender</label>
        <div className="space-y-2">
          {[
            { value: '', label: 'All' },
            { value: 'men', label: 'Men' },
            { value: 'women', label: 'Women' },
            { value: 'boy', label: 'Boy' },
            { value: 'girl', label: 'Girl' }
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="gender"
                value={option.value}
                checked={selectedGender === option.value}
                onChange={handleGenderChange}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Occasion Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Occasion</label>
        <Select
          className="text-black"
          options={occasionOption}
          isMulti
          name="occasion"
          onChange={handleOccasions}
          value={initialOccasionOptions}
          placeholder="Select occasions..."
        />
      </div>

      {/* Discount Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Discount Range</label>
        <Select
          className="text-black"
          options={discountOptions}
          name="discount"
          value={initialDiscountOptions}
          onChange={handleDiscount}
          placeholder="Select discount range..."
        />
      </div>
    </div>
  );
}

export default Filter;
