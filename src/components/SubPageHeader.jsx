import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

// Slim top bar for full-width pages without the stock sidebar (compare pages):
// back-to-home, logo, and the theme/language toggles the sidebar pages carry.
const SubPageHeader = () => {
    const { t } = useTranslation();
    return (
        <header className="subpage-header">
            <div className="subpage-header-inner">
                <Link to="/" className="subpage-back">
                    <ArrowLeft size={16} /> {t('rankings.backHome')}
                </Link>
                <Link to="/" className="subpage-logo">KSTOCKVIEW</Link>
                <div className="subpage-toggles">
                    <ThemeToggle />
                    <LanguageToggle />
                </div>
            </div>
        </header>
    );
};

export default SubPageHeader;
