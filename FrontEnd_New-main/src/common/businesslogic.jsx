export const getAccessToken = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user.access;
};

export const getLoggedInUser = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user;
};

const calculateOneMonthBeforeToday = () => {
  const today = new Date();
  // const oneMonthBefore = new Date(today);
  // oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);
  // const formattedDate = formatDate(oneMonthBefore);
  const oneWeekBefore = new Date(today);
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
  const formattedDate = formatDate(oneWeekBefore);
  return formattedDate;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getStartAndEndDates = () => {
  const startDate = calculateOneMonthBeforeToday();
  const endDate = formatDate(new Date());
  return { startDate, endDate };
};
