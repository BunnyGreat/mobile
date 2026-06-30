export const getAnnouncementCategoryLabel = (category: string) => {
  const normalized = category?.trim().toLowerCase();

  switch (normalized) {
    case "barangay event":
      return "Barangay Event";
    case "public advisory":
      return "Public Advisory";
    case "emergency":
      return "Emergency";
    case "health":
      return "Health";
    case "government program":
      return "Government Program";
    case "community notice":
    default:
      return category || "Community Notice";
  }
};
