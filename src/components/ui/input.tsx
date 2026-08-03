import { Colors, useTheme } from "@/hooks/theme.hook";
import { ReactNode, useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

type Props = {
    value: string,
    onChangeText: (value: string) => void,
    label?: string,
    required?: boolean,
    placeholder?: string,
    multiline?: boolean,
    keyboardType?: TextInputProps["keyboardType"],
    leftAdornment?: ReactNode,
}

export default function Input({
    value,
    onChangeText,
    label,
    required,
    placeholder,
    multiline,
    keyboardType,
    leftAdornment,
}: Props) {
    const { colors } = useTheme()
    const styles = createStyles(colors)
    const [isFocused, setIsFocused] = useState(false)

    return (
        <View style={styles.wrap}>
            {label ? (
                <Text style={styles.label}>
                    {label}
                    {required ? <Text style={styles.required}> (Required)</Text> : null}
                </Text>
            ) : null}
            <View
                style={[
                    styles.box,
                    multiline && styles.boxMultiline,
                    isFocused && styles.boxFocused,
                ]}
            >
                {leftAdornment ? (
                    <>
                        <View style={styles.adornment}>{leftAdornment}</View>
                        <View style={styles.adornmentDivider} />
                    </>
                ) : null}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                    multiline={multiline}
                    keyboardType={keyboardType}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={[
                        styles.input,
                        multiline && styles.inputMultiline,
                        // Web draws its own square focus ring on the native <input>/<textarea>
                        // which doesn't match the rounded `box` border above it — kill it and
                        // let `boxFocused` (rounded, on the outer View) be the only focus cue.
                        { outlineStyle: "none" } as any,
                    ]}
                />
            </View>
        </View>
    )
}

const createStyles = (colors: Colors) => StyleSheet.create({
    wrap: {
        gap: 10,
    },
    label: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    required: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "400",
    },
    box: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.textSecondary,
        borderRadius: 12,
    },
    boxMultiline: {
        alignItems: "flex-start",
    },
    boxFocused: {
        borderColor: colors.accent,
        borderWidth: 1.5,
    },
    adornment: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingLeft: 16,
        paddingVertical: 14,
    },
    adornmentDivider: {
        width: StyleSheet.hairlineWidth,
        alignSelf: "stretch",
        marginVertical: 10,
        backgroundColor: colors.textSecondary,
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: colors.textPrimary,
        fontSize: 15,
    },
    inputMultiline: {
        minHeight: 100,
        textAlignVertical: "top",
    },
})