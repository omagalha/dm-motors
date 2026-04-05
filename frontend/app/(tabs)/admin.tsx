import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const COLORS = {
  primary: "#FF0000",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#666666",
  lightGray: "#F5F5F5",
  border: "#EAEAEA",
};

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

type SelectedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

const uploadImageToCloudinary = async (image: SelectedImage) => {
  const data = new FormData();

  data.append(
    "file",
    {
      uri: image.uri,
      type: image.mimeType || "image/jpeg",
      name: image.fileName || "vehicle.jpg",
    } as any
  );

  data.append("upload_preset", "dm_motors");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dryhiq7pd/image/upload",
    {
      method: "POST",
      body: data,
    }
  );

  const result = await response.json();

  if (!response.ok || !result.secure_url) {
    console.log("Erro Cloudinary:", result);
    throw new Error("Erro ao enviar imagem para o Cloudinary");
  }

  return result.secure_url as string;
};

export default function AdminScreen() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [km, setKm] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<SelectedImage | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("admin_token");

        if (!mounted) return;

        if (!savedToken) {
          setCheckingAuth(false);
          router.replace("/admin-login");
          return;
        }

        setToken(savedToken);
      } catch (error) {
        console.error("Erro ao verificar auth:", error);

        if (mounted) {
          Alert.alert("Erro", "Não foi possível validar sua sessão.");
          router.replace("/admin-login");
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const resetForm = () => {
    setBrand("");
    setModel("");
    setYear("");
    setPrice("");
    setKm("");
    setColor("");
    setDescription("");
    setImage(null);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("admin_token");
    } finally {
      router.replace("/admin-login");
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permissão necessária",
          "Libere o acesso à galeria para escolher uma imagem."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        Alert.alert("Erro", "Não foi possível obter a imagem selecionada.");
        return;
      }

      setImage({
        uri: asset.uri,
        fileName: asset.fileName ?? "vehicle.jpg",
        mimeType: asset.mimeType ?? "image/jpeg",
      });
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };

  const handleSaveVehicle = async () => {
    if (loading) return;

    if (!brand.trim() || !model.trim() || !year.trim() || !price.trim() || !image) {
      Alert.alert(
        "Atenção",
        "Preencha marca, modelo, ano, preço e selecione uma imagem."
      );
      return;
    }

    if (!token) {
      Alert.alert("Erro", "Sessão inválida. Faça login novamente.");
      await AsyncStorage.removeItem("admin_token");
      router.replace("/admin-login");
      return;
    }

    if (!API_URL) {
      Alert.alert("Erro", "EXPO_PUBLIC_BACKEND_URL não configurada.");
      return;
    }

    const parsedYear = Number(year.trim());
    const parsedPrice = Number(price.replace(",", ".").trim());
    const parsedKm = km.trim() ? Number(km.replace(",", ".").trim()) : 0;
    const currentYear = new Date().getFullYear();

    if (
      !Number.isInteger(parsedYear) ||
      parsedYear < 1900 ||
      parsedYear > currentYear + 1
    ) {
      Alert.alert("Ano inválido", "Digite um ano válido.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("Preço inválido", "Digite um preço válido.");
      return;
    }

    if (km.trim() && (!Number.isFinite(parsedKm) || parsedKm < 0)) {
      Alert.alert("Quilometragem inválida", "Digite um valor válido para KM.");
      return;
    }

    try {
      setLoading(true);

      const imageUrl = await uploadImageToCloudinary(image);

      const newVehicle = {
        brand: brand.trim(),
        model: model.trim(),
        year: parsedYear,
        mileage: parsedKm,
        color: color.trim(),
        price: parsedPrice,
        description: description.trim(),
        photos: imageUrl ? [imageUrl] : [],
      };

      const response = await fetch(`${API_URL}/api/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newVehicle),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Erro backend:", errorText);

        if (response.status === 401) {
          await AsyncStorage.removeItem("admin_token");
          Alert.alert("Sessão expirada", "Faça login novamente.");
          router.replace("/admin-login");
          return;
        }

        throw new Error(errorText || "Erro ao salvar veículo");
      }

      Alert.alert("Sucesso", "Veículo cadastrado com sucesso.");
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar veículo:", error);
      Alert.alert("Erro", "Não foi possível salvar o veículo.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Verificando acesso...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>Portal do Admin</Text>
            <Text style={styles.subtitle}>Cadastre veículos da loja</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Marca"
            value={brand}
            onChangeText={setBrand}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Modelo"
            value={model}
            onChangeText={setModel}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Ano"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Preço"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Quilometragem"
            value={km}
            onChangeText={setKm}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Cor"
            value={color}
            onChangeText={setColor}
            placeholderTextColor="#999"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descrição"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="#999"
          />

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.uploadButtonText}>
              {image ? "Trocar foto" : "Selecionar foto"}
            </Text>
          </TouchableOpacity>

          {image && <Image source={{ uri: image.uri }} style={styles.previewImage} />}

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSaveVehicle}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>Salvar veículo</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.gray,
    fontSize: 15,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: COLORS.black,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.black,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  uploadButton: {
    backgroundColor: COLORS.black,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    minHeight: 52,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 16,
  },
});