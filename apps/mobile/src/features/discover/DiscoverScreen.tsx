import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "../discover/styles/discover.styles";
import DiscoverHeader from "../discover/components/DiscoverHeader";
import DiscoverList from "../discover/components/DiscoverList";

import { useDiscover } from "./hoooks/useDiscover";
import { useFavorites } from "./hoooks/useFavorites";
import { useUserProfile } from "../user/hooks/useUserProfile";
import { useCategories } from "./hoooks/useCategories";
import { useSearchSuggestions } from "./hoooks/useSearchSuggestions";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ✅ TYPES
type DiscoverType = "events" | "restaurants" | "businesses";

type LocationType = {
  name: string;
  lat: number | null;
  lng: number | null;
};

type DateFilter = "today" | "weekend" | "custom" | null;

export default function DiscoverScreen() {
  const { handleToggle, isFavorite, favorites } = useFavorites();
  const { data: user } = useUserProfile();

  const city = user?.location?.city || "Cologne";
  const insets = useSafeAreaInsets();

  // ✅ STATE
  const [activeTab, setActiveTab] = useState<DiscoverType>("events");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [selectedLocation, setSelectedLocation] = useState<LocationType>({
    name: city,
    lat: null,
    lng: null,
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>(null);

  // 🔥 DEBOUNCE SEARCH
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  // 🔥 CATEGORY LOGIC
  const mappedType =
    activeTab === "restaurants"
      ? "business"
      : activeTab === "businesses"
      ? "business"
      : "events";

  const forcedCategory =
    activeTab === "restaurants" ? "food" : selectedCategory;

  const { data: suggestions } = useSearchSuggestions(searchInput, mappedType);
  const { data: categoriesData } = useCategories(mappedType);

  const categories = [
    "All",
    ...(categoriesData?.map((c: { name: string }) => c.name) || []),
  ];

  const {
    items,
    fetchNextPage,
    hasNextPage,
    loadingMore,
    refreshing,
    refetch,
  } = useDiscover({
    city: selectedLocation.name,
    category: forcedCategory,
    type: mappedType,
    search,
    date: selectedDate,
  });

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          flex: 1,
          backgroundColor: "#0B0F1A",
          paddingBottom: 90,
        
        },
      ]}
      edges={["top"]} // 👈 maneja notch correctamente
    >
      <DiscoverHeader
        selectedCity={selectedLocation.name}
        setSelectedLocation={setSelectedLocation}
        selectedLocation={selectedLocation}
        setSelectedDate={setSelectedDate}
        selectedDate={selectedDate}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        suggestions={suggestions}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onSuggestionPress={(item) => {
          setSearchInput(item.label);
          setSearch(item.label);
        }}
      />

      <DiscoverList
        items={items}
        handleToggle={handleToggle}
        isFavorite={isFavorite}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        loadingMore={loadingMore}
        refreshing={refreshing}
        refetch={refetch}
        favorites={favorites}
      />
    </SafeAreaView>
  );
}