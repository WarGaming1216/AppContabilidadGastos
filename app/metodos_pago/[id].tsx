import { globalStyles } from "@/app/constants/styles";
import MyInput from "@/components/MyInput";
import MyText from "@/components/MyText";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams } from "expo-router"; // Importamos 'Stack' de expo-router
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface HistorialSaldos {
  id: number;
  cuenta_id: number;
  saldo_real: number;
  fecha_hora: Date;
}

interface Movimientos {
  id: number;
  cuenta_id: number;
  tipo_movimiento: string;
  monto: number;
  concepto: string;
  fecha_hora: Date;
}

const tiposGasto = [
  "Gasto regular",
  "Pago adelantado",
  "Pago automático",
  "Devolución",
  "Ingreso",
];

export default function DetalleMetodoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // Captura el ID de la ruta (ej: "1", "2")
  const [nombreCuenta, setNombreCuenta] = useState("Detalle de Cuenta");

  const [contenidoTabSaldos, setContenidoTabSaldos] = useState<
    HistorialSaldos[]
  >([]);
  const [contenidoTabMov, setContenidoTabMov] = useState<Movimientos[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [valorSeleccionado, setValorSeleccionado] = useState(
    "Selecciona un tipo de gasto",
  );

  const onSeleccionar = (valor: string) => {
    setValorSeleccionado(valor);
  };

  const [fecha, setFecha] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const db = useSQLiteContext();

  const alCambiarFecha = (
    event: DateTimePickerEvent,
    fechaSeleccionada?: Date,
  ) => {
    setMostrarCalendario(Platform.OS === "ios");

    if (fechaSeleccionada) {
      setFecha(fechaSeleccionada);
    }
  };

  // useEffect para obtener el nombre del método de pago.
  useEffect(() => {
    async function obtenerNombreCuenta() {
      try {
        // Buscamos en la base de datos el nombre real usando el ID de la ruta
        const result = await db.getFirstAsync<{ nombre: string }>(
          "SELECT nombre FROM cuentas_metodos WHERE id = ?",
          [parseInt(id)],
        );

        if (result) {
          setNombreCuenta(result.nombre);
        }
      } catch (error) {
        console.error("Error al consultar el nombre de la cuenta:", error);
      }
    }
    obtenerNombreCuenta();
  }, [id, db]);

  useEffect(() => {
    async function cargarTabla() {
      if (id !== "1") {
        const result = await db.getAllAsync<HistorialSaldos>(
          "SELECT * FROM historial_saldos WHERE cuenta_id = ?",
          [parseInt(id)],
        );
        setContenidoTabSaldos(result);
      } else {
        const result = await db.getAllAsync<Movimientos>(
          "SELECT * FROM movimientos",
        );
        setContenidoTabMov(result);
      }
    }
    cargarTabla();
  }, [id, db]);

  const contenido =
    id === "1" ? (
      contenidoTabMov.length > 0 ? (
        contenidoTabMov.map((movimiento) => (
          <MyText key={movimiento.id}>{movimiento.cuenta_id}</MyText>
        ))
      ) : (
        <MyText>No hay movimientos registrados...</MyText>
      )
    ) : contenidoTabSaldos.length > 0 ? (
      contenidoTabSaldos.map((saldo) => (
        <MyText key={saldo.id}>{saldo.saldo_real}</MyText>
      ))
    ) : (
      <MyText>No hay saldos registrados...</MyText>
    );

  const registros =
    id === "1" ? (
      <View>
        <View>
          <TouchableOpacity
            style={[globalStyles.selector, globalStyles.boton_select]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[globalStyles.boton_text]}>
              {valorSeleccionado || "Selecciona un tipo de gasto"}
            </Text>
          </TouchableOpacity>

          <Modal
            transparent={true}
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={globalStyles.modalOverlay}>
              <View style={globalStyles.modalContent}>
                <Text style={globalStyles.modalTitulo}>Tipo de gasto</Text>

                {tiposGasto.map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      globalStyles.opcion,
                      valorSeleccionado === tipo &&
                        globalStyles.opcionSeleccionada,
                    ]}
                    onPress={() => {
                      onSeleccionar(tipo);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        globalStyles.textoOpcion,
                        valorSeleccionado === tipo &&
                          globalStyles.textoOpcionSeleccionada,
                      ]}
                    >
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={globalStyles.botonCerrar}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={globalStyles.textoCerrar}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
        <MyInput placeholder="Monto" />
        <MyInput placeholder="Concepto" />
        <MyText>Fecha de registro:</MyText>
        <TouchableOpacity
          style={globalStyles.input}
          onPress={() => setMostrarCalendario(true)}
        >
          <MyText>
            {fecha.toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </MyText>
        </TouchableOpacity>
        {mostrarCalendario && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display="default"
            onChange={alCambiarFecha}
            maximumDate={new Date()}
          />
        )}
      </View>
    ) : (
      <View>
        <MyInput placeholder="Tipo de movimiento" />
        <MyInput placeholder="Monto" />
      </View>
    );

  return (
    <ScrollView style={globalStyles.container}>
      {/* ¡Aquí está el truco! Este componente sobreescribe las opciones del Layout 
        y clava el nombre real (BBVA, Mercado Pago, etc.) en la barra superior nativa
      */}
      <Stack.Screen options={{ headerTitle: nombreCuenta }} />

      <MyText>Nuevo registro:</MyText>
      {registros}

      <MyText>Historial de {id === "1" ? "movimientos:" : "saldos:"}</MyText>
      <MyText>{contenido}</MyText>
    </ScrollView>
  );
}
