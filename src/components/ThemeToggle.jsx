import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getTheme, setTheme } from '../hooks/useThemeColors';

const ThemeToggle = ({ style }) => {
    const [theme, _setTheme] = useState(getTheme);

    useEffect(() => {
        const handler = (e) => _setTheme(e.detail);
        window.addEventListener('themechange', handler);
        return () => window.removeEventListener('themechange', handler);
    }, []);

    const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggle}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '6px',
                border: '1px solid #555',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                flexShrink: 0,
                color: isDark ? '#FFb366' : '#e67e00',
                ...style
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {isDark ? <Moon size={14} /> : <Sun size={14} />}
        </button>
    );
};

export default ThemeToggle;
