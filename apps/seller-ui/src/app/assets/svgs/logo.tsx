import React from "react";

const Logo = () => {
  return (
    <div className="border border-slate-800 h-[45px] w-[45px] flex items-center justify-center rounded-md">
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Square */}
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Inner Square */}
        <rect
          x="8"
          y="8"
          width="8"
          height="8"
          rx="1"
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export default Logo;