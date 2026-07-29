import { ReactNode } from "react";
import { View as RNView, ViewStyle } from "react-native";

type Props ={ children: ReactNode, style?: ViewStyle }

export default function View({ children, style }: Props) {
    return (
        <RNView style={style}>
            {children}
        </RNView>
    );
}