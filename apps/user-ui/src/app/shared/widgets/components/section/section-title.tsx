import React from 'react'

// Custom SVG component for a Ticket Border
const TicketBorderIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Outer border with classic semi-circle cutouts */}
    <path d="M4 7V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4v-2a2 2 0 0 0 0-4z"></path>
    {/* Perforated dashed line inside the ticket */}
    <line x1="16" y1="4" x2="16" y2="20" strokeDasharray="3 4"></line>
  </svg>
);

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <div className="relative flex items-center gap-3 w-fit group cursor-default">
      {/* Premium Decorative Bar */}
      <span className="w-1.5 h-8 bg-gradient-to-b from-[#115061] to-[#2dd4bf] rounded-full shadow-[0_0_10px_rgba(45,212,191,0.4)] group-hover:shadow-[0_0_15px_rgba(45,212,191,0.7)] transition-shadow duration-300"></span>
      
      {/* Sleek Title Text */}
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight font-Roboto relative z-10 group-hover:text-[#115061] transition-colors duration-300">
        {title}
      </h2>

      {/* Interactive Icon Accent */}
      <div className="relative flex items-center justify-center ml-2">
        <div className="absolute inset-0 bg-teal-400/20 blur-md rounded-full scale-[2] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <TicketBorderIcon className="text-[#2dd4bf] w-7 h-7 transform -rotate-12 group-hover:scale-110 group-hover:rotate-0 group-hover:text-[#115061] transition-all duration-500 relative z-10 drop-shadow-sm" />
      </div>
    </div>
  )
}

export default SectionTitle;