export const getToday = () => {
  return new Date().toISOString();
};

export const getWeekend = () => {
  const now = new Date();
  const day = now.getDay(); // 0 domingo

  const saturday = new Date(now);
  saturday.setDate(now.getDate() + (6 - day));

  return saturday.toISOString();
};