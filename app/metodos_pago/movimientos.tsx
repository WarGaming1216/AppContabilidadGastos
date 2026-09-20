import EditarMovModal from "@/components/EditarMovModal";
import MyInput from "@/components/MyInput";
import MyText from "@/components/MyText";
import SelectorModal from "@/components/SelectorModal";
import { MetodosPago, Movimientos, TipoMov } from "@/interfaces/General_DB";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Pencil, Trash } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { formatearFecha, formatearMoneda } from "../../constants/functions";
import globalStyles from "../../constants/styles";

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

  // Guardamos el ID numérico del tipo seleccionado para el formulario nuevo
  const [tipoIdSeleccionado, setTipoIdSeleccionado] = useState<number | null>(
    null,
  );

  // Guardamos la lista de la BD: TipoCuenta[] ({ id, tipo_cuenta })
  const [tiposDB, setTiposDB] = useState<TipoMov[]>([]);

  // Carga los tipos de cuenta desde SQLite
  const cargarTipos = useCallback(async () => {
    try {
      const result = await db.getAllAsync<TipoMov>(
        "SELECT * FROM tipo_movimiento",
      );
      setTiposDB(result);
    } catch (error) {
      console.error("Error al obtener tipos de cuentas: ", error);
    }
  }, [db]);

  // Opciones en texto extraídas dinámicamente de la BD para el SelectorModal
  const opcionesModalTextos = tiposDB.map((t) => t.tipo_mov);

  const alCambiarFecha = (
    event: DateTimePickerEvent,
    fechaSeleccionada?: Date,
  ) => {
    if (event.type === "dismissed") {
      setMostrarCalendario(false);
      return;
    }

    setMostrarCalendario(Platform.OS === "ios");

    if (fechaSeleccionada) {
      setFecha(fechaSeleccionada);
    }

    setMostrarCalendario(false);
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
      cargarTipos();
    }, [cargarSaldos, cargarTipos]),
  );

  function onSeleccionarMov(nombreSeleccionado: string) {
    setMovSelec(nombreSeleccionado);

    const tipoEncontrado = tiposDB.find(
      (t) => t.tipo_mov === nombreSeleccionado,
    );
    if (tipoEncontrado) {
      setTipoIdSeleccionado(tipoEncontrado.id);
    }
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

  async function handleGuardarMovimiento() {
    if (!cuentaIdSelec) {
      console.error("No se ha seleccionado una cuenta.");
      return;
    }
    if (tipoIdSeleccionado === 0) {
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

    try {
      const result = await db.runAsync(
        `INSERT INTO movimientos(cuenta_id, tipo_movimiento, monto, concepto, fecha_hora) VALUES(?, ?, ?, ?, ?)`,
        [cuentaIdSelec, tipoIdSeleccionado, monto, concepto, fecha.toString()],
      );
      if (result && result.changes > 0) {
        console.log("El movimiento se registró con éxito.");
        setConcepto("");
        setMonto("");
        cargarSaldos();
      } else {
        console.error("Error: No se pudo generar el movimiento.");
      }
    } catch (error) {
      console.error("Ocurrió un error: ", error);
    }
  }

  async function eliminarMov(movimiento_id: number, mov_concepto: string) {
    if (!movimiento_id && movimiento_id < 0) {
      console.error("No se proporcionó un id válido");
    }

    Alert.alert(
      "Eliminar movimiento",
      `¿Estás seguro que quieres eliminar el movimiento ${mov_concepto}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await db.runAsync(
                `DELETE FROM movimientos WHERE id=?`,
                movimiento_id,
              );
              if (response && response.changes > 0) {
                cargarSaldos();
                console.error("Se eliminó el movimiento exitosamente.");
                return;
              }
            } catch (error) {
              console.error("Ocurrió un error: ", error);
              return;
            }
          },
        },
      ],
    );
  }

  async function editarMov(
    movimiento_id: number,
    mov_tipo: number,
    mov_concepto: string,
    mov_monto: number,
    mov_fecha: Date,
  ) {
    if (!movimiento_id && movimiento_id < 0) {
      console.error("No se proporcionó un id válido");
    }

    EditarMovModal(mov_tipo, mov_concepto, mov_monto, mov_fecha);
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
            onChangeText={(texto) => {
              const textoLimpio = texto.replace(/[^0-9.]/g, "");
              setMonto(textoLimpio);
            }}
            keyboardType="numeric"
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
              display={Platform.OS === "ios" ? "inline" : "default"}
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
                  <View style={[globalStyles.celdaAcciones]}>
                    <TouchableOpacity
                      onPress={() =>
                        editarMov(
                          movimiento.id,
                          movimiento.tipo_movimiento,
                          movimiento.concepto,
                          movimiento.monto,
                          movimiento.fecha_hora,
                        )
                      }
                    >
                      <Pencil color={"white"}></Pencil>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        eliminarMov(movimiento.id, movimiento.concepto)
                      }
                    >
                      <Trash color={"red"}></Trash>
                    </TouchableOpacity>
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
        titulo={"Cuentas"}
        opciones={nombresCuentas}
        valorSeleccionado={cuentaSelec}
        onSeleccionar={onSeleccionarCuenta}
        formatearOpcion="SI"
      />
      <SelectorModal
        visible={isVisibleMov}
        onClose={() => setIsVisibleMov(false)}
        titulo={"Tipos de movimiento"}
        opciones={opcionesModalTextos}
        valorSeleccionado={movSelec}
        onSeleccionar={onSeleccionarMov}
        formatearOpcion="SI"
      />
    </KeyboardAvoidingView>
  );
}
