import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="h2 text-center text-lingua-purple">Lingua</Text>
      <Link
        href="/onboarding"
        className="body-md text-lingua-purple underline mt-4"
      >
        Open Onboarding
      </Link>
    </View>
  );
}
