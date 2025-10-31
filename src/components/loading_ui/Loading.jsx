import React from "react";
import PageWrapper from "../../PageWrapper";

// 💡 Custom shimmer animation
const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  .animate-shimmer {
    animation: shimmer 2s infinite linear;
    background: linear-gradient(to right, #f6f7f8 4%, #edeef1 25%, #f6f7f8 36%);
    background-size: 1000px 100%;
  }
`;

function Loading() {
  return (
    <PageWrapper>
      {/* 🌀 Inject shimmer animation style */}
      <style>{shimmerStyle}</style>

      <div className="bg-gray-100 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* 🔹 Card Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full animate-shimmer"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-1/4 rounded animate-shimmer"></div>
                <div className="h-3 w-1/3 rounded animate-shimmer"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full animate-shimmer rounded"></div>
              <div className="h-4 w-full animate-shimmer rounded"></div>
              <div className="h-4 w-3/4 animate-shimmer rounded"></div>
            </div>
          </div>

          {/* 🔹 List Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded animate-shimmer"></div>
                <div className="flex-1 h-4 animate-shimmer rounded"></div>
              </div>
            ))}
          </div>

          {/* 🔹 Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-lg space-y-3">
                <div className="w-full h-48 rounded animate-shimmer"></div>
                <div className="h-4 w-3/4 animate-shimmer rounded"></div>
                <div className="h-3 w-1/2 animate-shimmer rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Loading;
