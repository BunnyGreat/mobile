import { db } from "../../../../../services/firebase/firebase";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { sendRegistrationOtpEmail } from "../../register/services/register.service";
import { useLoginStore } from "../store/login.store";

const USERS_COLLECTION = "users";

export const checkEmailRegistered = async (email: string): Promise<boolean> => {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where("email", "==", email), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
};

export const generateOtpCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendForgotPasswordOtp = async (email: string): Promise<void> => {
  if (!email) throw new Error("Invalid email");

  const exists = await checkEmailRegistered(email);
  if (!exists) throw new Error("NOT_REGISTERED");

  const otp = generateOtpCode();
  const now = Date.now();

  // send email using resend via register.service helper with password-reset type
  await sendRegistrationOtpEmail(email, otp, "password-reset");

  // persist to zustand store
  const saveEmail = useLoginStore.getState().saveForgotPasswordEmail;
  const saveOtp = useLoginStore.getState().saveResetOtp;
  const saveTs = useLoginStore.getState().saveOtpCreatedAt;

  saveEmail(email);
  saveOtp(otp);
  saveTs(now);
};

export const resendForgotPasswordOtp = async (): Promise<void> => {
  const state = useLoginStore.getState();
  const email = state.forgotPasswordEmail;
  if (!email) throw new Error("No email in reset flow");

  const otp = generateOtpCode();
  const now = Date.now();

  await sendRegistrationOtpEmail(email, otp, "password-reset");

  state.saveResetOtp(otp);
  state.saveOtpCreatedAt(now);
};
