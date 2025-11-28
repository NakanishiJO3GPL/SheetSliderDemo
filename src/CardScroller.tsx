import React, { useState, useMemo, useRef, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import ArrowSelector from "./ArrowSelector";
import { IoCaretBackSharp, IoCaretForwardSharp, IoLockClosedSharp } from "react-icons/io5";
import { FaTemperatureThreeQuarters } from "react-icons/fa6";
import Bottle1_icon from "./assets/parts/setting/Bottle1.png";
import Bottle2_icon from "./assets/parts/setting/Bottle2.png";
import Bottle3_icon from "./assets/parts/setting/Bottle3.png";
import "./App.css";

const CARDS_PRE_VIEW = 3;

type Card = {
	id: number;
	icon?: React.ReactNode;
	title: string;
	editable: boolean;
	options: string[];
	next: boolean;
}

type Contents = {
	id: number;
	cards: Card[];
	hint: string;
}

interface Props {
	content: Contents;
	selectedIndex: number;
	course1: string;
	course2: string;
	onSelectedIndexChange: (index: number) => void;
	onNextSet?: (index: number) => void;
	onPrevSet?: () => void;
}

const CardScroller: React.FC<Props> = ({
	content, 
	selectedIndex,
	course1,
	course2,
	onSelectedIndexChange,
	onNextSet, 
	onPrevSet 
}) => {
	const [activeDot, setActiveDot] = useState(0);
	const [editing, setEditing] = useState(false);
	const [selectedOptions, setSelectedOptions] = useState<Record<number, string | number>>({});
	const [editingOptionIndex, setEditingOptionIndex] = useState(0);
	// for DEBUG
	const [adcValue, setAdcValue] = useState<number>(0);
	const [keyCode, setKeyCode] = useState<string>("");
	const [keyEvent, setKeyEvent] = useState<number>(0);

	const containerRef = useRef<HTMLDivElement | null>(null);
	const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

	// Calculate dots
	const dotCount = useMemo(() => Math.max(1, Math.ceil(content.cards.length / CARDS_PRE_VIEW)), [content.cards]);

	// Update index using keyboard arrows
	useEffect(() => {
		const unlisten = listen("key-pressed", (event) => {
			if (editing) {
				// In editing mode, handle arrow keys for option selection
				const currentCard = content.cards[selectedIndex];
				if (event.payload === "Left") {
					setKeyCode("Left");
					setEditingOptionIndex((prev) => {
						const next = Math.max(prev - 1, 0);
						setSelectedOptions((opts) => ({
							...opts,
							[currentCard.id]: currentCard.options[next]
						}));
						return next;
					});
				} else if (event.payload === "Right") {
					setKeyCode("Right");
					setEditingOptionIndex((prev) => {
						const next = Math.min(prev + 1, currentCard.options.length - 1);
						setSelectedOptions((opts) => ({
							...opts,
							[currentCard.id]: currentCard.options[next]
						}));
						return next;
					});
				} else if (event.payload === "Return" || event.payload === "Ok") {
					setEditing(false);
				}
				return;
			}

			// Normal mode: card navigation
			if (event.payload === "Left") {
				setKeyCode("Left");
				onSelectedIndexChange(Math.max(selectedIndex - 1, 0));
			}
			else if (event.payload === "Right") {
				setKeyCode("Right");
				onSelectedIndexChange(Math.min(selectedIndex + 1, content.cards.length - 1));
			}
			else if (event.payload === "Ok") {
				setKeyCode("Ok");
				const currentCard = content.cards[selectedIndex];
				if (currentCard && currentCard.editable && currentCard.options.length > 0) {
					// Enter editing mode and initialize with current or default value
					const currentValue = selectedOptions[currentCard.id];
					const currentIdx = currentValue !== undefined 
						? currentCard.options.indexOf(String(currentValue))
						: 0;
					setEditingOptionIndex(currentIdx >= 0 ? currentIdx : 0);
					setEditing(true);
				} else if (currentCard.next && onNextSet) {
					onNextSet(selectedIndex);
				}
			}
			else if (event.payload === "Return") {
				setKeyCode("Return");
				if (onPrevSet) onPrevSet();
			}
		});

		return () => {
			unlisten.then((f) => f());
		}
	}, [content.cards, selectedIndex, onSelectedIndexChange, onNextSet, onPrevSet, editing, selectedOptions]);

	// for DEBUG
	useEffect(() => {
		const unlistenDebug = listen("adc-value", (event) => {
			const [adcVal, keyEvt] = event.payload as [number, number];
			setAdcValue(adcVal);
			setKeyEvent(keyEvt);
		});

		return () => {
			unlistenDebug.then((f) => f());
		}
	}, []);

	// If card reached egde, scroll
	useEffect(() => {
		const selectedCard = cardRefs.current[selectedIndex];
		if (selectedCard) {
			selectedCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
		}
	}, [selectedIndex, content.cards]);

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

	const styles: { [key: string]: React.CSSProperties } = {
		status_container: {
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: "20px",
		},
		status_label: {
			display: "flex",
			color: "#fff",
			gap: "12px",
			fontSize: "50px",
		},
		status_icon: {
			display: "flex",
			gap: "8px",
		},
		frame: {
			display: "flex",
			overflowX: "auto",
			border: "0px solid #fa7979ff",
			borderRadius: "8px",
			padding: "12px",
			gap: "12px",
			scrollBehavior: "smooth",
			background: "#000000",
		},
		card: {
			flex: "0 0 auto",
			width: "400px",
			height: "200px",
			borderRadius: "10px",
			background: "#000",
		},
		content: {
			display: "flex",
			width: "100%",
			height: "100%",
			justifyContent: "center",
			alignItems: "center",
			color: "#fff",
			fontWeight: "normal",
			fontSize: "50px",
			lineHeight: "1.5",
			textAlign: "center",
			whiteSpace: "pre-line",
		},
	};

	return (
		<div style={{ marginTop: "80px", width: "100%", maxWidth: 1200, margin: "24px auto" }}>
			<div style={styles.status_container}>
				<div style={styles.status_label}>
					<span>{course1}</span>
					<span>{course2}</span>
				</div>
				<div style={styles.status_icon}>
					<FaTemperatureThreeQuarters style={{ width: "40px", height: "44px" }} />
					<IoLockClosedSharp style={{ width: "40px", height: "44px" }} />
					<img src={Bottle1_icon} width="40" height="44"  />
					<img src={Bottle2_icon} width="40" height="44"  />
					<img src={Bottle3_icon} width="40" height="44"  />
				</div>
			</div>	
			<div ref={containerRef} className="scroll-hide" style={styles.frame} >
				{content.cards.map((card, index) => (
					<div
						key={card.id}
						ref={(el) => { cardRefs.current[index] = el; }}
						style={{
							...styles.card,
							border: index === selectedIndex ? "5px solid #fff" : "1px solid #000", 
						}}
					>
						<div style={styles.content}>
						{index === selectedIndex && editing && card.editable ? (
							<ArrowSelector
								title={card.title}
								options={card.options}
								selectedIndex={editingOptionIndex}
								onIndexChange={setEditingOptionIndex}
								leftIcon={<IoCaretBackSharp />}
								rightIcon={<IoCaretForwardSharp />}
							/>
							) : 
							(
								<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
									<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '4px' }}>
										{card.icon && <div>{card.icon}</div>}
										{card.title}
									</div>
									{card.editable && (
										<div style={{ fontSize: '50px', color: '#aaa' }}>
											{selectedOptions[card.id] !== undefined 
												? selectedOptions[card.id] 
												: card.options[0]}
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				))}
			</div>
			
			<div style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				fontSize: "50px",
				marginTop: "50px",
			}}
			>
				{content.hint}
			</div>

			<div
			  aria-label="Scroll position"
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					gap: 8,
					marginTop: 50,
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
								border: "1px solid #000000",
								background: isActive ? "#fff" : "#333",
								padding: 0,
							}}
							aria-label={`Scroll to section ${i + 1}`}
							title={`Go to position ${i + 1}`}	
						/>
					);
				})}
			</div>
			
			<div style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				fontSize: "25px",
				marginTop: "10px",
			}}
			>
				<span style={{marginRight: "10px"}}>{keyCode}</span>
				<span style={{marginRight: "10px"}}>{adcValue}</span>
				<span style={{marginRight: "10px"}}>{keyEvent}</span>
			</div>
		</div>
	);
};

export default CardScroller;
export type { Card, Contents };
