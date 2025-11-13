import React, { useState, useEffect } from 'react';
import './App.css';

type ArrowSelectorProps = {
    title: string;
    options: string[];
    onChange?: (selected: string) => void;   // Callback when selection changes
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const ArrowSelector: React.FC<ArrowSelectorProps> = ({ title, options, onChange, leftIcon, rightIcon }) => {
    const [index, setIndex] = useState<number>(0);

    // Handler for keydown events
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                setIndex((prev) => {
                    const next = Math.max(prev - 1, 0);
                    onChange?.(options[next]);
                    return next;
                });
            } else if (event.key === 'ArrowRight') {
                setIndex((prev) => {
                    const next = Math.min(prev + 1, options.length - 1);
                    onChange?.(options[next]);
                    return next;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [options.length, onChange]);

    const isAtStart = index === 0;
    const isAtEnd = index === options.length - 1;

    return (
        <div className="arrow-selector-container">
            <div className="row-title">{title}</div>

            <div className="row" role="group" aria-label="icon text icon">
                <span className={`icon ${isAtStart ? 'disabled' : ''}`} aria-hidden="true">
                    {leftIcon ?? <DefaultIcon />}
                </span>
                <span className="label" aria-label={title}>
                    {options[index]}
                </span>
                <span className={`icon ${isAtEnd ? 'disabled' : ''}`} aria-hidden="true">
                    {rightIcon ?? <DefaultIcon />}
                </span>
            </div>
        </div>
    );
}

const DefaultIcon: React.FC = () => <span className="default-icon" />;
export default ArrowSelector;