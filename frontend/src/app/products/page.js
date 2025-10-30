"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useListProductsQuery } from "@/api/services/productsApi";
import ProductList from "@/components/ProductList";
import CategoryFilter from "@/components/CategoryFilter";
import axios from "axios";
import {
  Grid,
  Heart,
  List,
  RefreshCw,
  Search,
  ShoppingCart,
  Star,
} from "lucide-react";
import Button from "@/components/Button";
import ProductCard from "@/components/ProductCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { ResourceNotFound } from "@/components/ResourceNotFound";
import { ProductCardSkeleton } from "@/components/SkeletonLoaders";

export default function DemoProductsPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    categories: [],
    priceRange: [null, null],
    availability: [], // ['inStock', 'onSale', 'new']
    sortBy: "featured",
  });
  const [totalPages, setTotalPages] = useState(1);

  // const fetchProducts = async () => {
  //   try {
  //     const query = {};

  //     // Dynamically build query from filters
  //     Object.entries({
  //       search: filters.search,
  //       category: filters.categories.length
  //         ? filters.categories.join(",")
  //         : undefined,
  //       minPrice: filters.priceRange[0] || undefined,
  //       maxPrice: filters.priceRange[1] || undefined,
  //       inStock: filters.availability.includes("inStock") ? true : undefined,
  //       isNewProduct: filters.availability.includes("new") ? true : undefined,
  //       onSale: filters.availability.includes("onSale") ? true : undefined,
  //       sortBy: filters.sortBy,
  //       page: filters.page,
  //       limit: filters.limit,
  //     }).forEach(([key, value]) => {
  //       if (value !== undefined && value !== null && value !== "")
  //         query[key] = value;
  //     });

  //     const { data } = await axios.get(
  //       "http://localhost:8080/products/products",
  //       { params: query }
  //     );
  //     setProducts(data.products);
  //     setTotalPages(data.totalPages);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // useEffect(() => {
  //   fetchProducts();
  // }, [filters]); // fetch whenever filters change

  // Update any filter dynamically

  const { data, isLoading, isError } = useListProductsQuery({
    search: filters.search,
    category: filters.categories.length
      ? filters.categories.join(",")
      : undefined,
    minPrice: filters.priceRange[0] || undefined,
    maxPrice: filters.priceRange[1] || undefined,
    inStock: filters.availability.includes("inStock") ? true : undefined,
    isNewProduct: filters.availability.includes("new") ? true : undefined,
    onSale: filters.availability.includes("onSale") ? true : undefined,
    sortBy: filters.sortBy,
    page: filters.page,
    limit: filters.limit,
  });

  useEffect(() => {
    if (data) {
      setProducts(data.products);
      setTotalPages(data.totalPages);
    }
  }, [data]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1, // reset page on any filter change except page
    }));
  };

  // Example handlers
  const handleCategoryChange = (category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    updateFilter("categories", newCategories);
  };

  const handleAvailabilityChange = (type) => {
    const newAvailability = filters.availability.includes(type)
      ? filters.availability.filter((a) => a !== type)
      : [...filters.availability, type];
    updateFilter("availability", newAvailability);
  };

  const handlePriceChange = (minOrMax, value) => {
    const newPriceRange = [...filters.priceRange];
    if (minOrMax === "min") newPriceRange[0] = Number(value);
    else newPriceRange[1] = Number(value);
    updateFilter("priceRange", newPriceRange);
  };

  const handleSortChange = (value) => updateFilter("sortBy", value);


  
  // if (isLoading || true) return <EmptyState />;
  // if (isLoading) return <LoadingSpinner />;
  // if (!data)
  if (isError) // if (!data)
    return (
      <ResourceNotFound
        message="Products Could not be loaded."
        subtext="there is some issues and products could not be loaded."
        actionLabel="Back to Home"
        route={"/"}
        resourceType={"product"}
      />
    );
  // if (!data) return <p className="p-6">No Product found.</p>;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
            <p className="text-gray-600">
              Discover our amazing collection of products
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:w-64 space-y-6"
            >
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  <CategoryFilter
                    selectedCategories={filters.categories}
                    onChange={(newCategories) =>
                      updateFilter("categories", newCategories)
                    }
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Price Range
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      name="min"
                      value={filters.priceRange[0] || ""}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      name="max"
                      value={filters.priceRange[1] || ""}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  {/* <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Apply
                    </button> */}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Availability
                </h3>
                <div className="space-y-2">
                  {["inStock", "onSale", "new"].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={filters.availability.includes(type)}
                        onChange={() => handleAvailabilityChange(type)}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {type === "inStock"
                          ? "In Stock"
                          : type === "new"
                          ? "New Arrivals"
                          : "On Sale"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm">
                <div className="space-y-2">
                  <Button
                    icon={RefreshCw}
                    className="w-full"
                    onClick={() =>
                      setFilters({
                        page: 1,
                        limit: 10,
                        search: "",
                        categories: [],
                        priceRange: [null, null],
                        availability: [],
                        sortBy: "featured",
                      })
                    }
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Sort Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white p-4 rounded-lg shadow-sm mb-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={(e) => updateFilter("search", e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest</option>
                    </select>

                    <div className="flex border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 ${
                          viewMode === "grid"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Grid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 ${
                          viewMode === "list"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Skleton Loader  */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                    <ProductCardSkeleton
                      key={`loadingFeaturedProducts${index}`}
                      index={index}
                      viewMode={viewMode}
                    />
                  ))}
                </motion.div>
              )}

              {/* Products Grid */}
              {products.length === 0 ? (
                <>
                  <EmptyState
                    message="No Products found"
                    subtext="Try adjusting or Reseting your filters."
                    actionLabel="Reset Filters"
                    onAction={() =>
                      setFilters({
                        page: 1,
                        limit: 10,
                        search: "",
                        categories: [],
                        priceRange: [null, null],
                        availability: [],
                        sortBy: "featured",
                      })
                    }
                    resourceType={"product"}
                  />
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {products.map((product, index) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      viewMode={viewMode}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}

              {/* Pagination */}
              {products.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-8 flex justify-center"
                >
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={filters.page <= 1}
                      onClick={() => updateFilter("page", filters.page - 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {/* <span className="text-gray-900">
                    {filters.page} / {totalPages}
                  </span> */}
                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => updateFilter("page", pageNum)}
                          className={`px-3 py-2 border rounded-lg transition-colors ${
                            filters.page === pageNum
                              ? "bg-blue-500 text-white border-blue-500"
                              : "border-gray-300 text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                    {/* <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">
                      1
                    </button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900">
                      2
                    </button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900">
                      3
                    </button> */}
                    <button
                      disabled={filters.page >= totalPages}
                      onClick={() => updateFilter("page", filters.page + 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
