import { useCallback, useMemo, useState } from "react";
import type { CertificatePurpose } from "../types/certificatePurpose.types";
import type { BarangayClearanceFormValues } from "../types/barangayClearance.types";
import { validateBarangayClearance } from "../services/certificateValidation.service";
import {
  getLoanTypes,
  getPurposeFieldLabel,
  isLoanTypePurpose,
} from "../utils/mapPurposeFields";

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

export const useBarangayClearance = () => {
  const [values, setValues] = useState<BarangayClearanceFormValues>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const purposeLabel = useMemo(
    () => getPurposeFieldLabel(values.purpose as CertificatePurpose),
    [values.purpose],
  );

  const loanTypes = useMemo(() => getLoanTypes(), []);

  const setField = useCallback(
    (
      field: keyof BarangayClearanceFormValues,
      value: string | undefined,
    ) => {
      setValues((current) => ({
        ...current,
        [field]: value,
      }));
    },
    [],
  );

  const validate = useCallback(() => {
    const nextErrors = validateBarangayClearance(values);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [values]);

  const reset = useCallback(() => {
    setValues(initialForm);
    setErrors({});
  }, []);

  const showDynamicField = Boolean(
    purposeLabel && !isLoanTypePurpose(values.purpose as CertificatePurpose),
  );

  const showLoanTypeField = isLoanTypePurpose(
    values.purpose as CertificatePurpose,
  );

  return {
    values,
    errors,
    purposeLabel,
    loanTypes,
    setField,
    validate,
    reset,
    showDynamicField,
    showLoanTypeField,
  };
};

export default useBarangayClearance;
