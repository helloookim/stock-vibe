import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

/**
 * Search box with a keyboard-navigable result list (↑/↓, Enter, Esc).
 * `search(term)` returns [{ id, code, name, meta }]; `onPick(id)` is called with the chosen id.
 * Clicking outside or pressing Esc calls `onClose` (popover usage) or just hides the results.
 */
const StockPicker = ({ search, onPick, placeholder, hint, autoFocus = false, onClose, accentColor, className = '' }) => {
    const rootRef = useRef(null);
    const [term, setTerm] = useState('');
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const results = term ? search(term) : [];

    useEffect(() => {
        const handle = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setOpen(false);
                onClose?.();
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [onClose]);

    useEffect(() => { setActive(0); }, [term]);

    const pick = (item) => {
        onPick(item.id);
        setTerm('');
        setOpen(false);
    };

    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            setOpen(false);
            setTerm('');
            onClose?.();
        } else if (e.key === 'ArrowDown' && results.length) {
            e.preventDefault();
            setOpen(true);
            setActive(i => (i + 1) % results.length);
        } else if (e.key === 'ArrowUp' && results.length) {
            e.preventDefault();
            setActive(i => (i - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && results[active]) {
            e.preventDefault();
            pick(results[active]);
        }
    };

    return (
        <div ref={rootRef} className={`stock-picker ${className}`}>
            <div className="stock-picker-box" style={accentColor && term ? { borderColor: accentColor } : undefined}>
                <Search size={15} className="stock-picker-icon" />
                <input
                    autoFocus={autoFocus}
                    value={term}
                    placeholder={placeholder}
                    onChange={(e) => { setTerm(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    role="combobox"
                    aria-expanded={open && results.length > 0}
                    aria-autocomplete="list"
                />
            </div>
            {open && (results.length > 0 || hint) && (
                <div className="stock-picker-results" role="listbox">
                    {hint && <div className="stock-picker-hint">{hint}</div>}
                    {results.map((item, i) => (
                        <button
                            key={item.id}
                            role="option"
                            aria-selected={i === active}
                            className={`stock-picker-item ${i === active ? 'active' : ''}`}
                            onMouseEnter={() => setActive(i)}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => pick(item)}
                        >
                            <span className="stock-picker-code">{item.code}</span>
                            <span className="stock-picker-name">{item.name}</span>
                            {item.meta && <span className="stock-picker-meta">{item.meta}</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StockPicker;
