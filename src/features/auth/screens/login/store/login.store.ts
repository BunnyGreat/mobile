import { create } from "zustand";
import type { LoginUser } from "../types/login.types";

export interface LoginStore {
	user: LoginUser | null;
	isLoading: boolean;
	error: string | null;

	// Forgot / Reset flow
	forgotPasswordEmail: string | null;
	resetChallengeId: string | null;
	otpExpiresAt: number | null;
	resetAuthorization: string | null;

	setUser: (user: LoginUser | null) => void;
	setLoading: (value: boolean) => void;
	setError: (message: string | null) => void;
	logout: () => void;
	clear: () => void;

	// Reset flow methods
	saveForgotPasswordEmail: (email: string) => void;
	saveResetChallenge: (challengeId: string, expiresAt: number) => void;
	saveResetAuthorization: (authorization: string) => void;
	clearResetFlow: () => void;
}

export const useLoginStore = create<LoginStore>((set) => ({
	user: null,
	isLoading: false,
	error: null,

	// Forgot / Reset flow
	forgotPasswordEmail: null,
	resetChallengeId: null,
	otpExpiresAt: null,
	resetAuthorization: null,

	setUser: (user) => set(() => ({ user })),
	setLoading: (value) => set(() => ({ isLoading: value })),
	setError: (message) => set(() => ({ error: message })),

	logout: () =>
		set(() => ({
			user: null,
			forgotPasswordEmail: null,
			resetChallengeId: null,
			otpExpiresAt: null,
			resetAuthorization: null,
		})),

	clear: () =>
		set(() => ({
			user: null,
			isLoading: false,
			error: null,
			forgotPasswordEmail: null,
			resetChallengeId: null,
			otpExpiresAt: null,
			resetAuthorization: null,
		})),

	// Reset flow methods
	saveForgotPasswordEmail: (email) => set(() => ({ forgotPasswordEmail: email })),
	saveResetChallenge: (challengeId, expiresAt) =>
		set(() => ({ resetChallengeId: challengeId, otpExpiresAt: expiresAt, resetAuthorization: null })),
	saveResetAuthorization: (authorization) => set(() => ({ resetAuthorization: authorization })),
	clearResetFlow: () =>
		set(() => ({
			forgotPasswordEmail: null,
			resetChallengeId: null,
			otpExpiresAt: null,
			resetAuthorization: null,
		})),
}));
