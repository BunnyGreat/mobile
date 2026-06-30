import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../../theme";
import { isSupportedDocumentFile } from "../utils/appointmentValidation";

interface SupportingDocumentPickerProps {
  value: string | null;
  uri: string | null;
  loading: boolean;
  onChange: (name: string | null, uri: string | null) => void;
}

const SupportingDocumentPicker: React.FC<SupportingDocumentPickerProps> = ({
  value,
  uri,
  loading,
  onChange,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileSizeLabel, setFileSizeLabel] = useState<string | null>(null);
  const [fileTypeLabel, setFileTypeLabel] = useState<string | null>(null);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.name) {
      setErrorMessage("Please select a valid supporting document.");
      return;
    }

    if (!isSupportedDocumentFile(asset.name)) {
      setErrorMessage("Only PDF, DOC, and DOCX files are allowed.");
      return;
    }

    const sizeInKb =
      typeof asset.size === "number"
        ? Math.max(1, Math.round(asset.size / 1024))
        : null;
    const extension = asset.name.split(".").pop()?.toLowerCase() ?? "file";

    setErrorMessage(null);
    setFileSizeLabel(sizeInKb ? `${sizeInKb} KB` : "size unknown");
    setFileTypeLabel(extension.toUpperCase());
    onChange(asset.name ?? "document", asset.uri ?? null);
  };

  const getFileIcon = () => {
    if (!value) return "file";
    const extension = value.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "file-text";
      case "doc":
      case "docx":
        return "file-text";
      default:
        return "file";
    }
  };

  const details = useMemo(() => {
    if (!value) {
      return null;
    }

    const fileName = value;
    const extension = fileName.split(".").pop()?.toLowerCase() ?? "file";

    return {
      fileName,
      detailLabel: `${fileTypeLabel ?? extension.toUpperCase()} • ${fileSizeLabel ?? "size unknown"}`,
    };
  }, [value, fileTypeLabel, fileSizeLabel]);

  return (
    <View style={styles.container}>
      {/* Upload Area */}
      <Pressable
        style={({ pressed }) => [
          styles.uploadArea,
          pressed && styles.uploadAreaPressed,
        ]}
        onPress={pickDocument}
        disabled={loading}
      >
        <View style={styles.uploadIconContainer}>
          <Feather name="upload-cloud" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.uploadTitle}>
          {value ? "Replace Document" : "Tap to Upload"}
        </Text>
        <Text style={styles.uploadSubtitle}>
          {value
            ? "Select a different file"
            : "PDF, DOC, or DOCX (max 10MB)"}
        </Text>
      </Pressable>

      {/* Error Message */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={16} color={COLORS.danger} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Selected File */}
      {value ? (
        <View style={styles.selectedContainer}>
          <View style={styles.fileInfo}>
            <View style={styles.fileIconContainer}>
              <Feather
                name={getFileIcon() as keyof typeof Feather.glyphMap}
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>
                {details?.fileName ?? value}
              </Text>
              {details && (
                <Text style={styles.fileMeta}>{details.detailLabel}</Text>
              )}
            </View>
          </View>
          <View style={styles.fileActions}>
            <View style={styles.successBadge}>
              <Feather name="check" size={12} color={COLORS.white} />
            </View>
            <Pressable
              style={styles.removeButton}
              onPress={() => {
                setFileSizeLabel(null);
                setFileTypeLabel(null);
                setErrorMessage(null);
                onChange(null, null);
              }}
            >
              <Feather name="trash-2" size={18} color={COLORS.danger} />
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Help Text */}
      <View style={styles.helpContainer}>
        <Feather name="info" size={14} color={COLORS.placeholder} />
        <Text style={styles.helpText}>
          Please ensure your document is clear and readable
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  uploadArea: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: `${COLORS.primary}08`,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${COLORS.primary}30`,
    borderStyle: "dashed",
  },
  uploadAreaPressed: {
    backgroundColor: `${COLORS.primary}12`,
    borderColor: COLORS.primary,
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  uploadTitle: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: FONT_SIZE.body14,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  uploadSubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: `${COLORS.danger}10`,
    borderRadius: 8,
  },
  errorText: {
    marginLeft: SPACING.xs,
    flex: 1,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.danger,
  },
  selectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fileInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.body14,
    color: COLORS.heading,
    marginBottom: 2,
  },
  fileMeta: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.paragraph,
  },
  fileActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  successBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    padding: SPACING.xs,
  },
  helpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
  },
  helpText: {
    marginLeft: SPACING.xs,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.body12,
    color: COLORS.placeholder,
  },
});

export default SupportingDocumentPicker;
