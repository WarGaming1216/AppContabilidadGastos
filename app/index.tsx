import MyText from "@/components/MyText";
import { Gasto, MetodosPago } from "@/interfaces/Gasto";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { globalStyles } from "./constants/styles";

export default function Index() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const db = useSQLiteContext();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [metodos, setMetodosPago] = useState<MetodosPago[]>([]);

  const gastosCompletos =
    gastos.length > 0 ? (
      gastos.map((gasto) => (
        <Text key={gasto.id}>
          {gasto.titulo} - ${gasto.monto}
        </Text>
      ))
    ) : (
      <MyText>No hay gastos por aqui...</MyText>
    );

  const metodosPago =
    metodos.length > 0 ? (
      metodos.map((metodo) => (
        <TouchableOpacity
          style={globalStyles.boton}
          key={metodo.id}
          onPress={
            () =>
              router.push({
                pathname: "/metodos_pago/[id]",
                params: { id: metodo.id.toString() },
              })
            // router.push(
            //   `/metodos_pago/${metodo.nombre === "Mercado Pago" ? "mercado_pago" : metodo.nombre === "BBVA" ? "bbva" : "efectivo"}`,
            // )
          }
        >
          <Text style={globalStyles.boton_text}>{metodo.nombre}</Text>
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

  useEffect(() => {
    async function cargarGastos() {
      const result = await db.getAllAsync<Gasto>("SELECT * FROM gastos");
      setGastos(result);
    }
    cargarGastos();

    async function cargarMetodosPago() {
      const result = await db.getAllAsync<MetodosPago>(
        "SELECT * FROM cuentas_metodos",
      );
      setMetodosPago(result);
    }
    cargarMetodosPago();
  }, [db]);

  return (
    <ScrollView style={globalStyles.container}>
      <Text
        style={[
          globalStyles.label,
          isDark ? globalStyles.dark : globalStyles.light,
        ]}
      >
        Este es el primer input
      </Text>
      <TextInput
        style={[
          globalStyles.input,
          isDark ? globalStyles.dark : globalStyles.light,
        ]}
      ></TextInput>
      <Text
        style={[
          globalStyles.label,
          isDark ? globalStyles.dark : globalStyles.light,
        ]}
      >
        Este es el segundo input
      </Text>
      <TextInput
        style={[
          globalStyles.input,
          isDark ? globalStyles.dark : globalStyles.light,
        ]}
      ></TextInput>
      <Text
        style={[
          globalStyles.label,
          isDark ? globalStyles.dark : globalStyles.light,
        ]}
      >
        Gastos:
      </Text>
      {gastosCompletos}
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
        onPress={() => router.push("/gastos")}
      >
        <Text style={[globalStyles.boton_text]}>Ir a agregar gastos</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
