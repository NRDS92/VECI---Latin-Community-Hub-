import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F1A",
    paddingHorizontal: 16,
    gap: 16,
  },

  // HEADER
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  filterBtn: {
    backgroundColor: "#121826",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  filterText: {
    color: "#fff",
    fontSize: 13,
  },
  dateChipsContainer: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },

  dateChip: {
    backgroundColor: "#1A2233",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  dateChipActive: {
    backgroundColor: "#FF7A00",
  },

  // SEARCH
  search: {
    backgroundColor: "#121826",
    borderRadius: 16,
    padding: 12,
    color: "#fff",
  },

  suggestionsBox: {
    backgroundColor: "#121826",
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 8,
  },

  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  suggestionText: {
    color: "#fff",
  },

  // TABS
  toggle: {
    flexDirection: "row",
    marginVertical: 16,
    backgroundColor: "#121826",
    borderRadius: 12,
  },

  toggleBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },

  toggleActive: {
    backgroundColor: "#FF7A00",
    borderRadius: 12,
  },

  toggleText: {
    color: "#fff",
    fontWeight: "600",
  },

  // CATEGORIES
  chip: {
    backgroundColor: "#1A2233",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },

  chipActive: {
    backgroundColor: "#FF7A00",
  },

  // STATES
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  helperText: {
    color: "#9ca3af",
    marginTop: 10,
  },

  errorText: {
    color: "#ff4d4d",
    fontSize: 16,
    marginBottom: 10,
  },

  retryBtn: {
    backgroundColor: "#FF7A00",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },

  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});