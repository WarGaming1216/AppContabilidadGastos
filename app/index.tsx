import MyText from "@/components/MyText";
import { MetodosPago, Saldos } from "@/interfaces/General_DB";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import globalStyles from "./constants/styles";

export default function Index() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const db = useSQLiteContext();
  const [saldos, setSaldos] = useState<Saldos[]>([]);
  const [metodos, setMetodosPago] = useState<MetodosPago[]>([]);

  const saldosCompletos =
    saldos.length > 0 ? (
      saldos.map((saldo) => (
        <Text key={saldo.id}>
          {saldo.cuenta_id} - ${saldo.saldo_actual}
        </Text>
      ))
    ) : (
      <MyText>No hay saldos registrados...</MyText>
    );

  const metodosPago =
    metodos.length > 0 ? (
      metodos.map((metodo) => (
        <TouchableOpacity
          style={globalStyles.boton_navegacion}
          key={metodo.id}
          onPress={() =>
            router.push({
              pathname: "/metodos_pago/[id]",
              params: { id: metodo.id.toString() },
            })
          }
        >
          <Text style={globalStyles.boton_nav_text}>{metodo.nombre}</Text>
        </TouchableOpacity>
      ))
    ) : (
      <Text
        style={[
          globalStyles.label,
          isDark ? globalStyles.dark : globalStyles.light,
        ]}
      >
        No hay métodos registrados...
      </Text>
    );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function cargarDatos() {
        try {
          const resultSaldos = await db.getAllAsync<Saldos>(
            "SELECT * FROM historial_saldos",
          );
          const resultMetodos = await db.getAllAsync<MetodosPago>(
            "SELECT * FROM cuentas_metodos",
          );

          if (isMounted) {
            setSaldos(resultSaldos);
            setMetodosPago(resultMetodos);
          }
        } catch (error) {
          console.error("Error al redefinir la lista de métodos:", error);
        }
      }

      cargarDatos();

      return () => {
        isMounted = false;
      };
    }, [db]),
  );

  return (
    <ScrollView
      style={globalStyles.scrollView}
      contentContainerStyle={globalStyles.scrollContent}
    >
      <Text
        style={[
          globalStyles.label,
          isDark ? globalStyles.dark : globalStyles.light,
        ]}
      >
        Saldos:
      </Text>
      {saldosCompletos}
      <Text
        style={[
          globalStyles.label,
          isDark ? globalStyles.dark : globalStyles.light,
        ]}
      >
        Métodos de pago:
      </Text>
      {metodosPago}
      <TouchableOpacity
        style={[globalStyles.boton]}
        onPress={() => router.push("/saldo_inicial")}
      >
        <Text style={[globalStyles.boton_text]}>Saldo</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={globalStyles.boton}
        onPress={() => router.push("/gestionar_cuentas")}
      >
        <Text style={globalStyles.boton_text}>Gestionar Cuentas</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
