// Principalmente para gastos de Mercado Pago

import MyInput from "@/components/MyInput";
import MyText from "@/components/MyText";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { Alert, Button, View } from "react-native";

export default function AgregarGastoScreen() {
  const db = useSQLiteContext();

  // 1. Creamos los estados para capturar el texto de los inputs
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");

  const guardarGastoLocal = async () => {
    // Validaciones iniciales básicas
    if (!concepto.trim() || !monto.trim()) {
      Alert.alert("Error", "Por favor llena todos los campos");
      return;
    }

    try {
      // 2. Pasamos las variables directamente en el arreglo.
      // Convertimos el monto de String (del input) a número flotante (REAL)
      const result = await db.runAsync(
        `INSERT INTO movimientos (cuenta_id, tipo_movimiento, monto, concepto) 
        VALUES (:cuenta, :tipo, :monto, :concepto)`,
        {
          ":cuenta": 1,
          ":tipo": "GASTO",
          ":monto": parseFloat(monto),
          ":concepto": concepto,
        },
      );

      console.log("ID del movimiento insertado:", result.lastInsertRowId);
      Alert.alert("Éxito", "Gasto guardado correctamente de forma local");

      // Limpiamos los inputs
      setConcepto("");
      setMonto("");
    } catch (error) {
      console.error("Error al insertar en la base de datos:", error);
      Alert.alert("Error", "No se pudo guardar el gasto");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <MyText>Concepto del Gasto</MyText>
      <MyInput
        placeholder="Ej. Inscripción al gimnasio"
        value={concepto}
        onChangeText={setConcepto} // Modifica el estado con el texto plano
      />

      <MyText>Monto</MyText>
      <MyInput
        placeholder="0.00"
        keyboardType="numeric"
        value={monto}
        onChangeText={setMonto} // Modifica el estado con el número en texto
      />

      <Button title="Guardar Gasto" onPress={guardarGastoLocal} />
    </View>
  );
}
