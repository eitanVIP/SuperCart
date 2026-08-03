export const lightColors = {
    // Backgrounds
    background: "#F6FAF7",
    surface: "#FFFFFF",
    surfaceAlt: "#E4F3EA",     // empty-state icon bg, subtle green fills
    card: "#FFFFFF",

    // Text
    text: "#1B3326",           // primary titles, item names
    textSecondary: "#718178",  // subtitles, descriptions
    textMuted: "#819087",      // byline "Added by X"
    textFaint: "#7A8D82",      // section headers (THIS WEEK, eyebrow)

    // Brand / primary
    primary: "#177A50",        // FAB, active states, checkbox filled
    primaryLight: "#DCF2E5",   // active filter pill bg
    primaryLighter: "#E6F5EC", // recurring badge bg
    primaryDark: "#166A45",    // active filter text
    primaryText: "#177A50",    // recurring badge text

    // Borders / dividers
    border: "#E2ECE6",         // card borders
    borderLight: "#D8E6DD",    // filter pill borders
    borderOnSheet: "#526B5F",
    divider: "#EDF2EF",

    // Checkbox / interactive
    checkboxBorder: "#B7C9BE",
    checkboxFilled: "#177A50",

    // Icons / arrows
    iconMuted: "#91A097",

    // Status
    success: "#177A50",
    danger: "#C0392B",
    dangerLight: "#FBEAE8",
    warning: "#C77C1E",
    warningLight: "#FBF1E2",

    // Nav
    navActive: "#177A50",
    navInactive: "#8A9992",
    navBorder: "#E7EEE9",

    // Misc
    overlay: "rgba(15, 30, 22, 0.4)",
    shadow: "#0B3E26",
    placeholder: "#A9B8AF",
};

export const darkColors = {
    // Backgrounds
    background: "#0F1512",
    surface: "#1A2420",
    surfaceAlt: "#20302A",
    card: "#1A2420",

    // Text
    text: "#EAF2ED",
    textSecondary: "#9AAAA1",
    textMuted: "#7E9089",
    textFaint: "#7A8D82",

    // Brand / primary
    primary: "#3DB87A",
    primaryLight: "#1E3A2C",
    primaryLighter: "#1B3327",
    primaryDark: "#5FCB93",
    primaryText: "#5FCB93",

    // Borders / dividers
    border: "#2B3833",
    borderLight: "#26332D",
    borderOnSheet: "#526B5F",
    divider: "#24302B",

    // Checkbox / interactive
    checkboxBorder: "#3D4C45",
    checkboxFilled: "#3DB87A",

    // Icons / arrows
    iconMuted: "#67796F",

    // Status
    success: "#3DB87A",
    danger: "#E5766A",
    dangerLight: "#2E1C1A",
    warning: "#E0A857",
    warningLight: "#2E2517",

    // Nav
    navActive: "#3DB87A",
    navInactive: "#5C6D65",
    navBorder: "#22302A",

    // Misc
    overlay: "rgba(0, 0, 0, 0.6)",
    shadow: "#000000",
    placeholder: "#4C5A53",
};

export type ThemeColors = typeof lightColors;