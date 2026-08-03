import { ReactNode } from "react";
import { View as RNView, StyleProp, ViewStyle } from "react-native";

type Props = { children?: ReactNode, style?: StyleProp<ViewStyle> }

export default function View({ children, style }: Props) {
    return (
        <RNView style={style}>
            {children}
        </RNView>
    );
}