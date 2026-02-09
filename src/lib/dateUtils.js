export const getISTDate = (date = new Date()) => {
    const d = new Date(date);
    // IST is UTC + 5:30
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(d.getTime() + istOffset);

    // Return a Date object representing midnight of that IST day in UTC terms 
    // (so it can be stored as "start of day")
    // BUT: MongoDB stores in UTC. 
    // If we want "2024-02-10" to be the date key:
    // We should probably return the YYYY-MM-DD string or a Date set to that local YYYY-MM-DD but in UTC?
    // Let's stick to returning the Date object shifted to IST for extraction.

    // Better approach for "Date Only" fields:
    // 1. Get UTC time
    // 2. Add 5.5 hours
    // 3. Extract YYYY-MM-DD
    // 4. Return new Date(YYYY-MM-DD) which will be 00:00 UTC of that specific date.

    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const ist = utc + (330 * 60000); // +5.5 hours
    const istDate = new Date(ist);

    return new Date(Date.UTC(istDate.getFullYear(), istDate.getMonth(), istDate.getDate()));
};

export const formatISTTime = (date) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

export const formatISTDate = (date) => {
    if (!date) return "--";
    return new Date(date).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};
