import { create } from "zustand";
import type { LoginUser } from "../types/login.types";

export interface LoginStore {
	user: LoginUser | null;
	isLoading: boolean;
	error: string | null;

	// Forgot / Reset flow
	forgotPasswordEmail: string | null;
	resetOtp: string | null;
	otpCreatedAt: number | null;

	setUser: (user: LoginUser | null) => void;
	setLoading: (value: boolean) => void;
	setError: (message: string | null) => void;
	logout: () => void;
	clear: () => void;

	// Reset flow methods
	saveForgotPasswordEmail: (email: string) => void;
	saveResetOtp: (otp: string) => void;
	saveOtpCreatedAt: (ts: number | null) => void;
	clearResetFlow: () => void;
}

export const useLoginStore = create<LoginStore>((set) => ({
	user: null,
	isLoading: false,
	error: null,

	// Forgot / Reset flow
	forgotPasswordEmail: null,
	resetOtp: null,
	otpCreatedAt: null,

	setUser: (user) => set(() => ({ user })),
	setLoading: (value) => set(() => ({ isLoading: value })),
	setError: (message) => set(() => ({ error: message })),

	logout: () => set(() => ({ user: null })),

	clear: () =>
		set(() => ({
			user: null,
			isLoading: false,
			error: null,
		})),

	// Reset flow methods
	saveForgotPasswordEmail: (email) => set(() => ({ forgotPasswordEmail: email })),
	saveResetOtp: (otp) => set(() => ({ resetOtp: otp })),
	saveOtpCreatedAt: (ts) => set(() => ({ otpCreatedAt: ts })),
	clearResetFlow: () =>
		set(() => ({
			forgotPasswordEmail: null,
			resetOtp: null,
			otpCreatedAt: null,
		})),
}));

