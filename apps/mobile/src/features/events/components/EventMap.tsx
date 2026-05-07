import { View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function EventMap({ location }: any) {
    // 🔥 GUARD 1
    if (!location || !location.coordinates) return null;

    let lat: number | undefined;
    let lng: number | undefined;

    // 🔥 SOPORTA AMBOS FORMATOS
    if (Array.isArray(location.coordinates)) {
        // Mongo format [lng, lat]
        lng = location.coordinates[0];
        lat = location.coordinates[1];
    } else {
        // Frontend format { lat, lng }
        lat = location.coordinates?.lat;
        lng = location.coordinates?.lng;
    }

    // 🔥 GUARD 2 (CRÍTICO)
    if (!lat || !lng) return null;

    return (
        <View style={styles.container}>
        <MapView
            pointerEvents="none"
            style={styles.map}
            initialRegion={{
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
            }}
        >
            <Marker coordinate={{ latitude: lat, longitude: lng }} />
        </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 200,
        borderRadius: 16,
        overflow: "hidden",
    },
    map: {
        width: "100%",
        height: "100%",
    },
});