import React, { useState, useEffect } from "react";
import Board from "./components/Board";
import { GROCERY_CATEGORIES } from "./config/categories";
import {
  BOARD_CONFIGS,
  FINANCE_SUB_TABS,
  REMINDER_SUB_TABS,
  TASK_SUB_TABS,
  GROCERY_SUB_TABS,
} from "./config/boards";

// Type definitions
interface BoardItem {
  key: string;
  title: string;
  description: string;
}

interface SubTabItem {
  key: string;
  title: string;
}

type BoardKey =
  | "grocery"
  | "grocery-inventory"
  | "finance"
  | "reminder"
  | "task";

const BOARDS: BoardItem[] = BOARD_CONFIGS.map((config) => ({
  key: config.key,
  title: config.title,
  description: config.description,
}));

const SUB_TABS: Record<BoardKey, SubTabItem[]> = {
  grocery: GROCERY_SUB_TABS.map((tab) => ({ key: tab.key, title: tab.title })),
  "grocery-inventory": GROCERY_CATEGORIES.map((category) => ({
    key: category.value,
    title: category.label,
  })),
  finance: FINANCE_SUB_TABS.map((tab) => ({ key: tab.key, title: tab.title })),
  reminder: REMINDER_SUB_TABS.map((tab) => ({
    key: tab.key,
    title: tab.title,
  })),
  task: TASK_SUB_TABS.map((tab) => ({ key: tab.key, title: tab.title })),
};

export default function App() {
  const [selected, setSelected] = useState<BoardKey>(
    () => (localStorage.getItem("dayboard.selected") as BoardKey) || "grocery"
  );
  const [subTab, setSubTab] = useState<string>(
    () => localStorage.getItem("dayboard.subtab") || "shopping"
  );
  const [isDark, setIsDark] = useState<boolean>(
    () => localStorage.getItem("dayboard.theme") === "dark"
  );

  useEffect(() => {
    localStorage.setItem("dayboard.selected", selected);
  }, [selected]);

  useEffect(() => {
    localStorage.setItem("dayboard.subtab", subTab);
  }, [subTab]);

  useEffect(() => {
    localStorage.setItem("dayboard.theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Reset subtab when changing main tab
  useEffect(() => {
    const subTabs = SUB_TABS[selected];
    if (subTabs && subTabs.length > 0) {
      setSubTab(subTabs[0].key);
    }
  }, [selected]);

  return (
    <div
      className={`app-root horizontal ${isDark ? "dark-theme" : "light-theme"}`}
    >
      {/* Header with logo and dark mode toggle */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">🌳</div>
            <h1 className="logo-text">DayBoard</h1>
          </div>
        </div>
        <div className="header-right">
          <button className="dark-toggle" onClick={() => setIsDark(!isDark)}>
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      {/* Main navigation tabs */}
      <nav className="main-nav">
        {BOARDS.map((board) => (
          <button
            key={board.key}
            className={`nav-tab ${selected === board.key ? "active" : ""}`}
            onClick={() => setSelected(board.key as BoardKey)}
          >
            {board.title}
          </button>
        ))}
      </nav>

      {/* Sub navigation tabs */}
      {SUB_TABS[selected] && (
        <nav className="sub-nav">
          {SUB_TABS[selected].map((tab) => (
            <button
              key={tab.key}
              className={`sub-tab ${subTab === tab.key ? "active" : ""}`}
              onClick={() => setSubTab(tab.key)}
            >
              {tab.title}
            </button>
          ))}
        </nav>
      )}

      {/* Legacy sidebar (hidden in new layout) */}
      <aside className="sidebar" style={{ display: "none" }}>
        <div className="brand">DayBoard</div>
        <nav>
          {BOARDS.map((b) => (
            <button
              key={b.key}
              className={`board-btn ${selected === b.key ? "active" : ""}`}
              onClick={() => setSelected(b.key as BoardKey)}
            >
              <div className="meta">
                <div className="title">{b.title}</div>
                <div className="desc">{b.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <section className="content">
          <Board boardKey={selected} subTab={subTab} />
        </section>
      </main>
    </div>
  );
}
