import { Pressable, StyleProp, ViewStyle } from "react-native";
import { ReactNode } from "react";

type Props = {
    style?: StyleProp<ViewStyle>;
    children: ReactNode;
    onPress?: () => void;
}

export default function Button({ children, style, onPress }: Props) {
  return (
    <Pressable style={style} onPress={onPress}>
      {children}
    </Pressable>
  );
}