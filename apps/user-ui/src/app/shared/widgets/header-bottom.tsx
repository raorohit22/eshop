'use client'
import ProfileIcon from 'apps/user-ui/src/assets/svgs/profile-icon';
import { navItems } from 'apps/user-ui/src/configs/constants';
import useUser from 'apps/user-ui/src/hooks/useUser';
import { AlignLeft, ChevronDown, } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'


const HeaderBottom = () => {
	const [show, setShow] = useState(false);
	const [isSticky, setIsSticky] = useState(false);
	const { user, isLoading } = useUser();
	//Track scroll position and set sticky header

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 100) {
				setIsSticky(true);
			} else {
				setIsSticky(false);
			}
		};
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, [])

	return (
		<div className={`w-full transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 shadow-lg bg-white z-[100]' : 'relative'}`}
		>
			<div className={`w-[80%] relative m-auto flex items-center justify-between ${isSticky ? 'pt-3' : 'py-0'
				}`}>
				{/* All Dropdown */}
				<div className={`w-[260px] ${isSticky ? '-mb-2' : ''} cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`
				}
					onClick={() => setShow(!show)}>

					<div className='flex items-center gap-2'>
						<AlignLeft color="white" />
						<span className="text-white font-medium">All Departments</span>

					</div>
					<ChevronDown color="white" />
				</div>

				{/* Dropdown menu */}
				{show && (
					<div className={`absolute left-0
					 ${isSticky ? 'top-[70px]' : 'top-[50px]'} w-[260px] h-[400px] bg-[#f5f5f5]`}>
						<ul className='flex flex-col'>
							<li className='px-5 py-2 hover:bg-gray-100 cursor-pointer'>Department 1</li>
							<li className='px-5 py-2 hover:bg-gray-100 cursor-pointer'>Department 2</li>
							<li className='px-5 py-2 hover:bg-gray-100 cursor-pointer'>Department 3</li>
						</ul>
					</div>
				)}

				{/* Navigation Links */}
				<div className="flex items-center">
					{navItems.map((i: NavItemsType, index: number) => (
						<Link key={index} className="px-5 font-medium text-lg" href={i.href}>
							{i.title}
						</Link>
					))}
				</div>
				{isSticky && (
					<div className="flex items-center gap-8">
						<div className=" flex items-center gap-2">
							{!isLoading && user ? (
								<>
									<Link href={"/profile"}
										className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]">
										<ProfileIcon />
									</Link>
									<Link href={"/profile"}>
										<span className="block font-medium">Hello</span>
										<span className="font-semibold">{user?.name?.split(" ")[0]}</span>
									</Link>
								</>
							) : (
								<>
									<Link
										href={"/login"}
										className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
									>
										<ProfileIcon />
									</Link>
									<Link href={"/login"}>
										<span className="block font-medium">Hello</span>
										<span className="font-semibold">{isLoading ? "..." : "Sign In"}</span>
									</Link>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default HeaderBottom
