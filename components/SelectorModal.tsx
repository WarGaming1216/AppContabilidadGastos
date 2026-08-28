import { formatearTexto } from "@/app/constants/functions";
import globalStyles from "@/app/constants/styles"; // Ajusta la ruta a tus estilos
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface SelectorModalProps {
  visible: boolean;
  onClose: () => void;
  titulo: string;
  opciones: string[];
  valorSeleccionado: string;
  onSeleccionar: (opcion: string) => void;
  // Opcional: si tienes una función para formatear el texto visible (ej. formatearTexto)
  formatearOpcion?: string;
}

export default function SelectorModal({
  visible,
  onClose,
  titulo,
  opciones,
  valorSeleccionado,
  onSeleccionar,
  formatearOpcion,
}: SelectorModalProps) {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={globalStyles.modalOverlay}>
        <View style={globalStyles.modalContentDark}>
          <Text style={globalStyles.modalTituloDark}>{titulo}</Text>

          {opciones.map((opcion) => (
            <TouchableOpacity
              key={opcion}
              style={[
                globalStyles.opcion,
                valorSeleccionado === opcion && globalStyles.opcionSeleccionada,
              ]}
              onPress={() => {
                onSeleccionar(opcion);
                onClose();
              }}
            >
              <Text
                style={[
                  globalStyles.textoOpcionDark,
                  valorSeleccionado === opcion &&
                    globalStyles.textoOpcionSeleccionada,
                ]}
              >
                {formatearOpcion ? formatearTexto(opcion) : opcion}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={globalStyles.botonCerrar} onPress={onClose}>
            <Text style={globalStyles.textoCerrar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
