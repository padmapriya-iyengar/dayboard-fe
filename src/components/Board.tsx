import React, { useState } from "react";
import { GroceryBoard } from "./groceries";
import { GROCERY_CATEGORIES, getCategoryByValue } from "../config/categories";

// Type definitions
interface BoardProps {
  boardKey: string;
  subTab?: string;
}

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  added: string;
}

interface FinanceEntry {
  id: number;
  desc: string;
  amount: number;
  type: string;
}

interface ReminderItem {
  id: number;
  text: string;
  urgent: boolean;
  added: string;
  date?: string; // For backward compatibility
}

interface TaskItem {
  id: number;
  text: string;
  done: boolean;
}

export default function Board({ boardKey, subTab }: BoardProps) {
  switch (boardKey) {
    case "grocery":
      return <GroceryBoard subTab={subTab} />;
    case "grocery-inventory":
      return <GroceryInventoryBoard subTab={subTab} />;
    case "finance":
      return <FinanceBoard subTab={subTab} />;
    case "reminder":
      return <ReminderBoard subTab={subTab} />;
    case "task":
      return <TaskBoard subTab={subTab} />;
    default:
      return <div>Unknown board</div>;
  }
}

interface GroceryInventoryBoardProps {
  subTab?: string;
}

function GroceryInventoryBoard({ subTab }: GroceryInventoryBoardProps) {
  // Import the Inventory component from groceries folder
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    JSON.parse(localStorage.getItem("dayboard.inventory") || "[]")
  );
  const [itemName, setItemName] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>("");

  // Get current category info
  const currentCategory =
    getCategoryByValue(subTab || "") || GROCERY_CATEGORIES[0];

  // Filter items by current category
  const filteredItems = inventory.filter((item) => item.category === subTab);

  const addInventoryItem = () => {
    if (!itemName.trim() || !subTab) return;

    const next: InventoryItem[] = [
      ...inventory,
      {
        id: Date.now(),
        name: itemName.trim(),
        category: subTab, // Use current sub-tab as category
        added: new Date().toISOString(),
      },
    ];
    setInventory(next);
    localStorage.setItem("dayboard.inventory", JSON.stringify(next));
    setItemName("");
  };

  const removeInventoryItem = (id: number) => {
    const next = inventory.filter((i) => i.id !== id);
    setInventory(next);
    localStorage.setItem("dayboard.inventory", JSON.stringify(next));
  };

  const startEdit = (id: number, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = () => {
    if (!editingName.trim() || editingId === null) return;

    const next = inventory.map((item) =>
      item.id === editingId ? { ...item, name: editingName.trim() } : item
    );
    setInventory(next);
    localStorage.setItem("dayboard.inventory", JSON.stringify(next));
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="grocery-container">
      <h3>{currentCategory.label}</h3>
      <p>Manage items in the {currentCategory.label.toLowerCase()} category.</p>

      <div className="add-item-form">
        <div className="input-row">
          <input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder={`Add ${currentCategory.label.toLowerCase()} item`}
            onKeyPress={(e) =>
              e.key === "Enter" && itemName.trim() && addInventoryItem()
            }
          />
          <button onClick={addInventoryItem} disabled={!itemName.trim()}>
            Add to {currentCategory.label}
          </button>
        </div>
      </div>

      {/* Category Items Table */}
      <div className="inventory-table-container">
        {filteredItems.length > 0 ? (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>ADDED ON</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="item-id">{index + 1}</td>
                  <td className="item-name">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        className="edit-input"
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td className="item-date">
                    {new Date(item.added).toLocaleDateString("en-GB")}
                  </td>
                  <td className="item-actions">
                    {editingId === item.id ? (
                      <>
                        <button
                          className="action-btn save-btn"
                          onClick={saveEdit}
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          className="action-btn cancel-btn"
                          onClick={cancelEdit}
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => startEdit(item.id, item.name)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => removeInventoryItem(item.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <span>
              No {currentCategory.label.toLowerCase()} items in inventory
            </span>
          </div>
        )}
      </div>

      {/* Category Summary */}
      {filteredItems.length > 0 && (
        <div className="category-summary">
          <p>
            <strong>{filteredItems.length}</strong> items in{" "}
            {currentCategory.label}
          </p>
        </div>
      )}
    </div>
  );
}

interface FinanceBoardProps {
  subTab?: string;
}

function FinanceBoard({ subTab }: FinanceBoardProps) {
  const [entries, setEntries] = useState<FinanceEntry[]>(() =>
    JSON.parse(localStorage.getItem("dayboard.finance") || "[]")
  );
  const [desc, setDesc] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const add = () => {
    const n = parseFloat(amount);
    if (!desc.trim() || Number.isNaN(n)) return;
    const next: FinanceEntry[] = [
      ...entries,
      {
        id: Date.now(),
        desc: desc.trim(),
        amount: n,
        type: subTab || "expenses",
      },
    ];
    setEntries(next);
    localStorage.setItem("dayboard.finance", JSON.stringify(next));
    setDesc("");
    setAmount("");
  };

  const filteredEntries = entries.filter(
    (e) => e.type === (subTab || "expenses")
  );
  const total = filteredEntries.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="board">
      <h3>
        {subTab === "income"
          ? "Income"
          : subTab === "transfers"
          ? "Transfers"
          : "Expenses"}
      </h3>
      <p>
        Log{" "}
        {subTab === "income"
          ? "income entries"
          : subTab === "transfers"
          ? "money transfers"
          : "quick expenses"}
        .
      </p>
      <div className="input-row">
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />
        <button onClick={add}>Add</button>
      </div>
      <div className="finance-summary">
        Total: <strong>₹{total.toFixed(2)}</strong>
      </div>
      <ul className="list">
        {filteredEntries.map((en) => (
          <li key={en.id}>
            {en.desc} — ₹{en.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ReminderBoardProps {
  subTab?: string;
}

function ReminderBoard({ subTab }: ReminderBoardProps) {
  const [notes, setNotes] = useState<ReminderItem[]>(() =>
    JSON.parse(localStorage.getItem("dayboard.reminder") || "[]")
  );
  const [text, setText] = useState<string>("");

  const add = () => {
    if (!text.trim()) return;
    const next: ReminderItem[] = [
      {
        id: Date.now(),
        text: text.trim(),
        urgent: false,
        added: new Date().toISOString(),
      },
      ...notes,
    ];
    setNotes(next);
    localStorage.setItem("dayboard.reminder", JSON.stringify(next));
    setText("");
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toDateString();
    return new Date(dateStr).toDateString() === today;
  };

  const filteredNotes =
    subTab === "today"
      ? notes.filter((n) => isToday(n.date || n.added))
      : notes.filter((n) => !isToday(n.date || n.added));

  return (
    <div className="board">
      <h3>{subTab === "today" ? "Today's Reminders" : "Upcoming Reminders"}</h3>
      <p>Quick reminders for {subTab === "today" ? "today" : "later"}.</p>
      <div className="input-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New reminder"
        />
        <button onClick={add}>Add</button>
      </div>
      <ul className="list reminders">
        {filteredNotes.map((n) => (
          <li key={n.id}>{n.text}</li>
        ))}
      </ul>
    </div>
  );
}

interface TaskBoardProps {
  subTab?: string;
}

function TaskBoard({ subTab }: TaskBoardProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    JSON.parse(localStorage.getItem("dayboard.task") || "[]")
  );
  const [text, setText] = useState<string>("");

  const add = () => {
    if (!text.trim()) return;
    const next: TaskItem[] = [
      ...tasks,
      { id: Date.now(), text: text.trim(), done: false },
    ];
    setTasks(next);
    localStorage.setItem("dayboard.task", JSON.stringify(next));
    setText("");
  };

  const toggle = (id: number) => {
    const next = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTasks(next);
    localStorage.setItem("dayboard.task", JSON.stringify(next));
  };

  const filteredTasks =
    subTab === "completed"
      ? tasks.filter((t) => t.done)
      : tasks.filter((t) => !t.done);

  return (
    <div className="board">
      <h3>{subTab === "completed" ? "Completed Tasks" : "Active Tasks"}</h3>
      <p>Daily to-dos with simple completion toggles.</p>
      <div className="input-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New task"
        />
        <button onClick={add}>Add</button>
      </div>
      <ul className="list tasks">
        {filteredTasks.map((t) => (
          <li key={t.id} className={t.done ? "done" : ""}>
            <label>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggle(t.id)}
              />
              <span>{t.text}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
