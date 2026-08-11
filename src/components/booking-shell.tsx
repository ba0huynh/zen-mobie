import BRAND from "@/constants/brand";
import { Colors, useTheme } from "@/hooks/theme.hook";
import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Below this width the brand panel stacks on top of the content instead of sitting beside it. */
const WIDE_BREAKPOINT = 900;

export function useIsWideLayout() {
    const { width } = useWindowDimensions();
    return width >= WIDE_BREAKPOINT;
}

type BookingShellProps = {
    /** Short line under the brand title — usually the current step. */
    subtitle?: string;
    /** Extra brand-panel content (summary cards, marketing copy). Split layout only. */
    aside?: ReactNode;
    /** Rendered under the card, outside its border. */
    footer?: ReactNode;
    /** "split": brand beside the content. "stacked": brand centered above it, for end screens. */
    variant?: "split" | "stacked";
    children: ReactNode;
};

/**
 * The booking widget frame: accent bar on top, brand block, and the current step.
 * The split layout collapses to a single column with a compact header on phones.
 */
export default function BookingShell({
    subtitle,
    aside,
    footer,
    variant = "split",
    children,
}: BookingShellProps) {
    const isWide = useIsWideLayout();
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const isStacked = variant === "stacked";
    const showLargeLogo = isStacked || isWide;

    const logo = (
        <View style={[styles.logo, !showLargeLogo && styles.logoNarrow]}>
            <Text style={[styles.logoMark, !showLargeLogo && styles.logoMarkNarrow]}>{BRAND.mark}</Text>
            {showLargeLogo && <Text style={styles.logoCaption}>{BRAND.caption}</Text>}
        </View>
    );

    const brandContent = (
        <>
            {logo}
            <View style={[styles.brandText, !isWide && styles.brandTextNarrow]}>
                <Text style={[styles.title, !isWide && styles.titleNarrow]}>{BRAND.title}</Text>
                {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                {isWide && aside}
            </View>
        </>
    );

    return (
        <SafeAreaView style={styles.page} edges={["top", "bottom"]}>
            <View style={[styles.card, isWide && styles.cardWide, isStacked && styles.cardStacked]}>
                <View style={styles.accentBar} />

                {isStacked ? (
                    <ScrollView
                        contentContainerStyle={styles.stackedContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {logo}
                        <Text style={[styles.title, styles.textCentered]}>{BRAND.title}</Text>
                        {!!subtitle && <Text style={[styles.subtitle, styles.textCentered]}>{subtitle}</Text>}
                        <View style={styles.stackedChildren}>{children}</View>
                    </ScrollView>
                ) : (
                    <View style={[styles.body, isWide && styles.bodyWide]}>
                        {isWide ? (
                            <ScrollView
                                style={styles.brandPanelWide}
                                contentContainerStyle={styles.brandPanelWideContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {brandContent}
                            </ScrollView>
                        ) : (
                            <View style={styles.brandPanelNarrow}>{brandContent}</View>
                        )}

                        {isWide && <View style={styles.columnDivider} />}

                        <View style={[styles.panel, isWide && styles.panelWide]}>{children}</View>
                    </View>
                )}
            </View>

            {footer ? <View style={styles.footerArea}>{footer}</View> : null}
        </SafeAreaView>
    );
}

const createStyles = (colors: Colors) => StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
    },
    card: {
        flex: 1,
        width: "100%",
        backgroundColor: colors.surface,
        overflow: "hidden",
    },
    cardWide: {
        maxWidth: 1080,
        marginTop: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardStacked: {
        maxWidth: 820,
    },
    accentBar: {
        height: 4,
        backgroundColor: colors.accent,
    },
    body: {
        flex: 1,
    },
    bodyWide: {
        flexDirection: "row",
    },
    // 2:3 against the booking panel. flexGrow/Shrink are pinned because RN Web's
    // ScrollView defaults to flexGrow: 1 and would otherwise eat the free space.
    brandPanelWide: {
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: "40%",
    },
    brandPanelWideContent: {
        padding: 40,
        gap: 24,
    },
    brandPanelNarrow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    logo: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
    },
    logoNarrow: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    logoMark: {
        color: "#1A1A1A",
        fontSize: 26,
        fontWeight: "700",
        letterSpacing: 4,
    },
    logoMarkNarrow: {
        fontSize: 13,
        letterSpacing: 1,
    },
    logoCaption: {
        color: "#6B6B6B",
        fontSize: 8,
        fontWeight: "600",
        letterSpacing: 2,
    },
    brandText: {
        gap: 12,
    },
    brandTextNarrow: {
        flex: 1,
        gap: 2,
    },
    title: {
        color: colors.textPrimary,
        fontSize: 30,
        lineHeight: 38,
        fontWeight: "700",
    },
    titleNarrow: {
        fontSize: 16,
        lineHeight: 21,
        fontWeight: "600",
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
    textCentered: {
        textAlign: "center",
    },
    columnDivider: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
    },
    panel: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 16,
    },
    panelWide: {
        padding: 32,
    },
    stackedContent: {
        alignItems: "center",
        gap: 16,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 40,
    },
    stackedChildren: {
        width: "100%",
        maxWidth: 560,
        gap: 20,
        marginTop: 12,
    },
    footerArea: {
        width: "100%",
        maxWidth: 1080,
        alignItems: "center",
        gap: 6,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
});
