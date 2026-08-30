import MyInput from "@/components/MyInput";
import MyText from "@/components/MyText";
import SelectorModal from "@/components/SelectorModal";
import { MetodosPago, Movimientos } from "@/interfaces/General_DB";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Eye, Trash } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { formatearFecha, formatearMoneda } from "../constants/functions";
import globalStyles from "../constants/styles";

const tipos_movimientos = [
  "Gasto",
  "Pago automático",
  "Pago adelantado",
  "Devolución",
  "Ingreso",
];

export default function Movimientos_Page() {
  const [movSelec, setMovSelec] = useState("");
  const [cuentaSelec, setCuentaSelec] = useState("");
  const [cuentaIdSelec, setCuentaIdSelec] = useState<number | null>(null);
  const [cuentasCompletas, setCuentasCompletas] = useState<MetodosPago[]>([]);

  const [isVisibleMov, setIsVisibleMov] = useState(false);
  const [isVisibleCuenta, setIsVisibleCuenta] = useState(false);

  const [pagSelec, setPagSelec] = useState(true);

  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");

  const [movimientos, setMovimientos] = useState<Movimientos[]>([]);

  const [fecha, setFecha] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const schema = useColorScheme();
  const isDark = schema === "dark";
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

  useEffect(() => {
    async function obtenerCuentas() {
      try {
        const result = await db.getAllAsync<MetodosPago>(
          "SELECT * FROM cuentas_metodos",
        );

        if (result) {
          setCuentasCompletas(result);
        }
      } catch (error) {
        console.error("Error al consultar las cuentas:", error);
      }
    }
    obtenerCuentas();
  }, [db]);

  const cargarSaldos = useCallback(async () => {
    try {
      const result = await db.getAllAsync<Movimientos>(
        "SELECT * FROM movimientos WHERE cuenta_id = ?",
        [cuentaIdSelec],
      );
      setMovimientos(result);
    } catch (error) {
      console.error("Error al redefinir la lista de métodos:", error);
    }
  }, [db, cuentaIdSelec]);

  // Se ejecuta al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      cargarSaldos();
    }, [cargarSaldos]),
  );

  function onSeleccionarMov(mov: string) {
    setMovSelec(mov);
  }

  function onSeleccionarCuenta(nombreSeleccionado: string) {
    setCuentaSelec(nombreSeleccionado);

    const cuentaEncontrada = cuentasCompletas.find(
      (c) => c.nombre === nombreSeleccionado,
    );

    if (cuentaEncontrada) {
      setCuentaIdSelec(cuentaEncontrada.id);
    }
  }

  function CambiarPagina(nuevo: boolean) {
    const pag = nuevo ? setPagSelec(false) : setPagSelec(true);
    return pag;
  }

  const caja = (
    <>
      {pagSelec ? (
        <View>
          <Text
            style={[
              globalStyles.label,
              isDark ? globalStyles.dark : globalStyles.light,
            ]}
          >
            Llena el formulario:
          </Text>
          <MyInput
            placeholder="Monto ($)"
            value={monto}
            onChangeText={setMonto}
          ></MyInput>
          <MyInput
            placeholder="Concepto"
            value={concepto}
            onChangeText={setConcepto}
          ></MyInput>
          <TouchableOpacity
            style={globalStyles.date}
            onPress={() => setMostrarCalendario(true)}
          >
            <MyText>{formatearFecha(fecha)}</MyText>
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
            style={[globalStyles.boton]}
            onPress={() => handleGuardarMovimiento()}
          >
            <Text style={globalStyles.boton_text}>Guardar Movimiento</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {movimientos.length > 0 ? (
            <View>
              <View style={[globalStyles.fila, globalStyles.encabezado]}>
                <View style={globalStyles.celdaNombre}>
                  <Text style={isDark ? globalStyles.dark : globalStyles.light}>
                    Monto
                  </Text>
                </View>
                <View style={globalStyles.celdaNombre}>
                  <Text style={isDark ? globalStyles.dark : globalStyles.light}>
                    Fecha
                  </Text>
                </View>
                <View style={globalStyles.celdaNombre}>
                  <Text style={isDark ? globalStyles.dark : globalStyles.light}>
                    Acciones
                  </Text>
                </View>
              </View>
              {movimientos.map((movimiento) => (
                <View key={movimiento.id} style={globalStyles.fila}>
                  <View style={globalStyles.celdaNombre}>
                    <Text
                      style={isDark ? globalStyles.dark : globalStyles.light}
                    >
                      {formatearMoneda(movimiento.monto)}
                    </Text>
                  </View>
                  <View style={globalStyles.celdaNombre}>
                    <Text
                      style={isDark ? globalStyles.dark : globalStyles.light}
                    >
                      {formatearFecha(movimiento.fecha_hora)}
                    </Text>
                  </View>
                  <View style={globalStyles.celdaAcciones}>
                    <Trash></Trash>
                    <Eye></Eye>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <>
              <Text style={isDark ? globalStyles.dark : globalStyles.light}>
                No hay un historial actual.
              </Text>
            </>
          )}
        </View>
      )}
    </>
  );

  async function handleGuardarMovimiento() {
    if (!cuentaIdSelec) {
      console.error("No se ha seleccionado una cuenta.");
      return;
    }
    if (!movSelec) {
      console.error("No se ha seleccionado un tipo de movimiento.");
      return;
    }

    if (!monto.trim()) {
      console.error("Ingresa un monto.");
      return;
    }
    if (!concepto.trim()) {
      console.error("Ingresa un concepto.");
      return;
    }

    console.error(cuentaIdSelec);

    try {
      const result = await db.runAsync(
        `INSERT INTO movimientos(cuenta_id, tipo_movimiento, monto, concepto, fecha_hora) VALUES(?, ?, ?, ?, ?)`,
        [cuentaIdSelec, movSelec, monto, concepto, fecha.toString()],
      );
      if (result && result.changes > 0) {
        console.log("El movimiento se registró con éxito.");
        setConcepto("");
        setMonto("");
        setMovSelec("");
        cargarSaldos();
      } else {
        console.error("Error: No se pudo generar el movimiento.");
      }
    } catch (error) {
      console.error("Ocurrió un error: ", error);
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
        <View>
          <TouchableOpacity
            style={globalStyles.boton_select}
            onPress={() =>
              isVisibleCuenta
                ? setIsVisibleCuenta(false)
                : setIsVisibleCuenta(true)
            }
          >
            <Text
              style={[
                globalStyles.boton_text,
                isDark ? globalStyles.dark : globalStyles.light,
              ]}
            >
              {cuentaSelec || "Selecciona una cuenta"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyles.boton_select}
            onPress={() =>
              isVisibleMov ? setIsVisibleMov(false) : setIsVisibleMov(true)
            }
          >
            <Text
              style={[
                globalStyles.boton_text,
                isDark ? globalStyles.dark : globalStyles.light,
              ]}
            >
              {movSelec || "Selecciona un tipo de movimiento"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={globalStyles.vista_pag}>
          <TouchableOpacity
            style={[
              globalStyles.boton_pag,
              pagSelec ? globalStyles.pag_seleccionado : undefined,
            ]}
            onPress={() => CambiarPagina(false)}
          >
            <Text style={isDark ? globalStyles.dark : globalStyles.light}>
              Nuevo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              globalStyles.boton_pag,
              pagSelec ? undefined : globalStyles.pag_seleccionado,
            ]}
            onPress={() => CambiarPagina(true)}
          >
            <Text style={isDark ? globalStyles.dark : globalStyles.light}>
              Historial
            </Text>
          </TouchableOpacity>
        </View>
        <View style={globalStyles.caja}>{caja}</View>
      </ScrollView>

      {/* Sección de Modales */}
      <SelectorModal
        visible={isVisibleCuenta}
        onClose={() => setIsVisibleCuenta(false)}
        titulo={"Selecciona un tipo"}
        opciones={nombresCuentas}
        valorSeleccionado={cuentaSelec}
        onSeleccionar={onSeleccionarCuenta}
        formatearOpcion="SI"
      />
      <SelectorModal
        visible={isVisibleMov}
        onClose={() => setIsVisibleMov(false)}
        titulo={"Selecciona un tipo"}
        opciones={tipos_movimientos}
        valorSeleccionado={movSelec}
        onSeleccionar={onSeleccionarMov}
        formatearOpcion="SI"
      />
    </KeyboardAvoidingView>
  );
}
