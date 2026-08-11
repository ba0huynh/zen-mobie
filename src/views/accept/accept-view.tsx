import BookingShell from "@/components/booking-shell";
import View from "@/components/ui/view";
import { Colors, useTheme } from "@/hooks/theme.hook";
import { Check, Link2Off, Mail, Ticket } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import useAcceptView from "./accept-view.hook";

const SUCCESS_COLOR = "#22A06B";

export default function AcceptView() {
    const { id, email, hasLink, status, message, handleAccept } = useAcceptView();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    if (!hasLink) {
        return (
            <BookingShell variant="stacked" subtitle="Therapist confirmation">
                <View style={styles.card}>
                    <View style={[styles.badge, styles.badgeMuted]}>
                        <Link2Off size={16} color="#fff" />
                    </View>
                    <Text style={styles.cardTitle}>This link is incomplete</Text>
                    <Text style={styles.cardText}>
                        An accept link carries both the booking id and your email. Open the link from
                        the assignment email again, or ask the front desk to resend it.
                    </Text>
                </View>
            </BookingShell>
        );
    }

    if (status === "accepted") {
        return (
            <BookingShell variant="stacked" subtitle="Therapist confirmation">
                <View style={styles.card}>
                    <View style={styles.badge}>
                        <Check size={16} color="#fff" />
                    </View>
                    <Text style={styles.cardTitle}>Booking accepted</Text>
                    <Text style={styles.cardText}>
                        This appointment is yours. The guest has been notified — please arrive a few
                        minutes early.
                    </Text>
                </View>
            </BookingShell>
        );
    }

    return (
        <BookingShell variant="stacked" subtitle="Therapist confirmation">
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Accept this booking?</Text>
                <Text style={styles.cardText}>
                    Confirm that you will take the appointment below. Once accepted it is assigned to
                    you and cannot be handed back from this page.
                </Text>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Ticket size={16} color={colors.textSecondary} />
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Booking</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>
                            {id}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <Mail size={16} color={colors.textSecondary} />
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Therapist</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>
                            {email}
                        </Text>
                    </View>
                </View>
            </View>

            {message ? <Text style={styles.errorText}>{message}</Text> : null}

            <Pressable
                disabled={status === "accepting"}
                onPress={handleAccept}
                style={({ pressed }) => [
                    styles.acceptButton,
                    status === "accepting" && styles.acceptButtonDisabled,
                    pressed && styles.acceptButtonPressed,
                ]}
            >
                {status === "accepting" ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.acceptText}>
                        {status === "failed" ? "Try again" : "Accept booking"}
                    </Text>
                )}
            </Pressable>
        </BookingShell>
    );
}

const createStyles = (colors: Colors) => StyleSheet.create({
    card: {
        width: "100%",
        gap: 12,
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    badge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: SUCCESS_COLOR,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
    },
    badgeMuted: {
        backgroundColor: colors.checkboxBorder,
    },
    cardTitle: {
        color: colors.textPrimary,
        fontSize: 17,
        fontWeight: "700",
        textAlign: "center",
    },
    cardText: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 21,
        textAlign: "center",
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    detailContent: {
        flex: 1,
        gap: 2,
    },
    detailLabel: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    detailValue: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "600",
    },
    errorText: {
        color: "#E5686B",
        fontSize: 13,
        lineHeight: 19,
        textAlign: "center",
    },
    acceptButton: {
        backgroundColor: colors.accent,
        borderRadius: 999,
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 56,
    },
    acceptButtonDisabled: {
        backgroundColor: colors.accentDisabled,
    },
    acceptButtonPressed: {
        opacity: 0.85,
    },
    acceptText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
