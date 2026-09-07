import NavBar from "@/components/NavBar";
import { dbName, iniciarBaseDeDatos } from "@/database/database";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useColorScheme, View } from "react-native";

export default function RootLayout() {
  const scheme = useColorScheme();
  const backgroundColor = scheme === "dark" ? "#16235C" : "white";

  return (
    <SQLiteProvider
      databaseName={dbName}
      onInit={iniciarBaseDeDatos}
      useSuspense
    >
      <View style={{ flex: 1, backgroundColor }}>
        <View style={{ flex: 1, backgroundColor }}>
          <Stack
            screenOptions={{
              animation: "none",
              contentStyle: {
                backgroundColor: scheme === "dark" ? "#16235C" : "white",
              },
              headerStyle: {
                backgroundColor: scheme === "dark" ? "#16235C" : "white",
              },
              headerTintColor: scheme === "dark" ? "#fff" : "#000",
            }}
          >
            <Stack.Screen name="index" options={{ headerTitle: "Inicio" }} />
            <Stack.Screen
              name="saldo_inicial"
              options={{ headerTitle: "Saldo Inicial" }}
            />
            <Stack.Screen
              name="metodos_pago/movimientos"
              options={{ headerTitle: "Movimientos" }}
            />
            <Stack.Screen
              name="metodos_pago/[id]"
              options={{ headerTitle: "Cargando..." }}
            />
            <Stack.Screen
              name="gestionar_cuentas"
              options={{ headerTitle: "Gestionar Cuentas" }}
            />
            <Stack.Screen
              name="configurar_tipos"
              options={{ headerTitle: "Configurar Tipos" }}
            />
          </Stack>
        </View>
        <NavBar />
      </View>
    </SQLiteProvider>
  );
}
