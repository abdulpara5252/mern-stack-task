import ProductCard from "./ProductCard";
import Empty from "./Empty";

interface Product {
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
}

interface ProductTableProps {
  products: Product[];
  numOfResultsOnCurPage: number;
}

async function ProductTable({ products, numOfResultsOnCurPage }: ProductTableProps) {
  if (products.length === 0) {
    return <Empty />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          numOfResultsOnCurPage={numOfResultsOnCurPage}
        />
      ))}
    </div>
  );
}

export default ProductTable;
