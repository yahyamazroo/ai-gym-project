export const toDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
};

export const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + Number(days));
  return next;
};

export const daysBetween = (from, to) => {
  const milliseconds = new Date(to).getTime() - new Date(from).getTime();
  return Math.ceil(milliseconds / (1000 * 60 * 60 * 24));
};
