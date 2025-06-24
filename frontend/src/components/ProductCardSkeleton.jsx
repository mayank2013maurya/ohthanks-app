import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="border p-4 rounded-lg h-full flex flex-col animate-pulse">
      <div className="bg-gray-300 w-full h-48 mb-4 rounded"></div>
      <div className="bg-gray-300 h-6 w-3/4 mb-2 rounded"></div>
      <div className="bg-gray-300 h-5 w-1/4 mb-2 rounded"></div>
      <div className="bg-gray-300 h-5 w-1/2 rounded"></div>
    </div>
  );
};

export default ProductCardSkeleton; 