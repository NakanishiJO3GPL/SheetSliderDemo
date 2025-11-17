import React from 'react';
import './App.css';

type ArrowSelectorProps = {
    title: string;
    options: string[];
    selectedIndex: number;
    onIndexChange: (index: number) => void;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const ArrowSelector: React.FC<ArrowSelectorProps> = ({ title, options, selectedIndex, leftIcon, rightIcon }) => {

    const isAtStart = selectedIndex === 0;
    const isAtEnd = selectedIndex === options.length - 1;

    return (
        <div className="arrow-selector-container">
            <div className="row-title">{title}</div>

            <div className="row" role="group" aria-label="icon text icon">
                <span className={`icon ${isAtStart ? 'disabled' : ''}`} aria-hidden="true">
                    {leftIcon ?? <DefaultIcon />}
                </span>
                <span className="label" aria-label={title}>
                    {options[selectedIndex]}
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