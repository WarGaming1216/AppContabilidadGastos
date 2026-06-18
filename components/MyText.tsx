import { globalStyles } from "@/app/constants/styles";
import { Text, type TextProps, useColorScheme } from "react-native";

// Extendemos las propiedades nativas del Text de React Native
interface MyTextProps extends TextProps {
  // children es una propiedad nativa de React para el contenido dentro de las etiquetas
  children: React.ReactNode;
}

export default function MyText({ children, style, ...rest }: MyTextProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <Text
      // Combinamos:
      // 1. El estilo base (label)
      // 2. El color automático por el tema
      // 3. Cualquier estilo extra que le pases desde fuera (style)
      style={[
        globalStyles.label,
        isDark ? globalStyles.dark : globalStyles.light,
        style,
      ]}
      // El operador ...rest arrastra automáticamente propiedades como numberOfLines, onPress, etc.
      {...rest}
    >
      {children}
    </Text>
  );
}
