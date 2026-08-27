import { globalStyles } from "@/app/constants/styles";
import MyInput from "@/components/MyInput";
import MyText from "@/components/MyText";
import SelectorModal from "@/components/SelectorModal";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Stack, useFocusEffect, useLocalSearchParams } from "expo-router"; // Importamos 'Stack' de expo-router
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { formatearMoneda } from "../constants/functions";

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
  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");

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

  const cargarSaldos = useCallback(async () => {
    try {
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
    } catch (error) {
      console.error("Error al redefinir la lista de métodos:", error);
    }
  }, [db, id]);

  // Se ejecuta al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      cargarSaldos();
    }, [cargarSaldos]),
  );

  const handleGuardarMovimiento = async () => {
    if (!monto.trim() || !concepto.trim() || !fecha.toDateString().trim()) {
      console.error("Verifica todos los campos");
      return;
    } else if (valorSeleccionado.trim() === "Selecciona un tipo de gasto") {
      console.error("Selecciona un tipo de gasto.");
      return;
    }

    const res = await handleMovimientoNuevo(
      id,
      monto,
      concepto,
      valorSeleccionado,
      fecha.toDateString(),
    );

    if (res && res.changes > 0) {
      console.log("El movimiento se registró con éxito.");
      setConcepto("");
      setMonto("");
      setValorSeleccionado("");
      cargarSaldos();
    } else {
      console.error("Error: No se pudo generar el movimiento.");
    }
  };

  async function handleMovimientoNuevo(
    id: string,
    monto: string,
    concepto: string,
    tipo: string,
    fecha: string,
  ) {
    try {
      const result = await db.runAsync(
        `INSERT INTO movimientos(cuenta_id, tipo_movimiento, monto, concepto, fecha_hora) VALUES(?, ?, ?, ?, ?)`,
        [id, tipo, monto, concepto, fecha],
      );
      return result;
    } catch (error) {
      console.error("Ocurrió un error al registrar el movimiento, ", error);
    }
  }

  const contenido =
    id === "1" ? (
      contenidoTabMov && contenidoTabMov.length > 0 ? (
        <View>
          <View style={[globalStyles.fila, globalStyles.encabezado]}>
            <View style={globalStyles.celdaNombre}>
              <Text style={isDark ? globalStyles.dark : globalStyles.light}>
                Tipo
              </Text>
            </View>
            <View style={globalStyles.celdaNombre}>
              <Text style={isDark ? globalStyles.dark : globalStyles.light}>
                Monto
              </Text>
            </View>
            <View style={globalStyles.celdaNombre}>
              <Text style={isDark ? globalStyles.dark : globalStyles.light}>
                Concepto
              </Text>
            </View>
            <View style={globalStyles.celdaNombre}>
              <Text style={isDark ? globalStyles.dark : globalStyles.light}>
                Fecha
              </Text>
            </View>
          </View>
          {contenidoTabMov.map((movimiento) => (
            <View key={movimiento.id} style={globalStyles.fila}>
              <View style={globalStyles.celdaNombre}>
                <Text style={isDark ? globalStyles.dark : globalStyles.light}>
                  {movimiento.tipo_movimiento}
                </Text>
              </View>
              <View style={globalStyles.celdaNombre}>
                <Text style={isDark ? globalStyles.dark : globalStyles.light}>
                  {formatearMoneda(movimiento.monto)}
                </Text>
              </View>
              <View style={globalStyles.celdaNombre}>
                <Text style={isDark ? globalStyles.dark : globalStyles.light}>
                  {movimiento.concepto}
                </Text>
              </View>
              <View style={globalStyles.celdaNombre}>
                <Text style={isDark ? globalStyles.dark : globalStyles.light}>
                  {movimiento.fecha_hora.toString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
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

          <SelectorModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            titulo="Tipo de gasto"
            opciones={tiposGasto}
            valorSeleccionado={valorSeleccionado}
            onSeleccionar={onSeleccionar}
          />
        </View>
        <MyInput placeholder="Monto" value={monto} onChangeText={setMonto} />
        <MyInput
          placeholder="Concepto"
          value={concepto}
          onChangeText={setConcepto}
        />
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
        <TouchableOpacity
          style={globalStyles.boton}
          onPress={handleGuardarMovimiento}
        >
          <Text style={globalStyles.boton_text}>Registrar movimiento</Text>
        </TouchableOpacity>
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
