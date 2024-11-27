export const getAgeFromDate = (dateString) => {
    const dob = new Date(dateString);
    const now = new Date();

    const currentYear = now.getFullYear();
    const dobYear = dob.getFullYear();

    let age = currentYear - dobYear;

    const currentMonth = now.getMonth();
    const dobMonth = dob.getMonth();
    const currentDay = now.getDate();
    const dobDay = dob.getDate();

    if (currentMonth < dobMonth || (currentMonth === dobMonth && currentDay < dobDay)) {
        age--;
    }

    return Math.abs(age);
}