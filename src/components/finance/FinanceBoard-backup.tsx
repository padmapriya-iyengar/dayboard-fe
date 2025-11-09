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
  Type: string;
  Active: boolean;
}

// Wallet Inquiry Interfaces
interface WalletInquiry {
  Id: number;
  Amount: number;
  Description: string;
  Currency: string;
  InquiryDate: string;
  PersonName: string;
  AccountName?: string;
  isDebit: boolean;
}

interface WalletInquiryResponse {
  status: string;
  message: string;
  data: WalletInquiry[];
  timestamp: string;
}

interface FinanceBoardProps {
  subTab?: string;
}

function FinanceBoard({ subTab }: Readonly<FinanceBoardProps>) {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [installments, setInstallments] = useState<InstallmentEntry[]>([]);
  const [walletInquiries, setWalletInquiries] = useState<WalletInquiry[]>([]);
  const [defaultPerson, setDefaultPerson] = useState<string>("joshi");
  const [isLoadingExpenses, setIsLoadingExpenses] = useState<boolean>(false);
  const [isLoadingInstallments, setIsLoadingInstallments] =
    useState<boolean>(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [collapsedAccounts, setCollapsedAccounts] = useState<Set<string>>(
    new Set()
  );
  const [isInstallmentsCollapsed, setIsInstallmentsCollapsed] =
    useState<boolean>(true);
  const [isWalletCollapsed, setIsWalletCollapsed] = useState<boolean>(true);
  const [isAccountsCollapsed, setIsAccountsCollapsed] = useState<boolean>(true);
  const [collapsedCurrencyGroups, setCollapsedCurrencyGroups] = useState<
    Set<string>
  >(new Set());

  // Currency conversion constants
  const AED_TO_INR_RATE = 23;

  // Currency conversion helper functions
  const convertToAED = (amount: number, currency: string): number => {
    if (currency === "INR") {
      return amount / AED_TO_INR_RATE;
    }
    return amount;
  };

  const convertToINR = (amount: number, currency: string): number => {
    if (currency === "AED") {
      return amount * AED_TO_INR_RATE;
    }
    return amount;
  };

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

  // Fetch wallet inquiries from API
  useEffect(() => {
    const fetchWalletInquiries = async () => {
      setIsLoadingWallet(true);
      try {
        const response = await fetch(
          "http://localhost:3002/api/v1/expenses/wallet-inquiries"
        );
        if (response.ok) {
          const responseData: WalletInquiryResponse = await response.json();
          console.log("Wallet Inquiries API Response:", responseData);

          if (
            responseData.status === "success" &&
            Array.isArray(responseData.data)
          ) {
            setWalletInquiries(responseData.data);
          } else {
            console.warn(
              "Wallet inquiries API response structure is not as expected:",
              responseData
            );
          }
        } else {
          console.error(
            "Failed to fetch wallet inquiries, status:",
            response.status
          );
          setWalletError("Failed to fetch wallet inquiries");
        }
      } catch (error) {
        console.error("Error fetching wallet inquiries:", error);
        setWalletError("Error fetching wallet inquiries");
      } finally {
        setIsLoadingWallet(false);
      }
    };

    fetchWalletInquiries();
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

  // Filter wallet inquiries by PersonName matching the current subTab
  const filteredWalletInquiries = walletInquiries.filter((inquiry) => {
    const currentPerson = subTab || defaultPerson;
    return inquiry.PersonName.toLowerCase() === currentPerson.toLowerCase();
  });

  // Calculate wallet totals in both currencies
  const calculateWalletTotals = () => {
    const aedTotal = filteredWalletInquiries.reduce((sum, inquiry) => {
      // Apply isDebit logic: if isDebit is true, make amount negative
      const amount = inquiry.isDebit ? -inquiry.Amount : inquiry.Amount;
      return sum + convertToAED(amount, inquiry.Currency);
    }, 0);

    const inrTotal = filteredWalletInquiries.reduce((sum, inquiry) => {
      // Apply isDebit logic: if isDebit is true, make amount negative
      const amount = inquiry.isDebit ? -inquiry.Amount : inquiry.Amount;
      return sum + convertToINR(amount, inquiry.Currency);
    }, 0);

    return { aedTotal, inrTotal };
  };

  // Helper function to get effective amount considering isDebit flag
  const getEffectiveAmount = (inquiry: WalletInquiry) => {
    return inquiry.isDebit ? -inquiry.Amount : inquiry.Amount;
  };

  const { aedTotal, inrTotal } = calculateWalletTotals();

  // Helper function to get monthly amount based on installment type
  const getMonthlyAmount = (installment: InstallmentEntry) => {
    const installmentType = installment.Type?.toUpperCase() || "MONTHLY";
    let divisor = 1; // Default for MONTHLY

    switch (installmentType) {
      case "QUARTERLY":
        divisor = 3;
        break;
      case "HALF YEARLY":
      case "HALF_YEARLY":
        divisor = 6;
        break;
      case "YEARLY":
        divisor = 12;
        break;
      case "MONTHLY":
      default:
        // divisor remains 1
        break;
    }

    // Apply isDebit logic: if isDebit is true, make amount negative
    const baseAmount = installment.isDebit
      ? -installment.Amount
      : installment.Amount;

    return baseAmount / divisor;
  };

  // Calculate installment totals in both currencies (normalized to monthly) - only active installments
  const calculateInstallmentTotals = () => {
    const aedTotal = filteredInstallments
      .filter((installment) => installment.Active)
      .reduce((sum, installment) => {
        const monthlyAmount = getMonthlyAmount(installment);
        return sum + convertToAED(monthlyAmount, installment.Currency);
      }, 0);

    const inrTotal = filteredInstallments
      .filter((installment) => installment.Active)
      .reduce((sum, installment) => {
        const monthlyAmount = getMonthlyAmount(installment);
        return sum + convertToINR(monthlyAmount, installment.Currency);
      }, 0);

    return { aedTotal, inrTotal };
  };

  const { aedTotal: installmentAEDTotal, inrTotal: installmentINRTotal } =
    calculateInstallmentTotals();

  // Get currency for an account (from first expense)
  const getAccountCurrency = (accountExpenses: ExpenseEntry[]) => {
    return accountExpenses.length > 0 ? accountExpenses[0].Currency : "AED";
  };

  // Group expenses by account
  const expensesByAccount = filteredExpenses.reduce((groups, expense) => {
    const accountName = expense.AccountName;
    if (!groups[accountName]) {
      groups[accountName] = [];
    }
    groups[accountName].push(expense);
    return groups;
  }, {} as Record<string, ExpenseEntry[]>);

  // Group accounts by currency
  const accountsByCurrency = Object.entries(expensesByAccount).reduce(
    (groups, [accountName, accountExpenses]) => {
      const currency = getAccountCurrency(accountExpenses);
      if (!groups[currency]) {
        groups[currency] = {};
      }
      groups[currency][accountName] = accountExpenses;
      return groups;
    },
    {} as Record<string, Record<string, ExpenseEntry[]>>
  );

  // Calculate total for each account
  const getAccountTotal = (accountExpenses: ExpenseEntry[]) => {
    return accountExpenses.reduce((sum, expense) => {
      return sum + (expense.isDebit ? -expense.Amount : expense.Amount);
    }, 0);
  };

  // Calculate total for each currency group
  const getCurrencyGroupTotal = (currency: string) => {
    if (!accountsByCurrency[currency]) return 0;
    return Object.values(accountsByCurrency[currency]).reduce(
      (totalSum, accountExpenses) => {
        return totalSum + getAccountTotal(accountExpenses);
      },
      0
    );
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

  // Toggle accounts collapse state
  const toggleAccountsCollapse = () => {
    setIsAccountsCollapsed((prev) => !prev);
  };

  // Toggle currency group collapse state
  const toggleCurrencyGroupCollapse = (currency: string) => {
    setCollapsedCurrencyGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currency)) {
        newSet.delete(currency);
      } else {
        newSet.add(currency);
      }
      return newSet;
    });
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
          <div className="installments-table-section">
            <div
              className="section-header"
              onClick={toggleAccountsCollapse}
              onKeyDown={(e) => e.key === "Enter" && toggleAccountsCollapse()}
              role="button"
              tabIndex={0}
              aria-expanded={!isAccountsCollapsed}
            >
              <div className="section-title-with-summary">
                <h2 className="section-title">
                  <span className="section-icon">💳</span> Account Overview
                </h2>
                {!isLoadingExpenses &&
                  Object.keys(expensesByAccount).length > 0 && (
                    <div className="portfolio-summary">
                      {accountsByCurrency.AED && (
                        <span className="portfolio-item">
                          AED Portfolio:{" "}
                          <span className="dirham-symbol">ê</span>
                          <span
                            className={
                              getCurrencyGroupTotal("AED") >= 0
                                ? "positive"
                                : "negative"
                            }
                          >
                            {getCurrencyGroupTotal("AED").toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </span>
                        </span>
                      )}
                      {accountsByCurrency.AED && accountsByCurrency.INR && (
                        <span className="portfolio-separator">; </span>
                      )}
                      {accountsByCurrency.INR && (
                        <span className="portfolio-item">
                          INR Portfolio: ₹
                          <span
                            className={
                              getCurrencyGroupTotal("INR") >= 0
                                ? "positive"
                                : "negative"
                            }
                          >
                            {getCurrencyGroupTotal("INR").toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </span>
                        </span>
                      )}
                    </div>
                  )}
              </div>
              <div className="collapse-icon">
                {isAccountsCollapsed ? "▼" : "▲"}
              </div>
            </div>

            {!isAccountsCollapsed && (
              <>
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
                      <p>
                        Debug: Total expenses: {expenses.length}, Filtered:{" "}
                        {filteredExpenses.length}
                      </p>
                      <p>Current person: {subTab || defaultPerson}</p>
                    </div>
                  )}

                {!isLoadingExpenses &&
                  Object.keys(expensesByAccount).length > 0 && (
                    <div className="currency-groups-container">
                      {/* AED Portfolio Group */}
                      {accountsByCurrency.AED && (
                        <div className="currency-group">
                          <div className="currency-group-header">
                            <button
                              className="currency-toggle"
                              onClick={() => toggleCurrencyGroupCollapse("AED")}
                              aria-expanded={
                                !collapsedCurrencyGroups.has("AED")
                              }
                            >
                              <span
                                className={`toggle-icon ${
                                  collapsedCurrencyGroups.has("AED")
                                    ? "collapsed"
                                    : ""
                                }`}
                              >
                                ▼
                              </span>
                              <span className="currency-flag aed">🇦🇪</span>
                              <h3 className="currency-title">
                                AED Portfolio:{" "}
                                <span className="dirham-symbol">ê</span>
                                {getCurrencyGroupTotal("AED").toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </h3>
                              <span className="account-count">
                                ({Object.keys(accountsByCurrency.AED).length}{" "}
                                accounts)
                              </span>
                            </button>
                          </div>

                          {!collapsedCurrencyGroups.has("AED") && (
                            <div className="accounts-table-container">
                              {Object.entries(accountsByCurrency.AED).map(
                                ([accountName, accountExpenses]) => {
                                  const accountTotal =
                                    getAccountTotal(accountExpenses);
                                  const isCollapsed =
                                    collapsedAccounts.has(accountName);

                                  return (
                                    <div
                                      key={accountName}
                                      className="account-table-section"
                                    >
                                      <button
                                        className="account-header clickable"
                                        onClick={() =>
                                          toggleAccountCollapse(accountName)
                                        }
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
                                          <span className="currency-flag aed">
                                            🇦🇪
                                          </span>
                                          <h4>{accountName}</h4>
                                          <span className="account-meta">
                                            ({accountExpenses.length}{" "}
                                            transactions)
                                          </span>
                                        </div>
                                        <div className="account-balance-summary">
                                          <span className="balance-label">
                                            Balance:
                                          </span>
                                          <span
                                            className={`balance-amount ${
                                              accountTotal >= 0
                                                ? "positive"
                                                : "negative"
                                            }`}
                                          >
                                            <span className="dirham-symbol">
                                              &#xea;
                                            </span>
                                            {Math.abs(
                                              accountTotal
                                            ).toLocaleString("en-US", {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })}
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
                                                  <th>Amount (AED)</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {(() => {
                                                  const sortedExpenses = [
                                                    ...accountExpenses,
                                                  ].sort(
                                                    (a, b) =>
                                                      new Date(
                                                        b.TxnDate
                                                      ).getTime() -
                                                      new Date(
                                                        a.TxnDate
                                                      ).getTime()
                                                  );
                                                  return sortedExpenses.map(
                                                    (expense) => (
                                                      <tr key={expense.Id}>
                                                        <td className="expense-date">
                                                          {new Date(
                                                            expense.TxnDate
                                                          ).toLocaleDateString(
                                                            "en-GB"
                                                          )}
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
                                                          {expense.isDebit
                                                            ? "-"
                                                            : "+"}
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
                                                        </td>
                                                      </tr>
                                                    )
                                                  );
                                                })()}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* INR Portfolio Group */}
                      {accountsByCurrency.INR && (
                        <div className="currency-group">
                          <div className="currency-group-header">
                            <button
                              className="currency-toggle"
                              onClick={() => toggleCurrencyGroupCollapse("INR")}
                              aria-expanded={
                                !collapsedCurrencyGroups.has("INR")
                              }
                            >
                              <span
                                className={`toggle-icon ${
                                  collapsedCurrencyGroups.has("INR")
                                    ? "collapsed"
                                    : ""
                                }`}
                              >
                                ▼
                              </span>
                              <span className="currency-flag inr">🇮🇳</span>
                              <h3 className="currency-title">
                                INR Portfolio: ₹
                                {getCurrencyGroupTotal("INR").toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </h3>
                              <span className="account-count">
                                ({Object.keys(accountsByCurrency.INR).length}{" "}
                                accounts)
                              </span>
                            </button>
                          </div>

                          {!collapsedCurrencyGroups.has("INR") && (
                            <div className="accounts-table-container">
                              {Object.entries(accountsByCurrency.INR).map(
                                ([accountName, accountExpenses]) => {
                                  const accountTotal =
                                    getAccountTotal(accountExpenses);
                                  const isCollapsed =
                                    collapsedAccounts.has(accountName);

                                  return (
                                    <div
                                      key={accountName}
                                      className="account-table-section"
                                    >
                                      <button
                                        className="account-header clickable"
                                        onClick={() =>
                                          toggleAccountCollapse(accountName)
                                        }
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
                                          <span className="currency-flag inr">
                                            🇮🇳
                                          </span>
                                          <h4>{accountName}</h4>
                                          <span className="account-meta">
                                            ({accountExpenses.length}{" "}
                                            transactions)
                                          </span>
                                        </div>
                                        <div className="account-balance-summary">
                                          <span className="balance-label">
                                            Balance:
                                          </span>
                                          <span
                                            className={`balance-amount ${
                                              accountTotal >= 0
                                                ? "positive"
                                                : "negative"
                                            }`}
                                          >
                                            ₹
                                            {Math.abs(
                                              accountTotal
                                            ).toLocaleString("en-US", {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })}
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
                                                  <th>Amount (INR)</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {(() => {
                                                  const sortedExpenses = [
                                                    ...accountExpenses,
                                                  ].sort(
                                                    (a, b) =>
                                                      new Date(
                                                        b.TxnDate
                                                      ).getTime() -
                                                      new Date(
                                                        a.TxnDate
                                                      ).getTime()
                                                  );
                                                  return sortedExpenses.map(
                                                    (expense) => (
                                                      <tr key={expense.Id}>
                                                        <td className="expense-date">
                                                          {new Date(
                                                            expense.TxnDate
                                                          ).toLocaleDateString(
                                                            "en-GB"
                                                          )}
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
                                                          {expense.isDebit
                                                            ? "-"
                                                            : "+"}
                                                          ₹
                                                          {expense.Amount.toLocaleString(
                                                            "en-US",
                                                            {
                                                              minimumFractionDigits: 2,
                                                              maximumFractionDigits: 2,
                                                            }
                                                          )}
                                                        </td>
                                                      </tr>
                                                    )
                                                  );
                                                })()}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
              </>
            )}
          </div>

          {/* Installments Section */}
          <div className="installments-table-section">
            <div
              className="section-header"
              onClick={toggleInstallmentsCollapse}
              onKeyDown={(e) =>
                e.key === "Enter" && toggleInstallmentsCollapse()
              }
              role="button"
              tabIndex={0}
              aria-expanded={!isInstallmentsCollapsed}
            >
              <div className="section-title-with-summary">
                <h2 className="section-title">
                  <span className="section-icon">🏛️</span> Installments
                </h2>
                {!isLoadingInstallments && filteredInstallments.length > 0 && (
                  <div className="portfolio-summary">
                    <span className="portfolio-item">
                      {filteredInstallments.filter((i) => i.Active).length}{" "}
                      active installment
                      {filteredInstallments.filter((i) => i.Active).length !== 1
                        ? "s"
                        : ""}
                    </span>
                    <span className="portfolio-separator">; </span>
                    <span className="portfolio-item">
                      Monthly AED: <span className="dirham-symbol">ê</span>
                      <span
                        className={
                          installmentAEDTotal >= 0 ? "positive" : "negative"
                        }
                      >
                        {installmentAEDTotal.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </span>
                    <span className="portfolio-separator">; </span>
                    <span className="portfolio-item">
                      Monthly INR: ₹
                      <span
                        className={
                          installmentINRTotal >= 0 ? "positive" : "negative"
                        }
                      >
                        {installmentINRTotal.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </span>
                  </div>
                )}
              </div>
              <div className="collapse-icon">
                {isInstallmentsCollapsed ? "▼" : "▲"}
              </div>
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
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Duration</th>
                            <th>Status</th>
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
                              <tr
                                key={installment.Id}
                                className={
                                  !installment.Active ? "inactive-row" : ""
                                }
                              >
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
                                <td className="installment-type">
                                  <span className="type-badge">
                                    {installment.Type || "MONTHLY"}
                                  </span>
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
                                <td className="installment-status">
                                  <span
                                    className={`status-badge ${
                                      installment.Active ? "active" : "inactive"
                                    }`}
                                  >
                                    {installment.Active ? "Active" : "Inactive"}
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

          {/* Wallet Inquiries Section */}
          <div className="installments-table-section">
            <div
              className="section-header"
              onClick={() => setIsWalletCollapsed(!isWalletCollapsed)}
              onKeyDown={(e) =>
                e.key === "Enter" && setIsWalletCollapsed(!isWalletCollapsed)
              }
              role="button"
              tabIndex={0}
              aria-expanded={!isWalletCollapsed}
            >
              <div className="section-title-with-summary">
                <h2 className="section-title">
                  <span className="section-icon">💳</span> Wallet Inquiries
                </h2>
                {!isLoadingWallet &&
                  !walletError &&
                  filteredWalletInquiries.length > 0 && (
                    <div className="portfolio-summary">
                      <span className="portfolio-item">
                        {filteredWalletInquiries.length} inquir
                        {filteredWalletInquiries.length === 1 ? "y" : "ies"}
                      </span>
                      <span className="portfolio-separator">; </span>
                      <span className="portfolio-item">
                        AED: <span className="dirham-symbol">ê</span>
                        <span
                          className={aedTotal >= 0 ? "positive" : "negative"}
                        >
                          {aedTotal.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </span>
                      <span className="portfolio-separator">; </span>
                      <span className="portfolio-item">
                        INR: ₹
                        <span
                          className={inrTotal >= 0 ? "positive" : "negative"}
                        >
                          {inrTotal.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </span>
                    </div>
                  )}
              </div>
              <div className="collapse-icon">
                {isWalletCollapsed ? "▼" : "▲"}
              </div>
            </div>

            {!isWalletCollapsed && (
              <div className="installments-content">
                {isLoadingWallet && (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading wallet inquiries...</p>
                  </div>
                )}

                {walletError && (
                  <div className="empty-state error-state">
                    <div className="empty-icon">⚠️</div>
                    <h3>Error Loading Wallet Data</h3>
                    <p>{walletError}</p>
                  </div>
                )}

                {!isLoadingWallet &&
                  !walletError &&
                  filteredWalletInquiries.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">💳</div>
                      <h3>No Wallet Inquiries</h3>
                      <p>No wallet inquiries found for {getDescription()}</p>
                    </div>
                  )}

                {!isLoadingWallet &&
                  !walletError &&
                  filteredWalletInquiries.length > 0 && (
                    <div className="wallet-summary-cards">
                      <div className="wallet-summary-card">
                        <h4>Total in AED</h4>
                        <div
                          className={`amount ${
                            aedTotal < 0 ? "negative" : "positive"
                          }`}
                        >
                          <span className="dirham-symbol">&#xea;</span>
                          {aedTotal.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <div className="wallet-summary-card">
                        <h4>Total in INR</h4>
                        <div
                          className={`amount ${
                            inrTotal < 0 ? "negative" : "positive"
                          }`}
                        >
                          ₹
                          {inrTotal.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                {!isLoadingWallet &&
                  !walletError &&
                  filteredWalletInquiries.length > 0 && (
                    <div className="wallet-inquiries-table-container">
                      <div className="transactions-table-wrapper">
                        <table className="wallet-inquiries-table">
                          <thead>
                            <tr>
                              <th>Description</th>
                              <th>Type</th>
                              <th>Original Amount</th>
                              <th>AED Equivalent</th>
                              <th>INR Equivalent</th>
                              <th>Account</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const sortedInquiries = [
                                ...filteredWalletInquiries,
                              ].sort(
                                (a, b) =>
                                  new Date(b.InquiryDate).getTime() -
                                  new Date(a.InquiryDate).getTime()
                              );
                              return sortedInquiries.map((inquiry) => {
                                const effectiveAmount =
                                  getEffectiveAmount(inquiry);
                                return (
                                  <tr key={inquiry.Id}>
                                    <td className="inquiry-desc">
                                      {inquiry.Description}
                                    </td>
                                    <td className="inquiry-type">
                                      <span
                                        className={`type-badge ${
                                          inquiry.isDebit ? "debit" : "credit"
                                        }`}
                                      >
                                        {inquiry.isDebit ? "DEBIT" : "CREDIT"}
                                      </span>
                                    </td>
                                    <td
                                      className={`inquiry-amount original ${
                                        effectiveAmount < 0
                                          ? "negative"
                                          : "positive"
                                      }`}
                                    >
                                      <span
                                        className={`currency-flag ${inquiry.Currency.toLowerCase()}`}
                                      >
                                        {inquiry.Currency === "AED"
                                          ? "🇦🇪"
                                          : "🇮🇳"}
                                      </span>
                                      {inquiry.Currency === "AED" ? (
                                        <>
                                          <span className="dirham-symbol">
                                            &#xea;
                                          </span>
                                          {effectiveAmount.toLocaleString(
                                            "en-US",
                                            {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            }
                                          )}
                                        </>
                                      ) : (
                                        <>
                                          ₹
                                          {effectiveAmount.toLocaleString(
                                            "en-IN",
                                            {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            }
                                          )}
                                        </>
                                      )}
                                    </td>
                                    <td
                                      className={`inquiry-amount aed ${
                                        convertToAED(
                                          effectiveAmount,
                                          inquiry.Currency
                                        ) < 0
                                          ? "negative"
                                          : "positive"
                                      }`}
                                    >
                                      <span className="dirham-symbol">
                                        &#xea;
                                      </span>
                                      {convertToAED(
                                        effectiveAmount,
                                        inquiry.Currency
                                      ).toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </td>
                                    <td
                                      className={`inquiry-amount inr ${
                                        convertToINR(
                                          effectiveAmount,
                                          inquiry.Currency
                                        ) < 0
                                          ? "negative"
                                          : "positive"
                                      }`}
                                    >
                                      ₹
                                      {convertToINR(
                                        effectiveAmount,
                                        inquiry.Currency
                                      ).toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </td>
                                    <td className="inquiry-account">
                                      {inquiry.AccountName || "N/A"}
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
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
