import ShoppingList from "./ShoppingList";

interface GroceryBoardProps {
  subTab?: string;
}

function GroceryBoard({ subTab }: Readonly<GroceryBoardProps>) {
  const renderContent = () => {
    switch (subTab) {
      case "active":
        return (
          <div>
            <h3>Active Lists</h3>
            <p>Current shopping lists in progress.</p>
            <ShoppingList type="active" />
          </div>
        );
      case "completed":
        return (
          <div>
            <h3>Completed Lists</h3>
            <p>Completed shopping lists and purchase history.</p>
            <ShoppingList type="completed" />
          </div>
        );
      case "cart":
      default:
        return (
          <div>
            <h3>Shopping Cart</h3>
            <p>Items you plan to buy on your next shopping trip.</p>
            <ShoppingList type="cart" />
          </div>
        );
    }
  };

  return <div className="grocery-container">{renderContent()}</div>;
}

export default GroceryBoard;
