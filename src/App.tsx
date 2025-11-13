import React, { useState } from "react";
//import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import CardScroller from "./CardScroller";
import type { Card } from "./CardScroller";
import Bottle1_icon from "./assets/parts/setting/Bottle1.png";
import Bottle2_icon from "./assets/parts/setting/Bottle2.png";
import Bottle3_icon from "./assets/parts/setting/Bottle3.png";

const cards_1st: Card[] = [
	{ id: 0, title: "洗濯のみ", editable: false, options: [], next: true },
	{ id: 1, title: "洗濯＋乾燥", editable: false, options: [], next: true },
	{ id: 2, title: "乾燥のみ", editable: false, options: [], next: true },
	{ id: 3, title: "スチーム", editable: false, options: [], next: true },
	{ id: 4, title: "ダウンロード", editable: false, options: [], next: true },
	{ id: 5, title: "お手入れ", editable: false, options: [], next: true },
	{ id: 6, title: "設定", editable: false, options: [], next: true },
];
const cards_2nd: Card[] = [
	{ id: 0, title: "おまかせ", editable: false, options: [], next: true },
	{ id: 1, title: "わが家流", editable: false, options: [], next: true },
	{ id: 2, title: "省エネ", editable: false, options: [], next: true },
	{ id: 3, title: "ナイト", editable: false, options: [], next: true },
	{ id: 4, title: "汚れはがし", editable: false, options: [], next: true },
	{ id: 5, title: "約40℃おまかせ", editable: false, options: [], next: true },
	{ id: 6, title: "パワフル滝", editable: false, options: [], next: true },
	{ id: 7, title: "どろんこ", editable: false, options: [], next: true },
	{ id: 8, title: "約40℃\nにおいスッキリ", editable: false, options: [], next: true },
	{ id: 9, title: "約40℃つけ置き\n(普段着)", editable: false, options: [], next: true },
	{ id: 10, title: "約40℃おまかせ\n(除菌)", editable: false, options: [], next: true },
	{ id: 11, title: "タオル専用", editable: false, options: [], next: true },
	{ id: 12, title: "化繊60分", editable: false, options: [], next: true },
	{ id: 13, title: "毛布", editable: false, options: [], next: true },
	{ id: 14, title: "約40℃毛布", editable: false, options: [], next: true },
	{ id: 15, title: "個別洗濯", editable: false, options: [], next: true },
];
const cards_3rd: Card[] = [
	{ id: 0, title: "洗剤", icon: <img src={Bottle1_icon} width="20" height="24" />, editable: true, options: ["標準", "少なめ", "多め"], next: false },
	{ id: 1, title: "柔軟剤", icon: <img src={Bottle2_icon} width="20" height="24" />, editable: true, options: ["標準", "少なめ", "多め"], next: false },
	{ id: 2, title: "おしゃれ着洗剤", icon: <img src={Bottle3_icon} width="20" height="24" />, editable: true, options: ["標準", "少なめ", "多め"], next: false },
	{ id: 3, title: "洗い", editable: true, options: ["自動", ...Array.from({ length: 30 }, (_, i) => `${i + 1}分`)], next: false },
	{ id: 4, title: "すすぎ", editable: true, options: ["自動", ...Array.from({ length: 30 }, (_, i) => `${i + 1}分`)], next: false},
	{ id: 5, title: "脱水", editable: true, options: ["標準", ...Array.from({ length: 30 }, (_, i) => `${i + 1}分` )], next: false },
	{ id: 6, title: "乾燥", editable: true, options: ["標準", ...Array.from({ length: 30 }, (_, i) => `${i + 1}分`)], next: false },
	{ id: 7, title: "水位", editable: true, options: ["自動", "15ℓ", "20ℓ", "25ℓ", "30ℓ", "35ℓ", "40ℓ", "45ℓ", "50ℓ", "55ℓ"], next: false },
	{ id: 8, title: "2度洗い", editable: true, options: ["あり", "なし"], next: false },
	{ id: 9, title: "予約", editable: true, options: ["なし", ...Array.from({ length: 24 }, (_, i) => `${i + 1}時間後`)], next: false },
];

const contentsSet = [
	{ id: 0, cards: cards_1st, hint: "運転内容を選んでください" },
	{ id: 1, cards: cards_2nd, hint: "運転内容を選んでください" },
	{ id: 2, cards: cards_3rd, hint: "内容を確認し、「スタート」を押してください" },
];

const App: React.FC = () => {
	const [setIndex, setSetIndex] = useState(0);
	const [selectedIndices, setSelectedIndices] = useState<number[]>(
		contentsSet.map(() => 0)
	);
	const [course1, setCourse1] = useState<string>(contentsSet[0].cards[0].title);
	const [course2, setCourse2] = useState<string>(contentsSet[1].cards[0].title);

	const currentSelectedIndex = selectedIndices[setIndex];

	const updateSelectedIndex = (index: number) => {
		setSelectedIndices((prev) => {
			const copy = [...prev];
			copy[setIndex] = index;
			return copy;
		});
	}
	const nextSet = (index: number) => {
		if (setIndex === 0) {
			setCourse1(contentsSet[0].cards[index].title);
		} else if (setIndex === 1) {
			setCourse2(contentsSet[1].cards[index].title);
		}
		setSetIndex((prev) => Math.min(prev + 1, contentsSet.length - 1));
	}
	const prevSet = () => {
		if (setIndex === 0) {
			setCourse1("");
		} else if (setIndex === 1) {
			setCourse2("");
		}
		setSetIndex((prev) => Math.max(prev - 1, 0));
	}

	return (
		<CardScroller
			content={contentsSet[setIndex]}
			selectedIndex={currentSelectedIndex}
			course1={course1}
			course2={course2}
			onSelectedIndexChange={updateSelectedIndex}
			onNextSet={nextSet}
			onPrevSet={prevSet}
		/>
	);
}

export default App;
