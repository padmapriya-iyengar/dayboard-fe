import React, { useState } from "react";

interface ShoppingItem {
  id: number;
  name: string;
  added: string;
  bought?: boolean;
  boughtDate?: string;
}

function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>(() =>
    JSON.parse(localStorage.getItem("dayboard.grocery") || "[]")
  );
  const [text, setText] = useState<string>("");

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

  return (
    <div className="shopping-list">
      <div className="input-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add grocery item"
          onKeyPress={(e) => e.key === "Enter" && add()}
        />
        <button onClick={add}>Add Item</button>
      </div>

      <div className="list-stats">
        <span>Total: {items.length}</span>
        <span>Remaining: {items.filter((i) => !i.bought).length}</span>
        <span>Bought: {items.filter((i) => i.bought).length}</span>
      </div>

      <ul className="list grocery-list">
        {items.map((item) => (
          <li key={item.id} className={item.bought ? "bought" : ""}>
            <div className="item-content">
              <span className="item-name">{item.name}</span>
              {item.bought && <span className="bought-date">✓ Bought</span>}
            </div>
            <div className="item-actions">
              <button
                className="toggle-btn"
                onClick={() => markBought(item.id)}
              >
                {item.bought ? "Undo" : "Mark Bought"}
              </button>
              <button
                className="small remove-btn"
                onClick={() => remove(item.id)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="empty-state">
            <span>No items in your shopping list</span>
          </li>
        )}
      </ul>
    </div>
  );
}

export default ShoppingList;
