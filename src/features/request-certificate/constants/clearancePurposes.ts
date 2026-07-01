export const CLEARANCE_PURPOSES = [
  "Electrical Application",
  "Police Clearance Application",
  "Postal ID Application",
  "Travel Abroad Application",
  "Water Application",
  "Bank Requirement",
  "Bail Bond Application",
  "Late Registration",
  "Local Employment",
  "NBI Requirement",
  "Private Body Number (Application/Renewal)",
  "Residency",
  "TESDA / School / OJT Requirement",
  "Loan Application",
  "LTOPF Requirement",
] as const;

export type ClearancePurpose = typeof CLEARANCE_PURPOSES[number];
