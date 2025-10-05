import { useState } from "react";
import {
  GROCERY_CATEGORIES,
  getCategoryLabel,
  type Category,
} from "../../config/categories";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  added: string;
}

// Add default "Select Category" option to the grocery categories
const CATEGORIES: Category[] = [
  { value: "", label: "Select Category" },
  ...GROCERY_CATEGORIES,
];

function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    JSON.parse(localStorage.getItem("dayboard.inventory") || "[]")
  );
  const [itemName, setItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const addInventoryItem = () => {
    if (!itemName.trim() || !selectedCategory) return;

    const next = [
      ...inventory,
      {
        id: Date.now(),
        name: itemName.trim(),
        category: selectedCategory,
        added: new Date().toISOString(),
      },
    ];
    setInventory(next);
    localStorage.setItem("dayboard.inventory", JSON.stringify(next));
    setItemName("");
    setSelectedCategory("");
  };

  const removeInventoryItem = (id: number) => {
    const next = inventory.filter((i: InventoryItem) => i.id !== id);
    setInventory(next);
    localStorage.setItem("dayboard.inventory", JSON.stringify(next));
  };

  return (
    <div className="inventory">
      <div className="add-item-form">
        <div className="input-row">
          <input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item name"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <button
            onClick={addInventoryItem}
            disabled={!itemName.trim() || !selectedCategory}
          >
            Add Item
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-container">
        {inventory.length > 0 ? (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>CATEGORY</th>
                <th>ADDED ON</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item: InventoryItem, index: number) => (
                <tr key={item.id}>
                  <td className="item-id">{index + 1}</td>
                  <td className="item-name">{item.name}</td>
                  <td className="item-category">
                    {getCategoryLabel(item.category)}
                  </td>
                  <td className="item-date">
                    {new Date(item.added).toLocaleDateString("en-GB")}
                  </td>
                  <td className="item-actions">
                    <button className="action-btn edit-btn" title="Edit">
                      ✏️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => removeInventoryItem(item.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <span>No items in inventory</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventory;
