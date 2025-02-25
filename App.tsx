import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";

export default function App() {
  const [fontsLoaded] = useFonts({
    "SpaceMono": require("./assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack />
    </>
  );
}
