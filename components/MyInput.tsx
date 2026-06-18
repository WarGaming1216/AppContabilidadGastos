import { globalStyles } from "@/app/constants/styles";
import { TextInput, type TextInputProps, useColorScheme } from "react-native";

// type MyInputProps = TextInputProps; ESTE TOMA LA PROPIEDAD SIN CAMBIARLA Y LA USA
// interface MyInputProps extends TextInputProps {} ESTA ES UNA INTERFAZ VACIA PORQUE ACTUALMENTE NO AÑADE NADA NUEVO A TextInputProps;
// Extendemos las propiedades nativas del TextInput
interface MyInputProps extends TextInputProps {
  mostrarBordeError?: boolean; // Un ejemplo de propiedad personalizada futura
}

export default function MyInput({ style, ...rest }: MyInputProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <TextInput
      style={[
        globalStyles.input,
        isDark ? globalStyles.dark : globalStyles.light,
        style,
      ]}
      // Permite que cambie el color del texto que parpadea (cursor) según el tema
      cursorColor={isDark ? "white" : "black"}
      // Permite cambiar el color del texto de ayuda (placeholder) dinámicamente
      placeholderTextColor={isDark ? "#888" : "#aaa"}
      {...rest}
    />
  );
}
