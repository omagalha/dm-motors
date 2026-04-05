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
    }
  }, [id]);

  const fetchVehicle = async () => {
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Veículo não encontrado.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const photos = vehicle.photos && vehicle.photos.length > 0 ? vehicle.photos : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.black} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Detalhes do Veículo</Text>

          <View style={styles.iconButtonPlaceholder} />
        </View>

        <View style={styles.imageSection}>
          {photos.length > 0 ? (
            <Image
              source={{ uri: photos[selectedImage] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.mainImage, styles.noImage]}>
              <Ionicons name="image-outline" size={48} color={COLORS.gray} />
              <Text style={styles.noImageText}>Sem imagem disponível</Text>
            </View>
          )}
        </View>

        {photos.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailContainer}
          >
            {photos.map((photo, index) => (
              <TouchableOpacity
                key={`${photo}-${index}`}
                onPress={() => setSelectedImage(index)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: photo }}
                  style={[
                    styles.thumbnail,
                    selectedImage === index && styles.thumbnailActive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.vehicleTitle}>
            {vehicle.brand} {vehicle.model}
          </Text>

          <Text style={styles.price}>
            R$ {Number(vehicle.price).toLocaleString("pt-BR")}
          </Text>

          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              <Text style={styles.badgeText}>{vehicle.year}</Text>
            </View>

            <View style={styles.badge}>
              <Ionicons name="speedometer-outline" size={16} color={COLORS.primary} />
              <Text style={styles.badgeText}>
                {Number(vehicle.mileage).toLocaleString("pt-BR")} km
              </Text>
            </View>

            <View style={styles.badge}>
              <Ionicons name="color-palette-outline" size={16} color={COLORS.primary} />
              <Text style={styles.badgeText}>{vehicle.color}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Marca</Text>
            <Text style={styles.specValue}>{vehicle.brand}</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Modelo</Text>
            <Text style={styles.specValue}>{vehicle.model}</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Ano</Text>
            <Text style={styles.specValue}>{vehicle.year}</Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Quilometragem</Text>
            <Text style={styles.specValue}>
              {Number(vehicle.mileage).toLocaleString("pt-BR")} km
            </Text>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Cor</Text>
            <Text style={styles.specValue}>{vehicle.color}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>
            {vehicle.description?.trim()
              ? vehicle.description
              : "Entre em contato para mais informações sobre este veículo."}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp} activeOpacity={0.9}>
          <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
          <Text style={styles.whatsappButtonText}>Tenho interesse</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.gray,
    fontSize: 15,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 14,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: "700",
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonPlaceholder: {
    width: 42,
    height: 42,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
  },

  imageSection: {
    paddingHorizontal: 16,
    marginTop: 6,
  },
  mainImage: {
    width: "100%",
    height: width * 0.68,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray,
  },
  noImage: {
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    marginTop: 10,
    color: COLORS.gray,
    fontSize: 14,
  },

  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  thumbnail: {
    width: 84,
    height: 84,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: COLORS.primary,
  },

  infoCard: {
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  vehicleTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.black,
    lineHeight: 30,
  },
  price: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
  },

  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4F4",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.black,
  },

  section: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 12,
  },

  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  specLabel: {
    fontSize: 15,
    color: COLORS.gray,
  },
  specValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.black,
    maxWidth: "55%",
    textAlign: "right",
  },

  description: {
    fontSize: 15,
    color: COLORS.gray,
    lineHeight: 24,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  whatsappButton: {
    backgroundColor: COLORS.green,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  whatsappButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },
});