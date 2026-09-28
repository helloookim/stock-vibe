import { useSearchParams } from 'react-router-dom';

// Active metric tab on stock detail pages, kept in the URL (?tab=op) so shared
// links and back/forward restore it. The first key is the default and is left out of the URL.
export default function useMetricTab(tabKeys) {
    const [searchParams, setSearchParams] = useSearchParams();
    const param = searchParams.get('tab');
    const activeTab = tabKeys.includes(param) ? param : tabKeys[0];

    const setActiveTab = (key) => {
        const next = new URLSearchParams(searchParams);
        if (key === tabKeys[0]) next.delete('tab');
        else next.set('tab', key);
        setSearchParams(next, { replace: true });
    };

    return [activeTab, setActiveTab];
}
