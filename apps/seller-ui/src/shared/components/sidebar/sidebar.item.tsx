import Link from 'next/link'
import React from 'react'


interface Props {
	icon: any
	title: string
	isActive?: boolean
	href: string
};

const SidebarItem = ({ icon, title, isActive, href }: Props) => {
	return (
		<Link href={href} className="block w-full">
			<div className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group
			 ${isActive 
				? "bg-blue-600/15" 
				: "hover:bg-white/5"
			}`}>
				<div className={`transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}>
					{icon}
				</div>
				<h5 className={`text-sm font-medium transition-colors duration-200 ${isActive ? "text-blue-500 font-semibold" : "text-slate-300 group-hover:text-white"}`}>
					{title}
				</h5>
			</div>
		</Link>
	)
}

export default SidebarItem
