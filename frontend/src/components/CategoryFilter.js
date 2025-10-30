import React, { useEffect, useState } from "react";
import axios from "axios";
import { useGetCategoriesQuery } from "@/api/services/productsApi";

const CategoryFilter = ({ selectedCategories, onChange }) => {
  const { data, isLoading: isLoadingCategories } =
      useGetCategoriesQuery();
  const [categories, setCategories] = useState([]);

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       const { data } = await axios.get(
  //         "http://localhost:8080/products/categories"
  //       ); // call backend
  //       setCategories(data.categories);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };
  //   fetchCategories();
  // }, []);

  useEffect(() => {
    console.log({data});
    
if (data) {
  setCategories(data);
}
  }, [data])
  

  const handleCategoryChange = (category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onChange(newCategories);
  };

  return (
    <div
      className="max-h-40 sm:max-h-56 md:max-h-72 
    overflow-y-auto p-2 
    scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      {categories.map((category) => (
        <label key={category} className="flex items-center">
          <input
            type="checkbox"
            checked={selectedCategories.includes(category)}
            onChange={() => handleCategoryChange(category)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">{category}</span>
        </label>
      ))}
    </div>
  );
};

export default CategoryFilter;
