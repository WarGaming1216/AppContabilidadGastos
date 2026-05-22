import { dbName, iniciarBaseDeDatos } from "@/database/database";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <SQLiteProvider
      databaseName={dbName}
      onInit={iniciarBaseDeDatos}
      useSuspense
    >
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: scheme === "dark" ? "#323232" : "white",
          },
          headerStyle: {
            backgroundColor: scheme === "dark" ? "#323232" : "white",
          },
          headerTintColor: scheme === "dark" ? "white" : "black",
        }}
      >
        <Stack.Screen name="index" options={{ headerTitle: "Resumen" }} />
        <Stack.Screen name="gastos" options={{ headerTitle: "Gastos" }} />
      </Stack>
    </SQLiteProvider>
  );
}
