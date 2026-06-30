"use client";
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
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
		try {
			const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-stripe-link`, { sellerId }
			);

			if (response.data.url) {
				window.location.href = response.data.url;
			}

		} catch (error) {
			console.log("Stripe connection Error:", error)
		};
	}

	return (
		<div className="w-full flex flex-col items-center pt-10 min-h-screen">
			{/* Steeper */}
			<div className="relative flex items-center justify-between md:w-[50%] mb-8">
				<div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10" />
				{[1, 2, 3].map((step) => (
					<div key={step}>
						<div className={`w-10 h-10 flex items-center justify-center rounded-full
						 text-white font-bold 
		                   ${step <= activeStep ? 'bg-blue-600' : 'bg-gray-300'}`}>
							{step}
						</div>
						<span className="ml-[-15px]">
							{step === 1 ? "Create Account" : step === 2 ? "Setup Shop" : "Connect Bank"}
						</span>
					</div>
				))}
			</div>

			{/* Steps Consent */}
			<div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
				{activeStep === 1 && (
					<>
						{!showOtp ? (
							<form onSubmit={handleSubmit(onSubmit)}>
								<h3 className="text-3xl font-semibold text-center mb-2">
									Create Account
								</h3>
								<label className="block text-gray-700 mb-1"> Name </label>
								<input
									type="text"
									placeholder="Enter your name"
									className={`w-full p-2 border border-gray-300 !rounded outline-0 mb-1`}
									{...register("name", {
										required: "Name is required"
									})}
								/>
								{errors.name && <p className="text-red-500 text-sm">{String(errors.name.message)}</p>}


								<label className="block text-gray-700 mb-1"> Email </label>
								<input
									type="email"
									placeholder="Enter your email"
									className={`w-full p-2 border border-gray-300 !rounded outline-0 mb-1`}
									{...register("email", {
										required: "Email is required",
										pattern: {
											value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
											message: "Invalid email address"
										}
									})}
								/>
								{errors.email && <p className="text-red-500 text-sm">{String(errors.email.message)}</p>}

								<label className="block text-gray-700 mb-1"> Phone Number </label>

								<input
									type='tel'
									placeholder="Enter your phone number"
									className={`w-full p-2 border border-gray-300 !rounded outline-0 mb-1`}
									{...register("phone_number", {
										required: "Phone number is required",
										pattern: {
											value: /^\+[1-9]\d{1,14}$/, //E.164 format
											message: "Invalid phone number format"
										},
										minLength: { value: 10, message: "Phone number must be at least 10 digits" },
										maxLength: { value: 15, message: "Phone number must be at most 15 digits" }
									})}
								/>
								{errors.phone_number && <p className="text-red-500 text-sm">{String(errors.phone_number.message)}</p>}

								<label className="block text-gray-700 mb-1"> Country </label>
								<select
									className={`w-full p-2 border border-gray-300 !rounded outline-0 mb-1`}
									{...register("country", {
										required: "Country is required"
									})}
								>
									<option value="">Select your country</option>
									{countries.map((country) => (
										<option key={country.code} value={country.code}>
											{country.name}
										</option>
									))}
								</select>
								{errors.country && <p className="text-red-500 text-sm">{String(errors.country.message)}</p>}

								<label className="block text-gray-700 mb-1"> Password </label>
								<div className="relative">

									<input
										type={passwordVisible ? "text" : "password"}
										placeholder="Enter your password"
										className={`w-full p-2 border border-gray-300 !rounded outline-0 mb-1`}
										{...register("password", {
											required: "Password is required",
											minLength: { value: 6, message: "Password must be at least 6 characters" }
										})}
									/>
									<button type="button" onClick={() => setPasswordVisible(!passwordVisible)}
										className="absolute inset-y-0 right-3 flex items-center text-gray-400">
										{passwordVisible ? <Eye /> : <EyeOff />}
									</button>
									{errors.password && <p className="text-red-500 text-sm">{String(errors.password.message)}</p>}

								</div>

								<button type="submit" disabled={signupMutation.isPending} className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg mt-4">
									{signupMutation.isPending ? "Signing up..." : "Signup"}
								</button>

								{signupMutation.isError &&
									signupMutation.error instanceof AxiosError && (
										<p className="text-red-500 text-sm mt-2">
											{signupMutation.error.response?.data?.message ||
												signupMutation.error.message}
										</p>
									)}

								<p className="text-center pt-3">
									Already have an account? {" "}
									<Link href={"/login"} className="text-blue-500 hover:underline">
										Login
									</Link>
								</p>
							</form>
						) : (

							<div>
								<h3 className="text-xl font-semibold text-center mb-2">
									Enter OTP
								</h3>
								<div className='flex justify-center gap-6'>
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
											className="w-12 h-12 border border-gray-300 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									))}
								</div>
								<button
									className="w-full text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg mt-4"
									disabled={verifyOtpMutation.isPending}
									onClick={() => verifyOtpMutation.mutate({ email: sellerData?.email || "", otp: otp.join("") })}
								>
									{verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
								</button>
								<p className="text-center text-sm mt-4">
									{canResend ? (
										<button onClick={resendOtp}
											className="text-blue-500 cursor-pointer ">
											Resend OTP
										</button>
									)
										:
										`Resend OTP in ${timer}s`}</p>
								{verifyOtpMutation?.isError &&
									verifyOtpMutation.error instanceof AxiosError && (
										<p className="text-red-500 text-sm mt-2">
											{verifyOtpMutation.error.response?.data?.message || verifyOtpMutation.error.message}</p>
									)
								}

							</div>
						)}
					</>
				)}

				{activeStep === 2 && (
					<CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
				)}

				{activeStep === 3 && (
					<div className="text-center">
						<h3 className="text-2xl font-semibold">Withdraw Method</h3>
						<br />
						<button
							onClick={connectStripe}
							className="w-full m-auto flex items-center justify-center gap-3 
						text-lg cursor-pointer bg-[#334155] text-white py-2 rounded-lg">
							Connect Stripe <StripeLogo />

						</button>

					</div>


				)
				}
			</div>
		</div>
	)
}

export default Signup;
