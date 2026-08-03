import { Colors, useTheme } from "@/hooks/theme.hook";
import { Check } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
    checked: boolean,
    onChange: (checked: boolean) => void,
    label: string,
}

export default function Checkbox({ checked, onChange, label }: Props) {
    const { colors } = useTheme()
    const styles = createStyles(colors)

    return (
        <Pressable style={styles.row} onPress={() => onChange(!checked)} hitSlop={8}>
            <View style={[styles.box, checked && styles.boxChecked]}>
                {checked && <Check size={14} color="#fff" />}
            </View>
            <Text style={styles.label}>{label}</Text>
        </Pressable>
    )
}

const createStyles = (colors: Colors) => StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    box: {
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: colors.textSecondary,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 1,
    },
    boxChecked: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    label: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 13,
        lineHeight: 18,
    },
})