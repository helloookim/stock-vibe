import { useTranslation } from 'react-i18next';

const LanguageToggle = ({ style }) => {
    const { i18n } = useTranslation();
    const isKo = i18n.language === 'ko';

    const toggle = () => {
        i18n.changeLanguage(isKo ? 'en' : 'ko');
    };

    return (
        <button
            onClick={toggle}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '4px 6px',
                borderRadius: '6px',
                border: '1px solid #555',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: '600',
                lineHeight: 1,
                transition: 'border-color 0.2s',
                flexShrink: 0,
                ...style
            }}
            title={isKo ? 'Switch to English' : '한국어로 전환'}
        >
            <span style={{ color: isKo ? '#FFb366' : '#666' }}>KO</span>
            <span style={{ color: '#555' }}>/</span>
            <span style={{ color: !isKo ? '#FFb366' : '#666' }}>EN</span>
        </button>
    );
};

export default LanguageToggle;
