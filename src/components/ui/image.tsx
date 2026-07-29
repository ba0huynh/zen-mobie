import { Image as RNImage, ImageStyle } from "react-native";

type Props = {
    style?: ImageStyle;
    source: string
}

export default function Image({ style, source }: Props) {
    return <RNImage source={{ uri: source }} style={style} />
}