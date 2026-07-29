import RNDateTimePicker from "@react-native-community/datetimepicker";

type Props = {
    value: Date,
    onValueChange: (date: Date) => void,
    
}

export default function DateTimePicker({ value, onValueChange }: Props) {
    return <RNDateTimePicker value={value} onValueChange={(_, v) => onValueChange(v)} />
}