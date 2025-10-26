import { useState, useEffect } from "react";
import "./finance.css";
import PortfolioSummary from "./PortfolioSummary";

interface ExpenseEntry {
  Id: number;
  Amount: number;
  Description: string;
  isDebit: boolean;
  TxnDate: string;
  Account_Id: number;
  AccountName: string;
  Currency: string;
  PersonName: string;
}

interface InstallmentEntry {
  Id: number;
  Account_Id: number;
  Amount: number;
  Description?: string;
  isDebit: boolean;
  Start_Date: string;
  End_Date: string;
  AccountName: string;
  Currency: string;
  PersonName: string;
}

interface FinanceBoardProps {
  subTab?: string;
}

function FinanceBoard({ subTab }: Readonly<FinanceBoardProps>) {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [installments, setInstallments] = useState<InstallmentEntry[]>([]);
  const [defaultPerson, setDefaultPerson] = useState<string>("joshi");
  const [isLoadingExpenses, setIsLoadingExpenses] = useState<boolean>(false);
  const [isLoadingInstallments, setIsLoadingInstallments] =
    useState<boolean>(false);
  const [collapsedAccounts, setCollapsedAccounts] = useState<Set<string>>(
    new Set()
  );
  const [isInstallmentsCollapsed, setIsInstallmentsCollapsed] =
    useState<boolean>(false);

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

            // Set all accounts as collapsed by default
            const accountNames = [
              ...new Set(
                responseData.data.map(
                  (expense: ExpenseEntry) => expense.AccountName
                )
              ),
            ];
            setCollapsedAccounts(new Set(accountNames as string[]));
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

  // Fetch installments from API
  useEffect(() => {
    const fetchInstallments = async () => {
      setIsLoadingInstallments(true);
      try {
        const response = await fetch(
          "http://localhost:3002/api/v1/installments"
        );
        if (response.ok) {
          const responseData = await response.json();
          console.log("Installments API Response:", responseData); // Debug log

          // Handle the installments API response structure
          if (
            responseData.status === "success" &&
            Array.isArray(responseData.data)
          ) {
            setInstallments(responseData.data);
          } else {
            console.warn(
              "Installments API response structure is not as expected:",
              responseData
            );
          }
        } else {
          console.error(
            "Failed to fetch installments, status:",
            response.status
          );
        }
      } catch (error) {
        console.error("Error fetching installments:", error);
      } finally {
        setIsLoadingInstallments(false);
      }
    };

    fetchInstallments();
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

  // Filter installments by PersonName matching the current subTab
  const filteredInstallments = installments.filter((installment) => {
    const currentPerson = subTab || defaultPerson;
    return installment.PersonName.toLowerCase() === currentPerson.toLowerCase();
  });

  // Group expenses by account
  const expensesByAccount = filteredExpenses.reduce((groups, expense) => {
    const accountName = expense.AccountName;
    if (!groups[accountName]) {
      groups[accountName] = [];
    }
    groups[accountName].push(expense);
    return groups;
  }, {} as Record<string, ExpenseEntry[]>);

  // Calculate total for each account
  const getAccountTotal = (accountExpenses: ExpenseEntry[]) => {
    return accountExpenses.reduce((sum, expense) => {
      return sum + (expense.isDebit ? -expense.Amount : expense.Amount);
    }, 0);
  };

  // Get currency for an account (from first expense)
  const getAccountCurrency = (accountExpenses: ExpenseEntry[]) => {
    return accountExpenses.length > 0 ? accountExpenses[0].Currency : "AED";
  };

  // Toggle account collapse state
  const toggleAccountCollapse = (accountName: string) => {
    setCollapsedAccounts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(accountName)) {
        newSet.delete(accountName);
      } else {
        newSet.add(accountName);
      }
      return newSet;
    });
  };

  // Toggle installments collapse state
  const toggleInstallmentsCollapse = () => {
    setIsInstallmentsCollapsed((prev) => !prev);
  };

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
    <div className="finance-dashboard">
      {subTab === "summary" ? (
        <PortfolioSummary />
      ) : (
        <>
          {/* Header Section */}
          <div className="finance-header">
            <div className="person-profile">
              <div className="person-avatar-large">
                {(subTab || defaultPerson).charAt(0).toUpperCase()}
              </div>
              <div className="person-details">
                <h1 className="person-title">{getTitle()}</h1>
                <p className="person-subtitle">Personal Financial Overview</p>
              </div>
            </div>
            <div className="finance-stats">
              <div className="stat-card accounts-stat">
                <div className="stat-icon">🏦</div>
                <div className="stat-info">
                  <div className="stat-value">
                    {Object.keys(expensesByAccount).length}
                  </div>
                  <div className="stat-label">Active Accounts</div>
                </div>
              </div>
              <div className="stat-card transactions-stat">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <div className="stat-value">{filteredExpenses.length}</div>
                  <div className="stat-label">Transactions</div>
                </div>
              </div>
              <div className="stat-card installments-stat">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <div className="stat-value">
                    {filteredInstallments.length}
                  </div>
                  <div className="stat-label">Installments</div>
                </div>
              </div>
            </div>
          </div>

          {/* Accounts Section */}
          <div className="accounts-table-section">
            <h2 className="section-title">
              <span className="section-icon">💳</span> Account Overview
            </h2>

            {isLoadingExpenses && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading financial data...</p>
              </div>
            )}

            {!isLoadingExpenses &&
              Object.keys(expensesByAccount).length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <h3>No Financial Data</h3>
                  <p>No expenses found for {getDescription()}</p>
                </div>
              )}

            {!isLoadingExpenses &&
              Object.keys(expensesByAccount).length > 0 && (
                <div className="accounts-table-container">
                  {Object.entries(expensesByAccount)
                    .sort(([, accountExpensesA], [, accountExpensesB]) => {
                      const currencyA = getAccountCurrency(accountExpensesA);
                      const currencyB = getAccountCurrency(accountExpensesB);

                      // Sort by currency: AED first, then INR, then others
                      const currencyOrder = { AED: 0, INR: 1 };
                      const orderA =
                        currencyOrder[
                          currencyA as keyof typeof currencyOrder
                        ] ?? 2;
                      const orderB =
                        currencyOrder[
                          currencyB as keyof typeof currencyOrder
                        ] ?? 2;

                      return orderA - orderB;
                    })
                    .map(([accountName, accountExpenses]) => {
                      const accountTotal = getAccountTotal(accountExpenses);
                      const accountCurrency =
                        getAccountCurrency(accountExpenses);
                      const isCollapsed = collapsedAccounts.has(accountName);

                      return (
                        <div
                          key={accountName}
                          className="account-table-section"
                        >
                          <button
                            className="account-header clickable"
                            onClick={() => toggleAccountCollapse(accountName)}
                            aria-expanded={!isCollapsed}
                          >
                            <div className="account-header-left">
                              <span
                                className={`collapse-icon ${
                                  isCollapsed ? "collapsed" : ""
                                }`}
                              >
                                ▼
                              </span>
                              <span
                                className={`currency-flag ${accountCurrency.toLowerCase()}`}
                              >
                                {accountCurrency === "AED" ? "🇦🇪" : "🇮🇳"}
                              </span>
                              <h4>{accountName}</h4>
                              <span className="account-meta">
                                ({accountExpenses.length} transactions)
                              </span>
                            </div>
                            <div className="account-balance-summary">
                              <span className="balance-label">Balance:</span>
                              <span
                                className={`balance-amount ${
                                  accountTotal >= 0 ? "positive" : "negative"
                                }`}
                              >
                                {accountCurrency === "AED" ? (
                                  <>
                                    <span className="dirham-symbol">
                                      &#xea;
                                    </span>
                                    {Math.abs(accountTotal).toLocaleString(
                                      "en-US",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }
                                    )}
                                  </>
                                ) : (
                                  `₹ ${Math.abs(accountTotal).toLocaleString(
                                    "en-US",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}`
                                )}
                              </span>
                            </div>
                          </button>

                          {!isCollapsed && (
                            <div className="account-table-container">
                              <div className="transactions-table-wrapper">
                                <table className="transactions-table">
                                  <thead>
                                    <tr>
                                      <th>Date</th>
                                      <th>Description</th>
                                      <th>Type</th>
                                      <th>Amount ({accountCurrency})</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(() => {
                                      const sortedExpenses = [
                                        ...accountExpenses,
                                      ].sort(
                                        (a, b) =>
                                          new Date(b.TxnDate).getTime() -
                                          new Date(a.TxnDate).getTime()
                                      );
                                      return sortedExpenses.map((expense) => (
                                        <tr key={expense.Id}>
                                          <td className="expense-date">
                                            {new Date(
                                              expense.TxnDate
                                            ).toLocaleDateString("en-GB")}
                                          </td>
                                          <td className="expense-desc">
                                            {expense.Description}
                                          </td>
                                          <td className="expense-type">
                                            <span
                                              className={`type-badge ${
                                                expense.isDebit
                                                  ? "debit"
                                                  : "credit"
                                              }`}
                                            >
                                              {expense.isDebit
                                                ? "Debit"
                                                : "Credit"}
                                            </span>
                                          </td>
                                          <td
                                            className={`expense-amount ${
                                              expense.isDebit
                                                ? "debit"
                                                : "credit"
                                            }`}
                                          >
                                            {expense.isDebit ? "-" : "+"}
                                            {expense.Currency === "AED" ? (
                                              <>
                                                <span className="dirham-symbol">
                                                  &#xea;
                                                </span>
                                                {expense.Amount.toLocaleString(
                                                  "en-US",
                                                  {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                  }
                                                )}
                                              </>
                                            ) : (
                                              `₹ ${expense.Amount.toLocaleString(
                                                "en-US",
                                                {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                                }
                                              )}`
                                            )}
                                          </td>
                                        </tr>
                                      ));
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
          </div>

          {/* Installments Section */}
          <div className="installments-table-section">
            <div className="installments-header">
              <h2 className="section-title">
                <span className="section-icon">🏛️</span> Monthly Installments
              </h2>
              <button
                className="installments-toggle"
                onClick={toggleInstallmentsCollapse}
                aria-expanded={!isInstallmentsCollapsed}
              >
                <span
                  className={`toggle-icon ${
                    isInstallmentsCollapsed ? "collapsed" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
            </div>

            {!isInstallmentsCollapsed && (
              <div className="installments-content">
                {isLoadingInstallments && (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading installments...</p>
                  </div>
                )}

                {!isLoadingInstallments &&
                  filteredInstallments.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">💰</div>
                      <h3>No Installments</h3>
                      <p>No installments found for {getDescription()}</p>
                    </div>
                  )}

                {!isLoadingInstallments && filteredInstallments.length > 0 && (
                  <div className="installments-table-container">
                    <div className="transactions-table-wrapper">
                      <table className="transactions-table">
                        <thead>
                          <tr>
                            <th>Account</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredInstallments.map((installment) => {
                            const startDate = new Date(installment.Start_Date);
                            const endDate = new Date(installment.End_Date);
                            const durationMonths = Math.round(
                              (endDate.getTime() - startDate.getTime()) /
                                (1000 * 60 * 60 * 24 * 30.44)
                            );

                            return (
                              <tr key={installment.Id}>
                                <td className="installment-account">
                                  <span
                                    className={`currency-flag ${installment.Currency.toLowerCase()}`}
                                  >
                                    {installment.Currency === "AED"
                                      ? "🇦🇪"
                                      : "🇮🇳"}
                                  </span>
                                  {installment.AccountName}
                                </td>
                                <td className="installment-desc">
                                  {installment.Description || "No description"}
                                </td>
                                <td
                                  className={`installment-amount ${
                                    installment.isDebit ? "debit" : "credit"
                                  }`}
                                >
                                  {installment.isDebit ? "-" : "+"}
                                  {installment.Currency === "AED" ? (
                                    <>
                                      <span className="dirham-symbol">
                                        &#xea;
                                      </span>
                                      {installment.Amount.toLocaleString(
                                        "en-US",
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      )}
                                    </>
                                  ) : (
                                    `₹ ${installment.Amount.toLocaleString(
                                      "en-US",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }
                                    )}`
                                  )}
                                </td>
                                <td className="installment-date">
                                  {startDate.toLocaleDateString("en-GB")}
                                </td>
                                <td className="installment-date">
                                  {endDate.toLocaleDateString("en-GB")}
                                </td>
                                <td className="installment-duration">
                                  <span className="duration-badge">
                                    {durationMonths} months
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FinanceBoard;
