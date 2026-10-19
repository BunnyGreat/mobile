import { z } from "zod";
import type {
  RegistrationPersonalInformation,
  RegistrationResidenceInformation,
  RegistrationDocuments,
  RegistrationFormData,
} from "../types/register.types";

export const registrationCredentialsSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Please enter a valid email address."),
    password: z
      .string()
      .min(1, "Password is required.")
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain an uppercase letter.")
      .regex(/[a-z]/, "Password must contain a lowercase letter.")
      .regex(/[0-9]/, "Password must contain a number.")
      .regex(/[^a-zA-Z0-9]/, "Password must contain a special character."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegistrationCredentialsErrors = {
  email: string;
  password: string;
  confirmPassword: string;
};

export const validateRegistrationCredentials = (values: {
  email: string;
  password: string;
  confirmPassword: string;
}): { isValid: boolean; errors: RegistrationCredentialsErrors } => {
  const result = registrationCredentialsSchema.safeParse(values);
  const errors: RegistrationCredentialsErrors = {
    email: "",
    password: "",
    confirmPassword: "",
  };

  if (result.success) return { isValid: true, errors };

  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (
      (field === "email" ||
        field === "password" ||
        field === "confirmPassword") &&
      !errors[field]
    ) {
      errors[field] = issue.message;
    }
  }

  return { isValid: false, errors };
};

export const personalInformationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  middleName: z.string().min(1, "Middle name is required"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  suffix: z.string().optional(),
  dateOfBirth: z.string().nonempty("Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  civilStatus: z.enum(["single", "married", "widowed", "separated", "divorced"]),
  contactNumber: z.string().regex(/^09\d{9}$/, {
    message: "Contact number must be a Philippine mobile number starting with 09 and 11 digits",
  }),
  profilePhotoUri: z.string().nonempty("Profile photo is required"),
});

export const residenceInformationSchema = z.object({
  houseNumber: z.string().nonempty("Block Number is required"),
  street: z.string().nonempty("Lot Number is required"),
  purok: z.string().nonempty("Phase / Subdivision is required"),
  barangay: z.string().nonempty("Barangay is required"),
  municipality: z.string().nonempty("Municipality is required"),
  province: z.string().nonempty("Province is required"),
});

export const documentsSchema = z.object({
  frontIdUri: z.string().nonempty("Front ID URI is required"),
  backIdUri: z.string().nonempty("Back ID URI is required"),
});

export const registrationSchema = z.object({
  personalInformation: personalInformationSchema,
  residenceInformation: residenceInformationSchema,
  documents: documentsSchema,
});

export type PersonalInformationFormValues = z.infer<typeof personalInformationSchema>;
export type ResidenceInformationFormValues = z.infer<typeof residenceInformationSchema>;
export type DocumentsFormValues = z.infer<typeof documentsSchema>;
export type RegistrationFormValues = z.infer<typeof registrationSchema>;
