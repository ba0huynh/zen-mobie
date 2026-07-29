import { TextInput } from "react-native";

type Props = {
    value: string,
    onChangeText: (value: string) => void,
}

export default function Input({ value, onChangeText }: Props) {
    return (
        <TextInput value={value} onChangeText={onChangeText} />
    )
}