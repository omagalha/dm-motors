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

const API_URL = "http://192.168.0.112:5000/api";

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_URL}/vehicles`);
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error("Erro ao buscar veículos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleWhatsApp = (vehicle: any) => {
    const phone = "5532999264848";
    const message = `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url);
  };

  const handleDetails = (vehicle: any) => {
    router.push({
      pathname: "/CarDetails",
      params: {
        car: JSON.stringify(vehicle),
      },
    });
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.title}>
          {item.brand} {item.model}
        </Text>

        <Text style={styles.subtitle}>
          {item.year} • {item.transmission || "Automático"}
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
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 30 }} />
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