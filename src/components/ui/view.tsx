import { ReactNode } from "react";
import { LayoutChangeEvent, View as RNView, StyleProp, ViewStyle } from "react-native";

type Props = {
    children?: ReactNode,
    style?: StyleProp<ViewStyle>,
    onLayout?: (event: LayoutChangeEvent) => void,
}

export default function View({ children, style, onLayout }: Props) {
    return (
        <RNView style={style} onLayout={onLayout}>
            {children}
        </RNView>
    );
}
