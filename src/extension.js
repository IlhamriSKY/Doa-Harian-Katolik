const vscode = require("vscode");
const cities = require("cities.json");
const { showLiturgicalCalendar } = require("./liturgicalCalendar");
const { initializePrayerReminders } = require("./prayerReminder");
const { initializeCitySetting } = require("./citySetting");
function activate(context) {
    console.log("Ekstensi aktif");
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = "$(calendar) Doa Harian Katolik";
    statusBar.tooltip = "Klik untuk melihat kalender atau pengaturan pengingat doa harian";
    statusBar.command = "doa-harian-katolik.showOptions";
    statusBar.show();
    context.subscriptions.push(statusBar);
    const disposable = vscode.commands.registerCommand("doa-harian-katolik.showOptions", async () => {
        console.log("Perintah doa-harian-katolik.showOptions dipanggil");
        const options = ["Tampilkan Kalender Liturgi", "Pengaturan Kota dan Pengingat Doa"];
        const choice = await vscode.window.showQuickPick(options, { placeHolder: "Pilih opsi" });
        if (choice === "Tampilkan Kalender Liturgi") {
            showLiturgicalCalendar();
        } else if (choice === "Pengaturan Kota dan Pengingat Doa") {
            await initializeCitySetting();
            const cityNames = cities.map(city => city.name);
            const selectedCity = await vscode.window.showQuickPick(cityNames, { placeHolder: "Pilih kota untuk pengingat doa" });
            if (selectedCity) {
                const selectedCityData = cities.find(city => city.name === selectedCity);
                if (selectedCityData) {
                    console.log(`Kota yang dipilih: ${selectedCityData.name}`);
                    // Simpan kota yang dipilih ke dalam pengaturan
                    const config = vscode.workspace.getConfiguration("doaHarianKatolik");
                    await config.update("city", selectedCityData.name, vscode.ConfigurationTarget.Global);
                    vscode.window.showInformationMessage(`Kota telah diatur ke ${selectedCityData.name} untuk pengingat doa.`);
                } else {
                    vscode.window.showErrorMessage("Data kota tidak ditemukan.");
                }
            } else {
                vscode.window.showWarningMessage("Pengaturan kota dibatalkan.");
            }
        }
    });
    context.subscriptions.push(disposable);
    initializePrayerReminders();
    console.log("Pengingat doa diinisialisasi");
}
function deactivate() {}
module.exports = { activate, deactivate };
