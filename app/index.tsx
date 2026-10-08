import TarCredBar from "@/components/TarCredBar";
import { MetodosPago, Movimientos, Saldos } from "@/interfaces/General_DB";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import globalStyles from "../constants/styles";

export default function Index() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const db = useSQLiteContext();
  const [saldos, setSaldos] = useState<Saldos[]>([]);
  const [metodos, setMetodosPago] = useState<MetodosPago[]>([]);
  const [movimientos, setMovimientos] = useState<Movimientos[]>([]);

  function sumaSaldos(metodoId: number) {
    let suma = 0;

    saldos.map((saldo) => {
      if (metodoId === saldo.cuenta_id) {
        suma += saldo.saldo_actual;
      }
    });

    return suma;
  }

  function sumaGastos(metodoId: number) {
    let gastos = 0;
    if (movimientos.length > 0) {
      movimientos.map((mov) => {
        if (metodoId === mov.cuenta_id && mov.tipo_movimiento === 1) {
          gastos += mov.monto;
        }
      });
    }
    return gastos;
  }

  const metodosPago =
    metodos.length > 0 ? (
      metodos.map((metodo) => (
        <TouchableOpacity
          key={metodo.id}
          onPress={() =>
            router.push({
              pathname: "/metodos_pago/[id]",
              params: { id: metodo.id.toString() },
            })
          }
        >
          {TarCredBar({
            nombreCuenta: metodo.nombre,
            limite: metodo.limite > 0 ? metodo.limite : sumaSaldos(metodo.id),
            gasto: sumaGastos(metodo.id),
            fecha_corte: metodo.fecha_corte,
          })}
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
          const resultMov = await db.getAllAsync<Movimientos>(
            "SELECT * FROM movimientos",
          );

          if (isMounted) {
            setSaldos(resultSaldos);
            setMetodosPago(resultMetodos);
            setMovimientos(resultMov);
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
        Cuentas y Saldos:
      </Text>
      {metodosPago}
    </ScrollView>
  );
}
