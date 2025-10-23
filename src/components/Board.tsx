import React, { useState } from "react";
import { GroceryBoard } from "./groceries";
import { FinanceBoard } from "./finance";
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Get current category info
  const currentCategory =
    getCategoryByValue(subTab || "") || GROCERY_CATEGORIES[0];

  // Filter items by current category
  const filteredItems = inventory.filter((item) => item.category === subTab);

  // Pagination logic
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Reset page when changing categories
  React.useEffect(() => {
    setCurrentPage(1);
  }, [subTab]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

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

  const addToCart = (item: InventoryItem) => {
    // Get existing grocery shopping list
    const existingCart = JSON.parse(
      localStorage.getItem("dayboard.grocery") || "[]"
    );

    // Check if item already exists in cart
    const itemExists = existingCart.some(
      (cartItem: any) => cartItem.name.toLowerCase() === item.name.toLowerCase()
    );

    if (itemExists) {
      alert(`${item.name} is already in your cart!`);
      return;
    }

    // Add new item to cart
    const newCartItem = {
      id: Date.now(),
      name: item.name,
      added: new Date().toISOString(),
      bought: false,
    };

    const updatedCart = [...existingCart, newCartItem];
    localStorage.setItem("dayboard.grocery", JSON.stringify(updatedCart));

    // Show success message
    alert(`${item.name} added to cart!`);
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
              {paginatedItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="item-id">{startIndex + index + 1}</td>
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
                          className="action-btn add-to-cart-btn"
                          onClick={() => addToCart(item)}
                          title="Add to Cart"
                        >
                          🛒
                        </button>
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

      {/* Pagination Controls */}
      {filteredItems.length > itemsPerPage && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
            {totalItems} items
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              title="First page"
            >
              ⏮
            </button>
            <button
              className="pagination-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous page"
            >
              ⏪
            </button>
            <div className="page-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${
                      currentPage === pageNum ? "active" : ""
                    }`}
                    onClick={() => goToPage(pageNum)}
                    style={
                      currentPage === pageNum
                        ? {
                            background: "#007acc",
                            color: "white",
                            borderColor: "#007acc",
                          }
                        : {}
                    }
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              className="pagination-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next page"
            >
              ⏩
            </button>
            <button
              className="pagination-btn"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              title="Last page"
            >
              ⏭
            </button>
          </div>
        </div>
      )}

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
