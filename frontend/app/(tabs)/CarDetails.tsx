import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

const COLORS = {
  primary: "#FF0000",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#666666",
  border: "#EAEAEA",
  green: "#25D366",
  lightGray: "#F5F5F5",
};

export default function CarDetails() {
  const { car } = useLocalSearchParams();
  const vehicle = car ? JSON.parse(car as string) : null;

  if (!vehicle) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Veículo não encontrado.</Text>
      </SafeAreaView>
    );
  }

  const handleWhatsApp = () => {
    const phone = "5532999264848";
    const message = `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: vehicle.image }} style={styles.image} />

        <View style={styles.content}>
          <Text style={styles.title}>
            {vehicle.brand} {vehicle.model}
          </Text>

          <Text style={styles.price}>
            R$ {vehicle.price.toLocaleString("pt-BR")}
          </Text>

          <View style={styles.detailsBox}>
            <Text style={styles.detailItem}>Ano: {vehicle.year}</Text>
            <Text style={styles.detailItem}>Quilometragem: {vehicle.km} km</Text>
            <Text style={styles.detailItem}>Combustível: {vehicle.fuel}</Text>
            <Text style={styles.detailItem}>Câmbio: {vehicle.transmission}</Text>
            <Text style={styles.detailItem}>Cor: {vehicle.color}</Text>
          </View>

          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{vehicle.description}</Text>

          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={handleWhatsApp}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Tenho Interesse</Text>
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

  image: {
    width: "100%",
    height: 250,
  },

  content: {
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.black,
  },

  price: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primary,
    marginTop: 8,
    marginBottom: 16,
  },

  detailsBox: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  detailItem: {
    fontSize: 15,
    color: COLORS.black,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 8,
    color: COLORS.black,
  },

  description: {
    fontSize: 15,
    color: COLORS.gray,
    lineHeight: 22,
  },

  whatsappButton: {
    marginTop: 24,
    backgroundColor: COLORS.green,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },

  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 40,
    color: COLORS.black,
  },
});