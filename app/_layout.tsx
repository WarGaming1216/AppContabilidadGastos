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
            backgroundColor: scheme === "dark" ? "#16235C" : "white",
          },
          headerStyle: {
            backgroundColor: scheme === "dark" ? "#16235C" : "white",
          },
          headerTintColor: scheme === "dark" ? "#fff" : "#000",
        }}
      >
        <Stack.Screen name="index" options={{ headerTitle: "Resumen" }} />
        <Stack.Screen
          name="saldo_inicial"
          options={{ headerTitle: "Saldo Inicial" }}
        />
        <Stack.Screen
          name="metodos_pago/[id]"
          options={{ headerTitle: "Cargando..." }}
        />
        <Stack.Screen
          name="gestionar_cuentas"
          options={{ headerTitle: "Gestionar Cuentas" }}
        />
      </Stack>
    </SQLiteProvider>
  );
}
