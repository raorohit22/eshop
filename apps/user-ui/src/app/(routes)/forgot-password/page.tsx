"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';


type FormData = {
	email: string;
	password: string;
}

const ForgotPassword = () => {
	const [step, setStep] = useState<"email" | "otp" | "reset">("email");
	const [otp, setOtp] = useState(["", "", "", ""]);
	const [userEmail, setUserEmail] = useState<string | null>(null);
	const [canResend, setCanResend] = useState(true);
	const [timer, setTimer] = useState(60);
	const [serverError, setServerError] = useState<string | null>(null);
	const [rememberMe, setRememberMe] = useState(false);
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
	const router = useRouter();

	const { register, handleSubmit, formState: { errors } } = useForm<FormData>({});

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

	const requestOtpMutation = useMutation({
		mutationFn: async (email: string) => {
			const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/forgot-password-user`, { email });
			return response.data;
		},
		onSuccess: (_, email: string) => {
			setUserEmail(email);
			setStep("otp");
			setServerError(null);
			setCanResend(false);
			startResendTimer();
		},
		onError: (error: AxiosError) => {
			const errorMessage = (error.response?.data as { message?: string })?.message || "Failed to request OTP";
			setServerError(errorMessage);
		},
	});


	const verifyOtpMutation = useMutation({
		mutationFn: async (otpData: { email: string; otp: string }) => {
			const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-password-user`, otpData);
			return response.data;
		},
		onSuccess: () => {
			setStep("reset");
			setServerError(null);
		},
		onError: (error: AxiosError) => {
			const errorMessage = (error.response?.data as { message?: string })?.message;
			setServerError(errorMessage || "Invalid OTP");
		}
	});

	const resetPasswordMutation = useMutation({
		mutationFn: async ({ password }: { password: string }) => {
			if (!password) return;
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-password-user`,
				{ email: userEmail, newPassword: password });
			return response.data;
		}
		,
		onSuccess: () => {
			setStep("email");
			toast.success("Password reset successfully! Please login with your new password.");
			setServerError(null);
			router.push("/login");
		},
		onError: (error: AxiosError) => {
			const errorMessage = (error.response?.data as { message?: string })?.message;
			setServerError(errorMessage || "Failed to reset password");
		}
	});

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

	const onSubmitEmail = ({ email }: { email: string }) => {
		requestOtpMutation.mutate(email);
	};

	const onSubmitPassword = ({ password }: { password: string }) => {
		requestOtpMutation.mutate(password);
	};

	return (
		<div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
			<h1 className="text-4xl font-Poppins font-semibold text-black text-center">
				Forgot Password
			</h1>
			<p className="text-center text-lg font-medium py-3 text-[#00000099]">
				Home . Forgot Password
			</p>

			<div className="w-full flex justify-center">
				<div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
					{step === "email" && (
						<>
							<h3 className="text-xl font-semibold text-center mb-2">
								Login to Eshop
							</h3>

							<p className="text-center text-gray-400 mb-4">
								Go back to? {" "}
								<Link href={"/login"} className="text-blue-500 cursor-pointer">
									Login
								</Link>
							</p>

							<form onSubmit={handleSubmit(onSubmitEmail)}>
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
								{errors.email &&
									(<p className="text-red-500 text-sm">{String(errors.email.message)}</p>)
								}

								<button
									disabled={requestOtpMutation.isPending}
									type="submit"
									className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg mt-4">
									{requestOtpMutation.isPending ? "Sending OTP..." : "Submit"}
								</button>
								{serverError && <p className="text-red-500 text-sm mt-2">{serverError}</p>}
							</form>

						</>
					)}

					{step === "otp" && (
						<>
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
								onClick={() => verifyOtpMutation.mutate({ email: userEmail!, otp: otp.join("") })}
							>
								{verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
							</button>

							{canResend ? (
								<button
									onClick={() => requestOtpMutation.mutate(userEmail!)}
									className="text-blue-500 cursor-pointer"
								>
									Resend OTP
								</button>
							) : (
								<p className="text-center text-sm mt-4">Resend OTP in ${timer}s
								</p>
							)}
							{serverError && (<p className="text-red-500 text-sm mt-2">{serverError}</p>)}

						</>
					)}

					{step === "reset" && (
						<>
							<h3 className="text-xl font-semibold text-center mb-2">
								Enter OTP
							</h3>
							<form onSubmit={handleSubmit(onSubmitPassword)}>
								<label className="block text-gray-700 mb-1">New Password</label>
								<input
									type="password"
									placeholder='Enter new password'
									className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
									{...register("password", {
										required: "Password is required",
										minLength: { value: 6, message: "Password must be at least 6 characters" }
									})}
								/>
								{errors.password &&
									<p className="text-red-500 text-sm">{String(errors.password.message)}
									</p>
								}

								<button
									type="submit"
									disabled={resetPasswordMutation.isPending}
									className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg mt-4">
									{resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
								</button>

								{serverError && (
									<p className="text-red-500 text-sm mt-2">{serverError}</p>
								)}
							</form>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default ForgotPassword;
