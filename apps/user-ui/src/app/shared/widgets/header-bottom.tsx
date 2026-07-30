'use client'
import { navItems } from 'apps/user-ui/src/configs/constants';
import { AlignLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'

const HeaderBottom = () => {
	const [show, setShow] = useState(false);

	return (
		<div className="w-full relative bg-white/40 border-t border-gray-100 backdrop-blur-md">
			<div className="w-[90%] md:w-[85%] m-auto flex items-center justify-between">
				
				{/* All Departments Dropdown Trigger */}
				<div className="relative group">
					<div 
						className="w-[280px] cursor-pointer flex items-center justify-between px-6 h-[56px] bg-gradient-to-r from-[#115061] to-[#1a738a] hover:from-[#0b3642] hover:to-[#115061] transition-all duration-300 rounded-t-xl shadow-inner"
						onClick={() => setShow(!show)}
					>
						<div className="flex items-center gap-3">
							<AlignLeft color="white" size={20} />
							<span className="text-white font-semibold tracking-wide">All Departments</span>
						</div>
						<ChevronDown color="white" size={18} className={`transition-transform duration-300 ${show ? 'rotate-180' : ''}`} />
					</div>

					{/* Dropdown Menu (Glassmorphism) */}
					<div className={`absolute top-full left-0 w-[280px] bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-b-xl overflow-hidden transition-all duration-300 origin-top ${show ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}>
						<ul className="flex flex-col py-2">
							{['Electronics & Gadgets', 'Smart Home', 'Wearables', 'Audio & Sound', 'Accessories'].map((dept, idx) => (
								<li key={idx} className="px-6 py-3 text-gray-700 font-medium hover:bg-teal-50 hover:text-teal-700 cursor-pointer transition-colors border-b border-gray-50 last:border-none flex items-center gap-2 group">
									<span className="w-1.5 h-1.5 rounded-full bg-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
									{dept}
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Navigation Links */}
				<div className="flex-grow flex items-center justify-end md:justify-center gap-2">
					{navItems.map((i: any, index: number) => (
						<Link 
							key={index} 
							className="px-5 py-2 font-medium text-gray-700 hover:text-[#115061] hover:bg-teal-50/50 rounded-full transition-all duration-300 relative group" 
							href={i.href}
						>
							{i.title}
							<span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#115061] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
						</Link>
					))}
				</div>

			</div>
		</div>
	)
}

export default HeaderBottom
