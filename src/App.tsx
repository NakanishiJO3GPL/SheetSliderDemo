import React, { useState, useMemo, useRef, useEffect, use } from "react";
import { invoke } from "@tauri-apps/api/core";
import { FluentProvider, webLightTheme, Button, teamsDarkTheme } from "@fluentui/react-components";
import "./App.css";
import CardScroller from "./CardScroller";
import type { Card } from "./CardScroller";
import ArrowSelector from "./ArrowSelector";

const cards_1st: Card[] = [
	{ id: 0, content: "洗濯のみ" },
	{ id: 1, content: "洗濯＋乾燥" },
	{ id: 2, content: "乾燥のみ" },
	{ id: 3, content: "スチーム" },
	{ id: 4, content: "ダウンロード" },
	{ id: 5, content: "お手入れ" },
	{ id: 6, content: "設定" },
];
const cards_2nd: Card[] = [
	{ id: 0, content: "おまかせ" },
	{ id: 1, content: "わが家流" },
	{ id: 2, content: "省エネ" },
	{ id: 3, content: "ナイト" },
	{ id: 4, content: "汚れはがし" },
	{ id: 5, content: "約40℃おまかせ" },
	{ id: 6, content: "パワフル滝" },
	{ id: 7, content: "どろんこ" },
	{ id: 8, content: "約40℃\nにおいスッキリ" },
	{ id: 9, content: "約40℃つけ置き\n(普段着)" },
	{ id: 10, content: "約40℃おまかせ\n(除菌)" },
	{ id: 11, content: "タオル専用" },
	{ id: 12, content: "化繊60分" },
	{ id: 13, content: "毛布" },
	{ id: 14, content: "約40℃毛布" },
	{ id: 15, content: "個別洗濯" },
];
const cards_3rd: Card[] = [
	{ id: 0, content: "洗剤\n標準" },
  { id: 1, content: "柔軟剤\n標準" },
	{ id: 2, content: "おしゃれ着洗剤 標準" },
	{ id: 3, content: "洗い\n自動" },
	{ id: 4, content: "すすぎ\n自動" },
	{ id: 5, content: "脱水\n13分" },
	{ id: 6, content: "乾燥\n標準" },
	{ id: 7, content: "水位\n自動" },
	{ id: 8, content: "2度洗い\n切" },
	{ id: 9, content: "予約\nなし" },
];

const cardSets = [cards_1st, cards_2nd, cards_3rd];

const App: React.FC = () => {
	const [setIndex, setSetIndex] = useState(0);
	const [selectedIndices, setSelectedIndices] = useState<number[]>(
		cardSets.map(() => 0)
	);

	const currentSelectedIndex = selectedIndices[setIndex];

	const updateSelectedIndex = (index: number) => {
		setSelectedIndices((prev) => {
			const copy = [...prev];
			copy[setIndex] = index;
			return copy;
		});
	}
	const nextSet = () => {
		setSetIndex((prev) => Math.min(prev + 1, cardSets.length - 1));
	}

	const prevSet = () => {
		setSetIndex((prev) => Math.max(prev - 1, 0));
	}

	const [selected, setSelected] = useState<string | number>("");

	return (
		<FluentProvider theme={teamsDarkTheme}>
			<CardScroller
				cards={cardSets[setIndex]}
				selectedIndex={currentSelectedIndex}
				onSelectedIndexChange={updateSelectedIndex}
				onNextSet={nextSet}
				onPrevSet={prevSet}
			/>
			<ArrowSelector
				options={cardSets[setIndex].map(card => card.content)}
				onChange={(value) => setSelected(value)} />
			<p>選択中の値 : {selected}</p>
		</FluentProvider>
	);
}

export default App;
