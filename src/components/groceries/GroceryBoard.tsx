import React from "react";
import ShoppingList from "./ShoppingList";

interface GroceryBoardProps {
  subTab?: string;
}

function GroceryBoard({ subTab }: GroceryBoardProps) {
  return (
    <div className="grocery-container">
      <h3>Shopping List</h3>
      <p>Create and manage your grocery shopping list.</p>
      <ShoppingList />
    </div>
  );
}

export default GroceryBoard;
