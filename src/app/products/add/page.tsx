"use client";
import { basicSchema } from "@/schemas/product";
import { getCategories } from "@/actions/categoryActions";
import { getBrands } from "@/actions/brandActions";
import { createProduct } from "@/actions/productActions";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { occasionOptions } from "../../../../constant";
import Select from "react-select";
import { toast } from "react-toastify";

function AddProduct() {
  const [brandsOption, setBrandsOption] = useState([]);
  const [categoriesOption, setCategoriesOption] = useState([]);
  const [occasionOption, setOccasionOption] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const {
    values: product,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    resetForm,
  }: any = useFormik({
    initialValues: {
      name: "",
      description: "",
      old_price: "",
      discount: "",
      rating: 0,
      colors: "",
      brands: null,
      categories: null,
      gender: "men",
      occasion: null,
      image_url: "",
    },
    validationSchema: basicSchema,

    onSubmit: async (values: any, actions) => {
      try {
        // Calculate price from old_price and discount
        const discountAmount = (parseFloat(values.old_price) * parseFloat(values.discount || 0)) / 100;
        const finalPrice = parseFloat(values.old_price) - discountAmount;

        const productData = {
          name: values.name,
          description: values.description,
          price: finalPrice,
          old_price: parseFloat(values.old_price),
          discount: parseFloat(values.discount || 0),
          image_url: values.image_url || null,
          gender: values.gender,
          occasion: values.occasion?.map((item: any) => item.value).join(',') || '',
          colors: values.colors,
          brands: JSON.stringify(values.brands?.map((item: any) => item.value) || []),
          rating: parseFloat(values.rating) || 0,
        };

        const categoryIds = values.categories?.map((item: any) => item.value) || [];
        
        const result = await createProduct(productData, categoryIds);

        if (result.error) {
          toast.error(`Error: ${result.error}`);
          return;
        }

        toast.success('Product created successfully!');
        router.push('/products');
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error(error);
      }
    },
  });

  useEffect(() => {
    setLoading(true);
    (async function () {
      const brands = await getBrands();
      const brandsOption = brands.map((brand) => ({
        value: brand.id,
        label: brand.name,
      }));

      const categories = await getCategories();
      const categoriesOption = categories.map((category) => ({
        value: category.id,
        label: category.name,
      }));
      const occasionOption = occasionOptions.map((item) => {
        return {
          value: item,
          label: item,
        };
      });

      setBrandsOption(brandsOption as any);
      setCategoriesOption(categoriesOption as any);
      setOccasionOption(occasionOption as any);
      setLoading(false);
    })();
  }, [setValues]);

  function handleChangeSelect(selectedOptions) {
    if (selectedOptions.length === 0) {
      setValues({
        ...product,
        brands: null,
      });
      return;
    }
    setValues({
      ...product,
      brands: selectedOptions,
    });
  }
  function handleOccasion(selectedOptions) {
    if (selectedOptions.length === 0) {
      setValues({
        ...product,
        occasion: null,
      });
      return;
    }
    setValues({
      ...product,
      occasion: selectedOptions,
    });
  }
  function handleCategories(selectedOptions) {
    if (selectedOptions.length === 0) {
      setValues({
        ...product,
        categories: null,
      });
      return;
    }
    setValues({
      ...product,
      categories: selectedOptions,
    });
  }

  function handleFileInput(e) {
    const file = e.target.files[0];
    setValues({
      ...product,
      image_url: `/images/${file.name}`,
    });
  }

  function handleColorPicker(e) {
    setValues({
      ...product,
      colors: product.colors
        ? `${product.colors},${e.target.value}`
        : e.target.value,
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="page-header">Add New Product</h1>
        <p className="text-gray-600">Fill in the details below to add a new product to your inventory</p>
      </div>
      
      {isSubmitting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-blue-800">Submitting product...</p>
          </div>
        </div>
      )}
      <div className="card">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={product.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              placeholder="Enter product name"
              className="input-field"
            />
            {errors.name && touched.name && (
              <p className="error">{errors.name}</p>
            )}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Product Description *
            </label>
            <textarea
              className="input-field"
              id="description"
              name="description"
              value={product.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={4}
              disabled={isSubmitting}
              placeholder="Enter product description"
            />
            {errors.description && touched.description && (
              <p className="error">{errors.description}</p>
            )}
          </div>
          <div>
            <label htmlFor="old_price" className="block text-sm font-medium text-gray-700 mb-2">
              Original Price *
            </label>
            <input
              type="number"
              name="old_price"
              id="old_price"
              className="input-field"
              placeholder="Enter original price"
              value={product.old_price}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              step={0.01}
              min={0}
            />
            {errors.old_price && touched.old_price && (
              <p className="error">{errors.old_price}</p>
            )}
          </div>
          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-2">
              Discount Percentage
            </label>
            <input
              type="number"
              name="discount"
              id="discount"
              className="input-field"
              value={product.discount}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              step={0.1}
              min={0}
              max={100}
              placeholder="Enter discount percentage (0-100)"
            />
            {errors.discount && touched.discount && (
              <p className="error">{errors.discount}</p>
            )}
          </div>
          <div>
            <label htmlFor="colors" className="block text-sm font-medium text-gray-700 mb-2">
              Product Colors
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                name="colors"
                id="colors"
                className="input-field flex-1"
                placeholder="Enter colors (comma separated)"
                onChange={handleChange}
                disabled={isSubmitting}
                onBlur={handleBlur}
                value={product.colors}
              />
              <input 
                type="color" 
                onChange={handleColorPicker}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                title="Pick a color"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter colors separated by commas, or use the color picker to add colors
            </p>
            {errors.colors && touched.colors && (
              <p className="error">{errors.colors}</p>
            )}
          </div>
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
              Product Rating
            </label>
            <input
              type="number"
              className="input-field"
              name="rating"
              id="rating"
              min={0}
              max={5}
              step={0.1}
              value={product.rating}
              disabled={isSubmitting}
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="Enter rating (0-5)"
            />
            {errors.rating && touched.rating && (
              <p className="error">{errors.rating}</p>
            )}
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
              Target Gender *
            </label>
            <select
              className="input-field"
              name="gender"
              id="gender"
              value={product.gender}
              disabled={isSubmitting}
              onBlur={handleBlur}
              onChange={handleChange}
            >
              {["men", "women", "boy", "girl"].map((gender, i) => {
                return (
                  <option key={i} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </option>
                );
              })}
            </select>
            {errors.gender && touched.gender && (
              <p className="error">{errors.gender}</p>
            )}
          </div>

          <div>
            <label htmlFor="brands" className="block text-sm font-medium text-gray-700 mb-2">
              Brands *
            </label>
            <Select
              className="text-black"
              options={brandsOption}
              isMulti
              name="brands"
              onChange={handleChangeSelect}
              onBlur={handleBlur}
              value={product.brands}
              isDisabled={isSubmitting}
              placeholder="Select product brands"
            />
            {errors.brands && touched.brands && (
              <p className="error">{String(errors.brands)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Occasions
            </label>
            <Select
              className="text-black"
              options={occasionOption}
              isMulti
              name="occasion"
              onChange={handleOccasion}
              onBlur={handleBlur}
              isDisabled={isSubmitting}
              value={product.occasion}
              placeholder="Select suitable occasions"
            />
            {errors.occasion && touched.occasion && (
              <p className="error">{String(errors.occasion)}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories *
            </label>
            <Select
              className="text-black"
              options={categoriesOption}
              isMulti
              name="categories"
              onChange={handleCategories}
              onBlur={handleBlur}
              isDisabled={isSubmitting}
              value={product.categories}
              placeholder="Select product categories"
            />
            {errors.categories && touched.categories && (
              <p className="error">{String(errors.categories)}</p>
            )}
          </div>
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <input
              className="input-field"
              type="file"
              name="image_url"
              id="image_url"
              onChange={handleFileInput}
              onBlur={handleBlur}
              disabled={isSubmitting}
              accept="image/*"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload a product image (JPG, PNG, GIF)
            </p>
          </div>
          <div className="flex gap-4 pt-6">
            <button
              disabled={isSubmitting}
              type="submit"
              className="btn-primary flex-1"
            >
              {isSubmitting ? 'Adding Product...' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
