function to12HourFormat(timeStr) {
    if (timeStr === "23:59") return "Midnight";

    const [hourStr, minuteStr] = timeStr.split(":");

    let hour = parseInt(hourStr, 10);
    let minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? "pm" : "am";

    hour = hour % 12 || 12;
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

function isPharmacyOpen(pharmacy) {
    if (pharmacy.open24_7 === true) {
        return true;
    }

    const hours = pharmacy.working_hours;
    if (!hours || typeof hours !== 'object') {
        return null; // For pharmacies without working hours info
    }

    const now = new Date();
    const today = now.toLocaleDateString("en-US", { weekday: "long" });

    const currentTime = now.getHours() + now.getMinutes() / 60; // e.g. 14.5 for 2:30pm

    const todayHours = hours[today];

    if (Array.isArray(todayHours) && todayHours.length === 2) {
        const [openTimeStr, closeTimeStr] = todayHours;

        const openTime = parseTimeToHours(openTimeStr);  
        const closeTime = parseTimeToHours(closeTimeStr); 

        if (closeTime < openTime) {
            return currentTime >= openTime || currentTime < closeTime;
        }

        return currentTime >= openTime && currentTime < closeTime;
    }

    return false;
}

function parseTimeToHours(timeStr) {
    const [hour, minute] = timeStr.split(":").map(Number);
    return hour + minute / 60;
}