import React, { useState, useEffect, useCallback } from 'react';

type ArrowSelectorProps<T> = {
    options: T[];
    onChange?: (selected: T) => void;   // Callback when selection changes
}

const ArrowSelector = <T extends string | number>({ options, onChange }: ArrowSelectorProps<T>) => {
    const [index, setIndex] = useState<number>(0);

    const updateIndex = (newIndex: number) => {
        setIndex(newIndex);
        if (onChange) {
            onChange(options[newIndex]);
        }
    };

    // Handler for keydown events
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
            setIndex((prev) => {
                const next = Math.max(prev - 1, 0);
                if (onChange) {
                    onChange(options[next]);
                }
                return next;
            });
        } else if (event.key === 'ArrowRight') {
            setIndex((prev) => {
                const next = Math.min(prev + 1, options.length - 1);
                if (onChange) {
                    onChange(options[next]);
                }
                return next;
            });
        }
    }, [options, onChange]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const counterCss: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        fontSize: "24px",
    };

    return (
        <div style={counterCss}>
            <button onClick={() => updateIndex(index > 0 ? index - 1:index)}
                disabled={index === 0} 
                >←</button>
            <span>{[options[index]]}</span>
            <button onClick={() => updateIndex(index + 1 < options.length ? index + 1 : index)}
                disabled={index === options.length - 1}
            >→</button>
        </div>
    );
}

export default ArrowSelector;