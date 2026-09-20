// Principalmente para gastos de Mercado Pago

import MyInput from "@/components/MyInput";
import SelectorModal from "@/components/SelectorModal";
import { formatearFecha, formatearMoneda } from "@/constants/functions";
import globalStyles from "@/constants/styles";
import { MetodosPago, Saldos } from "@/interfaces/General_DB";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AgregarGastoScreen() {
  const db = useSQLiteContext();

  // 1. Creamos los estados para capturar el texto de los inputs
  const [monto, setMonto] = useState("");
  const [isVisibleCuenta, setIsVisibleCuenta] = useState(false);
  const [saldos, setSaldos] = useState<Saldos[]>([]);
  const [cuentaSelec, setCuentaSelec] = useState("");
  const [cuentasCompletas, setCuentasCompletas] = useState<MetodosPago[]>([]);
  const [cuentaIdSelec, setCuentaIdSelec] = useState<number | null>(null);

  const obtenerCuentas = useCallback(async () => {
    try {
      const resultSaldos = await db.getAllAsync<Saldos>(
        "SELECT * FROM historial_saldos WHERE cuenta_id = ? ORDER BY fecha_hora DESC LIMIT 10;",
        [cuentaIdSelec],
      );

      const result = await db.getAllAsync<MetodosPago>(
        "SELECT * FROM cuentas_metodos;",
      );

      if (result) {
        setCuentasCompletas(result);
      }

      if (resultSaldos) {
        setSaldos(resultSaldos);
      }
    } catch (error) {
      console.error("Error al consultar las cuentas:", error);
    }
  }, [db, cuentaIdSelec]);

  useFocusEffect(
    useCallback(() => {
      obtenerCuentas();
    }, [obtenerCuentas]),
  );

  const guardarGastoLocal = async () => {
    // Validaciones iniciales básicas
    if (!cuentaIdSelec || !monto.trim()) {
      Alert.alert("Error", "Por favor llena todos los campos");
      return;
    }

    try {
      // 2. Pasamos las variables directamente en el arreglo.
      // Convertimos el monto de String (del input) a número flotante (REAL)
      const result = await db.runAsync(
        `INSERT INTO historial_saldos(cuenta_id, saldo_actual) VALUES(?, ?)`,
        [cuentaIdSelec, monto],
      );

      console.log("ID del movimiento insertado:", result.lastInsertRowId);
      Alert.alert("Éxito", "Gasto guardado correctamente de forma local");

      // Limpiamos los inputs
      setMonto("");
      obtenerCuentas();
    } catch (error) {
      console.error("Error al insertar en la base de datos:", error);
      Alert.alert("Error", "No se pudo guardar el gasto");
    }
  };

  function onSeleccionarCuenta(nombreSeleccionado: string) {
    setCuentaSelec(nombreSeleccionado);

    const cuentaEncontrada = cuentasCompletas.find(
      (c) => c.nombre === nombreSeleccionado,
    );

    if (cuentaEncontrada) {
      setCuentaIdSelec(cuentaEncontrada.id);
    }
  }

  const nombresCuentas = cuentasCompletas.map((c) => c.nombre);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        style={globalStyles.scrollView}
        contentContainerStyle={globalStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={globalStyles.caja}>
          <TouchableOpacity
            style={globalStyles.boton_select}
            onPress={() =>
              isVisibleCuenta
                ? setIsVisibleCuenta(false)
                : setIsVisibleCuenta(true)
            }
          >
            <Text style={[globalStyles.boton_text, globalStyles.dark]}>
              {cuentaSelec || "Selecciona una cuenta"}
            </Text>
          </TouchableOpacity>
          <Text style={[globalStyles.label, globalStyles.dark]}>Saldo:</Text>
          <MyInput
            keyboardType="numeric"
            placeholder="$0,000.00"
            value={monto}
            onChangeText={setMonto}
          />
          <TouchableOpacity
            style={globalStyles.boton}
            onPress={guardarGastoLocal}
          >
            <Text style={[globalStyles.boton_text, globalStyles.dark]}>
              Guardar Saldo
            </Text>
          </TouchableOpacity>
        </View>
        <View style={globalStyles.caja}>
          {saldos && saldos.length > 0 ? (
            <View style={{ flex: 1 }}>
              <View style={[globalStyles.encabezado, globalStyles.fila]}>
                <Text style={[globalStyles.celdaNombre, globalStyles.dark]}>
                  ID
                </Text>
                <Text style={[globalStyles.celdaNombre, globalStyles.dark]}>
                  Saldo
                </Text>
                <Text style={[globalStyles.celdaNombre, globalStyles.dark]}>
                  Fecha
                </Text>
              </View>

              {saldos.map((saldo) => (
                <View key={saldo.id} style={globalStyles.fila}>
                  <Text
                    style={[
                      globalStyles.celdaNombre,
                      globalStyles.dark,
                      { textAlign: "center" },
                    ]}
                  >
                    {saldo.id}
                  </Text>
                  <Text
                    style={[
                      globalStyles.celdaNombre,
                      globalStyles.dark,
                      { textAlign: "center" },
                    ]}
                  >
                    {formatearMoneda(saldo.saldo_actual)}
                  </Text>
                  <Text
                    style={[
                      globalStyles.celdaNombre,
                      globalStyles.dark,
                      { textAlign: "center" },
                    ]}
                  >
                    {formatearFecha(saldo.fecha_hora)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View>
              <Text style={[globalStyles.dark]}>
                No hay historial de saldos para esta cuenta.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      <SelectorModal
        visible={isVisibleCuenta}
        onClose={() => setIsVisibleCuenta(false)}
        titulo={"Cuentas"}
        opciones={nombresCuentas}
        valorSeleccionado={cuentaSelec}
        onSeleccionar={onSeleccionarCuenta}
        formatearOpcion="SI"
      />
    </KeyboardAvoidingView>
  );
}
