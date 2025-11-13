"use client";
import { selectCategoriesFormat } from "@/utils";
import { postCategory } from "@/actions/categoryActions";

import { useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";

function AddCategory({ categories }) {
  const [categoryName, setCategoryName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const categoriesOption = selectCategoriesFormat(categories);
  const [selectedCategory, setSelectedCategory] = useState<any>({
    value: "",
    label: "None",
  });

  function handleCategories(selectedCategories) {
    setSelectedCategory(selectedCategories);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const category = {
      name: categoryName,
      ...(selectedCategory.value && { parent_id: selectedCategory.value }),
    };
    const { error } = await postCategory(category);
    if (error?.startsWith("Duplicate")) {
      toast.error("Duplicate category name");
      return;
    }
    if (error) {
      toast.error(error);
      return;
    }
    setCategoryName("");
    setSelectedCategory({ value: "", label: "None" });
    setIsOpen(false);
    toast.success("category submitted");
  }

  return (
    <div>
      <button
        className="btn-primary flex items-center gap-2"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>📂</span>
        Add Category
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add New Category</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="category"
                  id="category"
                  className="input-field"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter Category Name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <Select
                  isSearchable
                  className="text-black"
                  options={categoriesOption}
                  name="categories"
                  onChange={handleCategories}
                  value={selectedCategory}
                  placeholder="Select parent category (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to create a main category
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                >
                  Add Category
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddCategory;
