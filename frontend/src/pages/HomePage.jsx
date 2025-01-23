import React, { useEffect } from "react";
import { CategoryItem, FeaturedProducts } from "../components/index.js";
import { useProductStore } from "../store/useProductStore";

const categories = [
  { href: "/tshirts", name: "T-shirts", imageUrl: "/tshirts.jpg" },
  { href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpeg" },
  { href: "/glasses", name: "Glasses", imageUrl: "/glasses.jpg" },
  { href: "/jeans", name: "Jeans", imageUrl: "/jeans.jpeg" },
  { href: "/jackets", name: "Jackets", imageUrl: "/jackets.jpeg" },
  { href: "/suits", name: "Suits", imageUrl: "/suit.jpeg" },
  { href: "/bags", name: "Bags", imageUrl: "/bag.jpg" },
];

function HomePage() {
  const { fetchFeaturedProducts, products, loading } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">
          Explore Our Categories
        </h2>
        <p className="text-center text-xl text-gray-300 mb-10">
          Discover the latest trends in eco-friendly fashion
        </p>

        <div className="sm:mx-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))}
        </div>

        {!loading && products.length > 0 && (
          <FeaturedProducts featured={products} />
        )}
      </div>
    </div>
  );
}

export default HomePage;
