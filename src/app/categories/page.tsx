import AddCategory from "@/components/AddCategory";
import DeleteCategory from "@/components/DeleteCategory";
import EditCategory from "@/components/EditCategory";
import { convertToNestedCategories } from "@/utils";
import { getCategories } from "@/actions/categoryActions";
import React from "react";
import { authOptions } from "../../utils/authOptions";
import { cookies } from "next/headers";

// export const dynamic = "force-dynamic";

async function Categories() {
  const categories = await getCategories();
  const modifiedCategories = convertToNestedCategories(categories);

  function renderCategories(categories, depth) {
    return categories.map((category, i) => {
      return (
        <div
          key={i}
          className={`${depth === 0 ? "card mb-6" : "ml-6 mt-3 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-200"}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                depth === 0 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-gray-200 text-gray-600"
              }`}>
                {depth === 0 ? "📂" : "📄"}
              </div>
              <div>
                <h3 className={`font-medium ${depth === 0 ? "text-lg text-gray-900" : "text-gray-700"}`}>
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {depth === 0 ? "Main Category" : "Subcategory"}
                  {category.subCategories?.length > 0 && ` • ${category.subCategories.length} subcategories`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <EditCategory category={category} />
              <DeleteCategory category_id={category.id} />
            </div>
          </div>
          {category.subCategories?.length > 0 && (
            <div className="mt-4">
              {renderCategories(category.subCategories, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-header">Category Management</h1>
          <p className="text-gray-600">Organize your products with categories and subcategories</p>
        </div>
        <AddCategory categories={categories} />
      </div>

      {/* Categories List */}
      {modifiedCategories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📂</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-500 mb-4">Create your first category to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {renderCategories(modifiedCategories, 0)}
        </div>
      )}
    </div>
  );
}

export default Categories;
