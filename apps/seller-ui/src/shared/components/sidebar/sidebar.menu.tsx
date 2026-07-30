import React from 'react'

interface Props {
	title: string
	children: React.ReactNode
}

const SidebarMenu = ({ title, children }: Props) => {
	return (
		<div className="flex flex-col gap-1 mb-6">
			<h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-3 mb-1">
				{title}
			</h3>
			<div className="flex flex-col gap-1">
				{children}
			</div>
		</div>
	)
}

export default SidebarMenu
