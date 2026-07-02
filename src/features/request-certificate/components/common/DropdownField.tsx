import React from "react";
import { View } from "react-native";
import SelectField from "../../../../components/ui/SelectField";
import { SPACING } from "../../../../theme";

interface DropdownFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  error?: string;
}

export const DropdownField: React.FC<DropdownFieldProps> = ({
  label,
  value,
  options,
  onChange,
  error,
}) => (
  <View style={{ marginBottom: SPACING.md }}>
    <SelectField
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      error={error}
    />
  </View>
);

export default DropdownField;
