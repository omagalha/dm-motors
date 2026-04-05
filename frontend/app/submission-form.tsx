import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const COLORS = {
  primary: "#FF0000",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#666666",
  lightGray: "#F5F5F5",
};

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function SubmissionForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = params.type as string;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "",
    phone: "",
    brand: "",
    model: "",
    year: "",
    mileage: "",
    color: "",
    observations: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);

  const pickImage = async () => {
    if (photos.length >= 6) {
      Alert.alert("Limite atingido", "Você pode adicionar no máximo 6 fotos");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à sua galeria para adicionar fotos"
      );
      return;
    }

    const result = await ImagePicker.launchImagePickerAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhotos([...photos, `data:image/jpeg;base64,${result.assets[0].base64}`]);
    }
  };

  const takePhoto = async () => {
    if (photos.length >= 6) {
      Alert.alert("Limite atingido", "Você pode adicionar no máximo 6 fotos");
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à sua câmera para tirar fotos"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhotos([...photos, `data:image/jpeg;base64,${result.assets[0].base64}`]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const validateForm = () => {
    if (!formData.client_name.trim()) {
      Alert.alert("Erro", "Por favor, informe seu nome");
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert("Erro", "Por favor, informe seu telefone");
      return false;
    }
    if (!formData.brand.trim()) {
      Alert.alert("Erro", "Por favor, informe a marca do veículo");
      return false;
    }
    if (!formData.model.trim()) {
      Alert.alert("Erro", "Por favor, informe o modelo do veículo");
      return false;
    }
    if (!formData.year.trim() || isNaN(Number(formData.year))) {
      Alert.alert("Erro", "Por favor, informe um ano válido");
      return false;
    }
    if (!formData.mileage.trim() || isNaN(Number(formData.mileage))) {
      Alert.alert("Erro", "Por favor, informe a quilometragem");
      return false;
    }
    if (!formData.color.trim()) {
      Alert.alert("Erro", "Por favor, informe a cor do veículo");
      return false;
    }
    if (photos.length === 0) {
      Alert.alert("Erro", "Por favor, adicione pelo menos uma foto do veículo");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submission = {
        type,
        client_name: formData.client_name,
        phone: formData.phone,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        color: formData.color,
        observations: formData.observations,
        photos,
      };

      await axios.post(`${EXPO_PUBLIC_BACKEND_URL}/api/submissions`, submission);

      Alert.alert(
        "Sucesso!",
        `Sua solicitação para ${type} foi enviada com sucesso! Entraremos em contato em breve.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Erro ao enviar:", error);
      Alert.alert("Erro", "Não foi possível enviar sua solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {type === "consignar" ? "Consignar Veículo" : "Vender Veículo"}
            </Text>
            <View style={styles.backButton} />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Seus Dados</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome completo *"
              value={formData.client_name}
              onChangeText={(text) =>
                setFormData({ ...formData, client_name: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Telefone com DDD *"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />

            <Text style={styles.sectionTitle}>Dados do Veículo</Text>

            <TextInput
              style={styles.input}
              placeholder="Marca (ex: Fiat, VW, Chevrolet) *"
              value={formData.brand}
              onChangeText={(text) => setFormData({ ...formData, brand: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Modelo (ex: Uno, Gol, Onix) *"
              value={formData.model}
              onChangeText={(text) => setFormData({ ...formData, model: text })}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Ano *"
                value={formData.year}
                onChangeText={(text) => setFormData({ ...formData, year: text })}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Cor *"
                value={formData.color}
                onChangeText={(text) => setFormData({ ...formData, color: text })}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Quilometragem (km) *"
              value={formData.mileage}
              onChangeText={(text) =>
                setFormData({ ...formData, mileage: text })
              }
              keyboardType="numeric"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Observações (opcional)"
              value={formData.observations}
              onChangeText={(text) =>
                setFormData({ ...formData, observations: text })
              }
              multiline
              numberOfLines={4}
            />

            <Text style={styles.sectionTitle}>Fotos do Veículo *</Text>
            <Text style={styles.photoHint}>
              Adicione até 6 fotos do veículo (frente, traseira, laterais, interior)
            </Text>

            <View style={styles.photoContainer}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ))}

              {photos.length < 6 && (
                <View style={styles.photoButtonsContainer}>
                  <TouchableOpacity
                    style={styles.addPhotoButton}
                    onPress={takePhoto}
                  >
                    <Ionicons name="camera" size={32} color={COLORS.primary} />
                    <Text style={styles.addPhotoText}>Tirar Foto</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.addPhotoButton}
                    onPress={pickImage}
                  >
                    <Ionicons name="images" size={32} color={COLORS.primary} />
                    <Text style={styles.addPhotoText}>Galeria</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Enviar Solicitação</Text>
                  <Ionicons name="send" size={20} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.footer}>
              * Campos obrigatórios{"\n"}
              Sua solicitação será avaliada e entraremos em contato em breve!
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  photoHint: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
  },
  photoContainer: {
    marginBottom: 24,
  },
  photoWrapper: {
    marginBottom: 12,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  photoButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  addPhotoButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lightGray,
    padding: 24,
    borderRadius: 8,
    width: "45%",
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  footer: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
  },
});
