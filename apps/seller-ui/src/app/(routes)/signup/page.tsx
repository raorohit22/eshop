"use client";
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { countries } from 'apps/seller-ui/src/utils/countries';
import Link from 'next/link';
import CreateShop from 'apps/seller-ui/src/shared/modules/auth/create-shop';
import StripeLogo from '../../assets/svgs/stripe-logo';

type FormData = {
	name: string;
	email: string;
	password: string;
	country: string;
	phone_number: string;
};

const Signup = () => {
	const [activeStep, setActiveStep] = useState(1);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [canResend, setCanResend] = useState(true);
	const [timer, setTimer] = useState(60);
	const [otp, setOtp] = useState(["", "", "", ""]);
	const [sellerData, setSellerData] = useState<FormData | null>(null);
	const [showOtp, setShowOtp] = useState(false);
	const [sellerId, setSellerId] = useState("");
	const [stripeLoading, setStripeLoading] = useState(false);
	const [stripeError, setStripeError] = useState("");
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

	const { register, handleSubmit, formState: { errors } } = useForm({});

	const startResendTimer = () => {
		const interval = setInterval(() => {
			setTimer((prevTimer) => {
				if (prevTimer <= 1) {
					clearInterval(interval);
					setCanResend(true);
					return 0;
				}
				return prevTimer - 1;
			});
		}, 1000);
	};

	const signupMutation = useMutation({
		mutationFn: async (data: FormData) => {
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_SERVER_URI}/api/seller-registration`,
				data
			);
			return response.data;
		},
		onSuccess: (_, formData) => {
			setSellerData(formData);
			setShowOtp(true);
			setCanResend(false);
			setTimer(60);
			startResendTimer();
		}
	});

	const verifyOtpMutation = useMutation({
		mutationFn: async (otpData: { email: string; otp: string }) => {
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-seller`,
				{
					...sellerData,
					otp: otp.join(""),
				}
			);
			return response.data;
		},
		onSuccess: (data: any) => {
			setSellerId(data?.seller?.id);
			setActiveStep(2);
		}
	})

	const onSubmit = async (data: any) => {
		signupMutation.mutate(data);
	};

	const handleOtpChange = (index: number, value: string) => {
		if (!/^[0-9]?$/.test(value)) return;

		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		if (value && index < inputRefs.current.length - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleOtpKey = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Backspace" && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const resendOtp = () => {
		if (sellerData) {
			signupMutation.mutate(sellerData);
		}
	};

	const connectStripe = async () => {
		if (stripeLoading) return;
		setStripeLoading(true);
		setStripeError("");
		try {
			const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-stripe-link`, { sellerId }
			);

			if (response.data.url) {
				window.location.href = response.data.url;
			}

		} catch (error) {
			if (error instanceof AxiosError) {
				setStripeError(error.response?.data?.message || "Failed to connect Stripe. Please try again.");
			} else {
				setStripeError("An unexpected error occurred. Please try again.");
			}
			console.error("Stripe connection Error:", error);
		} finally {
			setStripeLoading(false);
		}
	}

	return (
		<div className="w-full min-h-screen bg-gray-50 flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8">
			
			<div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-4">
				<h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
					Join Eshop Seller
				</h1>
				<p className="mt-2 text-sm text-gray-600">
					Create your seller account in three simple steps
				</p>
			</div>

			{/* Custom Stepper */}
			<div className="sm:mx-auto sm:w-full sm:max-w-xl mb-6">
				<div className="relative flex items-center justify-between w-[90%] m-auto">
					<div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[2px] bg-gray-200 -z-10" />
					<div className="absolute top-1/2 left-0 -translate-y-1/2 h-[2px] bg-blue-600 transition-all duration-500 -z-10" style={{ width: `${((activeStep - 1) / 2) * 100}%` }} />
					
					{[1, 2, 3].map((step) => (
						<div key={step} className="flex flex-col items-center">
							<div className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm ${
								step < activeStep 
									? 'bg-blue-600 text-white' 
									: step === activeStep 
										? 'bg-blue-600 text-white ring-4 ring-blue-100' 
										: 'bg-white border-2 border-gray-200 text-gray-400'
							}`}>
								{step < activeStep ? <Check size={20} strokeWidth={3} /> : <span className="font-bold">{step}</span>}
							</div>
							<span className={`mt-3 text-xs font-semibold uppercase tracking-wider ${step <= activeStep ? 'text-gray-900' : 'text-gray-400'}`}>
								{step === 1 ? "Account" : step === 2 ? "Shop" : "Payout"}
							</span>
						</div>
					))}
				</div>
			</div>

			<div className="sm:mx-auto sm:w-full sm:max-w-xl">
				<div className="bg-white py-6 px-6 sm:px-10 shadow-xl border border-gray-100 rounded-2xl">
					
					{activeStep === 1 && (
						<>
							{!showOtp ? (
								<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
									<h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
										Create your account
									</h3>
									
									{/* Name */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
										<input
											type="text"
											placeholder="John Doe"
											className={`w-full px-4 py-2 bg-gray-50 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'} rounded-lg outline-none focus:ring-2 focus:bg-white transition-all duration-200`}
											{...register("name", { required: "Name is required" })}
										/>
										{errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.name.message)}</p>}
									</div>

									{/* Email */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
										<input
											type="email"
											placeholder="you@example.com"
											className={`w-full px-4 py-2 bg-gray-50 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'} rounded-lg outline-none focus:ring-2 focus:bg-white transition-all duration-200`}
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

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
										{/* Phone Number */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
											<input
												type='tel'
												placeholder="+1234567890"
												className={`w-full px-4 py-2 bg-gray-50 border ${errors.phone_number ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'} rounded-lg outline-none focus:ring-2 focus:bg-white transition-all duration-200`}
												{...register("phone_number", {
													required: "Phone number is required",
													pattern: {
														value: /^\+[1-9]\d{1,14}$/, //E.164 format
														message: "Invalid format (e.g. +1...)"
													},
													minLength: { value: 10, message: "Min 10 digits" },
													maxLength: { value: 15, message: "Max 15 digits" }
												})}
											/>
											{errors.phone_number && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.phone_number.message)}</p>}
										</div>

										{/* Country */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
											<select
												className={`w-full px-4 py-2 bg-gray-50 border ${errors.country ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'} rounded-lg outline-none focus:ring-2 focus:bg-white transition-all duration-200 cursor-pointer`}
												{...register("country", { required: "Country is required" })}
											>
												<option value="" className="text-gray-400">Select country</option>
												{countries.map((country) => (
													<option key={country.code} value={country.code}>
														{country.name}
													</option>
												))}
											</select>
											{errors.country && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.country.message)}</p>}
										</div>
									</div>

									{/* Password */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
										<div className="relative">
											<input
												type={passwordVisible ? "text" : "password"}
												placeholder="Create a strong password"
												className={`w-full px-4 py-3 pr-12 bg-gray-50 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'} rounded-lg outline-none focus:ring-2 focus:bg-white transition-all duration-200`}
												{...register("password", {
													required: "Password is required",
													minLength: { value: 6, message: "Must be at least 6 characters" }
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

									{signupMutation.isError && signupMutation.error instanceof AxiosError && (
										<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
											<p className="text-red-700 text-sm font-medium">
												{signupMutation.error.response?.data?.message || signupMutation.error.message}
											</p>
										</div>
									)}

									<button 
										type="submit" 
										disabled={signupMutation.isPending} 
										className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 mt-4"
									>
										{signupMutation.isPending ? (
											<div className="flex items-center gap-2">
												<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
												<span>Signing up...</span>
											</div>
										) : "Create Account"}
									</button>

									<p className="text-center text-sm text-gray-500 pt-4">
										Already have an account? {" "}
										<Link href={"/login"} className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
											Log in here
										</Link>
									</p>
								</form>
							) : (
								<div className="text-center py-4">
									<h3 className="text-2xl font-bold text-gray-900 mb-2">
										Verify your email
									</h3>
									<p className="text-sm text-gray-500 mb-8">
										We've sent a 4-digit code to <span className="font-semibold text-gray-700">{sellerData?.email}</span>
									</p>
									
									<div className='flex justify-center gap-4 sm:gap-6 mb-8'>
										{otp?.map((digit, index) => (
											<input key={index}
												type="text"
												ref={(el) => {
													if (el) inputRefs.current[index] = el;
												}}
												maxLength={1}
												value={digit}
												onChange={(e) => handleOtpChange(index, e.target.value)}
												onKeyDown={(e) => handleOtpKey(index, e)}
												className="w-14 h-14 sm:w-16 sm:h-16 border border-gray-300 rounded-xl bg-gray-50 text-center text-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
											/>
										))}
									</div>

									{verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
										<div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md mb-6 text-left">
											<p className="text-red-700 text-sm font-medium">
												{verifyOtpMutation.error.response?.data?.message || verifyOtpMutation.error.message}
											</p>
										</div>
									)}

									<button
										className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
										disabled={verifyOtpMutation.isPending || otp.join("").length < 4}
										onClick={() => verifyOtpMutation.mutate({ email: sellerData?.email || "", otp: otp.join("") })}
									>
										{verifyOtpMutation.isPending ? (
											<div className="flex items-center gap-2">
												<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
												<span>Verifying...</span>
											</div>
										) : "Verify Code"}
									</button>
									
									<p className="text-center text-sm mt-6 text-gray-500">
										Didn't receive the code?{" "}
										{canResend ? (
											<button onClick={resendOtp} className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
												Resend OTP
											</button>
										) : (
											<span className="font-medium text-gray-400">Resend in {timer}s</span>
										)}
									</p>
								</div>
							)}
						</>
					)}

					{activeStep === 2 && (
						<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
							<CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
						</div>
					)}

					{activeStep === 3 && (
						<div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
							<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
								<Check className="w-10 h-10 text-green-500" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 mb-2">Shop Created!</h3>
							<p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
								Your shop is ready. The final step is to connect your bank account via Stripe to receive payouts.
							</p>
							
							<button
								onClick={connectStripe}
								disabled={stripeLoading}
								className="w-full sm:w-auto m-auto flex items-center justify-center gap-3 px-8 py-3.5 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#635BFF] hover:bg-[#5851E5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#635BFF] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
							>
								{stripeLoading ? (
									<div className="flex items-center gap-2">
										<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
										<span>Connecting...</span>
									</div>
								) : (
									<>
										<span>Connect with</span>
										<StripeLogo />
									</>
								)}
							</button>

							{stripeError && (
								<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mt-6 text-left">
									<p className="text-red-700 text-sm font-medium">{stripeError}</p>
								</div>
							)}
							
							<p className="text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
								Payments powered securely by Stripe
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default Signup;
