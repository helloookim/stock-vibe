import { useState, useEffect } from 'react';

const THEME_KEY = 'theme';
const THEME_EVENT = 'themechange';

export function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
}

export function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
}

const darkColors = {
    // Backgrounds
    bgBody: '#141417',
    bgCard: '#1c1c22',
    bgCardHover: '#1c1c22',
    bgVariant: '#141417',
    bgSidebar: '#0e0e11',
    bgInput: 'rgba(255, 255, 255, 0.08)',
    bgOverlay: 'rgba(0, 0, 0, 0.8)',

    // Text
    textPrimary: '#f0f0f5',
    textSecondary: '#c0c0d0',
    textMuted: '#8888a0',
    textFaded: '#5a5a70',
    textVeryFaded: '#4a4a60',

    // Borders
    border: 'rgba(255, 255, 255, 0.06)',
    borderMedium: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.1)',

    // Chart
    chartGrid: '#2a2a30',
    chartRef: '#5a5a70',
    tooltipBg: '#1c1c22',
    tooltipBorder: '#4a4a60',
    tooltipShadow: 'rgba(0, 0, 0, 0.5)',

    // Accent — UI only (buttons, links, toggles)
    accent: '#FF8C00',
    accentDark: '#e67e00',
    accentLight: '#FFb366',
    accentBg: 'rgba(255, 140, 0, 0.08)',

    // Chart-specific hues — each chart gets its own distinct color
    revenue: '#5B8DEF',       // blue — Revenue bars
    revenueLight: '#7BA4F7',  // lighter blue for gradients
    opIncome: '#00d084',      // green — Op Income / Op Profit bars
    opIncomeLight: '#33e888', // lighter green
    netIncome: '#A78BFA',     // purple — Net Income bars
    netIncomeLight: '#BFA8FF',// lighter purple
    margin: '#FF8C00',        // orange — Op Margin area chart
    gold: '#E2B93B',          // rich gold — EPS bars
    goldLight: '#F0CC5A',     // lighter gold

    // Semantic — universal YoY / up-down signals
    positive: '#00d084',
    positiveLight: '#33e888',
    negative: '#ff4d4f',

    // Footer
    footerBg: '#141417',
    footerBorder: '#2a2a30',

    // Disclaimer
    disclaimerBg: '#141417',
    disclaimerBorder: '#ff4d4f',

    // Scrollbar
    scrollThumb: 'rgba(255, 255, 255, 0.06)',

    // Misc
    codeBg: '#1c1c22',
    boxShadow: 'rgba(255, 255, 255, 0.04)',
};

const lightColors = {
    // Backgrounds
    bgBody: '#F8F6F3',
    bgCard: '#FFFFFF',
    bgCardHover: '#FAFAF8',
    bgVariant: '#F0EDE8',
    bgSidebar: '#0e0e11',
    bgInput: 'rgba(0, 0, 0, 0.04)',
    bgOverlay: 'rgba(0, 0, 0, 0.4)',

    // Text
    textPrimary: '#1a1a1a',
    textSecondary: '#2a2a2a',
    textMuted: '#505050',
    textFaded: '#707070',
    textVeryFaded: '#909090',

    // Borders
    border: 'rgba(0, 0, 0, 0.08)',
    borderMedium: 'rgba(0, 0, 0, 0.10)',
    borderLight: 'rgba(0, 0, 0, 0.12)',

    // Chart
    chartGrid: '#E0DDD8',
    chartRef: '#AAAAAA',
    tooltipBg: '#FFFFFF',
    tooltipBorder: '#D0CCC6',
    tooltipShadow: 'rgba(0, 0, 0, 0.12)',

    // Accent — UI only
    accent: '#E07800',
    accentDark: '#CC6D00',
    accentLight: '#FF9922',
    accentBg: 'rgba(204, 109, 0, 0.10)',

    // Chart-specific hues
    revenue: '#3A6FD8',       // deeper blue on white
    revenueLight: '#5B8DEF',
    opIncome: '#008C46',      // deeper green on white
    opIncomeLight: '#00A85A',
    netIncome: '#7C5CBF',     // deeper purple on white
    netIncomeLight: '#9678D6',
    margin: '#D97706',        // warm amber for margin area
    gold: '#B8960F',          // rich dark gold on white
    goldLight: '#D4AD20',

    // Semantic
    positive: '#008C46',
    positiveLight: '#00A85A',
    negative: '#DC2626',

    // Footer
    footerBg: '#F0EDE8',
    footerBorder: '#E0DDD8',

    // Disclaimer
    disclaimerBg: '#FFF5F5',
    disclaimerBorder: '#DC2626',

    // Scrollbar
    scrollThumb: 'rgba(0, 0, 0, 0.1)',

    // Misc
    codeBg: '#F0EDE8',
    boxShadow: 'rgba(0, 0, 0, 0.06)',
};

export default function useThemeColors() {
    const [theme, _setTheme] = useState(getTheme);

    useEffect(() => {
        const handler = (e) => _setTheme(e.detail);
        window.addEventListener(THEME_EVENT, handler);
        return () => window.removeEventListener(THEME_EVENT, handler);
    }, []);

    return theme === 'light' ? lightColors : darkColors;
}
