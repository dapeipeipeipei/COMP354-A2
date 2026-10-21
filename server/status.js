// Order status flow. An order can only move forward one step at a time:
// Received -> Preparing -> Ready for Pickup -> Completed
export const STATUSES = ['Received', 'Preparing', 'Ready for Pickup', 'Completed'];

// Returns the status after `current`, or null if there is none.
export function nextStatus(current) {
  const index = STATUSES.indexOf(current);
  if (index === -1 || index === STATUSES.length - 1) return null;
  return STATUSES[index + 1];
}

export function canChangeStatus(from, to) {
  return nextStatus(from) === to;
}
