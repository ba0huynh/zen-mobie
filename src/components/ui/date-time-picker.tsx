import { Colors, useTheme } from "@/hooks/theme.hook";
import RNDateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Platform, Pressable, StyleSheet, Text } from "react-native";

type Props = {
    value: Date,
    onValueChange: (date: Date) => void,
}

export default function DateTimePicker({ value, onValueChange }: Props) {
    const { colors } = useTheme()
    const styles = createStyles(colors)

    // Web: no native module exists for this package, so render a plain HTML input instead.
    if (Platform.OS === "web") {
        return (
            <input
                type="datetime-local"
                value={toLocalInputValue(value)}
                onChange={(e) => {
                    const next = fromLocalInputValue(e.target.value)
                    if (next) onValueChange(next)
                }}
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    padding: "12px 14px",
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontFamily: "inherit",
                }}
            />
        )
    }

    // Android: no combined "datetime" mode, and the library's own docs steer you
    // away from mounting the picker inline — chain two imperative dialogs instead.
    if (Platform.OS === "android") {
        const openPicker = () => {
            DateTimePickerAndroid.open({
                value,
                mode: "date",
                onChange: (dateEvent, selectedDate) => {
                    if (dateEvent.type !== "set" || !selectedDate) return

                    DateTimePickerAndroid.open({
                        value: selectedDate,
                        mode: "time",
                        onChange: (timeEvent, selectedTime) => {
                            if (timeEvent.type !== "set" || !selectedTime) return

                            const combined = new Date(selectedDate)
                            combined.setHours(selectedTime.getHours(), selectedTime.getMinutes())
                            onValueChange(combined)
                        },
                    })
                },
            })
        }

        return (
            <Pressable onPress={openPicker} style={styles.trigger}>
                <Text style={styles.triggerText}>
                    {value.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </Text>
            </Pressable>
        )
    }

    // iOS supports a combined mode and can stay mounted inline.
    return (
        <RNDateTimePicker
            value={value}
            mode="datetime"
            onChange={(_, selected) => {
                if (selected) onValueChange(selected)
            }}
        />
    )
}

// datetime-local inputs use "YYYY-MM-DDTHH:mm" in local time, with no timezone suffix.
function toLocalInputValue(date: Date) {
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromLocalInputValue(value: string): Date | null {
    if (!value) return null
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

const createStyles = (colors: Colors) => StyleSheet.create({
    trigger: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    triggerText: {
        color: colors.textPrimary,
        fontSize: 14,
    },
})