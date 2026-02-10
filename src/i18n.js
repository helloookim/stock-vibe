import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko.json';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
    resources: {
        ko: { translation: ko },
        en: { translation: en }
    },
    lng: localStorage.getItem('language') || 'ko',
    fallbackLng: 'ko',
    interpolation: {
        escapeValue: false
    }
});

// Update <html lang> attribute when language changes
i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
    localStorage.setItem('language', lng);
});

export default i18n;
