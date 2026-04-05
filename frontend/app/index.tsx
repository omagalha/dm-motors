import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const COLORS = {
  primary: "#FF0000",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#666666",
  lightGray: "#F5F5F5",
  darkGray: "#1A1A1A",
  green: "#25D366",
  border: "#EAEAEA",
};

export default function Index() {
  const router = useRouter();

  const phoneNumber = "5532999264848";
  const message = "Olá! Tenho interesse em falar com a DM Motors.";

  const handleWhatsApp = async () => {
    const appUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;
    const webUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    try {
      const supported = await Linking.canOpenURL(appUrl);
      if (supported) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
    }
  };

  const MenuButton = ({
    icon,
    title,
    subtitle,
    onPress,
    primary = false,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress: () => void;
    primary?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.menuButton, primary && styles.menuButtonPrimary]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={[
          styles.iconContainer,
          primary && styles.iconContainerPrimary,
        ]}
      >
        <Ionicons
          name={icon}
          size={28}
          color={primary ? COLORS.white : COLORS.primary}
        />
      </View>

      <View style={styles.menuTextContainer}>
        <Text
          style={[
            styles.menuButtonText,
            primary && styles.menuButtonTextPrimary,
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.menuButtonSubtitle,
              primary && styles.menuButtonSubtitlePrimary,
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color={primary ? COLORS.white : COLORS.gray}
      />
    </TouchableOpacity>
  );

  const FeatureCard = ({
    icon,
    title,
    text,
  }: {
    icon: any;
    title: string;
    text: string;
  }) => (
    <View style={styles.featureCard}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoRow}>
              <View style={styles.logoIconWrap}>
                <Ionicons name="car-sport" size={34} color={COLORS.primary} />
              </View>

              <View>
                <Text style={styles.logoText}>DM MOTORS</Text>
                <Text style={styles.logoTagline}>
                  Veículos com qualidade, procedência e confiança
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.headerWhatsButton}
            onPress={handleWhatsApp}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={18} color={COLORS.white} />
            <Text style={styles.headerWhatsText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroBadge}>ESTOQUE • CONSIGNAÇÃO • VENDAS</Text>

          <Text style={styles.heroTitle}>
            Encontre seu próximo veículo hoje.
          </Text>

          <Text style={styles.heroText}>
            Compre, venda ou consigne seu carro com praticidade, segurança e
            atendimento rápido.
          </Text>

          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.heroPrimaryButton}
              onPress={() => router.push("/(tabs)/vehicles")}
              activeOpacity={0.85}
            >
              <Ionicons name="search-outline" size={20} color={COLORS.white} />
              <Text style={styles.heroPrimaryButtonText}>Ver Estoque</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroSecondaryButton}
              onPress={handleWhatsApp}
              activeOpacity={0.85}
            >
              <Ionicons
                name="logo-whatsapp"
                size={20}
                color={COLORS.black}
              />
              <Text style={styles.heroSecondaryButtonText}>Atendimento</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <FeatureCard
            icon="shield-checkmark-outline"
            title="Confiança"
            text="Atendimento com transparência e suporte rápido."
          />
          <FeatureCard
            icon="flash-outline"
            title="Agilidade"
            text="Facilidade para comprar, vender ou consignar."
          />
          <FeatureCard
            icon="car-outline"
            title="Qualidade"
            text="Veículos selecionados e apresentação profissional."
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>O que você deseja fazer?</Text>
          <Text style={styles.sectionSubtitle}>
            Escolha uma opção para continuar
          </Text>
        </View>

        <View style={styles.menuContainer}>
          <MenuButton
            icon="search-outline"
            title="Comprar Veículo"
            subtitle="Veja os veículos disponíveis no estoque"
            onPress={() => router.push("/(tabs)/vehicles")}
            primary
          />

          <MenuButton
            icon="car-outline"
            title="Consignar meu Veículo"
            subtitle="Deixe seu carro conosco para vender melhor"
            onPress={() =>
              router.push({
                pathname: "/submission-form",
                params: { type: "consignar" },
              })
            }
          />

          <MenuButton
            icon="cash-outline"
            title="Vender meu Veículo"
            subtitle="Envie seus dados e receba atendimento"
            onPress={() =>
              router.push({
                pathname: "/submission-form",
                params: { type: "vender" },
              })
            }
          />

          <TouchableOpacity
            style={[styles.menuButton, styles.whatsappButton]}
            onPress={handleWhatsApp}
            activeOpacity={0.85}
          >
            <View style={[styles.iconContainer, styles.whatsIconContainer]}>
              <Ionicons name="logo-whatsapp" size={28} color={COLORS.white} />
            </View>

            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuButtonText, styles.whatsappText]}>
                Atendimento no WhatsApp
              </Text>
              <Text
                style={[styles.menuButtonSubtitle, styles.whatsappSubtext]}
              >
                Fale agora com a equipe da DM Motors
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.footerInfo}>
          <Ionicons name="location-outline" size={18} color={COLORS.gray} />
          <Text style={styles.footerText}>
            Rua Eliaquim Sales, 85 • Santo Antônio de Pádua
          </Text>
        </View>

        <TouchableOpacity
          style={styles.adminLink}
          onPress={() => router.push("/admin-login")}
          activeOpacity={0.85}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={COLORS.gray}
          />
          <Text style={styles.adminLinkText}>Acesso administrativo</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: 28,
  },

  header: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  logoContainer: {
    width: "100%",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  logoText: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 1.5,
  },
  logoTagline: {
    fontSize: 12,
    color: "#CFCFCF",
    marginTop: 2,
    maxWidth: 220,
  },
  headerWhatsButton: {
    marginTop: 16,
    alignSelf: "flex-start",
    backgroundColor: COLORS.green,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerWhatsText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },

  hero: {
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: "#0F0F0F",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#1F1F1F",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#E5E5E5",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 14,
    overflow: "hidden",
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.white,
    lineHeight: 36,
    marginBottom: 10,
  },
  heroText: {
    fontSize: 15,
    color: "#D6D6D6",
    lineHeight: 22,
  },
  heroButtons: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  heroPrimaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#FF0000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  heroPrimaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },
  heroSecondaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  heroSecondaryButtonText: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: "800",
  },

  featuresSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    marginHorizontal: 16,
    gap: 10,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  featureIcon: {
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.gray,
  },

  sectionHeader: {
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.black,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },

  menuContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuButtonPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFF4F4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconContainerPrimary: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  whatsIconContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  menuTextContainer: {
    flex: 1,
  },
  menuButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.black,
  },
  menuButtonTextPrimary: {
    color: COLORS.white,
  },
  menuButtonSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
    lineHeight: 18,
  },
  menuButtonSubtitlePrimary: {
    color: "rgba(255,255,255,0.88)",
  },

  whatsappButton: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  whatsappText: {
    color: COLORS.white,
  },
  whatsappSubtext: {
    color: "rgba(255,255,255,0.88)",
  },

  footerInfo: {
    marginTop: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    marginLeft: 6,
    color: COLORS.gray,
    fontSize: 13,
    textAlign: "center",
  },

  adminLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    padding: 10,
  },
  adminLinkText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 6,
  },
});