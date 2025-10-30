import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Save, PlusCircle } from "lucide-react";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetCategoriesQuery,
} from "@/api/services/productsApi";
import { toast } from "react-hot-toast";
import Button from "../Button";
import { validateAddEditProductForm } from "@/utils/formValidation";
import Image from "next/image";

const AddEditProductModal = ({ open, onClose, editingProduct }) => {
  const { data: categories = [], isLoading: loadingCategories } =
    useGetCategoriesQuery();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const [form, setForm] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    description: "",
    image: "",
    stock: "",
    isNewProduct: false,
    status: "active",
  });
  const [errors, setErrors] = useState({});

  // Populate form if editing
  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || "",
        price: editingProduct.price || "",
        originalPrice: editingProduct.originalPrice || "",
        category: editingProduct.category || "",
        description: editingProduct.description || "",
        image: editingProduct.image || "",
        stock: editingProduct.stock || "",
        isNewProduct: editingProduct.isNewProduct || false,
        status: editingProduct.status || "active",
      });
    } else {
      // setForm({
      //   name: "",
      //   price: "",
      //   originalPrice: "",
      //   category: "",
      //   description: "",
      //   image: "",
      //   stock: "",
      //   isNewProduct: false,
      //   status: "active",
      // });
      setForm({
        name: "mitzie-organics",
        price: 100,
        originalPrice: 80,
        category: "Industrial",
        description: "organic multi-purspoe surface cleaner",
        image: "",
        stock: 10,
        isNewProduct: true,
        status: "active",
      });
    }
  }, [editingProduct]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     if (editingProduct) {
  //       await updateProduct({ id: editingProduct._id, ...form }).unwrap();
  //       toast.success("Product updated successfully!");
  //     } else {
  //       await createProduct(form).unwrap();
  //       toast.success("Product created successfully!");
  //     }
  //     onClose();
  //   } catch (err) {
  //     console.error(err);
  //     toast.error(err?.data?.message || "Operation failed");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (creating || updating) return; // prevent multiple submissions

    // validate form
    const newErrors = validateAddEditProductForm(form, editingProduct);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      try {
        const formData = new FormData();

        // Append all fields
        Object.keys(form).forEach((key) => {
          if (form[key] !== undefined && form[key] !== null) {
            formData.append(key, form[key]);
          }
        });

        // Ensure file is attached
        if (form.imageFile) {
          formData.append("image", form.imageFile);
          // formData.delete("image");
          formData.delete("imageFile");
        } else if (!editingProduct) {
          toast.error("Product image is required");
          return;
        }

        if (editingProduct) {
          await updateProduct({ id: editingProduct._id, formData }).unwrap();
          toast.success("Product updated successfully!");
        } else {
          await createProduct(formData).unwrap();
          toast.success("Product created successfully!");
        }

        onClose();
      } catch (err) {
        console.error(err);
        toast.error(err?.data?.message || "Operation failed");
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                // onSubmit={handleSubmit}
                className="space-y-6"
                // encType="multipart/form-data"
              >
                {/* Name & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 text-gray-900 placeholder-gray-400"
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="text-red-400">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    >
                      <option value="">Select category</option>
                      {!loadingCategories &&
                        categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-400">{errors.category}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    rows={3}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    placeholder="Enter product description"
                  />
                  {errors.description && (
                    <p className="text-red-400">{errors.description}</p>
                  )}
                </div>

                {/* Price, Original Price, Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                    {errors.price && (
                      <p className="text-red-400">{errors.price}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.originalPrice}
                      onChange={(e) =>
                        handleChange("originalPrice", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                    {errors.originalPrice && (
                      <p className="text-red-400">{errors.originalPrice}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => handleChange("stock", e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                    {errors.stock && (
                      <p className="text-red-400">{errors.stock}</p>
                    )}
                  </div>
                </div>

                {/* Status & New Product */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      // className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    {errors.status && (
                      <p className="text-red-400">{errors.status}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Product
                    </label>
                    <input
                      type="checkbox"
                      checked={form.isNewProduct}
                      onChange={(e) =>
                        handleChange("isNewProduct", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      New Product
                    </span>
                    {errors.isNewProduct && (
                      <p className="text-red-400">{errors.isNewProduct}</p>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        handleChange("image", URL.createObjectURL(e.target.files[0]))
                      }
                    />
                  </div>
                </div> */}
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image *
                  </label>

                  <div
                    onClick={() =>
                      document.getElementById("product-image-input").click()
                    }
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    {form.image ? (
                      <div className="flex justify-center">
                        <Image
                          src={form.image}
                          alt="Preview"
                          width={128} // equals w-32
                          height={128} // equals h-32
                          className="object-cover rounded-lg"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                      </>
                    )}

                    <input
                      id="product-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const imageURL = URL.createObjectURL(file);
                          handleChange("image", imageURL); // for preview
                          handleChange("imageFile", file); // for actual upload
                        }
                      }}
                    />
                  </div>

                  {form.image && (
                    <button
                      type="button"
                      onClick={() => handleChange("image", "")}
                      className="mt-2 text-sm text-red-500 hover:underline"
                    >
                      Remove Image
                    </button>
                  )}
                  {errors.image && (
                    <p className="text-red-400">{errors.image}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    icon={Save}
                    iconPosition="left"
                    variant="ghost"
                    size="lg"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    icon={Save}
                    iconPosition="left"
                    variant="primary"
                    size="lg"
                    type="submit"
                    onClick={handleSubmit}
                  >
                    {editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddEditProductModal;
