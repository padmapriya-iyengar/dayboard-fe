import { useState } from "react";
import "./finance.css";

interface FinanceEntry {
  id: number;
  desc: string;
  amount: number;
  type: string;
}

interface FinanceBoardProps {
  subTab?: string;
}

function FinanceBoard({ subTab }: Readonly<FinanceBoardProps>) {
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
        type: subTab || "joshi",
      },
    ];
    setEntries(next);
    localStorage.setItem("dayboard.finance", JSON.stringify(next));
    setDesc("");
    setAmount("");
  };

  const removeEntry = (id: number) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    localStorage.setItem("dayboard.finance", JSON.stringify(next));
  };

  const filteredEntries = entries.filter((e) => e.type === (subTab || "joshi"));
  const total = filteredEntries.reduce((s, e) => s + e.amount, 0);

  const getTitle = () => {
    switch (subTab) {
      case "joshi":
        return "Joshi's Finances";
      case "nandu":
        return "Nandu's Finances";
      default:
        return "Joshi's Finances";
    }
  };

  const getDescription = () => {
    switch (subTab) {
      case "joshi":
        return "financial entries for Joshi";
      case "nandu":
        return "financial entries for Nandu";
      default:
        return "financial entries for Joshi";
    }
  };

  return (
    <div className="finance-container">
      <h3>{getTitle()}</h3>
      <p>Log {getDescription()}.</p>

      <div className="add-entry-form">
        <div className="input-row">
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Enter description (e.g., groceries, salary, transfer)"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (₹)"
            type="number"
            step="0.01"
          />
          <button onClick={add} disabled={!desc.trim() || !amount.trim()}>
            Add Entry
          </button>
        </div>
      </div>

      <div className="finance-summary">
        Total: <strong>₹{total.toFixed(2)}</strong>
      </div>

      <div className="finance-entries">
        {filteredEntries.length > 0 ? (
          <ul className="entry-list">
            {filteredEntries.map((entry) => (
              <li key={entry.id} className="entry-item">
                <div className="entry-content">
                  <span className="entry-desc">{entry.desc}</span>
                  <span className="entry-amount">
                    ₹{entry.amount.toFixed(2)}
                  </span>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeEntry(entry.id)}
                  title="Remove entry"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <span>No {getDescription()} recorded yet</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinanceBoard;
