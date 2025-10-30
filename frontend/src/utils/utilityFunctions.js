export const renderItemsSummary = (items, limit = 3) => {
  const displayedItems = items.slice(0, limit).map((item) => item.name);
  const remaining = items.length - limit;
  return remaining > 0
    ? `${displayedItems.join(", ")}, +${remaining} more`
    : displayedItems.join(", ");
};
