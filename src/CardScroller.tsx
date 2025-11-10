import React, { useState, useMemo, useRef, useEffect } from "react";
import "./App.css";

const CARDS_PRE_VIEW = 3;

type Card = {
	id: number;
	content: string;
}
interface Props {
	cards: Card[];
	selectedIndex: number;
	onSelectedIndexChange: (index: number) => void;
	onNextSet?: () => void;
	onPrevSet?: () => void;
}

const CardScroller: React.FC<Props> = ({
	cards, 
	selectedIndex,
	onSelectedIndexChange,
	onNextSet, 
	onPrevSet 
}) => {
	const [activeDot, setActiveDot] = useState(0);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

	// Calculate dots
	const dotCount = useMemo(() => Math.max(1, Math.ceil(cards.length / CARDS_PRE_VIEW)), [cards]);

	// Update index using keyboard arrows
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") {
				onSelectedIndexChange(Math.min(selectedIndex + 1, cards.length - 1));
			} else if (e.key === "ArrowLeft") {
				onSelectedIndexChange(Math.max(selectedIndex - 1, 0));
			} else if (e.key === "Enter") {
				if (onNextSet) onNextSet();
			} else if (e.key === "Backspace") {
				if (onPrevSet) onPrevSet();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [cards, selectedIndex, onSelectedIndexChange, onNextSet, onPrevSet]);

	// If card reached egde, scroll
	useEffect(() => {
		const selectedCard = cardRefs.current[selectedIndex];
		if (selectedCard) {
			selectedCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
		}
	}, [selectedIndex, cards]);

	// Update active dot based on scroll position
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const onScroll = () => {
			const totalScrollable = el.scrollWidth - el.clientWidth;
			const ratio = totalScrollable > 0 ? el.scrollLeft / totalScrollable : 0;
			const idx = Math.min(dotCount - 1, Math.max(0, Math.round(ratio * (dotCount - 1))));
			setActiveDot(idx);
		};
		el.addEventListener("scroll", onScroll, { passive: true });
		onScroll(); // Initial call
		return () => el.removeEventListener("scroll", onScroll);
	}, [dotCount]);

	const cardStyle: React.CSSProperties = {
		flex: "0 0 auto",
		width: "220px",
		height: "140px",
		borderRadius: "4px",
		background: "#000",
		boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
	};

	const contentStyle: React.CSSProperties = {
		display: "flex",
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
		color: "#fff",
		fontWeight: "bold",
		fontSize: "30px",
		lineHeight: "1.5",
		textAlign: "center",
		whiteSpace: "pre-line",
	};

	return (
		<div style={{ width: "100%", maxWidth: 720, margin: "24px auto" }}>
			<div
				ref={containerRef}
				className="scroll-hide"
				style={{
					display: "flex",
					overflowX: "auto",
					border: "1px solid #fa7979ff",
					borderRadius: "8px",
					padding: "12px",
					gap: "12px",
					scrollBehavior: "smooth",
				}}
			>
				{cards.map((card, index) => (
					<div
						key={card.id}
						ref={(el) => { cardRefs.current[index] = el; }}
						style={{
							...cardStyle,
							border: index === selectedIndex ? "2px solid #fff" : "1px solid #000", 
						}}
					>
					<div style={contentStyle}>
						  {card.content}
					</div>
				</div>
			))}
		</div>
		
		<div
		  aria-label="Scroll position"
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				gap: 8,
				marginTop: 12,
			}}
		>
			{Array.from({ length: dotCount }, (_, i) => {
				const isActive = i === activeDot;
				return (
					<button
						key={i}
						style={{
							width: 12,
							height: 12,
							borderRadius: "50%",
							border: "1px solid #333",
							background: isActive ? "#fff" : "#333",
							padding: 0,
						}}
						aria-label={`Scroll to section ${i + 1}`}
						title={`Go to position ${i + 1}`}	
					/>
				);
			})}
		</div>
		</div>
	);
};

export default CardScroller;
export type { Card };
