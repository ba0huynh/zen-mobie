import { Text as RNText, StyleProp, TextStyle } from "react-native";
import { ReactNode } from "react";

type Props = {
    style?: StyleProp<TextStyle>;
    children: ReactNode;
    onPress?: () => void;
}

export default function Text({ children, style, onPress }: Props) {
  return (
    <RNText style={style} onPress={onPress}>
      {children}
    </RNText>
  );
}