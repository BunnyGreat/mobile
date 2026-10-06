import { auth, db } from "../../../../../services/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import type { LoginResponse, LoginUser } from "../types/login.types";
import { resolveProfilePhotoUrl } from "../../../../profile/services/profilePhoto.service";

export const loginUser = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return { success: false, error: "Account record not found." };
    }

    const data = userSnap.data() as Record<string, any>;

    const status: string = data.status ?? "pending";
    const role: string = data.role ?? "resident";
    const referenceId: string | undefined = data.referenceId ?? undefined;
    const personalInformation = {
      firstName: data.personalInformation?.firstName ?? "",
      middleName: data.personalInformation?.middleName ?? "",
      lastName: data.personalInformation?.lastName ?? "",
      profilePhotoPath:
        data.personalInformation?.profilePhotoPath ??
        data.profilePhotoPath ??
        undefined,
      profilePhotoUrl:
        data.personalInformation?.profilePhotoUrl ??
        data.profilePhotoUrl ??
        undefined,
    };

    if (status === "pending") {
      return { success: false, error: "Your registration is still under review." };
    }

    if (status === "rejected") {
      return { success: false, error: "Your registration has been rejected." };
    }

    // Sign in to Supabase before resolving private storage URLs.
    try {
      const { supabaseSignIn } = await import(
        "../../../../../services/supabase/auth.service"
      );
      const supa = await supabaseSignIn(email, password);
      if (supa?.error) {
        console.error("[LOGIN] Supabase signIn failed:", supa.error);
        return { success: false, error: "Unable to sign into storage service." };
      }
    } catch (e) {
      console.error("[LOGIN] Supabase signIn error:", e);
      return { success: false, error: "Unable to sign into storage service." };
    }

    let profilePhotoUrl: string | undefined;
    try {
      profilePhotoUrl =
        (await resolveProfilePhotoUrl(uid, data, credential.user.photoURL)) ??
        undefined;
    } catch (error) {
      console.warn("[LOGIN] Failed to resolve profile photo", error);
    }
    personalInformation.profilePhotoUrl = profilePhotoUrl;

    const user: LoginUser = {
      uid,
      email,
      role,
      status: status as any,
      referenceId,
      personalInformation,
      profilePhotoUrl,
    };

    return { success: true, user };
  } catch (err: unknown) {
    const code = (err as any)?.code as string | undefined;

    switch (code) {
      case "auth/user-not-found":
        return { success: false, error: "No account found with this email." };
      case "auth/wrong-password":
        return { success: false, error: "Incorrect password." };
      case "auth/invalid-credential":
        return { success: false, error: "Invalid email or password." };
      case "auth/too-many-requests":
        return { success: false, error: "Too many attempts. Please try again later." };
      default:
        return { success: false, error: (err as Error)?.message ?? "Login failed." };
    }
  }
};
