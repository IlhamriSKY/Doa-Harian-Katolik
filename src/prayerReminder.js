const vscode = require("vscode");
const moment = require("moment-timezone");
const allCities = require("all-the-cities");
const tzLookup = require("tz-lookup");

// Fungsi untuk mendapatkan zona waktu berdasarkan nama kota
function getCityTimezone(cityName) {
    const city = allCities.find(city => city.name.toLowerCase() === cityName.toLowerCase());

    if (city) {
        const [longitude, latitude] = city.loc.coordinates;
        const timezone = tzLookup(latitude, longitude);
        logDebug(`Kota ditemukan: ${cityName}, Timezone: ${timezone}`);
        return timezone;
    } else {
        vscode.window.showErrorMessage(`Kota ${cityName} tidak ditemukan.`);
        logDebug(`Kota ${cityName} tidak ditemukan dalam all-the-cities`);
        return null;
    }
}

// Fungsi log untuk debugging
function logDebug(message) {
    console.log(`[DEBUG] ${message}`);
}

// Fungsi untuk mengatur pengingat doa
function schedulePrayerReminder(time, prayerName, timezone, reminderMinutesBefore, debugMode = false) {
    const setReminder = () => {
        const now = moment.tz(timezone);
        const targetTime = moment.tz(time, "HH:mm", timezone).subtract(reminderMinutesBefore, "minutes");

        if (targetTime.isBefore(now)) {
            targetTime.add(1, "day");
        }

        const delay = debugMode ? 10000 : targetTime.diff(now);

        logDebug(`Pengaturan reminder untuk ${prayerName}:`);
        logDebug(`Waktu sekarang di ${timezone}: ${now.format("YYYY-MM-DD HH:mm:ss")}`);
        logDebug(`Waktu target notifikasi untuk ${prayerName} di ${timezone}: ${targetTime.format("YYYY-MM-DD HH:mm:ss")}`);
        logDebug(`Delay: ${delay} ms`);

        setTimeout(() => {
            vscode.window.showInformationMessage(`Reminder: ${prayerName} akan dimulai dalam ${reminderMinutesBefore} menit.`);
            logDebug(`Reminder: ${prayerName} ditampilkan pada ${moment().format("YYYY-MM-DD HH:mm:ss")}`);
            setReminder();
        }, delay);
    };
    setReminder();
}

// Fungsi untuk menginisialisasi pengingat doa berdasarkan konfigurasi pengguna
async function initializePrayerReminders() {
    const config = vscode.workspace.getConfiguration("doaHarianKatolik");
    const cityName = config.get("city", "Jakarta");
    const timezone = getCityTimezone(cityName) || "Asia/Jakarta";
    const reminderMinutesBefore = config.get("reminderMinutesBefore", 5);
    const debugMode = config.get("debugMode", false);

    logDebug(`Inisialisasi reminder untuk ${cityName} dengan timezone ${timezone} dan debugMode ${debugMode}`);
    
    schedulePrayerReminder("06:00", "Doa Angelus pagi", timezone, reminderMinutesBefore, debugMode);
    schedulePrayerReminder("12:00", "Doa Angelus siang", timezone, reminderMinutesBefore, debugMode);
    schedulePrayerReminder("15:00", "Doa Kerahiman Ilahi", timezone, reminderMinutesBefore, debugMode);

    if (debugMode) {
        vscode.window.showInformationMessage("Mode debug aktif: Reminder akan berjalan setiap 10 detik.");
        logDebug("Mode debug aktif, pengingat akan berjalan setiap 10 detik");
    }
}

module.exports = { initializePrayerReminders };
