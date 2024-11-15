const vscode = require("vscode");
const moment = require("moment-timezone");
const tzLookup = require("tz-lookup");
const fs = require("fs");
const path = require("path");
const cities = require("cities.json");
const { showLiturgicalCalendar, getTodayLiturgicalInfo } = require("./liturgicalCalendar");
const { initializePrayerReminders } = require("./prayerReminder");
const { initializeCitySetting } = require("./citySetting");
const { showPrayers } = require("./prayerDisplay");
const { showSaints } = require("./saintDisplay");
const { showBible } = require("./bibleDisplay");

let statusBar;
let countdownInterval;

/**
 * Retrieves the timezone of a specified city using its latitude and longitude.
 * If the city is not found, defaults to "Asia/Jakarta" timezone.
 * @param {string} cityName - The name of the city.
 * @returns {string} - The timezone of the specified city.
 */
function getCityTimezone(cityName) {
    const city = cities.find(city => city.name.toLowerCase() === cityName.toLowerCase());
    if (city) {
        return tzLookup(city.lat, city.lng);
    }
    return "Asia/Jakarta";
}

/**
 * Loads today's saint celebration information from orangkudus.json based on the current date.
 * @param {object} context - The extension context for accessing resources.
 * @param {object} todayDate - The current date.
 * @returns {string} - Names of saints being celebrated today, if any.
 */
function getTodaySaints(context, todayDate) {
    const saintsPath = path.join(context.extensionPath, "resources", "orangkudus.json");
    let saints = [];
    try {
        const data = fs.readFileSync(saintsPath, "utf8");
        saints = JSON.parse(data);
    } catch (error) {
        console.error("Error loading saints data:", error);
        return null;
    }

    const todaySaints = saints.filter(saint => saint.tgl === todayDate.date() && saint.bulan === todayDate.month() + 1);
    return todaySaints.map(saint => saint.nama).join(", ");
}

/**
 * Updates the countdown to Christmas based on the selected city’s timezone, displaying
 * daily liturgical information and saint celebrations in the tooltip.
 * @param {string} city - The city for setting the timezone.
 * @param {object} context - The extension context.
 */
async function updateCountdownToChristmas(city, context) {
    if (countdownInterval) clearInterval(countdownInterval);

    const timezone = getCityTimezone(city) || "Asia/Jakarta";
    const todayDate = moment.tz(timezone);

    const liturgicalInfo = await getTodayLiturgicalInfo(timezone);
    const { celebration, color } = liturgicalInfo || {};
    const saintsCelebration = getTodaySaints(context, todayDate);

    statusBar.tooltip = `Perayaan: ${celebration || "Tidak ada"} | Warna: ${color || "-"}\nSanto/Hari Ini: ${saintsCelebration || "Tidak ada"}`;

    countdownInterval = setInterval(() => {
        const now = moment.tz(timezone);
        const christmas = moment.tz(`${now.year()}-12-25 00:00:00`, "YYYY-MM-DD HH:mm:ss", timezone);

        if (now.isAfter(christmas)) {
            christmas.add(1, 'year');
        }

        const diffDays = christmas.diff(now, 'days');
        const diffHours = christmas.diff(now, 'hours') % 24;
        const diffMinutes = christmas.diff(now, 'minutes') % 60;
        const diffSeconds = christmas.diff(now, 'seconds') % 60;

        let countdownText;
        if (diffDays > 0) {
            countdownText = `${diffDays} hari menuju Natal`;
        } else {
            countdownText = `${diffHours} jam ${diffMinutes} menit ${diffSeconds} detik menuju Natal`;
        }

        statusBar.text = `$(sparkle) ${countdownText}`;
    }, 1000);
}

/**
 * The main activation function for the extension. Initializes status bar,
 * registers commands, and sets default reminders and countdown based on city.
 * @param {object} context - The extension context.
 */
async function activate(context) {
    console.log("Extension active");

    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.command = "doa-harian-katolik.showOptions";
    statusBar.show();
    context.subscriptions.push(statusBar);

    const disposable = vscode.commands.registerCommand("doa-harian-katolik.showOptions", async () => {
        const options = [
            "Tampilkan Kalender Liturgi", 
            "Pengaturan Kota dan Pengingat Doa",
            "Tampilkan Alkitab",
            "Tampilkan Kumpulan Doa", 
            "Tampilkan Orang Kudus"
        ];
        const choice = await vscode.window.showQuickPick(options, { placeHolder: "Pilih opsi" });

        if (choice === "Tampilkan Kalender Liturgi") {
            showLiturgicalCalendar();
        } else if (choice === "Pengaturan Kota dan Pengingat Doa") {
            await initializeCitySetting();
            const config = vscode.workspace.getConfiguration("doaHarianKatolik");
            const city = config.get("city", "Jakarta");
            updateCountdownToChristmas(city, context);
            initializePrayerReminders();
        } else if (choice === "Tampilkan Kumpulan Doa") {
            showPrayers(context);
        } else if (choice === "Tampilkan Orang Kudus") {
            showSaints(context);
        } else if (choice === "Tampilkan Alkitab") {
            showBible(context);
        }
    });

    context.subscriptions.push(disposable);

    const config = vscode.workspace.getConfiguration("doaHarianKatolik");
    const city = config.get("city", "Jakarta");
    updateCountdownToChristmas(city, context);

    initializePrayerReminders();
    console.log("Prayer reminders initialized");
}

/**
 * Deactivates the extension and clears any countdown intervals.
 */
function deactivate() {
    if (countdownInterval) clearInterval(countdownInterval);
}

module.exports = { activate, deactivate };
