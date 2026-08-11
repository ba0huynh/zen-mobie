import BookingShell from "@/components/booking-shell";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import PhoneInput from "@/components/ui/phone-input";
import View from "@/components/ui/view";
import BRAND from "@/constants/brand";
import { Colors, useTheme } from "@/hooks/theme.hook";
import { router } from "expo-router";
import { Check, ChevronLeft, Clock, Globe, MapPin, Pencil, Tag } from "lucide-react-native";
import { useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { formatDuration, formatPrice } from "../home/components/massage-card";
import {
    BOOKING_FIELDS,
    BookingField,
    GENDER_LABELS,
    PAYMENT_LABELS,
    PaymentMethod,
    TherapistGender,
    useBookingView,
} from "./booking-view.hook";
import DateTimeStep from "./components/date-time-step";
import PlacePicker from "./components/place-picker";

type BookingStep = "datetime" | "details";

const SUCCESS_COLOR = "#22A06B";

const NAME_HELPER =
    "For more than 1 person booked, please include the other person's name separated by comma in the notes below.";
const SMS_DISCLAIMER =
    "By checking this box, you agree to receive transactional SMS messages. Message frequency varies. Message rates may apply. Text HELP for help. Text STOP to stop.";
const GENDER_HELPER =
    "The 'Either' option will ensure the client will get the therapist who is immediately available regardless of gender.";
const PAYMENT_TITLE =
    "Payment will be collected by the attending therapist by QR Code or by Cash";
const PAYMENT_BANKS =
    "Momo, ZaloPay, EcoPay or any Vietnamese Bank (MB, VietcomBank, VietinBank, TechcomBank, BIDV, OCB, SacomBank, ACB, SHB, VPBank, HDBank, VIB, SeABank, and TPBank) - Therapist will present QR Code after the session.";
const CANCELLATION_INTRO =
    "Please note that once a booking is made, we have reserved a therapist exclusively for you. Cancellation fees are determined by the time the booking is cancelled by the client.";
const CANCELLATION_FEES = [
    "3 hours before: 0",
    "2 hours before: VND 75,000",
    "1 hour before: VND 150,000",
    "Within the hour: VND 250,000",
    "No show: VND 250,000",
];
const LATE_POLICY =
    "Therapists can wait 15 minutes if you are running late. If you are more than 15 minutes late for your appointment, it will be considered a no-show and you will be charged the appropriate fee.";
const COMMITMENT_LABEL =
    "By booking a massage, you agree to maintain professional conduct. Any inappropriate behavior will be reported to the authorities. Thank you for ensuring a safe and respectful environment.";

type Styles = ReturnType<typeof createStyles>;

/** Matches the label Input renders, for fields that are not text inputs. */
function FieldLabel({ styles, label, required }: { styles: Styles; label: string; required?: boolean }) {
    return (
        <Text style={styles.fieldLabel}>
            {label}
            {required ? <Text style={styles.fieldLabelRequired}> (Required)</Text> : null}
        </Text>
    );
}

export default function BookingView() {
    const {
        form,
        handleChange,
        handleSubmit,
        isSubmiting,
        selectedMassages,
        details,
        handleDetailChange,
        places,
        selectedPlaceId,
        handlePlaceSelect,
        errors,
        validate,
        isDone,
        submitError,
    } = useBookingView()
    const { colors } = useTheme()
    const styles = createStyles(colors)

    // Date & time is its own step (like the reference booking widget): pick a slot
    // first, then move on to contact details / preferences / policy.
    const [step, setStep] = useState<BookingStep>(form.startTime ? "details" : "datetime")

    const scrollRef = useRef<ScrollView>(null)
    // Filled by onLayout so a failed validation can scroll straight to the culprit.
    const fieldOffsets = useRef<Partial<Record<BookingField, number>>>({})

    const measureField = (field: BookingField) => (event: LayoutChangeEvent) => {
        fieldOffsets.current[field] = event.nativeEvent.layout.y
    }

    const handleDateTimeChange = (time: Date) => {
        handleChange("startTime", time.toISOString())
    }

    const goBackToServices = () => {
        if (router.canGoBack()) return router.back()
        router.replace("/")
    }

    const handleConfirm = () => {
        const found = validate()
        const firstInvalid = BOOKING_FIELDS.find((field) => found[field])

        if (!firstInvalid) {
            handleSubmit()
            return
        }

        // These two are set on earlier screens, so there is nothing here to scroll to.
        if (firstInvalid === "massages") return goBackToServices()
        if (firstInvalid === "startTime") return setStep("datetime")

        const offset = fieldOffsets.current[firstInvalid]
        if (offset !== undefined) {
            scrollRef.current?.scrollTo({ y: Math.max(offset - 16, 0), animated: true })
        }
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

    const startTime = form.startTime ? new Date(form.startTime) : null
    const endTime = startTime ? new Date(startTime.getTime() + totalDuration * 60_000) : null
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    const formatTime = (date: Date) =>
        date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })

    const dateLabel = startTime
        ? startTime.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        : "No date selected"
    const timeRangeLabel =
        startTime && endTime ? `${formatTime(startTime)} – ${formatTime(endTime)}` : "—"

    const footer = (
        <>
            {BRAND.links.map((line) => (
                <Text key={line} style={styles.footerLine}>
                    {line}
                </Text>
            ))}
        </>
    )

    if (isDone) {
        const firstName = form.name.trim().split(" ")[0]

        return (
            <BookingShell variant="stacked" footer={footer}>
                <View style={styles.confirmWrap}>
                    <View style={styles.confirmBadge}>
                        <Check size={16} color="#fff" />
                    </View>

                    <View style={styles.confirmCard}>
                        <Text style={styles.summaryDate}>{dateLabel}</Text>
                        <Text style={styles.summaryTime}>{timeRangeLabel}</Text>
                        <View style={styles.metaRow}>
                            <Globe size={14} color={colors.textSecondary} />
                            <Text style={styles.metaText}>{timeZone}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.confirmRow}>
                            <Clock size={16} color={colors.textSecondary} />
                            <View style={styles.confirmRowContent}>
                                <Text style={styles.confirmLabel}>Appointment types</Text>
                                {groupedMassages.map((massage, index) => (
                                    <Text
                                        key={`${massage.massageId}-${massage.duration}-${index}`}
                                        style={styles.confirmValue}
                                    >
                                        {massage.name}
                                        {massage.quantity > 1 ? ` x${massage.quantity}` : ""}
                                    </Text>
                                ))}
                            </View>
                        </View>

                        <View style={styles.confirmRow}>
                            <MapPin size={16} color={colors.textSecondary} />
                            <View style={styles.confirmRowContent}>
                                <Text style={styles.confirmLabel}>Location</Text>
                                <Text style={styles.confirmValue}>
                                    {form.address || "No location set"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.confirmRow}>
                            <Tag size={16} color={colors.textSecondary} />
                            <View style={styles.confirmRowContent}>
                                <Text style={styles.confirmLabel}>Price</Text>
                                <Text style={styles.confirmValue}>{formatPrice(totalPrice)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={styles.thanksText}>Thanks{firstName ? ` ${firstName}` : ""},</Text>
                <Text style={styles.helperText}>
                    You will receive a notification confirming the meeting details shortly.
                </Text>
            </BookingShell>
        )
    }

    if (step === "datetime") {
        const selectionLabel = groupedMassages.length === 0
            ? "No services selected"
            : groupedMassages.length === 1
                ? groupedMassages[0].name
                : `${groupedMassages[0].name} +${groupedMassages.length - 1} more`

        return (
            <BookingShell
                subtitle="Choose date & time"
                footer={footer}
                aside={
                    <>
                        <Pressable style={styles.selectionChip} onPress={goBackToServices}>
                            <Clock size={14} color={colors.textSecondary} />
                            <Text style={styles.selectionChipText} numberOfLines={1}>
                                {selectionLabel}
                            </Text>
                            <Pencil size={13} color={colors.textSecondary} />
                        </Pressable>

                        <View style={styles.asideCopy}>
                            {BRAND.description.map((paragraph) => (
                                <Text key={paragraph} style={styles.asideText}>
                                    {paragraph}
                                </Text>
                            ))}
                        </View>
                    </>
                }
            >
                <DateTimeStep
                    value={startTime}
                    onChange={handleDateTimeChange}
                    onContinue={() => setStep("details")}
                />
            </BookingShell>
        )
    }

    // Left-hand panel on the details step: what has been picked so far, each block
    // pencil-editable back to the step that set it.
    const appointmentSummary = (
        <View style={styles.summaryCard}>
            <View style={styles.summaryHead}>
                <View style={styles.summaryHeadContent}>
                    <Text style={styles.summaryDate}>{dateLabel}</Text>
                    <Text style={styles.summaryTime}>{timeRangeLabel}</Text>
                    <View style={styles.metaRow}>
                        <Globe size={14} color={colors.textSecondary} />
                        <Text style={styles.metaText}>{timeZone}</Text>
                    </View>
                </View>
                <Pressable hitSlop={8} onPress={() => setStep("datetime")}>
                    <Pencil size={15} color={colors.textSecondary} />
                </Pressable>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryHead}>
                <View style={styles.summaryHeadContent}>
                    <View style={styles.metaRow}>
                        <Clock size={14} color={colors.textSecondary} />
                        <Text style={styles.summaryStrong}>{formatDuration(totalDuration)}</Text>
                    </View>
                    {groupedMassages.map((massage, index) => (
                        <Text
                            key={`${massage.massageId}-${massage.duration}-${index}`}
                            style={styles.summaryService}
                            numberOfLines={1}
                        >
                            {massage.name}
                            {massage.quantity > 1 ? ` x${massage.quantity}` : ""}
                        </Text>
                    ))}
                </View>
                <Pressable hitSlop={8} onPress={goBackToServices}>
                    <Pencil size={15} color={colors.textSecondary} />
                </Pressable>
            </View>

            <View style={styles.metaRow}>
                <Tag size={14} color={colors.textSecondary} />
                <Text style={styles.summaryStrong}>{formatPrice(totalPrice)}</Text>
            </View>
        </View>
    )

    return (
        <BookingShell aside={appointmentSummary} footer={footer}>
            <View style={styles.stepHeader}>
                <Pressable style={styles.backButton} onPress={() => setStep("datetime")} hitSlop={8}>
                    <ChevronLeft size={18} color={colors.textPrimary} />
                    <Text style={styles.backText}>Back</Text>
                </Pressable>
                <Text style={styles.stepTitle}>Confirm Booking</Text>
                <View style={styles.stepHeaderSpacer} />
            </View>

            <View style={styles.divider} />

            <ScrollView
                ref={scrollRef}
                style={styles.formScroll}
                contentContainerStyle={styles.formContent}
            >
                <View style={styles.field} onLayout={measureField("name")}>
                    <Input
                        label="Full Name (as shown on Passport or Identification Card)"
                        required
                        value={form.name}
                        onChangeText={(value) => handleChange("name", value)}
                        placeholder="Nguyen Van A"
                    />
                    {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                    <Text style={styles.helperText}>{NAME_HELPER}</Text>
                </View>

                <View style={styles.field} onLayout={measureField("address")}>
                    <FieldLabel styles={styles} label="Where should the therapist go?" required />

                    <PlacePicker
                        places={places}
                        selectedPlaceId={selectedPlaceId}
                        onSelect={handlePlaceSelect}
                        address={form.address}
                        onAddressChange={(value) => handleChange("address", value)}
                    />

                    {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
                </View>

                <View style={styles.field} onLayout={measureField("email")}>
                    <Input
                        label="Email"
                        required
                        value={form.email}
                        onChangeText={(value) => handleChange("email", value)}
                        placeholder="you@example.com"
                        keyboardType="email-address"
                    />
                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                </View>

                <View style={styles.field} onLayout={measureField("phone")}>
                    <PhoneInput
                        label="Mobile / Zalo Number"
                        required
                        value={form.phone}
                        onChangeText={(value) => handleChange("phone", value)}
                        dialCode={details.dialCode}
                        onDialCodeChange={(value) => handleDetailChange("dialCode", value)}
                        placeholder="78 123 45 67"
                    />
                    {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                    <Checkbox
                        label="I would like to receive scheduling-related text messages about this booking."
                        checked={details.smsOptIn}
                        onChange={(checked) => handleDetailChange("smsOptIn", checked)}
                    />
                    <Text style={styles.helperText}>{SMS_DISCLAIMER}</Text>
                </View>

                <View style={styles.field} onLayout={measureField("therapistGender")}>
                    <FieldLabel
                        styles={styles}
                        label="Therapist Gender Required / Kỹ Thuật Viên"
                        required
                    />
                    <View style={styles.optionGroup}>
                        {(Object.keys(GENDER_LABELS) as TherapistGender[]).map((gender) => (
                            <Checkbox
                                key={gender}
                                label={GENDER_LABELS[gender]}
                                checked={details.therapistGender === gender}
                                onChange={() => handleDetailChange("therapistGender", gender)}
                            />
                        ))}
                    </View>
                    {errors.therapistGender ? (
                        <Text style={styles.errorText}>{errors.therapistGender}</Text>
                    ) : null}
                    <Text style={styles.helperText}>{GENDER_HELPER}</Text>
                </View>

                <Input
                    label="Notes"
                    value={form.note ?? ""}
                    onChangeText={(value) => handleChange("note", value)}
                    placeholder="Anything the therapist should know?"
                    multiline
                />

                <Input
                    label="Referrer"
                    value={details.referrer}
                    onChangeText={(value) => handleDetailChange("referrer", value)}
                />

                <Input
                    label="Promotion Code/ Mã Khuyến Mãi"
                    value={details.promotionCode}
                    onChangeText={(value) => handleDetailChange("promotionCode", value)}
                />

                <View style={styles.divider} />

                <View style={styles.field}>
                    <Text style={styles.sectionTitle}>{PAYMENT_TITLE}</Text>
                    <Text style={styles.sectionSubtitle}>QR Code Payment Accepted by the following:</Text>
                    <Text style={styles.helperText}>{PAYMENT_BANKS}</Text>
                </View>

                <View style={styles.field} onLayout={measureField("paymentMethod")}>
                    <FieldLabel
                        styles={styles}
                        label="Pay by Cash or QR Code (No Credit Cards Accepted yet)"
                        required
                    />
                    <View style={styles.optionGroup}>
                        {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((method) => (
                            <Checkbox
                                key={method}
                                label={PAYMENT_LABELS[method]}
                                checked={details.paymentMethod === method}
                                onChange={() => handleDetailChange("paymentMethod", method)}
                            />
                        ))}
                    </View>
                    {errors.paymentMethod ? (
                        <Text style={styles.errorText}>{errors.paymentMethod}</Text>
                    ) : null}
                    <Text style={styles.helperText}>Rates are inclusive of tip.</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.field}>
                    <Text style={styles.sectionTitle}>Cancellation Policy</Text>
                    <Text style={styles.helperText}>{CANCELLATION_INTRO}</Text>
                    <View style={styles.policyList}>
                        {CANCELLATION_FEES.map((fee) => (
                            <Text key={fee} style={styles.policyItem}>
                                {"•  "}
                                {fee}
                            </Text>
                        ))}
                    </View>
                    <Text style={styles.helperText}>{LATE_POLICY}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.field} onLayout={measureField("agreedToPolicy")}>
                    <FieldLabel
                        styles={styles}
                        label="Commitment To Safe & Respectful Environment"
                        required
                    />
                    <Checkbox
                        label={COMMITMENT_LABEL}
                        checked={details.agreedToPolicy}
                        onChange={(checked) => handleDetailChange("agreedToPolicy", checked)}
                    />
                    {errors.agreedToPolicy ? (
                        <Text style={styles.errorText}>{errors.agreedToPolicy}</Text>
                    ) : null}
                </View>

                {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

                <Pressable
                    disabled={isSubmiting}
                    onPress={handleConfirm}
                    style={({ pressed }) => [
                        styles.submitButton,
                        isSubmiting && styles.submitButtonDisabled,
                        pressed && styles.submitButtonPressed,
                    ]}
                >
                    <Text style={styles.submitText}>
                        {isSubmiting ? "Submitting..." : "Confirm Booking"}
                    </Text>
                </Pressable>
            </ScrollView>
        </BookingShell>
    )
}

const createStyles = (colors: Colors) => StyleSheet.create({
    stepHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    backText: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "600",
    },
    stepTitle: {
        flex: 1,
        textAlign: "center",
        color: colors.textPrimary,
        fontSize: 17,
        fontWeight: "700",
    },
    stepHeaderSpacer: {
        width: 96,
    },
    formScroll: {
        flex: 1,
    },
    formContent: {
        gap: 22,
        paddingBottom: 8,
        width: "100%",
        maxWidth: 560,
        alignSelf: "center",
    },
    field: {
        gap: 10,
    },
    fieldLabel: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    fieldLabelRequired: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "400",
    },
    sectionTitle: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "700",
        lineHeight: 21,
    },
    sectionSubtitle: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "600",
    },
    helperText: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 19,
    },
    optionGroup: {
        gap: 12,
    },
    policyList: {
        gap: 6,
    },
    policyItem: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 19,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
    },
    errorText: {
        color: "#E5686B",
        fontSize: 13,
        lineHeight: 19,
    },
    submitButton: {
        backgroundColor: colors.accent,
        borderRadius: 999,
        paddingVertical: 18,
        alignItems: "center",
        marginTop: 4,
        marginBottom: 16,
    },
    submitButtonDisabled: {
        backgroundColor: colors.accentDisabled,
    },
    submitButtonPressed: {
        opacity: 0.85,
    },
    submitText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    selectionChip: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        maxWidth: "100%",
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    selectionChipText: {
        flexShrink: 1,
        color: colors.textPrimary,
        fontSize: 13,
        fontWeight: "600",
    },
    asideCopy: {
        gap: 16,
    },
    asideText: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 21,
    },
    summaryCard: {
        gap: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    summaryHead: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    summaryHeadContent: {
        flex: 1,
        gap: 6,
    },
    summaryDate: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    summaryTime: {
        color: colors.textPrimary,
        fontSize: 17,
        fontWeight: "700",
    },
    summaryStrong: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "700",
    },
    summaryService: {
        color: colors.textSecondary,
        fontSize: 13,
        paddingLeft: 20,
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
    confirmWrap: {
        alignItems: "center",
    },
    confirmBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: SUCCESS_COLOR,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: -14,
        zIndex: 1,
    },
    confirmCard: {
        width: "100%",
        gap: 12,
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    confirmRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    confirmRowContent: {
        flex: 1,
        gap: 2,
    },
    confirmLabel: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    confirmValue: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    thanksText: {
        color: colors.textSecondary,
        fontSize: 15,
    },
    footerLine: {
        color: colors.textSecondary,
        fontSize: 13,
        textAlign: "center",
    },
})
