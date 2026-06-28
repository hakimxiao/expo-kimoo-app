import SocialButton from "@/components/SocialButton";
import VerificationModal from "@/components/VerificationModal";
import { images } from "@/constants/images";
import { addAppBreadcrumb, captureHandledError } from "@/lib/sentry";
import { useSignIn, useSSO } from "@clerk/expo";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router, type Href } from "expo-router";
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

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [showVerification, setShowVerification] = useState(false);

  const isLoading = fetchStatus === "fetching";

  const handleSignIn = async () => {
    addAppBreadcrumb("Sign in code requested", { method: "email_code" });

    try {
      const { error } = await signIn.emailCode.sendCode({
        emailAddress: email,
      });
      if (error) {
        addAppBreadcrumb("Sign in code request failed", undefined, "warning");
        return;
      }
      setShowVerification(true);
    } catch (error) {
      captureHandledError(error, "sign_in_send_code");
    }
  };

  const handleVerify = async (code: string) => {
    addAppBreadcrumb("Sign in verification submitted", {
      method: "email_code",
    });

    try {
      const { error } = await signIn.emailCode.verifyCode({ code });
      if (error) {
        addAppBreadcrumb("Sign in verification failed", undefined, "warning");
        return;
      }
      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            router.replace(decorateUrl("/") as Href);
          },
        });
      }
    } catch (error) {
      captureHandledError(error, "sign_in_verify_code");
    }
  };

  const handleResend = async () => {
    addAppBreadcrumb("Sign in code resent", { method: "email_code" });

    try {
      await signIn.emailCode.sendCode({ emailAddress: email });
    } catch (error) {
      captureHandledError(error, "sign_in_resend_code");
    }
  };

  const handleSSO = async (strategy: SSOStrategy) => {
    addAppBreadcrumb("SSO sign in started", { strategy });

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
      captureHandledError(error, "sign_in_sso", { strategy });
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
            <Text className="h1 mt-4">Hallo lagi!</Text>
            <Text className="body-md text-text-secondary mt-2">
              Mari lanjutkan sejarah bahasa kamu ✨
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

            {errors.fields.identifier ? (
              <Text className="body-sm  text-error -mt-2 mb-2">
                {errors.fields.identifier.message}
              </Text>
            ) : null}
            {errors.global?.[0] ? (
              <Text className="body-sm text-error mb-2">
                {errors.global[0].message}
              </Text>
            ) : null}

            {/* Sign in button */}
            <TouchableOpacity
              className="bg-lingua-purple rounded-2xl py-4 items-center mt-2"
              activeOpacity={0.85}
              onPress={handleSignIn}
              disabled={!email || isLoading}
              style={{ opacity: !email || isLoading ? 0.6 : 1 }}
            >
              <Text className="font-poppins-semibold text-base text-white">
                {isLoading ? "Mengirim kode..." : "Sign In"}
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
              label="Lanjut dengan Google"
              onPress={() => handleSSO("oauth_google")}
            />
            <SocialButton
              icon={<FontAwesome name="facebook" size={20} color="#1877F2" />}
              label="Lanjut dengan Facebook"
              onPress={() => handleSSO("oauth_facebook")}
            />
            <SocialButton
              icon={<AntDesign name="apple" size={20} color="#000" />}
              label="Lanjut dengan Apple"
              onPress={() => handleSSO("oauth_apple")}
            />

            {/* Sign up link */}
            <View className="flex-row justify-center mt-4 mb-8">
              <Text className="body-md text-text-secondary">
                Tidak punya akun?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/sign-up")}
              >
                <Text className="body-md text-lingua-purple font-poppins-semibold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
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
