import type { CertificatePurpose, LoanType } from "../types/certificatePurpose.types";

export const getPurposeFieldLabel = (purpose: CertificatePurpose): string | null => {
  switch (purpose) {
    case "Electrical Application":
      return "Electric Company";
    case "Police Clearance Application":
      return "Police Station";
    case "Travel Abroad Application":
      return "Country to Visit";
    case "Water Application":
      return "Water Provider";
    case "Bank Requirement":
      return "Bank Name";
    case "Bail Bond Application":
      return "Court / Agency Name";
    case "Late Registration":
      return "Purpose";
    case "Local Employment":
      return "Company Name";
    case "Private Body Number (Application/Renewal)":
      return "Agency Name";
    case "Residency":
      return "Years of Residency";
    case "TESDA / School / OJT Requirement":
      return "School Name";
    case "Loan Application (Motorcycle, E-Bike, Housing & Car)":
      return "Loan Type";
    case "LTOPF Requirement":
      return "Firearm Type";
    default:
      return null;
  }
};

export const isLoanTypePurpose = (purpose: CertificatePurpose): boolean => {
  return purpose === "Loan Application (Motorcycle, E-Bike, Housing & Car)";
};

export const isPurposeFieldOptional = (purpose: CertificatePurpose): boolean => {
  return purpose === "Postal ID Application" || purpose === "NBI Requirement" || purpose === "LTOPF Requirement";
};

export const getLoanTypes = (): LoanType[] => ["Motorcycle", "E-bike", "Housing", "Car"];
