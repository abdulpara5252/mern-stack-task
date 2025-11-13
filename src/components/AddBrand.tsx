"use client";

import { addBrand } from "@/actions/brandActions";
import { InsertBrands } from "@/types";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

function AddBrand() {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<any>();

  async function brandAction(formData: FormData) {
    const brand = formData.get("brand") as string;
    let website = formData.get("website") as string;
    if (!brand) {
      toast.error("brand name is required");
      return;
    }
    if (website && !website?.startsWith("http")) {
      website = `http://${website}`;
    }
    const value: InsertBrands = {
      name: brand,
      website,
    };
    const { error } = await addBrand(value);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Brand added successfully");
    setIsOpen(false);
  }

  return (
    <div>
      <button
        className="btn-primary flex items-center gap-2"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>➕</span>
        Add Brand
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add New Brand</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form
              action={brandAction}
              className="space-y-4"
              ref={formRef}
            >
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  name="brand"
                  id="brand"
                  className="input-field"
                  placeholder="Enter Brand Name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Website
                </label>
                <input
                  type="text"
                  name="website"
                  id="website"
                  className="input-field"
                  placeholder="Enter Website URL (optional)"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                >
                  Add Brand
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

export default AddBrand;
