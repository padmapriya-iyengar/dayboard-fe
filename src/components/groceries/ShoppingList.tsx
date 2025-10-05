import { useState } from "react";

interface ShoppingItem {
  id: number;
  name: string;
  added: string;
  bought?: boolean;
  boughtDate?: string;
}

interface ShoppingListProps {
  type?: "cart" | "active" | "completed";
}

function ShoppingList({ type = "cart" }: Readonly<ShoppingListProps>) {
  const [items, setItems] = useState<ShoppingItem[]>(() =>
    JSON.parse(localStorage.getItem("dayboard.grocery") || "[]")
  );
  const [text, setText] = useState<string>("");

  // Filter items based on type
  const getFilteredItems = () => {
    switch (type) {
      case "cart":
        return items.filter((item) => !item.bought);
      case "active":
        return items.filter((item) => !item.bought);
      case "completed":
        return items.filter((item) => item.bought);
      default:
        return items;
    }
  };

  const filteredItems = getFilteredItems();

  const add = () => {
    if (!text.trim()) return;
    const next: ShoppingItem[] = [
      ...items,
      { id: Date.now(), name: text.trim(), added: new Date().toISOString() },
    ];
    setItems(next);
    localStorage.setItem("dayboard.grocery", JSON.stringify(next));
    setText("");
  };

  const remove = (id: number) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    localStorage.setItem("dayboard.grocery", JSON.stringify(next));
  };

  const markBought = (id: number) => {
    const next = items.map((item) =>
      item.id === id
        ? {
            ...item,
            bought: !item.bought,
            boughtDate: new Date().toISOString(),
          }
        : item
    );
    setItems(next);
    localStorage.setItem("dayboard.grocery", JSON.stringify(next));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      add();
    }
  };

  return (
    <div className="shopping-list">
      {type !== "completed" && (
        <div className="input-row">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add grocery item"
            onKeyDown={handleKeyDown}
          />
          <button onClick={add}>Add Item</button>
        </div>
      )}

      <div className="list-stats">
        <span>Total: {items.length}</span>
        <span>Remaining: {items.filter((i) => !i.bought).length}</span>
        <span>Bought: {items.filter((i) => i.bought).length}</span>
      </div>

      <ul className="list grocery-list">
        {filteredItems.map((item) => (
          <li key={item.id} className={item.bought ? "bought" : ""}>
            <div className="item-content">
              <span className="item-name">{item.name}</span>
              {item.bought && <span className="bought-date">✓ Bought</span>}
            </div>
            <div className="item-actions">
              {type !== "completed" && (
                <button
                  className="toggle-btn"
                  onClick={() => markBought(item.id)}
                >
                  {item.bought ? "Undo" : "Mark Bought"}
                </button>
              )}
              <button
                className="small remove-btn"
                onClick={() => remove(item.id)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {filteredItems.length === 0 && (
          <li className="empty-state">
            <span>
              {type === "completed"
                ? "No completed items"
                : "No items in your shopping list"}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

export default ShoppingList;
