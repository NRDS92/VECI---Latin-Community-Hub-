import { View, StyleSheet } from "react-native";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import { useState } from "react";

export default function LocationPicker({ onSelect }: any) {
    const [location, setLocation] = useState<any>(null);

    const handlePress = (e: MapPressEvent) => {
        const coords = e.nativeEvent.coordinate;

        setLocation(coords);

        onSelect({
            latitude: coords.latitude,
            longitude: coords.longitude,
        });
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 52.52,
                    longitude: 13.405,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                onPress={handlePress}
            >
                {location && <Marker coordinate={location} />}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 200,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
    },
    map: {
        flex: 1,
    },
});