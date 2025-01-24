import React from "react";

function PageNotFound() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h4 className="text-center text-xl font-bold text-emerald-400 mb-4">
          404 Error
        </h4>
        <h2 className="text-center text-3xl sm:text-5xl font-bold text-emerald-400 mb-4">
          Page Not Found
        </h2>
        <h4 className="text-center text-xl sm:text-2xl font-bold text-gray-300 mt-12">
          We could not find that page
        </h4>
      </div>
    </div>
  );
}

export default PageNotFound;
