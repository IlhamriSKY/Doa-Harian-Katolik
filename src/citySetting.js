const vscode = require("vscode");
const allCities = require("all-the-cities");

// Fungsi untuk menginisialisasi pengaturan kota
async function initializeCitySetting() {
    // Ambil dan urutkan daftar nama kota
    const cities = allCities.map(city => city.name).sort();

    // Tampilkan pilihan kota kepada pengguna
    const selectedCity = await vscode.window.showQuickPick(cities, {
        placeHolder: "Pilih kota Anda untuk pengingat doa harian"
    });

    // Perbarui pengaturan kota jika pengguna memilih satu kota
    if (selectedCity) {
        const config = vscode.workspace.getConfiguration("doaHarianKatolik");
        await config.update("city", selectedCity, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Kota telah diatur ke ${selectedCity} untuk pengingat doa.`);
    } else {
        vscode.window.showWarningMessage("Pengaturan kota dibatalkan.");
    }
}

module.exports = { initializeCitySetting };
