import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Calendar, ChevronLeft, ChevronRight, Globe, List } from "lucide-react-native";
import View from "@/components/ui/view";
import { isSameDay, startOfDay } from "@/components/ui/day-picker";
import { Colors, useTheme } from "@/hooks/theme.hook";

type DateTimeStepProps = {
    value: Date | null;
    onChange: (date: Date) => void;
    onContinue: () => void;
    /** How many upcoming days to list in the agenda view. */
    daysAhead?: number;
    /** Minimum number of hours from now before a slot can be booked. */
    leadTimeHours?: number;
    /** Business hours, 24h clock. */
    startHour?: number;
    endHour?: number;
    slotMinutes?: number;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getOrdinalDay(day: number) {
    if (day % 10 === 1 && day !== 11) return `${day}st`;
    if (day % 10 === 2 && day !== 12) return `${day}nd`;
    if (day % 10 === 3 && day !== 13) return `${day}rd`;
    return `${day}th`;
}

function formatDayHeaderParts(day: Date) {
    return {
        weekday: day.toLocaleDateString(undefined, { weekday: "long" }),
        monthDay: `${day.toLocaleDateString(undefined, { month: "long" })} ${getOrdinalDay(day.getDate())}`,
    };
}

function addDays(day: Date, amount: number) {
    const next = new Date(day);
    next.setDate(next.getDate() + amount);
    return next;
}

function addMonths(day: Date, amount: number) {
    const next = new Date(day);
    next.setMonth(next.getMonth() + amount, 1);
    return next;
}

function getWeekStart(date: Date) {
    const start = startOfDay(date);
    start.setDate(start.getDate() - start.getDay());
    return start;
}

function weekLabelFor(weekStart: Date, todayWeekStart: Date) {
    const diffWeeks = Math.round((weekStart.getTime() - todayWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (diffWeeks <= 0) return "This Week";
    if (diffWeeks === 1) return "Next Week";
    return `Week of ${weekStart.toLocaleDateString(undefined, { month: "long", day: "numeric" })}`;
}

function buildSlotsForDay(
    day: Date,
    opts: Required<Pick<DateTimeStepProps, "startHour" | "endHour" | "slotMinutes" | "leadTimeHours">>
) {
    const { startHour, endHour, slotMinutes, leadTimeHours } = opts;
    const earliestBookable = new Date(Date.now() + leadTimeHours * 60 * 60 * 1000);
    const slots: Date[] = [];

    const cursor = new Date(day);
    cursor.setHours(startHour, 0, 0, 0);
    const end = new Date(day);
    end.setHours(endHour, 0, 0, 0);

    while (cursor <= end) {
        if (cursor >= earliestBookable) {
            slots.push(new Date(cursor));
        }
        cursor.setMinutes(cursor.getMinutes() + slotMinutes);
    }

    return slots;
}

export default function DateTimeStep({
    value,
    onChange,
    onContinue,
    daysAhead = 14,
    leadTimeHours = 2,
    startHour = 9,
    endHour = 21,
    slotMinutes = 30,
}: DateTimeStepProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const today = useMemo(() => startOfDay(new Date()), []);
    const [mode, setMode] = useState<"agenda" | "month">("agenda");
    const [anchorDay, setAnchorDay] = useState<Date>(value ? startOfDay(value) : today);
    const [monthCursor, setMonthCursor] = useState<Date>(new Date(anchorDay.getFullYear(), anchorDay.getMonth(), 1));

    const agendaDays = useMemo(() => {
        return Array.from({ length: daysAhead }, (_, i) => addDays(anchorDay, i))
            .map((day) => ({
                day,
                weekStart: getWeekStart(day),
                slots: buildSlotsForDay(day, { startHour, endHour, slotMinutes, leadTimeHours }),
            }))
            .filter(({ slots }) => slots.length > 0);
    }, [anchorDay, startHour, endHour, slotMinutes, leadTimeHours]);

    const monthLabel = (mode === "agenda" ? anchorDay : monthCursor).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
    });

    const goToToday = () => {
        setAnchorDay(today);
        setMonthCursor(new Date(today.getFullYear(), today.getMonth(), 1));
        setMode("agenda");
    };

    const openMonth = () => {
        setMonthCursor(new Date(anchorDay.getFullYear(), anchorDay.getMonth(), 1));
        setMode("month");
    };

    const pickDayFromMonth = (day: Date) => {
        setAnchorDay(day);
        setMode("agenda");
    };

    const monthCells = useMemo(() => {
        const year = monthCursor.getFullYear();
        const month = monthCursor.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstWeekday = new Date(year, month, 1).getDay();
        const cells: (Date | null)[] = [
            ...Array.from({ length: firstWeekday }, () => null),
            ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
        ];
        return cells;
    }, [monthCursor]);

    const canGoPrevMonth =
        monthCursor.getFullYear() > today.getFullYear() ||
        (monthCursor.getFullYear() === today.getFullYear() && monthCursor.getMonth() > today.getMonth());

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.todayButton} onPress={goToToday}>
                    <Text style={styles.todayButtonText}>Today</Text>
                </Pressable>

                {mode === "month" ? (
                    <View style={styles.monthNav}>
                        <Pressable
                            hitSlop={8}
                            disabled={!canGoPrevMonth}
                            onPress={() => setMonthCursor((prev) => addMonths(prev, -1))}
                            style={styles.chevronButton}
                        >
                            <ChevronLeft size={18} color={canGoPrevMonth ? colors.textPrimary : colors.textSecondary} />
                        </Pressable>
                        <Text style={styles.headerTitle}>{monthLabel}</Text>
                        <Pressable hitSlop={8} onPress={() => setMonthCursor((prev) => addMonths(prev, 1))} style={styles.chevronButton}>
                            <ChevronRight size={18} color={colors.textPrimary} />
                        </Pressable>
                    </View>
                ) : (
                    <Text style={styles.headerTitle}>{monthLabel}</Text>
                )}

                <Pressable
                    hitSlop={8}
                    onPress={() => (mode === "agenda" ? openMonth() : setMode("agenda"))}
                    style={styles.toggleButton}
                >
                    {mode === "agenda" ? (
                        <Calendar size={18} color={colors.textPrimary} />
                    ) : (
                        <List size={18} color={colors.textPrimary} />
                    )}
                </Pressable>
            </View>

            <View style={styles.divider} />

            {mode === "agenda" ? (
                <ScrollView
                    key={anchorDay.toDateString()}
                    style={styles.agendaScroll}
                    contentContainerStyle={styles.agendaContent}
                >
                    {agendaDays.length === 0 ? (
                        <Text style={styles.emptyText}>No time slots available right now.</Text>
                    ) : (
                        agendaDays.map(({ day, weekStart, slots }, index) => {
                            const isToday = isSameDay(day, today);
                            const { weekday, monthDay } = formatDayHeaderParts(day);
                            const previousWeekStart = index > 0 ? agendaDays[index - 1].weekStart : null;
                            const showWeekLabel = index === 0 || weekStart.getTime() !== previousWeekStart?.getTime();

                            return (
                                <View key={day.toISOString()} style={styles.daySection}>
                                    {showWeekLabel ? (
                                        <Text style={styles.weekLabel}>{weekLabelFor(weekStart, getWeekStart(today))}</Text>
                                    ) : null}
                                    <View style={styles.dayHeaderRow}>
                                        {isToday ? (
                                            <View style={styles.todayBadge}>
                                                <Text style={styles.todayBadgeText}>TODAY</Text>
                                            </View>
                                        ) : null}
                                        <Text style={styles.dayHeaderText}>
                                            <Text style={styles.dayHeaderWeekday}>{weekday}</Text>{" "}
                                            <Text style={styles.dayHeaderDate}>{monthDay}</Text>
                                        </Text>
                                    </View>

                                    <View style={styles.slotGrid}>
                                        {slots.map((slot) => {
                                            const isSelected = value?.getTime() === slot.getTime();
                                            return (
                                                <Pressable
                                                    key={slot.toISOString()}
                                                    onPress={() => onChange(slot)}
                                                    style={[styles.slotPill, isSelected && styles.slotPillSelected]}
                                                >
                                                    <Text style={[styles.slotPillText, isSelected && styles.slotPillTextSelected]}>
                                                        {slot.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            ) : (
                <View style={styles.monthContent}>
                    <View style={styles.weekdayRow}>
                        {WEEKDAY_LABELS.map((label) => (
                            <Text key={label} style={styles.weekdayLabel}>
                                {label}
                            </Text>
                        ))}
                    </View>

                    <View style={styles.monthGrid}>
                        {monthCells.map((cellDay, index) => {
                            if (!cellDay) {
                                return <View key={`blank-${index}`} style={styles.dayCell} />;
                            }

                            const isPast = cellDay < today;
                            const isToday = isSameDay(cellDay, today);
                            const isSelectedDay = value ? isSameDay(cellDay, value) : false;

                            return (
                                <View key={cellDay.toISOString()} style={styles.dayCell}>
                                    <Pressable
                                        disabled={isPast}
                                        onPress={() => pickDayFromMonth(cellDay)}
                                        style={[
                                            styles.dayCircle,
                                            !isPast && styles.dayCircleAvailable,
                                            isSelectedDay && styles.dayCircleSelected,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.dayCircleText,
                                                isPast && styles.dayCircleTextDisabled,
                                                isSelectedDay && styles.dayCircleTextSelected,
                                            ]}
                                        >
                                            {cellDay.getDate()}
                                        </Text>
                                    </Pressable>
                                    {isToday && !isSelectedDay ? <View style={styles.todayDot} /> : null}
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}

            <View style={styles.footer}>
                <Globe size={13} color={colors.textSecondary} />
                <Text style={styles.footerText}>
                    Time zone{"  "}
                    <Text style={styles.footerTextStrong}>
                        {Intl.DateTimeFormat().resolvedOptions().timeZone} (
                        {new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })})
                    </Text>
                </Text>
            </View>

            {value ? (
                <Pressable style={styles.continueButton} onPress={onContinue}>
                    <Text style={styles.continueButtonText}>
                        Continue with {value.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} at{" "}
                        {value.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                    </Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        width: "100%",
        maxWidth: 480,
        alignSelf: "center",
        borderRadius: 14,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
    },
    todayButton: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    todayButtonText: {
        color: colors.textPrimary,
        fontSize: 13,
        fontWeight: "600",
    },
    headerTitle: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    monthNav: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    chevronButton: {
        padding: 4,
    },
    toggleButton: {
        padding: 6,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
    },
    agendaScroll: {
        maxHeight: 460,
    },
    agendaContent: {
        padding: 16,
        gap: 18,
    },
    weekLabel: {
        alignSelf: "center",
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 13,
        textAlign: "center",
    },
    daySection: {
        gap: 10,
    },
    dayHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    todayBadge: {
        backgroundColor: colors.accent,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    todayBadgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    dayHeaderText: {
        fontSize: 14,
    },
    dayHeaderWeekday: {
        color: colors.textPrimary,
        fontWeight: "700",
    },
    dayHeaderDate: {
        color: colors.textSecondary,
        fontWeight: "400",
    },
    slotGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    slotPill: {
        flexBasis: "31%",
        flexGrow: 0,
        borderWidth: 1,
        borderColor: colors.accent,
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
    },
    slotPillSelected: {
        backgroundColor: colors.accent,
    },
    slotPillText: {
        color: colors.textPrimary,
        fontSize: 13,
        fontWeight: "600",
    },
    slotPillTextSelected: {
        color: "#fff",
    },
    monthContent: {
        padding: 16,
        gap: 10,
    },
    weekdayRow: {
        flexDirection: "row",
    },
    weekdayLabel: {
        width: `${100 / 7}%`,
        textAlign: "center",
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: "600",
    },
    monthGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    dayCell: {
        width: `${100 / 7}%`,
        alignItems: "center",
        paddingVertical: 6,
        gap: 4,
    },
    dayCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
    },
    dayCircleAvailable: {
        borderWidth: 1,
        borderColor: colors.accent,
    },
    dayCircleSelected: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    dayCircleText: {
        color: colors.textPrimary,
        fontSize: 13,
        fontWeight: "600",
    },
    dayCircleTextDisabled: {
        color: colors.textSecondary,
    },
    dayCircleTextSelected: {
        color: "#fff",
    },
    todayDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.accent,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    footerTextStrong: {
        color: colors.textPrimary,
        fontWeight: "600",
    },
    continueButton: {
        margin: 16,
        marginTop: 0,
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    continueButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});