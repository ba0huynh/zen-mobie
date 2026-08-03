import { Colors, useTheme } from "@/hooks/theme.hook";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import View from "@/components/ui/view";

type Props = {
    value: Date | null,
    onChange: (date: Date) => void,
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function startOfDay(date: Date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}

export function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function DayPicker({ value, onChange }: Props) {
    const { colors } = useTheme()
    const styles = createStyles(colors)

    const today = useMemo(() => startOfDay(new Date()), [])
    const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

    const isCurrentMonthVisible =
        visibleMonth.getFullYear() === today.getFullYear() && visibleMonth.getMonth() === today.getMonth()

    const goToPrevMonth = () => {
        if (isCurrentMonthVisible) return // nothing selectable in a fully-past month
        setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))
    }

    const goToNextMonth = () => {
        setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))
    }

    const goToToday = () => {
        setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1))
        onChange(today)
    }

    const cells = useMemo(() => {
        const year = visibleMonth.getFullYear()
        const month = visibleMonth.getMonth()
        const firstDayOfMonth = new Date(year, month, 1)
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const leadingBlanks = firstDayOfMonth.getDay() // 0 = Sunday

        const result: (Date | null)[] = []
        for (let i = 0; i < leadingBlanks; i++) result.push(null)
        for (let day = 1; day <= daysInMonth; day++) result.push(new Date(year, month, day))
        return result
    }, [visibleMonth])

    return (
        <View style={styles.wrap}>
            <View style={styles.headerRow}>
                <Pressable onPress={goToToday} style={styles.todayButton} hitSlop={6}>
                    <Text style={styles.todayButtonText}>Today</Text>
                </Pressable>
                <Text style={styles.monthLabel}>
                    {visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </Text>
                <View style={styles.navGroup}>
                    <Pressable
                        onPress={goToPrevMonth}
                        disabled={isCurrentMonthVisible}
                        style={[styles.navButton, isCurrentMonthVisible && styles.navButtonDisabled]}
                        hitSlop={8}
                    >
                        <ChevronLeft
                            size={16}
                            color={isCurrentMonthVisible ? colors.border : colors.textPrimary}
                        />
                    </Pressable>
                    <Pressable onPress={goToNextMonth} style={styles.navButton} hitSlop={8}>
                        <ChevronRight size={16} color={colors.textPrimary} />
                    </Pressable>
                </View>
            </View>

            <View style={styles.weekdayRow}>
                {WEEKDAY_LABELS.map((label) => (
                    <Text key={label} style={styles.weekdayLabel}>{label}</Text>
                ))}
            </View>

            <View style={styles.grid}>
                {cells.map((date, index) => {
                    if (!date) return <View key={`blank-${index}`} style={styles.dayCell} />

                    const isPast = date < today
                    const isToday = isSameDay(date, today)
                    const isSelected = value ? isSameDay(date, value) : false

                    return (
                        <Pressable
                            key={date.toISOString()}
                            disabled={isPast}
                            onPress={() => onChange(date)}
                            style={[
                                styles.dayCell,
                                styles.dayCircle,
                                isSelected && styles.dayCircleSelected,
                                isPast && styles.dayCircleDisabled,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.dayText,
                                    isSelected && styles.dayTextSelected,
                                    isPast && styles.dayTextDisabled,
                                ]}
                            >
                                {date.getDate()}
                            </Text>
                            {isToday && !isSelected ? <View style={styles.todayDot} /> : null}
                        </Pressable>
                    )
                })}
            </View>
        </View>
    )
}

const createStyles = (colors: Colors) => StyleSheet.create({
    wrap: {
        gap: 12,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    todayButton: {
        borderWidth: 1,
        borderColor: colors.textSecondary,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    todayButtonText: {
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: "600",
    },
    monthLabel: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "700",
    },
    navGroup: {
        flexDirection: "row",
        gap: 6,
    },
    navButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.textSecondary,
    },
    navButtonDisabled: {
        borderColor: colors.border,
    },
    weekdayRow: {
        flexDirection: "row",
    },
    weekdayLabel: {
        width: `${100 / 7}%`,
        textAlign: "center",
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: "600",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    dayCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    dayCircle: {
        borderWidth: 1,
        borderColor: colors.textSecondary,
        borderRadius: 999,
        margin: 2,
    },
    dayCircleSelected: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    dayCircleDisabled: {
        borderColor: colors.border,
    },
    dayText: {
        color: colors.textPrimary,
        fontSize: 13,
        fontWeight: "600",
    },
    dayTextSelected: {
        color: "#fff",
    },
    dayTextDisabled: {
        color: colors.border,
    },
    todayDot: {
        position: "absolute",
        bottom: 6,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.accent,
    },
})