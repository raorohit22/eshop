import React from "react";

const GoogleButton = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="h-[46px] cursor-pointer border border-blue-100 flex items-center gap-2 px-3 rounded my-2 bg-[rgba(210,227,252, 0.3)]">
        {" "}
        <svg
          xmlns="http://w3.org"
          x="0px"
          y="0px"
          viewBox="0 0 48 48"
          width="30px"
          height="30px"
        >
          {" "}
          <path
            fill="#EA4335"
            d="M24 9.5c3.5 0 6.6 1.3 9.1 3.4l6.8-6.8C35.5 2.4 30 0 24 0 14.8 0 7.1 5.4 3.6 13.5l8.1 6.3C13.4 12.8 18.2 9.5 24 9.5z"
          />{" "}
          <path
            fill="#4285F4"
            d="M46.9 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h12.9c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 7.1-10.4 7.1-16.9z"
          />{" "}
          <path
            fill="#FBBC05"
            d="M11.7 28.3c-1.2-2.1-1.9-4.5-1.9-7.1s.7-5 1.9-7.1l-8.1-6.3C1 12 0 17.9 0 24.5s1 12.5 3.6 18l8.1-6.2z"
          />{" "}
          <path
            fill="#34A853"
            d="M24 48c6.5 0 12-2.4 16-6.4l-7.7-6c-2.1 1.5-4.8 2.4-8.3 2.4-5.8 0-10.6-3.9-12.3-9.1l-8.1 6.3C7.1 42.6 14.8 48 24 48z"
          />{" "}
          <path fill="none" d="M0 0h48v48H0z" />{" "}
        </svg>
        <span className="text-[16px] font-poppins opacity-[0.8]">
          Sign In with Google
        </span>
      </div>{" "}
    </div>
  );
};

export default GoogleButton;
