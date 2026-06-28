import SocialButton from "@/components/SocialButton";
import VerificationModal from "@/components/VerificationModal";
import { images } from "@/constants/images";
import { addAppBreadcrumb, captureHandledError } from "@/lib/sentry";
import { useSignUp, useSSO } from "@clerk/expo";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { type Href, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

type SSOStrategy = "oauth_google" | "oauth_facebook" | "oauth_apple";

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const isLoading = fetchStatus === "fetching";

  const handleSignUp = async () => {
    addAppBreadcrumb("Sign up started", { method: "password" });

    try {
      const { error } = await signUp.password({
        emailAddress: email,
        password,
      });
      if (error) {
        addAppBreadcrumb("Sign up failed", undefined, "warning");
        return;
      }
      await signUp.verifications.sendEmailCode();
      setShowVerification(true);
    } catch (error) {
      captureHandledError(error, "sign_up_password");
    }
  };

  const handleVerify = async (code: string) => {
    addAppBreadcrumb("Sign up verification submitted", {
      method: "email_code",
    });

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        addAppBreadcrumb("Sign up verification failed", undefined, "warning");
        return;
      }
      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ decorateUrl }) => {
            router.replace(decorateUrl("/") as Href);
          },
        });
      }
    } catch (error) {
      captureHandledError(error, "sign_up_verify_code");
    }
  };

  const handleResend = async () => {
    addAppBreadcrumb("Sign up code resent", { method: "email_code" });

    try {
      await signUp.verifications.sendEmailCode();
    } catch (error) {
      captureHandledError(error, "sign_up_resend_code");
    }
  };

  const handleSSO = async (strategy: SSOStrategy) => {
    addAppBreadcrumb("SSO sign up started", { strategy });

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: Linking.createURL("/"),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/");
      }
    } catch (error) {
      captureHandledError(error, "sign_up_sso", { strategy });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6">
            {/* Back */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-4 w-10 h-10 justify-center"
            >
              <Ionicons name="chevron-back" size={24} color="#001328" />
            </TouchableOpacity>

            {/* Header */}
            <Text className="h1 mt-4">Ayo buat akun</Text>
            <Text className="body-md text-text-secondary mt-2">
              Mulai sejarah bahasa kamu hari ini ✨
            </Text>

            {/* Mascot */}
            <View className="items-center mt-6 mb-6">
              <Image
                source={images.mascotAuth}
                style={{ width: 160, height: 160 }}
                resizeMode="contain"
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="hakim@gmail.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
            {errors.fields.emailAddress ? (
              <Text className="body-sm text-error -mt-2 mb-2">
                {errors.fields.emailAddress.message}
              </Text>
            ) : null}

            {/* Password */}
            <View style={[styles.inputContainer, { flexDirection: "column" }]}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  style={[styles.input, { flex: 1 }]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-outline"}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
            </View>
            {errors.fields.password ? (
              <Text className="body-sm text-error -mt-2 mb-2">
                {errors.fields.password.message}
              </Text>
            ) : null}
            {errors.global?.[0] ? (
              <Text className="body-sm text-error mb-2">
                {errors.global[0].message}
              </Text>
            ) : null}

            {/* Sign up button */}
            <TouchableOpacity
              className="bg-lingua-purple rounded-2xl py-4 items-center mt-2"
              activeOpacity={0.85}
              onPress={handleSignUp}
              disabled={!email || !password || isLoading}
              style={{ opacity: !email || !password || isLoading ? 0.6 : 1 }}
            >
              <Text className="font-poppins-semibold text-base text-white">
                {isLoading ? "Membuat akun..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6 gap-3">
              <View className="flex-1 h-px bg-border" />
              <Text className="body-sm text-text-secondary">
                Atau lanjutkan dengan
              </Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Social */}
            <SocialButton
              icon={<AntDesign name="google" size={20} color="#DB4437" />}
              label="Continue with Google"
              onPress={() => handleSSO("oauth_google")}
            />
            <SocialButton
              icon={<FontAwesome name="facebook" size={20} color="#1877F2" />}
              label="Continue with Facebook"
              onPress={() => handleSSO("oauth_facebook")}
            />
            <SocialButton
              icon={<AntDesign name="apple" size={20} color="#000" />}
              label="Continue with Apple"
              onPress={() => handleSSO("oauth_apple")}
            />

            {/* Sign in link */}
            <View className="flex-row justify-center mt-4 mb-8">
              <Text className="body-md text-text-secondary">
                Sudah punya akun?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/sign-in")}
              >
                <Text className="body-md text-lingua-purple font-poppins-semibold">
                  Log In
                </Text>
              </TouchableOpacity>
            </View>

            <View nativeID="clerk-captcha" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <VerificationModal
        visible={showVerification}
        email={email}
        onClose={() => setShowVerification(false)}
        onVerify={handleVerify}
        onResend={handleResend}
        error={errors.fields.code?.message || errors.global?.[0]?.message || ""}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 2,
  },
  input: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#001328",
    padding: 0,
  },
});
