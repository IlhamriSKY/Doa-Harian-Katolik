const vscode = require("vscode");
const moment = require("moment-timezone");
const tzLookup = require("tz-lookup"); // Ensure tz-lookup is installed
const cities = require("cities.json");

/**
 * Retrieves the timezone based on the specified city name using latitude and longitude data.
 * @param {string} cityName - The name of the city for which to retrieve the timezone.
 * @returns {string} - The timezone string (e.g., "Asia/Jakarta") or defaults to "Asia/Jakarta" if the city is not found.
 */
function getCityTimezone(cityName) {
    const city = cities.find(city => city.name.toLowerCase() === cityName.toLowerCase());
    if (city) {
        return tzLookup(city.lat, city.lng); // Get timezone based on coordinates
    } else {
        vscode.window.showErrorMessage(`Kota ${cityName} tidak ditemukan.`);
        return "Asia/Jakarta"; // Default timezone
    }
}

/**
 * Logs debug messages to the console for troubleshooting purposes.
 * @param {string} message - The message to log.
 */
function logDebug(message) {
    console.log(`[DEBUG] ${message}`);
}

/**
 * Schedules a prayer reminder at a specified time, with an optional offset for reminder timing.
 * If debug mode is enabled, reminders will trigger every 10 seconds.
 * @param {string} time - The time for the prayer in "HH:mm" format.
 * @param {string} prayerName - The name of the prayer for notification purposes.
 * @param {string} timezone - The timezone in which to schedule the reminder.
 * @param {number} reminderMinutesBefore - Minutes before the prayer time to trigger the reminder.
 * @param {boolean} debugMode - Whether to enable debug mode (shortens delay for testing).
 */
function schedulePrayerReminder(time, prayerName, timezone, reminderMinutesBefore, debugMode = false) {
    const setReminder = () => {
        const now = moment.tz(timezone);
        const targetTime = moment.tz(time, "HH:mm", timezone).subtract(reminderMinutesBefore, "minutes");

        // If the target time is in the past, set it for the next day
        if (targetTime.isBefore(now)) {
            targetTime.add(1, "day");
        }

        const delay = debugMode ? 10000 : targetTime.diff(now);
        logDebug(`Setting reminder for ${prayerName}:`);
        logDebug(`Current time in ${timezone}: ${now.format("YYYY-MM-DD HH:mm:ss")}`);
        logDebug(`Notification target time for ${prayerName} in ${timezone}: ${targetTime.format("YYYY-MM-DD HH:mm:ss")}`);
        logDebug(`Delay: ${delay} ms`);

        setTimeout(() => {
            vscode.window.showInformationMessage(`Reminder: ${prayerName} akan dimulai dalam ${reminderMinutesBefore} menit.`);
            logDebug(`Reminder: ${prayerName} displayed at ${moment().format("YYYY-MM-DD HH:mm:ss")}`);
            setReminder();
        }, delay);
    };

    setReminder();
}

/**
 * Initializes the prayer reminders based on user configuration, such as city and reminder timing.
 * Configures reminders for morning, noon, and afternoon prayers.
 */
async function initializePrayerReminders() {
    const config = vscode.workspace.getConfiguration("doaHarianKatolik");
    const cityName = config.get("city", "Jakarta");
    const timezone = getCityTimezone(cityName);
    const reminderMinutesBefore = config.get("reminderMinutesBefore", 5);
    const debugMode = config.get("debugMode", false);

    logDebug(`Initializing reminder for ${cityName} with timezone ${timezone} and debug mode ${debugMode}`);

    // Schedule reminders at specific prayer times using the selected city's timezone
    schedulePrayerReminder("06:00", "Doa Angelus pagi", timezone, reminderMinutesBefore, debugMode);
    schedulePrayerReminder("12:00", "Doa Angelus siang", timezone, reminderMinutesBefore, debugMode);
    schedulePrayerReminder("15:00", "Doa Kerahiman Ilahi", timezone, reminderMinutesBefore, debugMode);

    if (debugMode) {
        vscode.window.showInformationMessage("Debug mode active: Reminders will run every 10 seconds.");
        logDebug("Debug mode active, reminders will run every 10 seconds");
    }
}

module.exports = { initializePrayerReminders };
