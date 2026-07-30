"use client";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const Hero = () => {
  const router = useRouter();
  return (
    <div className="relative bg-[#041116] min-h-[85vh] flex flex-col justify-center w-full overflow-hidden">
      {/* Abstract Background Elements for Premium Feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[60%] bg-teal-900/40 rounded-full blur-[120px]"></div>
        <div className="absolute top-[30%] -right-[10%] w-[40%] h-[50%] bg-cyan-900/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-[20%] w-[60%] h-[40%] bg-[#0b3642]/50 rounded-full blur-[150px]"></div>
      </div>

      <div className="md:w-[85%] w-[90%] m-auto md:flex h-full items-center relative z-10 py-12 md:py-0">
        
        {/* Left Content Area */}
        <div className="md:w-1/2 flex flex-col justify-center space-y-6">
          
          {/* Glassmorphism Badge */}
          <div className="inline-flex items-center px-4 py-2 w-max rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 mr-3 animate-pulse shadow-[0_0_8px_#2dd4bf]"></span>
            <span className="text-teal-50 text-xs font-semibold tracking-[0.2em] uppercase font-Roboto">
              Starting from
            </span>
            <span className="text-white font-bold text-lg ml-2 font-Roboto">$40</span>
          </div>

          {/* Headline with Text Gradient */}
          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold font-Roboto leading-[1.1] tracking-tight text-white drop-shadow-2xl">
            The Smart <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-teal-500">
              Watch
            </span>
            <br />
            Collection 2025
          </h1>

          <p className="text-teal-100/70 text-xl md:text-2xl font-Oregano max-w-lg leading-relaxed mt-2 drop-shadow-sm">
            Elevate your lifestyle with our most advanced smart watch collection. 
            Where cutting-edge technology meets flawless modern design.
          </p>

          {/* Premium Glowing Button */}
          <div className="pt-6">
            <button
              onClick={() => router.push("/products")}
              className="relative group inline-block rounded-full p-[2px] overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-[2px]"></span>
              <div className="relative flex items-center justify-center gap-3 px-10 py-4 bg-[#041116] rounded-full border border-teal-500/30 group-hover:bg-[#061921] transition-colors duration-300">
                <span className="text-teal-50 font-semibold text-lg font-Roboto tracking-wide">Explore Now</span>
                <MoveRight className="w-5 h-5 text-teal-400 group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </button>
          </div>
        </div>

        {/* Right Image Area */}
        <div className="md:w-1/2 flex justify-center items-center mt-16 md:mt-0 relative group perspective-1000">
          {/* Intense Ambient Glow Behind Watch */}
          <div className="absolute inset-0 m-auto w-[60%] h-[60%] bg-gradient-to-tr from-teal-400/20 to-cyan-500/20 rounded-full blur-[80px] group-hover:blur-[100px] transition-all duration-700"></div>
          <div className="absolute inset-0 m-auto w-[40%] h-[40%] bg-white/5 rounded-full blur-[50px]"></div>
          
          <Image
            src={"https://ik.imagekit.io/eshoprohit/products/product-1783794029761_gMUgPbCtz.jpg?updatedAt=1783794033204"}
            alt="Hero Watch"
            width={550}
            height={550}
            priority
            className="relative z-10 drop-shadow-[0_30px_60px_rgba(13,148,136,0.3)] hover:-translate-y-4 hover:scale-[1.03] hover:-rotate-2 transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
