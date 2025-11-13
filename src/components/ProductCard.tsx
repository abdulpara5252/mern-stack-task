import { formatCurrency } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import DeleteProduct from "./DeleteProduct";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    old_price: number;
    discount: number;
    image_url: string | null;
    gender: string;
    occasion: string;
    colors: string;
    brands: string;
    rating: number;
    categories?: Array<{ id: number; name: string }>;
  };
  numOfResultsOnCurPage: number;
}

export default function ProductCard({ product, numOfResultsOnCurPage }: ProductCardProps) {
  const discountPercentage = product.old_price > 0 
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  const brandNames = (() => {
    try {
      const brandIds = JSON.parse(product.brands);
      return Array.isArray(brandIds) ? brandIds.join(", ") : "Unknown";
    } catch {
      return "Unknown";
    }
  })();

  const categoryNames = product.categories?.map(cat => cat.name).join(", ") || "Uncategorized";
  const colorList = product.colors?.split(",").map(c => c.trim()) || [];
  const occasionList = product.occasion?.split(",").map(o => o.trim()) || [];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group relative">
      <div className="absolute top-2 left-2 z-10 flex gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/products/${product.id}/edit`}
          className="bg-blue-600 text-white p-2 rounded-full text-xs font-medium hover:bg-blue-700 transition-colors shadow-lg"
          title="Edit Product"
        >
          ✏️
        </Link>
        <div>
          <DeleteProduct
            numOfResultsOnCurPage={numOfResultsOnCurPage}
            productId={product.id}
            isCompact={true}
          />
        </div>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square">
        <Image
          src={product.image_url || "/images/dummy.webp"}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {discountPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
            -{discountPercentage}%
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-sm">
          ⭐ {product.rating || 0}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.description}
          </p>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            {product.old_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.old_price)}
              </span>
            )}
          </div>
        </div>

        {/* Categories */}
        {categoryNames && (
          <div className="mb-2">
            <span className="text-xs text-gray-500">Categories: </span>
            <span className="text-xs text-gray-700">{categoryNames}</span>
          </div>
        )}

        {/* Colors */}
        {colorList.length > 0 && (
          <div className="mb-2">
            <span className="text-xs text-gray-500">Colors: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {colorList.slice(0, 3).map((color, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-700"
                >
                  {color}
                </span>
              ))}
              {colorList.length > 3 && (
                <span className="text-xs text-gray-500">+{colorList.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Gender & Occasions */}
        <div className="mb-3 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Gender:</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">
              {product.gender}
            </span>
          </div>
          {occasionList.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Occasions:</span>
              <div className="flex flex-wrap gap-1">
                {occasionList.slice(0, 2).map((occasion, index) => (
                  <span
                    key={index}
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full capitalize"
                  >
                    {occasion}
                  </span>
                ))}
                {occasionList.length > 2 && (
                  <span className="text-xs text-gray-500">+{occasionList.length - 2}</span>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
