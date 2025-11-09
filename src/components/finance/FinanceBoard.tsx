import React, { useState, useEffect } from "react";
import "./finance.css";
import AccountDetails from "./AccountDetails";

interface FinanceBoardProps {
  subTab?: string;
}

// Account Interfaces
interface AccountEntry {
  Id: number;
  Person_Id: number;
  AccountName: string;
  Currency: string;
  Type: string;
  Balance: number;
  Last_Updated_On: string;
  PersonName: string;
}

interface AccountResponse {
  status: string;
  message: string;
  data: {
    accounts: AccountEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  timestamp: string;
}

// Installment Interfaces
interface InstallmentEntry {
  Id: number;
  Amount: number;
  Description: string;
  Currency: string;
  InstallmentDate: string;
  PersonName: string;
  TransactionType: string;
  Active: boolean;
}

interface InstallmentResponse {
  status: string;
  message: string;
  data: InstallmentEntry[];
  timestamp: string;
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

// Expense/Transaction Interfaces
interface ExpenseEntry {
  Id: number;
  Amount: number;
  Description: string;
  isDebit: boolean;
  TxnDate: string;
  Account_Id: number;
  AccountName: string;
  Currency: string;
  AccountType: string;
  PersonName: string;
}

interface ExpenseResponse {
  status: string;
  message: string;
  data: ExpenseEntry[];
  timestamp: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function FinanceBoard({ subTab }: Readonly<FinanceBoardProps>) {
  const defaultPerson = "Joshi";

  // State variables
  const [accounts, setAccounts] = useState<AccountEntry[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  const [installments, setInstallments] = useState<InstallmentEntry[]>([]);
  const [isLoadingInstallments, setIsLoadingInstallments] = useState(true);
  const [installmentError, setInstallmentError] = useState<string | null>(null);

  const [walletInquiries, setWalletInquiries] = useState<WalletInquiry[]>([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Collapse states
  const [isAccountsCollapsed, setIsAccountsCollapsed] = useState(false);
  const [isInstallmentsCollapsed, setIsInstallmentsCollapsed] = useState(false);
  const [isWalletCollapsed, setIsWalletCollapsed] = useState(false);

  // Navigation state
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  // Pagination state for accounts
  const [currentAccountPage, setCurrentAccountPage] = useState(1);
  const accountsPerPage = 8;

  // Fetch accounts from API
  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoadingAccounts(true);
      setAccountsError(null);
      try {
        const response = await fetch("http://localhost:3002/api/v1/accounts");
        if (response.ok) {
          const responseData = await response.json();
          console.log("Accounts API Response:", responseData);

          if (
            responseData.status === "success" &&
            responseData.data &&
            Array.isArray(responseData.data.accounts)
          ) {
            setAccounts(responseData.data.accounts);
          } else {
            console.warn(
              "Accounts API response structure is not as expected:",
              responseData
            );
            setAccountsError("Invalid response structure");
          }
        } else {
          console.error("Failed to fetch accounts, status:", response.status);
          setAccountsError("Failed to fetch accounts");
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        setAccountsError("Error fetching accounts");
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  // Fetch installments from API
  useEffect(() => {
    const fetchInstallments = async () => {
      setIsLoadingInstallments(true);
      try {
        const response = await fetch(
          "http://localhost:3002/api/v1/expenses/installments"
        );
        if (response.ok) {
          const responseData: InstallmentResponse = await response.json();
          console.log("Installments API Response:", responseData);

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
          setInstallmentError("Failed to fetch installments");
        }
      } catch (error) {
        console.error("Error fetching installments:", error);
        setInstallmentError("Error fetching installments");
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

  // Reset pagination when subTab changes
  useEffect(() => {
    setCurrentAccountPage(1);
  }, [subTab]);

  // Filter functions
  const filteredAccounts = accounts.filter((account) => {
    const currentPerson = subTab || defaultPerson;
    return account.PersonName.toLowerCase() === currentPerson.toLowerCase();
  });

  const filteredInstallments = installments.filter((installment) => {
    const currentPerson = subTab || defaultPerson;
    return installment.PersonName.toLowerCase() === currentPerson.toLowerCase();
  });

  const filteredWalletInquiries = walletInquiries.filter((inquiry) => {
    const currentPerson = subTab || defaultPerson;
    return inquiry.PersonName.toLowerCase() === currentPerson.toLowerCase();
  });

  // Pagination logic for accounts
  const getPaginatedAccounts = () => {
    const startIndex = (currentAccountPage - 1) * accountsPerPage;
    const endIndex = startIndex + accountsPerPage;
    return filteredAccounts.slice(startIndex, endIndex);
  };

  const totalAccountPages = Math.ceil(
    filteredAccounts.length / accountsPerPage
  );

  const handleAccountPageChange = (page: number) => {
    setCurrentAccountPage(page);
  };

  // Helper functions
  const getTitle = () => {
    return `${subTab || defaultPerson}'s Finance Dashboard`;
  };

  const getDescription = () => {
    return subTab || defaultPerson;
  };

  const getMonthlyAmount = (
    amount: number,
    transactionType: string
  ): number => {
    switch (transactionType?.toUpperCase()) {
      case "MONTHLY":
        return amount;
      case "QUARTERLY":
        return amount / 3;
      case "YEARLY":
        return amount / 12;
      default:
        return amount;
    }
  };

  const calculateInstallmentTotals = () => {
    const aedTotal = filteredInstallments
      .filter((installment) => installment.Active)
      .reduce((sum, installment) => {
        if (installment.Currency === "AED") {
          return (
            sum +
            getMonthlyAmount(installment.Amount, installment.TransactionType)
          );
        }
        return sum;
      }, 0);

    const inrTotal = filteredInstallments
      .filter((installment) => installment.Active)
      .reduce((sum, installment) => {
        if (installment.Currency === "INR") {
          return (
            sum +
            getMonthlyAmount(installment.Amount, installment.TransactionType)
          );
        }
        return sum;
      }, 0);

    return { aedTotal, inrTotal };
  };

  const calculateWalletTotals = () => {
    const aedTotal = filteredWalletInquiries.reduce((sum, inquiry) => {
      const amount = inquiry.isDebit ? -inquiry.Amount : inquiry.Amount;
      if (inquiry.Currency === "AED") {
        return sum + amount;
      }
      return sum;
    }, 0);

    const inrTotal = filteredWalletInquiries.reduce((sum, inquiry) => {
      const amount = inquiry.isDebit ? -inquiry.Amount : inquiry.Amount;
      if (inquiry.Currency === "INR") {
        return sum + amount;
      }
      return sum;
    }, 0);

    return { aedTotal, inrTotal };
  };

  const { aedTotal: installmentAedTotal, inrTotal: installmentInrTotal } =
    calculateInstallmentTotals();
  const { aedTotal: walletAedTotal, inrTotal: walletInrTotal } =
    calculateWalletTotals();

  // Navigation functions
  const navigateToAccount = (accountId: number) => {
    setSelectedAccountId(accountId);
    setShowAccountDetails(true);
  };

  const navigateBackToFinance = () => {
    setShowAccountDetails(false);
    setSelectedAccountId(null);
  };

  // Show AccountDetails if an account is selected
  if (showAccountDetails && selectedAccountId) {
    return (
      <AccountDetails
        accountId={selectedAccountId}
        onBackToFinance={navigateBackToFinance}
      />
    );
  }

  return (
    <div className="finance-dashboard">
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
              <div className="stat-value">{filteredAccounts.length}</div>
              <div className="stat-label">Active Accounts</div>
            </div>
          </div>
          <div className="stat-card installments-stat">
            <div className="stat-icon">🏛️</div>
            <div className="stat-info">
              <div className="stat-value">
                {filteredInstallments.filter((i) => i.Active).length}
              </div>
              <div className="stat-label">
                {filteredInstallments.filter((i) => i.Active).length === 1
                  ? "Active EMI"
                  : "Active EMIs"}
              </div>
            </div>
          </div>
          <div className="stat-card wallet-stat">
            <div className="stat-icon">💼</div>
            <div className="stat-info">
              <div className="stat-value">{filteredWalletInquiries.length}</div>
              <div className="stat-label">Wallet Transactions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Overview Section */}
      <div className="accounts-table-section">
        <div
          className="section-header"
          onClick={() => setIsAccountsCollapsed(!isAccountsCollapsed)}
          onKeyDown={(e) =>
            e.key === "Enter" && setIsAccountsCollapsed(!isAccountsCollapsed)
          }
          role="button"
          tabIndex={0}
          aria-expanded={!isAccountsCollapsed}
        >
          <div className="section-title-with-summary">
            <h2 className="section-title">
              <span className="section-icon">💳</span> Account Overview
            </h2>
          </div>
          <div className="collapse-icon">{isAccountsCollapsed ? "▼" : "▲"}</div>
        </div>

        {!isAccountsCollapsed && (
          <>
            {isLoadingAccounts && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading accounts data...</p>
              </div>
            )}

            {accountsError && (
              <div className="empty-state error-state">
                <div className="empty-icon">⚠️</div>
                <h3>Error Loading Accounts</h3>
                <p>{accountsError}</p>
              </div>
            )}

            {!isLoadingAccounts &&
              !accountsError &&
              filteredAccounts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🏦</div>
                  <h3>No Accounts Found</h3>
                  <p>No accounts found for {getDescription()}</p>
                </div>
              )}

            {!isLoadingAccounts &&
              !accountsError &&
              filteredAccounts.length > 0 && (
                <div className="accounts-table-container">
                  <div className="transactions-table-wrapper">
                    <table className="transactions-table">
                      <thead>
                        <tr>
                          <th>Account Name</th>
                          <th>Currency</th>
                          <th>Balance</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedAccounts().map((account) => (
                          <tr key={account.Id}>
                            <td className="account-name">
                              {account.AccountName}
                            </td>
                            <td className="account-currency">
                              {account.Currency}
                            </td>
                            <td
                              className={`account-balance ${
                                account.Balance >= 0 ? "positive" : "negative"
                              }`}
                            >
                              {account.Currency === "AED" ? (
                                <>
                                  <span className="dirham-symbol">ê</span>
                                  {account.Balance.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </>
                              ) : (
                                `₹ ${account.Balance.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              )}
                            </td>
                            <td className="actions-cell">
                              <button
                                className="action-button"
                                onClick={() => navigateToAccount(account.Id)}
                                title="View Account Details"
                              >
                                📊
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Accounts Pagination Controls */}
                  {filteredAccounts.length > accountsPerPage && (
                    <div className="pagination-controls">
                      <div className="pagination-info">
                        <span>
                          Showing{" "}
                          {(currentAccountPage - 1) * accountsPerPage + 1} to{" "}
                          {Math.min(
                            currentAccountPage * accountsPerPage,
                            filteredAccounts.length
                          )}{" "}
                          of {filteredAccounts.length} accounts
                        </span>
                      </div>
                      <div className="pagination-numbers">
                        {currentAccountPage > 1 && (
                          <button
                            className="pagination-arrow"
                            onClick={() =>
                              handleAccountPageChange(currentAccountPage - 1)
                            }
                          >
                            ‹
                          </button>
                        )}

                        {Array.from(
                          { length: totalAccountPages },
                          (_, i) => i + 1
                        ).map((pageNumber) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalAccountPages ||
                            (pageNumber >= currentAccountPage - 1 &&
                              pageNumber <= currentAccountPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                className={`pagination-number ${
                                  currentAccountPage === pageNumber
                                    ? "active"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleAccountPageChange(pageNumber)
                                }
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                          return null;
                        })}

                        {currentAccountPage < totalAccountPages && (
                          <button
                            className="pagination-arrow"
                            onClick={() =>
                              handleAccountPageChange(currentAccountPage + 1)
                            }
                          >
                            ›
                          </button>
                        )}
                      </div>
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
          onClick={() => setIsInstallmentsCollapsed(!isInstallmentsCollapsed)}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            setIsInstallmentsCollapsed(!isInstallmentsCollapsed)
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
                  {filteredInstallments.filter((i) => i.Active).length === 1
                    ? "Active EMI"
                    : "Active EMIs"}
                </span>
                {installmentAedTotal > 0 && (
                  <>
                    <span className="portfolio-separator">; </span>
                    <span className="portfolio-item">
                      AED Monthly: <span className="dirham-symbol">ê</span>
                      <span
                        className={
                          installmentAedTotal >= 0 ? "positive" : "negative"
                        }
                      >
                        {installmentAedTotal.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </span>
                  </>
                )}
                {installmentInrTotal > 0 && (
                  <>
                    <span className="portfolio-separator">; </span>
                    <span className="portfolio-item">
                      INR Monthly: ₹
                      <span
                        className={
                          installmentInrTotal >= 0 ? "positive" : "negative"
                        }
                      >
                        {installmentInrTotal.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="collapse-icon">
            {isInstallmentsCollapsed ? "▼" : "▲"}
          </div>
        </div>

        {!isInstallmentsCollapsed && (
          <>
            {isLoadingInstallments && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading installments...</p>
              </div>
            )}

            {!isLoadingInstallments && filteredInstallments.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🏛️</div>
                <h3>No Installments</h3>
                <p>No installments found for {getDescription()}</p>
              </div>
            )}

            {!isLoadingInstallments && filteredInstallments.length > 0 && (
              <div className="transactions-table-wrapper">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Monthly Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstallments.map((installment) => {
                      const monthlyAmount = getMonthlyAmount(
                        installment.Amount,
                        installment.TransactionType
                      );
                      return (
                        <tr
                          key={installment.Id}
                          className={!installment.Active ? "inactive-row" : ""}
                        >
                          <td className="date-cell">
                            {new Date(
                              installment.InstallmentDate
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </td>
                          <td className="description-cell">
                            {installment.Description}
                          </td>
                          <td className="type-cell">
                            <span
                              className={`transaction-type-badge ${installment.TransactionType?.toLowerCase()}`}
                            >
                              {installment.TransactionType}
                            </span>
                          </td>
                          <td className="amount-cell positive">
                            {installment.Currency === "AED" ? (
                              <>
                                <span className="dirham-symbol">ê</span>
                                {monthlyAmount.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </>
                            ) : (
                              `₹ ${monthlyAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            )}
                          </td>
                          <td className="status-cell">
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
            )}
          </>
        )}
      </div>

      {/* Wallet Inquiries Section */}
      <div className="wallet-inquiries-section">
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
              <span className="section-icon">💼</span> Wallet Inquiries
            </h2>
            {!isLoadingWallet && filteredWalletInquiries.length > 0 && (
              <div className="portfolio-summary">
                {walletAedTotal !== 0 && (
                  <span className="portfolio-item">
                    AED Balance: <span className="dirham-symbol">ê</span>
                    <span
                      className={walletAedTotal >= 0 ? "positive" : "negative"}
                    >
                      {walletAedTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </span>
                )}
                {walletAedTotal !== 0 && walletInrTotal !== 0 && (
                  <span className="portfolio-separator">; </span>
                )}
                {walletInrTotal !== 0 && (
                  <span className="portfolio-item">
                    INR Balance: ₹
                    <span
                      className={walletInrTotal >= 0 ? "positive" : "negative"}
                    >
                      {walletInrTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="collapse-icon">{isWalletCollapsed ? "▼" : "▲"}</div>
        </div>

        {!isWalletCollapsed && (
          <>
            {isLoadingWallet && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading wallet inquiries...</p>
              </div>
            )}

            {!isLoadingWallet && filteredWalletInquiries.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">💼</div>
                <h3>No Wallet Inquiries</h3>
                <p>No wallet inquiries found for {getDescription()}</p>
              </div>
            )}

            {!isLoadingWallet && filteredWalletInquiries.length > 0 && (
              <div className="wallet-inquiries-table-container">
                <div className="transactions-table-wrapper">
                  <table className="wallet-inquiries-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Account</th>
                        <th>Amount</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWalletInquiries.map((inquiry) => (
                        <tr key={inquiry.Id}>
                          <td className="date-cell">
                            {new Date(inquiry.InquiryDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="description-cell">
                            {inquiry.Description}
                          </td>
                          <td className="account-cell">
                            {inquiry.AccountName || "N/A"}
                          </td>
                          <td
                            className={`amount-cell ${
                              inquiry.isDebit ? "negative" : "positive"
                            }`}
                          >
                            {inquiry.Currency === "AED" ? (
                              <>
                                <span className="dirham-symbol">ê</span>
                                {inquiry.Amount.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </>
                            ) : (
                              `₹ ${inquiry.Amount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            )}
                          </td>
                          <td className="type-cell">
                            <span
                              className={`transaction-type-badge ${
                                inquiry.isDebit ? "debit" : "credit"
                              }`}
                            >
                              {inquiry.isDebit ? "Debit" : "Credit"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FinanceBoard;
