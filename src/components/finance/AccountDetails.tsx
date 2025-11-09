import React, { useState, useEffect } from "react";
import "./finance.css";

interface AccountDetailsProps {
  accountId: number;
  onBackToFinance: () => void;
}

// Transaction Interfaces
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

// Tag Interfaces
interface ExpenseTag {
  Id: number;
  Expense_Id: number;
  Category_Id: number;
  Category_Value: string;
  CategoryName: string;
  CategoryDescription: string;
}

interface TagResponse {
  status: string;
  message: string;
  data: ExpenseTag[];
  timestamp: string;
}

// Category Interfaces
interface Category {
  Id: number;
  Category: string;
  Description: string;
}

interface CategoryResponse {
  status: string;
  message: string;
  data: Category[];
  timestamp: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Account Interface
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

function AccountDetails({
  accountId,
  onBackToFinance,
}: Readonly<AccountDetailsProps>) {
  const [account, setAccount] = useState<AccountEntry | null>(null);
  const [transactions, setTransactions] = useState<ExpenseEntry[]>([]);
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  // Tag management state
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(
    null
  );
  const [showTagManagement, setShowTagManagement] = useState(false);
  const [expenseTags, setExpenseTags] = useState<ExpenseTag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);

  // Category and tag creation state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [tagValue, setTagValue] = useState<string>("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [createTagError, setCreateTagError] = useState<string | null>(null);

  // Edit and delete tag state
  const [showEditTagModal, setShowEditTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState<ExpenseTag | null>(null);
  const [isUpdatingTag, setIsUpdatingTag] = useState(false);
  const [isDeletingTag, setIsDeletingTag] = useState<number | null>(null);
  const [updateTagError, setUpdateTagError] = useState<string | null>(null);

  // Fetch account details
  useEffect(() => {
    const fetchAccount = async () => {
      setIsLoadingAccount(true);
      setAccountError(null);
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
            const foundAccount = responseData.data.accounts.find(
              (acc: AccountEntry) => acc.Id === accountId
            );
            if (foundAccount) {
              setAccount(foundAccount);
            } else {
              setAccountError("Account not found");
            }
          } else {
            setAccountError("Invalid response structure");
          }
        } else {
          setAccountError("Failed to fetch account details");
        }
      } catch (error) {
        console.error("Error fetching account:", error);
        setAccountError("Error fetching account details");
      } finally {
        setIsLoadingAccount(false);
      }
    };

    fetchAccount();
  }, [accountId]);

  // Fetch account transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoadingTransactions(true);
      setTransactionsError(null);
      try {
        const response = await fetch(
          `http://localhost:3002/api/v1/expenses?Account_Id=${accountId}`
        );
        if (response.ok) {
          const responseData = await response.json();
          console.log("Account Transactions API Response:", responseData);

          if (
            responseData.status === "success" &&
            Array.isArray(responseData.data)
          ) {
            setTransactions(responseData.data);
          } else {
            setTransactionsError("Invalid response structure");
          }
        } else {
          setTransactionsError("Failed to fetch transactions");
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactionsError("Error fetching transactions");
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [accountId]);

  // Pagination logic
  const getPaginatedTransactions = () => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return transactions.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(transactions.length / recordsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Tag management functions
  const fetchExpenseTags = async (expenseId: number) => {
    setIsLoadingTags(true);
    setTagsError(null);
    try {
      const response = await fetch(
        `http://localhost:3002/api/v1/tags/expense/${expenseId}`
      );
      if (response.ok) {
        const responseData: TagResponse = await response.json();
        console.log("Tags API Response:", responseData);

        if (
          responseData.status === "success" &&
          Array.isArray(responseData.data)
        ) {
          setExpenseTags(responseData.data);
        } else {
          setTagsError("Invalid response structure");
        }
      } else {
        setTagsError("Failed to fetch tags");
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      setTagsError("Error fetching tags");
    } finally {
      setIsLoadingTags(false);
    }
  };

  const navigateToTagManagement = (expenseId: number) => {
    setSelectedExpenseId(expenseId);
    setShowTagManagement(true);
    fetchExpenseTags(expenseId);
    fetchCategories(); // Fetch categories when opening tag management
  };

  const navigateBackToTransactions = () => {
    setShowTagManagement(false);
    setSelectedExpenseId(null);
    setExpenseTags([]);
    setTagsError(null);
    setShowAddTagModal(false);
    setCreateTagError(null);
  };

  // Category and tag creation functions
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    setCategoriesError(null);
    try {
      const response = await fetch("http://localhost:3002/api/v1/categories");
      if (response.ok) {
        const responseData: CategoryResponse = await response.json();
        console.log("Categories API Response:", responseData);

        if (
          responseData.status === "success" &&
          Array.isArray(responseData.data)
        ) {
          setCategories(responseData.data);
        } else {
          setCategoriesError("Invalid response structure");
        }
      } else {
        setCategoriesError("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoriesError("Error fetching categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const createTag = async () => {
    if (!selectedExpenseId || !selectedCategoryId || !tagValue.trim()) {
      setCreateTagError("Please select a category and enter a tag value");
      return;
    }

    setIsCreatingTag(true);
    setCreateTagError(null);

    try {
      const response = await fetch("http://localhost:3002/api/v1/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Expense_Id: selectedExpenseId,
          Category_Id: selectedCategoryId,
          Category_Value: tagValue.trim(),
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Create Tag API Response:", responseData);

        // Refresh the tags list
        await fetchExpenseTags(selectedExpenseId);

        // Reset form
        setShowAddTagModal(false);
        setSelectedCategoryId(null);
        setTagValue("");
        setCreateTagError(null);
      } else {
        const errorData = await response.json();
        setCreateTagError(errorData.message || "Failed to create tag");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      setCreateTagError("Error creating tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleShowAddTagForm = () => {
    setShowAddTagModal(true);
    setCreateTagError(null);
    fetchCategories(); // Fetch categories when opening modal
  };

  const handleCancelAddTag = () => {
    setShowAddTagModal(false);
    setSelectedCategoryId(null);
    setTagValue("");
    setCreateTagError(null);
  };

  // Edit tag functions
  const handleEditTag = (tag: ExpenseTag) => {
    setEditingTag(tag);
    setSelectedCategoryId(tag.Category_Id);
    setTagValue(tag.Category_Value);
    setShowEditTagModal(true);
    setUpdateTagError(null);
    fetchCategories(); // Ensure categories are loaded
  };

  const handleCancelEditTag = () => {
    setShowEditTagModal(false);
    setEditingTag(null);
    setSelectedCategoryId(null);
    setTagValue("");
    setUpdateTagError(null);
  };

  const updateTag = async () => {
    if (!editingTag || !selectedCategoryId || !tagValue.trim()) return;

    setIsUpdatingTag(true);
    setUpdateTagError(null);

    try {
      const response = await fetch(
        `http://localhost:3002/api/v1/tags/${editingTag.Id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Expense_Id: editingTag.Expense_Id,
            Category_Id: selectedCategoryId,
            Category_Value: tagValue,
          }),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log("Update Tag API Response:", responseData);

        // Refresh the tags list
        if (selectedExpenseId) {
          await fetchExpenseTags(selectedExpenseId);
        }

        // Reset form
        handleCancelEditTag();
      } else {
        const errorData = await response.json();
        setUpdateTagError(errorData.message || "Failed to update tag");
      }
    } catch (error) {
      setUpdateTagError("Network error occurred while updating tag");
      console.error("Update tag error:", error);
    } finally {
      setIsUpdatingTag(false);
    }
  };

  // Delete tag function
  const deleteTag = async (tagId: number) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    setIsDeletingTag(tagId);

    try {
      const response = await fetch(
        `http://localhost:3002/api/v1/tags/${tagId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log("Delete Tag API Response:", responseData);

        // Refresh the tags list
        if (selectedExpenseId) {
          await fetchExpenseTags(selectedExpenseId);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to delete tag");
      }
    } catch (error) {
      alert("Network error occurred while deleting tag");
      console.error("Delete tag error:", error);
    } finally {
      setIsDeletingTag(null);
    }
  };

  if (isLoadingAccount) {
    return (
      <div className="account-details-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading account details...</p>
        </div>
      </div>
    );
  }

  if (accountError || !account) {
    return (
      <div className="account-details-container">
        <div className="empty-state error-state">
          <div className="empty-icon">⚠️</div>
          <h3>Error Loading Account</h3>
          <p>{accountError || "Account not found"}</p>
          <button className="back-button" onClick={onBackToFinance}>
            ← Back to Finance
          </button>
        </div>
      </div>
    );
  }

  // Show tag management if a transaction is selected for tag management
  if (showTagManagement && selectedExpenseId) {
    const selectedTransaction = transactions.find(
      (t) => t.Id === selectedExpenseId
    );

    return (
      <div className="account-details-container">
        {/* Extended Breadcrumb Navigation */}
        <div className="breadcrumb-nav">
          <button className="breadcrumb-link" onClick={onBackToFinance}>
            Finance
          </button>
          <span className="breadcrumb-separator">›</span>
          <button
            className="breadcrumb-link"
            onClick={navigateBackToTransactions}
          >
            {account.AccountName}
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">
            Tags -{" "}
            {selectedTransaction?.Description || `Expense ${selectedExpenseId}`}
          </span>
        </div>

        {/* Tag Management Section */}
        <div className="tag-management-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">🏷️</span> Manage Tags
            </h2>
          </div>

          {isLoadingTags && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading tags...</p>
            </div>
          )}

          {tagsError && (
            <div className="empty-state error-state">
              <div className="empty-icon">⚠️</div>
              <h3>Error Loading Tags</h3>
              <p>{tagsError}</p>
            </div>
          )}

          {!isLoadingTags && !tagsError && (
            <div className="tags-container">
              <div className="expense-info">
                <h3>Expense Details</h3>
                {selectedTransaction && (
                  <div className="expense-summary">
                    <span className="tag-expense-date">
                      {new Date(selectedTransaction.TxnDate).toLocaleDateString(
                        "en-GB"
                      )}
                    </span>
                    <span className="tag-expense-description">
                      {selectedTransaction.Description}
                    </span>
                    <span
                      className={`tag-expense-amount ${
                        selectedTransaction.isDebit ? "negative" : "positive"
                      }`}
                    >
                      {selectedTransaction.Currency === "AED" ? (
                        <>
                          <span className="dirham-symbol">ê</span>
                          {selectedTransaction.Amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </>
                      ) : (
                        `₹ ${selectedTransaction.Amount.toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}`
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="tags-list">
                <div className="tags-list-header">
                  <h3>Applied Tags</h3>
                  <button
                    className="add-tag-button"
                    onClick={handleShowAddTagForm}
                    disabled={isLoadingCategories}
                  >
                    + Add Tag
                  </button>
                </div>

                <div className="tags-grid">
                  {expenseTags.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🏷️</div>
                      <h3>No Tags Found</h3>
                      <p>
                        This expense has no tags assigned. Use the "Add Tag"
                        button above to create the first tag.
                      </p>
                    </div>
                  ) : (
                    expenseTags.map((tag) => (
                      <div key={tag.Id} className="tag-card">
                        <div className="tag-actions">
                          <button
                            className="edit-tag-button icon-button"
                            onClick={() => handleEditTag(tag)}
                            disabled={isDeletingTag === tag.Id}
                            title="Edit tag"
                          >
                            ✏️
                          </button>
                          <button
                            className="delete-tag-button icon-button"
                            onClick={() => deleteTag(tag.Id)}
                            disabled={isDeletingTag === tag.Id}
                            title={
                              isDeletingTag === tag.Id
                                ? "Deleting..."
                                : "Delete tag"
                            }
                          >
                            {isDeletingTag === tag.Id ? "⏳" : "🗑️"}
                          </button>
                        </div>
                        <div className="tag-header">
                          <h4 className="tag-name">{tag.CategoryName}</h4>
                          <span
                            className={`tag-value ${
                              tag.Category_Value.toLowerCase() === "yes"
                                ? "positive"
                                : "negative"
                            }`}
                          >
                            {tag.Category_Value}
                          </span>
                        </div>
                        <p className="tag-description">
                          {tag.CategoryDescription}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add Tag Modal */}
          {showAddTagModal && (
            <div className="modal-overlay" onClick={handleCancelAddTag}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Add New Tag</h2>
                  <button
                    className="modal-close-button"
                    onClick={handleCancelAddTag}
                    disabled={isCreatingTag}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  {createTagError && (
                    <div className="error-message">{createTagError}</div>
                  )}

                  <div className="form-group">
                    <label htmlFor="modal-category-select">Category:</label>
                    <select
                      id="modal-category-select"
                      value={selectedCategoryId || ""}
                      onChange={(e) =>
                        setSelectedCategoryId(Number(e.target.value) || null)
                      }
                      disabled={isLoadingCategories}
                    >
                      <option value="">Select a category...</option>
                      {categories.map((category) => (
                        <option key={category.Id} value={category.Id}>
                          {category.Category} - {category.Description}
                        </option>
                      ))}
                    </select>
                    {isLoadingCategories && (
                      <span className="loading-text">
                        Loading categories...
                      </span>
                    )}
                    {categoriesError && (
                      <span className="error-text">{categoriesError}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="modal-tag-value">Value:</label>
                    <input
                      id="modal-tag-value"
                      type="text"
                      value={tagValue}
                      onChange={(e) => setTagValue(e.target.value)}
                      placeholder="Enter tag value (e.g., Yes, No, etc.)"
                      disabled={isCreatingTag}
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      className="create-tag-button"
                      onClick={createTag}
                      disabled={
                        isCreatingTag || !selectedCategoryId || !tagValue.trim()
                      }
                    >
                      {isCreatingTag ? "Creating..." : "Create Tag"}
                    </button>
                    <button
                      className="cancel-tag-button"
                      onClick={handleCancelAddTag}
                      disabled={isCreatingTag}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Tag Modal */}
          {showEditTagModal && editingTag && (
            <div className="modal-overlay" onClick={handleCancelEditTag}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Edit Tag</h2>
                  <button
                    className="modal-close-button"
                    onClick={handleCancelEditTag}
                    disabled={isUpdatingTag}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  {updateTagError && (
                    <div className="error-message">{updateTagError}</div>
                  )}

                  <div className="form-group">
                    <label htmlFor="edit-category-select">Category:</label>
                    <select
                      id="edit-category-select"
                      value={selectedCategoryId || ""}
                      onChange={(e) =>
                        setSelectedCategoryId(Number(e.target.value) || null)
                      }
                      disabled={isLoadingCategories || isUpdatingTag}
                    >
                      <option value="">Select a category...</option>
                      {categories.map((category) => (
                        <option key={category.Id} value={category.Id}>
                          {category.Category} - {category.Description}
                        </option>
                      ))}
                    </select>
                    {isLoadingCategories && (
                      <span className="loading-text">
                        Loading categories...
                      </span>
                    )}
                    {categoriesError && (
                      <span className="error-text">{categoriesError}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-tag-value">Value:</label>
                    <input
                      id="edit-tag-value"
                      type="text"
                      value={tagValue}
                      onChange={(e) => setTagValue(e.target.value)}
                      placeholder="Enter tag value (e.g., Yes, No, etc.)"
                      disabled={isUpdatingTag}
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      className="update-tag-button"
                      onClick={updateTag}
                      disabled={
                        isUpdatingTag || !selectedCategoryId || !tagValue.trim()
                      }
                    >
                      {isUpdatingTag ? "Updating..." : "Update Tag"}
                    </button>
                    <button
                      className="cancel-tag-button"
                      onClick={handleCancelEditTag}
                      disabled={isUpdatingTag}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="account-details-container">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-nav">
        <button className="breadcrumb-link" onClick={onBackToFinance}>
          Finance
        </button>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{account.AccountName}</span>
      </div>

      {/* Transactions Section */}
      <div className="transactions-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-icon">📋</span> Transaction History
          </h2>
        </div>

        {isLoadingTransactions && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading transactions...</p>
          </div>
        )}

        {transactionsError && (
          <div className="empty-state error-state">
            <div className="empty-icon">⚠️</div>
            <h3>Error Loading Transactions</h3>
            <p>{transactionsError}</p>
          </div>
        )}

        {!isLoadingTransactions &&
          !transactionsError &&
          transactions.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No Transactions Found</h3>
              <p>This account has no transaction history</p>
            </div>
          )}

        {!isLoadingTransactions &&
          !transactionsError &&
          transactions.length > 0 && (
            <div className="transactions-table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedTransactions().map((transaction) => (
                    <tr key={transaction.Id}>
                      <td className="date-cell">
                        {new Date(transaction.TxnDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}
                      </td>
                      <td className="description-cell">
                        {transaction.Description}
                      </td>
                      <td
                        className={`amount-cell ${
                          transaction.isDebit ? "negative" : "positive"
                        }`}
                      >
                        {transaction.Currency === "AED" ? (
                          <>
                            <span className="dirham-symbol">ê</span>
                            {transaction.Amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </>
                        ) : (
                          `₹ ${transaction.Amount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        )}
                      </td>
                      <td className="type-cell">
                        <span
                          className={`transaction-type-badge ${
                            transaction.isDebit ? "debit" : "credit"
                          }`}
                        >
                          {transaction.isDebit ? "Debit" : "Credit"}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="action-button tags-button"
                          onClick={() =>
                            navigateToTagManagement(transaction.Id)
                          }
                          title="Manage Tags"
                        >
                          🏷️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <div className="pagination-info">
                    <span className="pagination-text">
                      {transactions.length} total transactions
                    </span>
                  </div>

                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          className={`pagination-number ${
                            currentPage === pageNumber ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    {currentPage < totalPages && (
                      <button
                        className="pagination-arrow"
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        ›
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}

export default AccountDetails;
