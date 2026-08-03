import { Colors, useTheme } from "@/hooks/theme.hook";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import View from "@/components/ui/view";

type Props = {
    day: Date,
    value: Date | null,
    onChange: (date: Date) => void,
    startHour?: number,
    endHour?: number,
    intervalMinutes?: number,
    // How much lead time bookings need, e.g. 120 for "book 2 hours before".
    // Defaults to 0 (only truly-past times are blocked) — bump this if the
    // business needs advance notice, per the "Book 2 hours before" line
    // in the reference screenshots.
    minNoticeMinutes?: number,
}

export default function TimeSlotPicker({
    day,
    value,
    onChange,
    startHour = 9,
    endHour = 21,
    intervalMinutes = 30,
    minNoticeMinutes = 0,
}: Props) {
    const { colors } = useTheme()
    const styles = createStyles(colors)

    const slots = useMemo(() => {
        const result: Date[] = []
        const cursor = new Date(day)
        cursor.setHours(startHour, 0, 0, 0)
        const end = new Date(day)
        end.setHours(endHour, 0, 0, 0)

        while (cursor <= end) {
            result.push(new Date(cursor))
            cursor.setMinutes(cursor.getMinutes() + intervalMinutes)
        }
        return result
    }, [day, startHour, endHour, intervalMinutes])

    const earliestBookable = useMemo(() => {
        const cutoff = new Date()
        cutoff.setMinutes(cutoff.getMinutes() + minNoticeMinutes)
        return cutoff
    }, [minNoticeMinutes])

    return (
        <View style={styles.grid}>
            {slots.map((slot) => {
                const isPast = slot < earliestBookable
                const isSelected = value ? slot.getTime() === value.getTime() : false

                return (
                    <Pressable
                        key={slot.toISOString()}
                        disabled={isPast}
                        onPress={() => onChange(slot)}
                        style={[
                            styles.slot,
                            isSelected && styles.slotSelected,
                            isPast && styles.slotDisabled,
                        ]}
                    >
                        <Text
                            style={[
                                styles.slotText,
                                isSelected && styles.slotTextSelected,
                                isPast && styles.slotTextDisabled,
                            ]}
                        >
                            {slot.toLocaleTimeString(undefined, {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </Text>
                    </Pressable>
                )
            })}
        </View>
    )
}

const createStyles = (colors: Colors) => StyleSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    slot: {
        borderWidth: 1,
        borderColor: colors.textSecondary,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    slotSelected: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    slotDisabled: {
        borderColor: colors.border,
    },
    slotText: {
        color: colors.textPrimary,
        fontSize: 13,
        fontWeight: "600",
    },
    slotTextSelected: {
        color: "#fff",
    },
    slotTextDisabled: {
        color: colors.border,
    },
})