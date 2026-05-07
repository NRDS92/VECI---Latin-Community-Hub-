import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { styles } from "../styles/discover.styles";
import { SearchSuggestion, DiscoverType } from "../types/discover.types";
import CitySelectorModal from "./CitySelectorModal";
import DatePickerModal from "./DatePickerModal";

type LocationType = {
  name: string;
  lat: number | null;
  lng: number | null;
};

type DateFilter = "today" | "weekend" | "custom" | null;

type Props = {
  selectedCity: string;
  selectedLocation: LocationType;
  setSelectedLocation: React.Dispatch<
    React.SetStateAction<LocationType>
  >;
  selectedDate: string | null;
  setSelectedDate: (v: string | null) => void;
  dateFilter: DateFilter;
  setDateFilter: (v: DateFilter) => void;
  searchInput: string;
  setSearchInput: (v: string) => void;
  suggestions?: SearchSuggestion[];
  activeTab: DiscoverType;
  setActiveTab: (v: DiscoverType) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  onSuggestionPress: (item: SearchSuggestion) => void;
};

function DiscoverHeader({
  selectedCity,
  setSelectedLocation,
  selectedLocation,
  selectedDate,
  dateFilter,
  setDateFilter,
  setSelectedDate,
  searchInput,
  setSearchInput,
  suggestions,
  activeTab,
  setActiveTab,
  categories,
  selectedCategory,
  setSelectedCategory,
  onSuggestionPress,
}: Props) {
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  const tabs = useMemo(
    () => [
      { key: "events" as DiscoverType, label: "Events" },
      { key: "restaurants" as DiscoverType, label: "Restaurants" },
      { key: "businesses" as DiscoverType, label: "Businesses" },
    ],
    []
  );

  return (
    <View style={{ paddingTop: 10 }}>
      {/* 📍 CITY + DATE */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setCityModalVisible(true)}
        >
          <Text style={styles.filterText}>📍 {selectedCity}</Text>
        </TouchableOpacity>

        <View style={styles.dateChipsContainer}>
          {[
            { key: "today", label: "Today" },
            { key: "weekend", label: "Weekend" },
            { key: "custom", label: "Pick date" },
          ].map((item) => {
            const active = dateFilter === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => {
                  if (item.key === "today") {
                    setDateFilter("today");
                    setSelectedDate(new Date().toISOString());
                  }

                  if (item.key === "weekend") {
                    const now = new Date();
                    const day = now.getDay();
                    const saturday = new Date(now);
                    saturday.setDate(now.getDate() + (6 - day));

                    setDateFilter("weekend");
                    setSelectedDate(saturday.toISOString());
                  }

                  if (item.key === "custom") {
                    setDateFilter("custom");
                    setShowDateModal(true);
                  }
                }}
                style={[
                  styles.chip,
                  active && styles.chipActive,
                ]}
              >
                <Text style={{ color: "#fff" }}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 🔍 SEARCH */}
      <View style={{ position: "relative", zIndex: 10 }}>
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Search events, places..."
          placeholderTextColor="#6b7280"
          style={styles.search}
        />

        {/* ✅ FIX iOS: dropdown encima de todo */}
        {searchInput.length > 2 && !!suggestions?.length && (
          <View style={styles.suggestionsBox}>
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => onSuggestionPress(item)}
              >
                <Text style={styles.suggestionText}>
                  {item.type === "business" ? "🏪" : "🎉"} {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 🔄 TABS */}
      <View style={styles.toggle}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[
              styles.toggleBtn,
              activeTab === tab.key && styles.toggleActive,
            ]}
          >
            <Text style={styles.toggleText}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🏷️ CATEGORIES */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 6 }}
      >
        {categories.map((cat) => {
          const active = selectedCategory === cat;

          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={{ color: "#fff" }}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 🌍 MODALS */}
      <CitySelectorModal
        visible={cityModalVisible}
        onClose={() => setCityModalVisible(false)}
        onSelect={(city) => {
          setSelectedLocation(city);
        }}
      />

      <DatePickerModal
        visible={showDateModal}
        onClose={() => setShowDateModal(false)}
        onSelect={(date) => {
          setSelectedDate(date);
        }}
      />
    </View>
  );
}

export default React.memo(DiscoverHeader);