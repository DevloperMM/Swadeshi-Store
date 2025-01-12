import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";
import { useProductStore } from "../store/useProductStore.js";

const catgs = ["jean", "tshirt", "shoe", "glasse", "jacket", "suit", "bag"];

function CreateProductForm() {
  const [prodData, setProdData] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    image: null,
  });

  const { createProduct, loading } = useProductStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct(prodData);
      setProdData({
        title: "",
        description: "",
        price: "",
        category: "",
        file: null,
      });
    } catch (err) {
      console.error(err?.message || "An error occured");
    }
  };

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
        Create New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-300"
          >
            Product Name
          </label>
          <input
            type="text"
            id="title"
            value={prodData.title}
            onChange={(e) =>
              setProdData({ ...prodData, title: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Product Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            value={prodData.description}
            onChange={(e) =>
              setProdData({ ...prodData, description: e.target.value })
            }
            rows="3"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Product Price */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-300"
          >
            Price
          </label>
          <input
            type="number"
            id="price"
            value={prodData.price}
            onChange={(e) =>
              setProdData({ ...prodData, price: parseInt(e.target.value) })
            }
            step="1"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Product Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-300"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            value={prodData.category}
            onChange={(e) =>
              setProdData({ ...prodData, category: e.target.value })
            }
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          >
            <option value="">Select a category</option>
            {catgs.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Product Image */}
        <div className="pt-2 flex items-center">
          <label
            htmlFor="image"
            className="cursor-pointer bg-gray-700 py-1 px-3 border border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Upload className="h-5 w-5 inline-block mr-2" />
            Upload Image
          </label>
          <input
            type="file"
            id="image"
            className="sr-only"
            accept="image/*"
            onChange={(e) => {
              setProdData({ ...prodData, image: e.target.files[0] });
            }}
          />
          {prodData.image && (
            <span className="ml-3 text-sm text-gray-400">Image uploaded</span>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
					shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 
					focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader
                className="mr-2 h-5 w-5 animate-spin"
                aria-hidden="true"
              />
              Loading...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Product
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

export default CreateProductForm;
