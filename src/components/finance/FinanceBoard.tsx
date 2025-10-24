import { useState, useEffect } from "react";
import "./finance.css";

interface ExpenseEntry {
  Id: number;
  Amount: number;
  Description: string;
  isDebit: boolean;
  TxnDate: string;
  Person_Id: number;
  PersonName: string;
}

interface FinanceBoardProps {
  subTab?: string;
}

function FinanceBoard({ subTab }: Readonly<FinanceBoardProps>) {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [defaultPerson, setDefaultPerson] = useState<string>("joshi");
  const [isLoadingExpenses, setIsLoadingExpenses] = useState<boolean>(false);

  // Fetch expenses from API
  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoadingExpenses(true);
      try {
        const response = await fetch("http://localhost:3002/api/v1/expenses");
        if (response.ok) {
          const responseData = await response.json();
          console.log("Expenses API Response:", responseData); // Debug log

          // Handle the expenses API response structure
          if (
            responseData.status === "success" &&
            Array.isArray(responseData.data)
          ) {
            setExpenses(responseData.data);
          } else {
            console.warn(
              "Expenses API response structure is not as expected:",
              responseData
            );
          }
        } else {
          console.error("Failed to fetch expenses, status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setIsLoadingExpenses(false);
      }
    };

    fetchExpenses();
  }, []);

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

  // Filter expenses by PersonName matching the current subTab
  const filteredExpenses = expenses.filter((expense) => {
    const currentPerson = subTab || defaultPerson;
    return expense.PersonName.toLowerCase() === currentPerson.toLowerCase();
  });

  const expensesTotal = filteredExpenses.reduce((sum, expense) => {
    return sum + (expense.isDebit ? -expense.Amount : expense.Amount);
  }, 0);

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

      {/* Expenses Table - Full Width */}
      <div className="expenses-table-section">
        <div className="expenses-header">
          <h4>Expenses</h4>
          <div className="expenses-total">
            Total: <strong>₹{expensesTotal.toFixed(2)}</strong>
          </div>
        </div>
        {isLoadingExpenses && (
          <div className="loading-state">Loading expenses...</div>
        )}
        {!isLoadingExpenses && filteredExpenses.length > 0 && (
          <div className="expenses-table-container">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>DESCRIPTION</th>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>PERSON</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.Id}>
                    <td className="expense-date">
                      {new Date(expense.TxnDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="expense-desc">{expense.Description}</td>
                    <td className="expense-type">
                      <span
                        className={`type-badge ${
                          expense.isDebit ? "debit" : "credit"
                        }`}
                      >
                        {expense.isDebit ? "Debit" : "Credit"}
                      </span>
                    </td>
                    <td
                      className={`expense-amount ${
                        expense.isDebit ? "debit" : "credit"
                      }`}
                    >
                      {expense.isDebit ? "-" : "+"}₹{expense.Amount.toFixed(2)}
                    </td>
                    <td className="expense-person">{expense.PersonName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoadingExpenses && filteredExpenses.length === 0 && (
          <div className="empty-state">
            <span>No expenses found for {getDescription()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinanceBoard;
