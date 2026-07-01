import { create } from "zustand";
import type { BarangayClearanceFormValues } from "../types/barangayClearance.types";

export interface CertificateStore {
  selectedCertificateTypeId: string | null;
  setSelectedCertificateTypeId: (typeId: string) => void;
  barangayClearanceForm: BarangayClearanceFormValues;
  setBarangayClearanceForm: (
    values: Partial<BarangayClearanceFormValues>,
  ) => void;
  resetBarangayClearanceForm: () => void;
}

const initialForm: BarangayClearanceFormValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  address: "",
  birthdate: "",
  birthplace: "",
  contactNumber: "",
  purpose: "",
  dynamicFieldValue: "",
  loanType: undefined,
};

export const useCertificateStore = create<CertificateStore>((set) => ({
  selectedCertificateTypeId: null,
  setSelectedCertificateTypeId: (typeId: string) =>
    set({ selectedCertificateTypeId: typeId }),
  barangayClearanceForm: initialForm,
  setBarangayClearanceForm: (values: Partial<BarangayClearanceFormValues>) =>
    set((state) => ({
      barangayClearanceForm: {
        ...state.barangayClearanceForm,
        ...values,
      },
    })),
  resetBarangayClearanceForm: () => set({ barangayClearanceForm: initialForm }),
}));
