import { getBrands } from "@/actions/brandActions";
import AddBrand from "@/components/AddBrand";
import DeleteBrand from "@/components/DeleteBrand";
import EditBrand from "@/components/EditBrand";

async function Brands() {
  const brands = await getBrands();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-header">Brand Management</h1>
          <p className="text-gray-600">Manage all your product brands in one place</p>
        </div>
        <AddBrand />
      </div>

      {/* Brands Grid */}
      {brands.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏷️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No brands yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first brand</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand, i) => (
            <div key={brand.id} className="card group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                    <p className="text-sm text-gray-500">Brand #{i + 1}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Website:</span>
                  {brand.website ? (
                    <a
                      href={brand.website as string}
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {brand.website.length > 30 
                        ? `${brand.website.substring(0, 30)}...` 
                        : brand.website}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">No website</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <EditBrand brand={brand} />
                <DeleteBrand brand_id={brand.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Brands;
