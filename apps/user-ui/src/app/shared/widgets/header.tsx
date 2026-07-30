'use client'
import Link from "next/link";
import React from "react";
import { HeartIcon, Search, ShoppingCartIcon } from "lucide-react";
import ProfileIcon from "../../../assets/svgs/profile-icon";
import HeaderBottom from "./header-bottom";
import useUser from "apps/user-ui/src/hooks/useUser";

const Header = () => {
  const { user, isLoading } = useUser();
  return (
    <header className="w-full bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="w-[90%] md:w-[85%] py-4 m-auto flex items-center justify-between gap-8">
        
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href={"/"} className="group">
            <span className="text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#115061] to-[#2dd4bf] group-hover:to-cyan-400 transition-all duration-500">
              Eshop
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-grow max-w-[600px] relative group">
          <input
            type="text"
            placeholder="Search for premium products..."
            className="w-full px-6 pr-14 font-Roboto text-gray-700 bg-gray-50 border border-gray-200 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-50 rounded-full outline-none h-[50px] transition-all duration-300"
          />
          <div className="w-[44px] cursor-pointer flex items-center justify-center h-[44px] bg-gradient-to-r from-[#115061] to-[#1a738a] hover:from-[#0b3642] hover:to-[#115061] rounded-full absolute top-[3px] right-[3px] transition-all duration-300 shadow-md transform group-focus-within:scale-105">
            <Search color="#fff" size={18} strokeWidth={2.5} />
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-6 flex-shrink-0">
          
          {/* Profile */}
          <div className="flex items-center gap-3">
            {!isLoading && user ? (
              <>
                <Link href={"/profile"}
                  className="w-[45px] h-[45px] flex items-center justify-center rounded-full bg-teal-50 border border-teal-100 hover:bg-teal-100 transition-colors duration-300">
                  <ProfileIcon />
                </Link>
                <Link href={"/profile"} className="hidden md:flex flex-col group">
                  <span className="text-xs text-gray-500 font-medium group-hover:text-teal-600 transition-colors">Welcome back,</span>
                  <span className="font-bold text-gray-800 group-hover:text-[#115061] transition-colors">{user?.name?.split(" ")[0]}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={"/login"}
                  className="w-[45px] h-[45px] flex items-center justify-center rounded-full bg-gray-50 border border-gray-200 hover:bg-teal-50 hover:border-teal-200 transition-colors duration-300"
                >
                  <ProfileIcon />
                </Link>
                <Link href={"/login"} className="hidden md:flex flex-col group">
                  <span className="text-xs text-gray-500 font-medium group-hover:text-teal-600 transition-colors">Hello</span>
                  <span className="font-bold text-gray-800 group-hover:text-[#115061] transition-colors">{isLoading ? "Loading..." : "Sign In"}</span>
                </Link>
              </>
            )}
          </div>

          <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

          {/* Icons (Wishlist & Cart) */}
          <div className="flex items-center gap-4">
            <Link href={"/wishlist"} className="relative p-2 rounded-full hover:bg-teal-50 group transition-colors">
              <HeartIcon className="text-gray-600 group-hover:text-rose-500 transition-colors duration-300" strokeWidth={2} size={24} />
              <div className="w-[20px] h-[20px] border-2 border-white bg-rose-500 rounded-full flex items-center justify-center absolute top-[0px] right-[0px] shadow-sm transform group-hover:scale-110 transition-transform">
                <span className="text-[10px] text-white font-bold leading-none">0</span>
              </div>
            </Link>
            
            <Link href={"/cart"} className="relative p-2 rounded-full hover:bg-teal-50 group transition-colors">
              <ShoppingCartIcon className="text-gray-600 group-hover:text-teal-600 transition-colors duration-300" strokeWidth={2} size={24} />
              <div className="w-[20px] h-[20px] border-2 border-white bg-teal-500 rounded-full flex items-center justify-center absolute top-[0px] right-[0px] shadow-sm transform group-hover:scale-110 transition-transform">
                <span className="text-[10px] text-white font-bold leading-none">9</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <HeaderBottom />
    </header>
  );
};

export default Header;
