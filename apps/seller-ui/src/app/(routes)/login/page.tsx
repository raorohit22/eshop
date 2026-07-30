"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';


type FormData = {
	email: string;
	password: string;
}

const Login = () => {
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [rememberMe, setRememberMe] = useState(false);
	const router = useRouter();

	const { register, handleSubmit, formState: { errors } } = useForm<FormData>({});

	const loginMutation = useMutation({
		mutationFn: async (data: FormData) => {
			const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-seller`, data,
				{ withCredentials: true }
			);
			return response.data;
		},
		onSuccess: (data) => {
			setServerError(null);
			router.push("/");
		},
		onError: (error: AxiosError) => {
			const errorMessage = (error.response?.data as { message?: string })?.message || "Invalid credentials";
			setServerError(errorMessage);
		}
	});

	const onSubmit = async (data: FormData) => {
		loginMutation.mutate(data);
	};

	return (
		<div className="w-full min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
			
			<div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
				<h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
					Eshop Seller
				</h1>
				<p className="mt-2 text-sm text-gray-600">
					Manage your store and grow your business
				</p>
			</div>

			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-10 px-8 shadow-xl border border-gray-100 rounded-2xl sm:px-10">
					
					<h3 className="text-2xl font-bold text-gray-900 mb-2">
						Welcome back
					</h3>
					<p className="text-gray-500 text-sm mb-6">
						Don't have a seller account? {" "}
						<Link href={"/signup"} className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
							Sign Up
						</Link>
					</p>

					<div className="flex items-center mb-6">
						<div className="flex-1 border-t border-gray-200" />
						<span className="px-4 text-sm text-gray-400 font-medium">Sign in with Email</span>
						<div className="flex-1 border-t border-gray-200" />
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						
						{/* Email Input */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								Email Address
							</label>
							<input
								type="email"
								placeholder="you@example.com"
								className={`w-full px-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'} rounded-lg outline-none focus:ring-2 focus:bg-white transition-all duration-200`}
								{...register("email", {
									required: "Email is required",
									pattern: {
										value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
										message: "Invalid email address"
									}
								})}
							/>
							{errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.email.message)}</p>}
						</div>

						{/* Password Input */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								Password
							</label>
							<div className="relative">
								<input
									type={passwordVisible ? "text" : "password"}
									placeholder="Enter your password"
									className={`w-full px-4 py-3 pr-12 bg-gray-50 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'} rounded-lg outline-none focus:ring-2 focus:bg-white transition-all duration-200`}
									{...register("password", {
										required: "Password is required",
										minLength: { value: 6, message: "Password must be at least 6 characters" }
									})}
								/>
								<button 
									type="button" 
									onClick={() => setPasswordVisible(!passwordVisible)}
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
								>
									{passwordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
								</button>
							</div>
							{errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.password.message)}</p>}
						</div>

						{/* Utilities */}
						<div className="flex items-center justify-between pt-1">
							<label className="flex items-center text-sm text-gray-600 cursor-pointer">
								<input
									type="checkbox"
									className="w-4 h-4 mr-2 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-colors"
									checked={rememberMe}
									onChange={() => setRememberMe(!rememberMe)}
								/>
								Remember me
							</label>
							<Link href={"/forgot-password"} className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
								Forgot Password?
							</Link>
						</div>

						{/* Error Banner */}
						{serverError && (
							<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
								<p className="text-red-700 text-sm font-medium">{serverError}</p>
							</div>
						)}

						{/* Submit Button */}
						<button 
							disabled={loginMutation.isPending} 
							type="submit" 
							className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 mt-2"
						>
							{loginMutation.isPending ? (
								<div className="flex items-center gap-2">
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									<span>Signing in...</span>
								</div>
							) : "Sign In to Seller Dashboard"}
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}

export default Login;
