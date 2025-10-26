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
      <div className="portfolio-container">
        <div className="loading-state">Loading portfolio data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-container">
        <div className="error-state">
          <h3>Error Loading Portfolio</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="portfolio-container">
        <div className="empty-state">No portfolio data available</div>
      </div>
    );
  }

  const { summary, portfolios } = portfolioData;

  return (
    <div className="portfolio-container">
      <div className="portfolio-header">
        <h2>📊 Portfolio Summary</h2>
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-number">
              {formatNumber(summary.totalPersons)}
            </div>
            <div className="stat-label">Persons</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {formatNumber(summary.totalAccounts)}
            </div>
            <div className="stat-label">Accounts</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {formatNumber(summary.totalExpenses)}
            </div>
            <div className="stat-label">Transactions</div>
          </div>
        </div>
      </div>

      {/* Person-wise Financial Position */}
      <div className="grand-totals">
        <h3>💰 Individual Financial Position</h3>
        <div className="currency-grid">
          {portfolios.map((portfolio) => (
            <div key={portfolio.personId} className="person-financial-card">
              <h4>👤 {portfolio.personName}'s Portfolio</h4>

              {/* AED Totals */}
              <div className="currency-section aed">
                <h5>
                  <span className="dirham-symbol">&#xea;</span> UAE Dirham (AED)
                </h5>
                <div className="amounts-grid">
                  <div className="amount-item credit">
                    <span className="label">Total Credits</span>
                    <span className="value">
                      {formatCurrency(portfolio.totals.aed.creditAmount, "AED")}
                    </span>
                  </div>
                  <div className="amount-item debit">
                    <span className="label">Total Debits</span>
                    <span className="value">
                      {formatCurrency(portfolio.totals.aed.debitAmount, "AED")}
                    </span>
                  </div>
                  <div className="amount-item net">
                    <span className="label">Net Amount</span>
                    <span
                      className={`value ${
                        portfolio.totals.aed.netAmount >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {formatCurrency(portfolio.totals.aed.netAmount, "AED")}
                    </span>
                  </div>
                </div>
              </div>

              {/* INR Totals */}
              <div className="currency-section inr">
                <h5>₹ Indian Rupee (INR)</h5>
                <div className="amounts-grid">
                  <div className="amount-item credit">
                    <span className="label">Total Credits</span>
                    <span className="value">
                      {formatCurrency(portfolio.totals.inr.creditAmount, "INR")}
                    </span>
                  </div>
                  <div className="amount-item debit">
                    <span className="label">Total Debits</span>
                    <span className="value">
                      {formatCurrency(portfolio.totals.inr.debitAmount, "INR")}
                    </span>
                  </div>
                  <div className="amount-item net">
                    <span className="label">Net Amount</span>
                    <span
                      className={`value ${
                        portfolio.totals.inr.netAmount >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {formatCurrency(portfolio.totals.inr.netAmount, "INR")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Portfolios */}
      <div className="portfolios-section">
        <h3>👥 Individual Portfolios</h3>
        {portfolios.map((portfolio) => {
          const isCollapsed = collapsedPersons.has(portfolio.personId);
          return (
            <div key={portfolio.personId} className="person-portfolio">
              <button
                className="portfolio-header-btn"
                onClick={() => togglePersonCollapse(portfolio.personId)}
                aria-expanded={!isCollapsed}
              >
                <div className="header-left">
                  <span
                    className={`collapse-icon ${
                      isCollapsed ? "collapsed" : ""
                    }`}
                  >
                    ▼
                  </span>
                  <h4>👤 {portfolio.personName}'s Portfolio</h4>
                </div>
                <div className="portfolio-summary">
                  <span className="accounts-count">
                    {portfolio.accounts.length} accounts
                  </span>
                  <span className="net-worth">
                    Net: {formatCurrency(portfolio.totals.aed.netAmount, "AED")}
                  </span>
                </div>
              </button>

              {!isCollapsed && (
                <div className="portfolio-content">
                  <div className="person-totals">
                    <div className="total-card aed">
                      <h5>
                        <span className="dirham-symbol">&#xea;</span> AED Totals
                      </h5>
                      <div className="total-amounts">
                        <span className="net-amount">
                          Net:{" "}
                          {formatCurrency(
                            portfolio.totals.aed.netAmount,
                            "AED"
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="total-card inr">
                      <h5>₹ INR Totals</h5>
                      <div className="total-amounts">
                        <span className="net-amount">
                          Net:{" "}
                          {formatCurrency(
                            portfolio.totals.inr.netAmount,
                            "INR"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="accounts-grid">
                    {portfolio.accounts.map((account) => {
                      const isAccountCollapsed = collapsedAccounts.has(
                        account.accountId
                      );
                      return (
                        <div key={account.accountId} className="account-card">
                          <button
                            className="account-header-btn"
                            onClick={() =>
                              toggleAccountCollapse(account.accountId)
                            }
                            aria-expanded={!isAccountCollapsed}
                          >
                            <div className="account-header">
                              <span
                                className={`collapse-icon ${
                                  isAccountCollapsed ? "collapsed" : ""
                                }`}
                              >
                                ▼
                              </span>
                              <h5>{account.accountName}</h5>
                              <span className="currency-badge">
                                {account.currency}
                              </span>
                            </div>
                            <div className="account-summary">
                              <span className="transaction-count">
                                {account.amounts.expenseCount} txns
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
                            <div className="account-details">
                              <div className="account-stats">
                                <div className="stat">
                                  <span className="label">Transactions</span>
                                  <span className="value">
                                    {account.amounts.expenseCount}
                                  </span>
                                </div>
                                <div className="stat">
                                  <span className="label">Net Amount</span>
                                  <span
                                    className={`value ${
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
                              </div>
                              <div className="account-breakdown">
                                <div className="breakdown-item credit">
                                  <span>
                                    Credits:{" "}
                                    {formatCurrency(
                                      account.amounts.creditAmount,
                                      account.currency
                                    )}
                                  </span>
                                </div>
                                <div className="breakdown-item debit">
                                  <span>
                                    Debits:{" "}
                                    {formatCurrency(
                                      account.amounts.debitAmount,
                                      account.currency
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Exchange Rate Info */}
      <div className="exchange-rate-info">
        <h4>💱 Current Exchange Rates</h4>
        <div className="rates">
          <span>1 AED = ₹ {summary.conversionRate.aedToInr}</span>
          <span>
            1 INR = <span className="dirham-symbol">&#xea;</span>{" "}
            {summary.conversionRate.inrToAed.toFixed(4)}
          </span>
        </div>
        <div className="generated-at">
          Last updated: {new Date(summary.generatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default PortfolioSummary;
