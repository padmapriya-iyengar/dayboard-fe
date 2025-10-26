import { useState, useEffect } from "react";
import "./portfolio.css";

interface ConversionRate {
  aedToInr: number;
  inrToAed: number;
}

interface CurrencyAmounts {
  totalAmount: number;
  debitAmount: number;
  creditAmount: number;
  netAmount: number;
}

interface GrandTotals {
  aed: CurrencyAmounts;
  inr: CurrencyAmounts;
}

interface AccountAmounts extends CurrencyAmounts {
  expenseCount: number;
}

interface ConvertedAmounts {
  aed: CurrencyAmounts;
  inr: CurrencyAmounts;
}

interface Account {
  accountId: number;
  accountName: string;
  currency: string;
  amounts: AccountAmounts;
  convertedAmounts: ConvertedAmounts;
}

interface PersonTotals {
  aed: CurrencyAmounts;
  inr: CurrencyAmounts;
}

interface Portfolio {
  personId: number;
  personName: string;
  accounts: Account[];
  totals: PersonTotals;
}

interface Summary {
  totalPersons: number;
  totalAccounts: number;
  totalExpenses: number;
  grandTotals: GrandTotals;
  conversionRate: ConversionRate;
  generatedAt: string;
}

interface PortfolioData {
  summary: Summary;
  portfolios: Portfolio[];
}

interface PortfolioResponse {
  status: string;
  message: string;
  data: PortfolioData;
  timestamp: string;
}

function PortfolioSummary() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsedPersons, setCollapsedPersons] = useState<Set<number>>(
    new Set()
  );
  const [collapsedAccounts, setCollapsedAccounts] = useState<Set<number>>(
    new Set()
  );

  // Fetch portfolio data from API
  useEffect(() => {
    const fetchPortfolio = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:3002/api/v1/portfolio");
        if (response.ok) {
          const responseData: PortfolioResponse = await response.json();
          console.log("Portfolio API Response:", responseData);

          if (responseData.status === "success" && responseData.data) {
            setPortfolioData(responseData.data);
            // Set all persons as collapsed by default
            const personIds = responseData.data.portfolios.map(
              (p) => p.personId
            );
            setCollapsedPersons(new Set(personIds));

            // Set all accounts as collapsed by default
            const accountIds = responseData.data.portfolios.flatMap((p) =>
              p.accounts.map((a) => a.accountId)
            );
            setCollapsedAccounts(new Set(accountIds));
          } else {
            setError("Invalid response format");
          }
        } else {
          setError(`Failed to fetch portfolio data: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        setError("Network error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const togglePersonCollapse = (personId: number) => {
    setCollapsedPersons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(personId)) {
        newSet.delete(personId);
      } else {
        newSet.add(personId);
      }
      return newSet;
    });
  };

  const toggleAccountCollapse = (accountId: number) => {
    setCollapsedAccounts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "AED") {
      return (
        <>
          <span className="dirham-symbol">&#xea;</span>{" "}
          {amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </>
      );
    }
    const symbol = "₹";
    return `${symbol} ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US");
  };

  if (isLoading) {
    return (
      <div className="portfolio-dashboard">
        <div className="loading-state">Loading portfolio data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-dashboard">
        <div className="error-state">
          <h3>Error Loading Portfolio</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="portfolio-dashboard">
        <div className="empty-state">No portfolio data available</div>
      </div>
    );
  }

  const { summary, portfolios } = portfolioData;

  return (
    <div className="portfolio-dashboard">
      {/* Hero Section with Key Metrics */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="dashboard-title">
            <span className="title-icon">💼</span> Financial Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Real-time portfolio overview and analytics
          </p>
        </div>
        <div className="hero-metrics">
          <div className="metric-card primary">
            <div className="metric-icon">👥</div>
            <div className="metric-info">
              <div className="metric-value">
                {formatNumber(summary.totalPersons)}
              </div>
              <div className="metric-label">Active Portfolios</div>
            </div>
          </div>
          <div className="metric-card secondary">
            <div className="metric-icon">🏦</div>
            <div className="metric-info">
              <div className="metric-value">
                {formatNumber(summary.totalAccounts)}
              </div>
              <div className="metric-label">Connected Accounts</div>
            </div>
          </div>
          <div className="metric-card tertiary">
            <div className="metric-icon">📊</div>
            <div className="metric-info">
              <div className="metric-value">
                {formatNumber(summary.totalExpenses)}
              </div>
              <div className="metric-label">Total Transactions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="overview-section">
        <h2 className="section-title">
          <span className="section-icon">💰</span> Portfolio Overview
        </h2>
        <div className="overview-grid">
          {portfolios.map((portfolio) => (
            <div key={portfolio.personId} className="portfolio-overview-card">
              <div className="card-header">
                <div className="person-avatar">
                  {portfolio.personName.charAt(0).toUpperCase()}
                </div>
                <div className="person-info">
                  <h3 className="person-name">{portfolio.personName}</h3>
                  <span className="account-count">
                    {portfolio.accounts.length} accounts
                  </span>
                </div>
              </div>

              <div className="currency-overview">
                <div className="currency-card aed-card">
                  <div className="currency-header">
                    <span className="currency-flag">🇦🇪</span>
                    <span className="currency-name">UAE Dirham</span>
                    <span className="currency-code">AED</span>
                  </div>
                  <div className="currency-amount">
                    <span className="amount-value">
                      <span className="dirham-symbol">&#xea;</span>
                      {Math.abs(portfolio.totals.aed.netAmount).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                    <span
                      className={`amount-status ${
                        portfolio.totals.aed.netAmount >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {portfolio.totals.aed.netAmount >= 0 ? "↗️" : "↘️"}
                    </span>
                  </div>
                </div>

                <div className="currency-card inr-card">
                  <div className="currency-header">
                    <span className="currency-flag">🇮🇳</span>
                    <span className="currency-name">Indian Rupee</span>
                    <span className="currency-code">INR</span>
                  </div>
                  <div className="currency-amount">
                    <span className="amount-value">
                      ₹
                      {Math.abs(portfolio.totals.inr.netAmount).toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                    <span
                      className={`amount-status ${
                        portfolio.totals.inr.netAmount >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {portfolio.totals.inr.netAmount >= 0 ? "↗️" : "↘️"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Details Section */}
      <div className="accounts-section">
        <h2 className="section-title">
          <span className="section-icon">🏛️</span> Account Details
        </h2>
        {portfolios.map((portfolio) => {
          const isCollapsed = collapsedPersons.has(portfolio.personId);
          return (
            <div key={portfolio.personId} className="person-accounts">
              <button
                className="person-toggle-btn"
                onClick={() => togglePersonCollapse(portfolio.personId)}
                aria-expanded={!isCollapsed}
              >
                <div className="toggle-header">
                  <span
                    className={`toggle-icon ${isCollapsed ? "collapsed" : ""}`}
                  >
                    ▼
                  </span>
                  <div className="person-avatar-small">
                    {portfolio.personName.charAt(0).toUpperCase()}
                  </div>
                  <h3>{portfolio.personName}'s Accounts</h3>
                </div>
                <div className="toggle-summary">
                  <span className="accounts-count">
                    {portfolio.accounts.length} accounts
                  </span>
                  <div className="net-amounts">
                    <span className="net-aed">
                      <span className="dirham-symbol">&#xea;</span>{" "}
                      {portfolio.totals.aed.netAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="net-inr">
                      ₹
                      {portfolio.totals.inr.netAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </button>

              {!isCollapsed && (
                <div className="accounts-grid">
                  {portfolio.accounts
                    .sort((a, b) => {
                      // Sort by currency: AED first, then INR
                      const currencyOrder = { AED: 0, INR: 1 };
                      const orderA =
                        currencyOrder[
                          a.currency as keyof typeof currencyOrder
                        ] ?? 2;
                      const orderB =
                        currencyOrder[
                          b.currency as keyof typeof currencyOrder
                        ] ?? 2;
                      return orderA - orderB;
                    })
                    .map((account) => {
                      const isAccountCollapsed = collapsedAccounts.has(
                        account.accountId
                      );
                      return (
                        <div
                          key={account.accountId}
                          className="account-detail-card"
                        >
                          <button
                            className="account-toggle-btn"
                            onClick={() =>
                              toggleAccountCollapse(account.accountId)
                            }
                            aria-expanded={!isAccountCollapsed}
                          >
                            <div className="account-toggle-header">
                              <span
                                className={`toggle-icon ${
                                  isAccountCollapsed ? "collapsed" : ""
                                }`}
                              >
                                ▼
                              </span>
                              <h4>{account.accountName}</h4>
                              <span
                                className={`currency-badge ${account.currency.toLowerCase()}`}
                              >
                                {account.currency}
                              </span>
                            </div>
                            <div className="account-toggle-summary">
                              <span className="transaction-count">
                                {account.amounts.expenseCount} transactions
                              </span>
                              <span
                                className={`net-amount ${
                                  account.amounts.netAmount >= 0
                                    ? "positive"
                                    : "negative"
                                }`}
                              >
                                {formatCurrency(
                                  account.amounts.netAmount,
                                  account.currency
                                )}
                              </span>
                            </div>
                          </button>

                          {!isAccountCollapsed && (
                            <div className="account-breakdown">
                              <div className="breakdown-stats">
                                <div className="stat-item">
                                  <span className="stat-label">
                                    Total Credits
                                  </span>
                                  <span className="stat-value credit">
                                    +
                                    {formatCurrency(
                                      account.amounts.creditAmount,
                                      account.currency
                                    )}
                                  </span>
                                </div>
                                <div className="stat-item">
                                  <span className="stat-label">
                                    Total Debits
                                  </span>
                                  <span className="stat-value debit">
                                    -
                                    {formatCurrency(
                                      account.amounts.debitAmount,
                                      account.currency
                                    )}
                                  </span>
                                </div>
                                <div className="stat-item">
                                  <span className="stat-label">
                                    Net Balance
                                  </span>
                                  <span
                                    className={`stat-value ${
                                      account.amounts.netAmount >= 0
                                        ? "positive"
                                        : "negative"
                                    }`}
                                  >
                                    {formatCurrency(
                                      account.amounts.netAmount,
                                      account.currency
                                    )}
                                  </span>
                                </div>
                                <div className="stat-item">
                                  <span className="stat-label">
                                    Transactions
                                  </span>
                                  <span className="stat-value neutral">
                                    {account.amounts.expenseCount}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Exchange Rate Footer */}
      <div className="exchange-rate-footer">
        <div className="rate-info">
          <h4>
            <span className="rate-icon">💱</span> Current Exchange Rates
          </h4>
          <div className="rates-display">
            <div className="rate-item">
              <span className="rate-from">1 AED</span>
              <span className="rate-arrow">→</span>
              <span className="rate-to">
                ₹ {summary.conversionRate.aedToInr}
              </span>
            </div>
            <div className="rate-item">
              <span className="rate-from">1 INR</span>
              <span className="rate-arrow">→</span>
              <span className="rate-to">
                <span className="dirham-symbol">&#xea;</span>{" "}
                {summary.conversionRate.inrToAed.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
        <div className="last-updated">
          <span className="update-icon">🕒</span> Last updated:{" "}
          {new Date(summary.generatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default PortfolioSummary;
