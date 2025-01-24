import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useCartStore } from "../store/useCartStore";
import { useUserStore } from "../store/useUserStore";

function FeaturedProducts({ featured }) {
  const [currIdx, setCurrIdx] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  const { user } = useUserStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(3);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nxtSlide = () => {
    setCurrIdx((prevIdx) => prevIdx + itemsPerPage);
  };
  const prevSlide = () => {
    setCurrIdx((prevIdx) => prevIdx - itemsPerPage);
  };

  const isStartDisabled = currIdx === 0;
  const isEndDisabled = currIdx >= featured.length - itemsPerPage;

  const handleAddToCart = (product) => {
    if (!user) {
      return toast.error("Login for adding to cart", { id: "login" });
    } else {
      addToCart(product);
    }
  };

  return (
    <div className="py-12">
      <div className="w-full sm:w-[88%] container mx-auto px-4">
        <h2 className="text-center text-3xl sm:text-4xl font-bold text-emerald-400 mb-8">
          Featured Products
        </h2>
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currIdx * (100 / itemsPerPage)}%)`,
              }}
            >
              {featured?.map((product) => (
                <div
                  key={product._id}
                  className="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-2"
                >
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden h-full transition-all duration-300 hover:shadow-xl border border-emerald-500/30">
                    <div className="overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-48 object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 text-white">
                        {product.title}
                      </h3>
                      <p className="text-emerald-300 font-medium mb-4">
                        ₹{product.price.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded transition-colors duration-300 
												flex items-center justify-center"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevSlide}
            className={`absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${
              isStartDisabled ? "hidden" : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nxtSlide}
            className={`absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${
              isEndDisabled ? "hidden" : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeaturedProducts;
