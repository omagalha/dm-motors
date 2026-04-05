import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";

const { width } = Dimensions.get("window");
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const COLORS = {
  primary: "#FF0000",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#666666",
  lightGray: "#F5F5F5",
  darkGray: "#1A1A1A",
  border: "#EAEAEA",
  green: "#25D366",
};

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  price: number;
  description?: string;
  photos?: string[];
};

export default function VehicleDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchVehicle();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchVehicle = async () => {
    if (!BACKEND_URL) {
      Alert.alert("Erro", "EXPO_PUBLIC_BACKEND_URL não configurada.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/vehicles/${id}`);
      setVehicle(response.data);
    } catch (error) {
      console.log("Erro ao buscar veículo:", error);
      Alert.alert("Erro", "Não foi possível carregar os detalhes do veículo.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!vehicle) return;

    const phone = "5532999264848";
    const message =
      `Olá! Tenho interesse no veículo:\n\n` +
      `${vehicle.brand} ${vehicle.model} - ${vehicle.year}\n` +
      `Preço: R$ ${Number(vehicle.price).toLocaleString("pt-BR")}\n` +
      `KM: ${Number(vehicle.mileage).toLocaleString("pt-BR")} km`;

    const appUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    const webUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(appUrl);

      if (supported) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </SafeAreaView>
    );
  }

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.notFoundText}>Veículo não encontrado.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const vehicleImages =
    vehicle.photos && vehicle.photos.length > 0
      ? vehicle.photos
      : ["https://via.placeholder.com/800x500?text=Sem+foto"];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.black} />
          </TouchableOpacity>

          <Text style={styles.topBarTitle}>Detalhes do veículo</Text>

          <View style={styles.iconButtonPlaceholder} />
        </View>

        <Image
          source={{ uri: vehicleImages[selectedImage] }}
          style={styles.mainImage}
          resizeMode="cover"
        />

        {vehicleImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            {vehicleImages.map((photo, index) => (
              <TouchableOpacity
                key={`${photo}-${index}`}
                onPress={() => setSelectedImage(index)}
                style={[
                  styles.thumbnailWrapper,
                  selectedImage === index && styles.thumbnailSelected,
                ]}
              >
                <Image source={{ uri: photo }} style={styles.thumbnail} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>
            {vehicle.brand} {vehicle.model}
          </Text>

          <Text style={styles.price}>
            R$ {Number(vehicle.price).toLocaleString("pt-BR")}
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Ano</Text>
              <Text style={styles.infoValue}>{vehicle.year}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>KM</Text>
              <Text style={styles.infoValue}>
                {Number(vehicle.mileage).toLocaleString("pt-BR")}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Cor</Text>
              <Text style={styles.infoValue}>{vehicle.color || "-"}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>
              {vehicle.description?.trim()
                ? vehicle.description
                : "Sem descrição informada."}
            </Text>
          </View>

          <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
            <Text style={styles.whatsappButtonText}>Tenho Interesse</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.gray,
    fontSize: 15,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 16,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  mainImage: {
    width,
    height: 260,
    backgroundColor: COLORS.lightGray,
  },
  thumbnailRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  thumbnailWrapper: {
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 10,
    overflow: "hidden",
  },
  thumbnailSelected: {
    borderColor: COLORS.primary,
  },
  thumbnail: {
    width: 78,
    height: 78,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.black,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primary,
    marginTop: 8,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.black,
  },
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: COLORS.darkGray,
    lineHeight: 22,
  },
  whatsappButton: {
    marginTop: 24,
    backgroundColor: COLORS.green,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  whatsappButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },
  backButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: "700",
  },
});