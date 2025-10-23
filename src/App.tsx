import { useState, useEffect } from "react";
import Board from "./components/Board";
import { GROCERY_CATEGORIES } from "./config/categories";
import {
  BOARD_CONFIGS,
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

interface Person {
  id: number;
  name: string;
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

export default function App() {
  const [selected, setSelected] = useState<BoardKey>(
    () => (localStorage.getItem("dayboard.selected") as BoardKey) || "grocery"
  );
  const [subTab, setSubTab] = useState<string>(
    () => localStorage.getItem("dayboard.subtab") || "cart"
  );
  const [isDark, setIsDark] = useState<boolean>(
    () => localStorage.getItem("dayboard.theme") === "dark"
  );
  const [persons, setPersons] = useState<Person[]>([]);

  // Fetch persons from API
  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const response = await fetch("http://localhost:3002/api/v1/persons");
        if (response.ok) {
          const responseData = await response.json();
          console.log("API Response:", responseData); // Debug log

          // Handle the correct API response structure
          if (
            responseData.status === "success" &&
            responseData.data?.persons &&
            Array.isArray(responseData.data.persons) &&
            responseData.data.persons.length > 0
          ) {
            // Map the API response to our expected format
            const personsData = responseData.data.persons.map(
              (person: any) => ({
                id: person.Id,
                name: person.Name,
              })
            );

            setPersons(personsData);
          } else {
            console.warn(
              "API response structure is not as expected:",
              responseData
            );
            // Fallback to default persons
            setPersons([
              { id: 1, name: "Joshi" },
              { id: 2, name: "Nandu" },
            ]);
          }
        } else {
          console.error("Failed to fetch persons, status:", response.status);
          // Fallback to default persons if API fails
          setPersons([
            { id: 1, name: "Joshi" },
            { id: 2, name: "Nandu" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching persons:", error);
        // Fallback to default persons if API fails
        setPersons([
          { id: 1, name: "Joshi" },
          { id: 2, name: "Nandu" },
        ]);
      }
    };

    fetchPersons();
  }, []);

  // Create dynamic SUB_TABS based on API response
  const SUB_TABS: Record<BoardKey, SubTabItem[]> = {
    grocery: GROCERY_SUB_TABS.map((tab) => ({
      key: tab.key,
      title: tab.title,
    })),
    "grocery-inventory": GROCERY_CATEGORIES.map((category) => ({
      key: category.value,
      title: category.label,
    })),
    finance:
      Array.isArray(persons) && persons.length > 0
        ? persons.map((person) => ({
            key: person.name.toLowerCase(),
            title: person.name,
          }))
        : [
            { key: "joshi", title: "Joshi" },
            { key: "nandu", title: "Nandu" },
          ],
    reminder: REMINDER_SUB_TABS.map((tab) => ({
      key: tab.key,
      title: tab.title,
    })),
    task: TASK_SUB_TABS.map((tab) => ({ key: tab.key, title: tab.title })),
  };

  useEffect(() => {
    localStorage.setItem("dayboard.selected", selected);
  }, [selected]);

  useEffect(() => {
    localStorage.setItem("dayboard.subtab", subTab);
  }, [subTab]);

  useEffect(() => {
    localStorage.setItem("dayboard.theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Reset subtab when changing main tab or when persons are loaded
  useEffect(() => {
    const subTabs = SUB_TABS[selected];
    if (subTabs && subTabs.length > 0) {
      setSubTab(subTabs[0].key);
    }
  }, [selected, persons]); // Added persons dependency

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
