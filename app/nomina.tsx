import MyInput from "@/components/MyInput";
import MyText from "@/components/MyText";
import { formatearFecha } from "@/constants/functions";
import globalStyles from "@/constants/styles";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Trabajo() {
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [fecha, setFecha] = useState(new Date());

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        // ref={scrollViewRef}
        style={globalStyles.scrollView}
        contentContainerStyle={globalStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          {/* Formulario para ingresar datos */}
          <View style={globalStyles.caja}>
            <Text style={[globalStyles.label, globalStyles.dark]}>Cuenta</Text>
            <TouchableOpacity style={[globalStyles.boton_select]}>
              <Text style={[globalStyles.boton_text, globalStyles.dark]}>
                Seleccione la cuenta
              </Text>
            </TouchableOpacity>
            <Text style={[globalStyles.label, globalStyles.dark]}>
              Método de pago
            </Text>
            <TouchableOpacity style={[globalStyles.boton_select]}>
              <Text style={[globalStyles.boton_text, globalStyles.dark]}>
                Transferencia
              </Text>
            </TouchableOpacity>
            <Text style={[globalStyles.label, globalStyles.dark]}>Monto</Text>
            <MyInput placeholder="($) 00,000.00" />
            <Text style={[globalStyles.label, globalStyles.dark]}>Fecha</Text>
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
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
