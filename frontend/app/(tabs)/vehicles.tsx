import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const COLORS = {
  primary: "#FF0000",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#666666",
  lightGray: "#F5F5F5",
  border: "#EAEAEA",
  green: "#25D366",
  dark: "#222222",
};

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage?: number;
  color?: string;
  price: number;
  description?: string;
  photos?: string[];
};

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      if (!API_URL) {
        console.error("EXPO_PUBLIC_BACKEND_URL não configurada.");
        Alert.alert("Erro", "EXPO_PUBLIC_BACKEND_URL não configurada.");
        return;
      }

      const response = await fetch(`${API_URL}/api/vehicles`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Erro ao buscar veículos");
      }

      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar veículos:", error);
      Alert.alert("Erro", "Não foi possível carregar os veículos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleWhatsApp = (vehicle: Vehicle) => {
    const phone = "5532999264848";
    const message = `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const handleDetails = (vehicle: Vehicle) => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  const renderItem = ({ item }: { item: Vehicle }) => (
    <View style={styles.card}>
      <Image
        source={{
          uri: item.photos?.[0] || "https://via.placeholder.com/400x300?text=Sem+foto",
        }}
        style={styles.image}
      />

      <View style={styles.info}>
        <Text style={styles.title}>
          {item.brand} {item.model}
        </Text>

        <Text style={styles.subtitle}>
          {item.year}
          {item.mileage !== undefined ? ` • ${Number(item.mileage).toLocaleString("pt-BR")} km` : ""}
        </Text>

        <Text style={styles.price}>
          R$ {Number(item.price).toLocaleString("pt-BR")}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleDetails(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.detailsButtonText}>Saiba mais</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={() => handleWhatsApp(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Tenho Interesse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Veículos disponíveis</Text>

      {loading ? (
        <View style={{ paddingTop: 40 }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum veículo cadastrado ainda.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    fontSize: 22,
    fontWeight: "800",
    padding: 16,
    color: COLORS.black,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: "100%",
    height: 180,
  },
  info: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: COLORS.dark,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  detailsButtonText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.gray,
    marginTop: 30,
    fontSize: 15,
  },
});