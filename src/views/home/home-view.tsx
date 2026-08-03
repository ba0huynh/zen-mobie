import usePlatform from "@/hooks/platform.hook";
import { Colors, useTheme } from "@/hooks/theme.hook";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBookingStore } from "../booking/booking.store";
import MassageCard, { formatPrice } from "./components/massage-card";
import useHomeView from "./home-view.hook";

export default function HomeView() {
    const {
        isLoading,
        massageList,
        selection,
        totalPrice,
        totalSelected,
        handleSelect,
        handleDecrement,
    } = useHomeView();
    const { is } = usePlatform();
    const isWeb = is("web");
    const { colors } = useTheme();
    const setSelectedMassages = useBookingStore((state) => state.setSelectedMassages);
    const styles = createStyles(colors);

    const handleContinue = () => {
        const bookingMassages = selection.flatMap((selectedItem) => {
            const massage = massageList.find((item) => item.id === selectedItem.itemId);
            const pricing = massage?.pricing[selectedItem.pricingIndex];

            if (!massage || !pricing) return [];

            return Array.from({ length: selectedItem.quantity }, () => ({
                massageId: massage.id,
                duration: pricing.duration,
                price: pricing.price,
                name: massage.name,
            }));
        });

        setSelectedMassages(bookingMassages);
        router.push("/booking");
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator color={colors.accent} size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <View style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}>
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>Choose a service</Text>
                    <Text style={styles.pageSubtitle}>Select a duration to continue booking.</Text>
                </View>

                <FlashList
                    data={massageList}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    renderItem={({ item }) => (
                        <MassageCard
                            item={item}
                            selection={selection}
                            onSelect={handleSelect}
                            onDecrement={handleDecrement}
                        />
                    )}
                />

                <View style={styles.footer}>
                    {totalSelected > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryText}>
                                {totalSelected} service{totalSelected > 1 ? "s" : ""} selected
                            </Text>
                            <Text style={styles.summaryTotal}>{formatPrice(totalPrice)}</Text>
                        </View>
                    )}
                    <Pressable
                        onPress={handleContinue}
                        disabled={totalSelected === 0}
                        style={[styles.continueButton, totalSelected === 0 && styles.continueButtonDisabled]}
                    >
                        <Text style={styles.continueText}>Continue</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centered: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
    },
    contentWrapper: {
        flex: 1,
        width: "100%",
    },
    contentWrapperWeb: {
        width: "50%",
        alignSelf: "center",
    },
    pageHeader: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
        gap: 4,
    },
    pageTitle: {
        color: colors.textPrimary,
        fontSize: 20,
        fontWeight: "700",
    },
    pageSubtitle: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 96,
    },
    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: 16,
        gap: 10,
        backgroundColor: colors.background,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
    },
    summaryRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    summaryText: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    summaryTotal: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    continueButton: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    continueButtonDisabled: {
        backgroundColor: colors.accentDisabled,
    },
    continueText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
});
