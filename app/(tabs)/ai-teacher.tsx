import * as Sentry from "@sentry/react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AITeacherScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Sentry.Unmask>
        <View className="flex-1 items-center justify-center">
          <Text className="h2">AI Teacher</Text>
        </View>
      </Sentry.Unmask>
    </SafeAreaView>
  );
}
