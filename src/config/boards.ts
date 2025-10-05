// Configuration for other boards in the application
export interface BoardConfiguration {
  key: string;
  title: string;
  description: string;
  icon?: string;
}

export interface SubTabConfiguration {
  key: string;
  title: string;
  icon?: string;
  description?: string;
}

// Main board configurations
export const BOARD_CONFIGS: BoardConfiguration[] = [
  {
    key: "grocery",
    title: "Grocery",
    description: "Manage grocery lists",
    icon: "🛒",
  },
  {
    key: "grocery-inventory",
    title: "Grocery Inventory",
    description: "Track grocery inventory",
    icon: "📦",
  },
  {
    key: "finance",
    title: "Finance",
    description: "Track expenses & transfers",
    icon: "💰",
  },
  {
    key: "reminder",
    title: "Reminder",
    description: "Quick reminders",
    icon: "📝",
  },
  {
    key: "task",
    title: "Task",
    description: "Daily to-dos",
    icon: "✓",
  },
];

// Sub-tab configurations for non-grocery boards
export const FINANCE_SUB_TABS: SubTabConfiguration[] = [
  {
    key: "expenses",
    title: "Expenses",
    icon: "💸",
    description: "Track your expenses",
  },
  {
    key: "income",
    title: "Income",
    icon: "💵",
    description: "Record income sources",
  },
  {
    key: "transfers",
    title: "Transfers",
    icon: "🔄",
    description: "Money transfers between accounts",
  },
];

export const REMINDER_SUB_TABS: SubTabConfiguration[] = [
  {
    key: "today",
    title: "Today",
    icon: "📅",
    description: "Today's reminders",
  },
  {
    key: "upcoming",
    title: "Upcoming",
    icon: "⏰",
    description: "Future reminders",
  },
];

export const TASK_SUB_TABS: SubTabConfiguration[] = [
  { key: "active", title: "Active", icon: "⚡", description: "Active tasks" },
  {
    key: "completed",
    title: "Completed",
    icon: "✅",
    description: "Completed tasks",
  },
];

export const GROCERY_SUB_TABS: SubTabConfiguration[] = [
  {
    key: "shopping",
    title: "Shopping List",
    icon: "🛒",
    description: "Create shopping lists",
  },
];

// Helper functions
export const getBoardConfig = (key: string): BoardConfiguration | undefined => {
  return BOARD_CONFIGS.find((board) => board.key === key);
};

export const getBoardTitle = (key: string): string => {
  const board = getBoardConfig(key);
  return board?.title || "Unknown Board";
};

export const getBoardIcon = (key: string): string => {
  const board = getBoardConfig(key);
  return board?.icon || "📋";
};
