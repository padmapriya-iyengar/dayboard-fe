import { useState, useEffect } from "react";
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
  const [defaultPerson, setDefaultPerson] = useState<string>("joshi");

  // Fetch persons to get the default person
  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const response = await fetch("http://localhost:3002/api/v1/persons");
        if (response.ok) {
          const responseData = await response.json();
          console.log("FinanceBoard API Response:", responseData); // Debug log

          // Handle the correct API response structure
          if (
            responseData.status === "success" &&
            responseData.data?.persons &&
            Array.isArray(responseData.data.persons) &&
            responseData.data.persons.length > 0
          ) {
            // Use the first person's name as default
            setDefaultPerson(responseData.data.persons[0].Name.toLowerCase());
          }
        }
      } catch (error) {
        console.error("Error fetching persons:", error);
        // Keep default as "joshi"
      }
    };

    fetchPersons();
  }, []);

  const add = () => {
    const n = parseFloat(amount);
    if (!desc.trim() || Number.isNaN(n)) return;
    const next: FinanceEntry[] = [
      ...entries,
      {
        id: Date.now(),
        desc: desc.trim(),
        amount: n,
        type: subTab || defaultPerson,
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

  const filteredEntries = entries.filter(
    (e) => e.type === (subTab || defaultPerson)
  );
  const total = filteredEntries.reduce((s, e) => s + e.amount, 0);

  const getTitle = () => {
    if (!subTab) return "Financial Entries";
    // Capitalize first letter of the person's name
    const personName = subTab.charAt(0).toUpperCase() + subTab.slice(1);
    return `${personName}'s Finances`;
  };

  const getDescription = () => {
    if (!subTab) return "financial entries";
    const personName = subTab.charAt(0).toUpperCase() + subTab.slice(1);
    return `financial entries for ${personName}`;
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
