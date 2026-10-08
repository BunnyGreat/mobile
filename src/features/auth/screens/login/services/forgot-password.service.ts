import { invokePasswordResetFunction } from "./password-reset-api.service";
import { useLoginStore } from "../store/login.store";

type ResetChallengeResponse = {
  success: boolean;
  challengeId: string;
  expiresAt: number;
};

const requestOtp = async (email: string): Promise<void> => {
  const response = await invokePasswordResetFunction<ResetChallengeResponse>({
    action: "request",
    email,
  });

  if (!response.success || !response.challengeId || !response.expiresAt) {
    throw new Error("Unable to process the password reset request.");
  }

  const store = useLoginStore.getState();
  store.saveForgotPasswordEmail(email);
  store.saveResetChallenge(response.challengeId, response.expiresAt);
};

export const sendForgotPasswordOtp = async (email: string): Promise<void> => {
  if (!email) throw new Error("Invalid email");
  await requestOtp(email.trim().toLowerCase());
};

export const resendForgotPasswordOtp = async (): Promise<void> => {
  const email = useLoginStore.getState().forgotPasswordEmail;
  if (!email) throw new Error("No email in reset flow");

  await requestOtp(email);
};

type VerifyOtpResponse = {
  success: boolean;
  resetAuthorization: string;
};

export const verifyForgotPasswordOtp = async (otp: string): Promise<void> => {
  const challengeId = useLoginStore.getState().resetChallengeId;
  if (!challengeId) throw new Error("Request a new verification code.");

  const response = await invokePasswordResetFunction<VerifyOtpResponse>({
    action: "verify",
    challengeId,
    otp,
  });

  if (!response.success || !response.resetAuthorization) {
    throw new Error("Unable to verify the code. Request a new one.");
  }

  useLoginStore.getState().saveResetAuthorization(response.resetAuthorization);
};
