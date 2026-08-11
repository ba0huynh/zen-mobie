import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import View from "@/components/ui/view";
import { Colors, useTheme } from "@/hooks/theme.hook";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { formatPrice } from "../home/components/massage-card";
import { useBookingView } from "./booking-view.hook";
import { Calendar, ChevronRight, Clock, Tag } from "lucide-react-native";
import DateTimeStep from "./components/date-time-step";

type TherapistGender = "male" | "female" | "either";
type BookingStep = "datetime" | "details";

export default function BookingView() {
    const { form, handleChange, handleSubmit, isSubmiting, selectedMassages } = useBookingView()
    const { colors } = useTheme()
    const styles = createStyles(colors)

    // Date & time is now its own step (like the reference booking widget): pick a
    // slot first, then move on to contact details / preferences / policy.
    const [step, setStep] = useState<BookingStep>(form.startTime ? "details" : "datetime")

    // Not part of the form hook yet — lift these up into useBookingView once the backend supports them.
    const [therapistGender, setTherapistGender] = useState<TherapistGender | null>(null)
    const [agreedToPolicy, setAgreedToPolicy] = useState(false)

    const handleDateTimeChange = (time: Date) => {
        handleChange("startTime", time.toISOString())
    }

    const groupedMassages = selectedMassages.reduce<(typeof selectedMassages[number] & { quantity: number })[]>(
        (summary, massage) => {
            const existingItem = summary.find(
                (item) =>
                    item.massageId === massage.massageId &&
                    item.duration === massage.duration &&
                    item.price === massage.price
            )

            if (existingItem) {
                existingItem.quantity += 1
                return summary
            }

            summary.push({ ...massage, quantity: 1 })
            return summary
        },
        []
    )

    const totalPrice = groupedMassages.reduce((sum, m) => sum + m.price * m.quantity, 0)
    const totalDuration = groupedMassages.reduce((sum, m) => sum + m.duration * m.quantity, 0)

    const canSubmit = !isSubmiting && groupedMassages.length > 0 && agreedToPolicy && !!form.startTime

    if (step === "datetime") {
        return (
            <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
                <View style={styles.accentBar} />
                <Text style={styles.pageTitle}>Choose date & time</Text>

                <DateTimeStep
                    value={form.startTime ? new Date(form.startTime) : null}
                    onChange={handleDateTimeChange}
                    onContinue={() => setStep("details")}
                />
            </ScrollView>
        )
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <View style={styles.accentBar} />
            <Text style={styles.pageTitle}>Confirm Booking</Text>

            <Pressable style={styles.card} onPress={() => setStep("datetime")}>
                <View style={styles.cardHeaderRow}>
                    <Calendar size={16} color={colors.textSecondary} />
                    <Text style={styles.cardHeaderText}>
                        {form.startTime
                            ? new Date(form.startTime).toLocaleDateString(undefined, {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })
                            : "Select a date"}
                    </Text>
                    <View style={styles.cardHeaderSpacer} />
                    <ChevronRight size={16} color={colors.textSecondary} />
                </View>

                {form.startTime ? (
                    <View style={styles.metaRow}>
                        <Clock size={14} color={colors.textSecondary} />
                        <Text style={styles.metaText}>
                            {new Date(form.startTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                            {"  ·  tap to change"}
                        </Text>
                    </View>
                ) : null}

                {groupedMassages.length === 0 ? (
                    <Text style={styles.emptyText}>No services selected yet.</Text>
                ) : (
                    <>
                        <View style={styles.divider} />
                        {groupedMassages.map((massage, index) => (
                            <View key={`${massage.massageId}-${massage.duration}-${index}`} style={styles.summaryRow}>
                                <View style={styles.summaryContent}>
                                    <Text style={styles.summaryName}>{massage.name}</Text>
                                    <Text style={styles.summaryMeta}>
                                        {massage.duration} mins
                                        {massage.quantity > 1 ? ` x${massage.quantity}` : ""}
                                    </Text>
                                </View>
                                <Text style={styles.summaryPrice}>
                                    {formatPrice(massage.price * massage.quantity)}
                                </Text>
                            </View>
                        ))}

                        <View style={styles.divider} />

                        <View style={styles.metaRow}>
                            <Clock size={14} color={colors.textSecondary} />
                            <Text style={styles.metaText}>{totalDuration} mins total</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Tag size={14} color={colors.textSecondary} />
                            <Text style={styles.priceTagText}>{formatPrice(totalPrice)}</Text>
                        </View>
                    </>
                )}
            </Pressable>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Contact details</Text>
                <Input
                    label="Phone"
                    required
                    value={form.phone}
                    onChangeText={(value) => handleChange("phone", value)}
                    placeholder="912 345 678"
                    keyboardType="phone-pad"
                />
                <Input
                    label="Address"
                    required
                    value={form.address}
                    onChangeText={(value) => handleChange("address", value)}
                    placeholder="Where should the therapist go?"
                />
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Input
                    value={form.note ?? ""}
                    onChangeText={(value) => handleChange("note", value)}
                    placeholder="Anything the therapist should know?"
                    multiline
                />
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Therapist gender preference</Text>
                <View style={styles.optionGroup}>
                    <Checkbox
                        label="Male"
                        checked={therapistGender === "male"}
                        onChange={() => setTherapistGender("male")}
                    />
                    <Checkbox
                        label="Female"
                        checked={therapistGender === "female"}
                        onChange={() => setTherapistGender("female")}
                    />
                    <Checkbox
                        label="Either"
                        checked={therapistGender === "either"}
                        onChange={() => setTherapistGender("either")}
                    />
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Cancellation policy</Text>
                <Text style={styles.policyText}>
                    A therapist is reserved exclusively for you once the booking is confirmed. Cancelling
                    close to the appointment time may incur a fee:
                </Text>
                <View style={styles.policyList}>
                    <Text style={styles.policyItem}>• More than 3 hours before — free</Text>
                    <Text style={styles.policyItem}>• 1–2 hours before — partial fee applies</Text>
                    <Text style={styles.policyItem}>• Within the hour or no-show — full fee applies</Text>
                </View>

                <View style={styles.divider} />

                <Checkbox
                    label="I agree to maintain professional conduct during the session. Inappropriate behavior will be reported."
                    checked={agreedToPolicy}
                    onChange={setAgreedToPolicy}
                />
            </View>

            <Pressable
                disabled={!canSubmit}
                onPress={() => handleSubmit()}
                style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            >
                <Text style={styles.submitText}>
                    {isSubmiting ? "Submitting..." : "Confirm booking"}
                </Text>
            </Pressable>
        </ScrollView>
    )
}

const createStyles = (colors: Colors) => StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 16,
        gap: 14,
        width: "100%",
        maxWidth: 480,
        alignSelf: "center",
    },
    accentBar: {
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.accent,
        marginBottom: 2,
    },
    pageTitle: {
        color: colors.textPrimary,
        fontSize: 20,
        fontWeight: "700",
    },
    card: {
        gap: 10,
        padding: 16,
        borderRadius: 14,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    cardHeaderText: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    cardHeaderSpacer: {
        flex: 1,
    },
    sectionTitle: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
    },
    summaryContent: {
        flex: 1,
        gap: 2,
    },
    summaryName: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "600",
    },
    summaryMeta: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    summaryPrice: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "700",
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginVertical: 2,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    priceTagText: {
        color: colors.accent,
        fontSize: 15,
        fontWeight: "700",
    },
    optionGroup: {
        gap: 12,
    },
    policyText: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 19,
    },
    policyList: {
        gap: 4,
    },
    policyItem: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 19,
    },
    submitButton: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        marginBottom: 16,
        marginTop: 4,
    },
    submitButtonDisabled: {
        backgroundColor: colors.accentDisabled,
    },
    submitText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
})