const vscode = require("vscode");
const cities = require("cities.json");

// Filter to get only cities in Indonesia
const indonesiaCities = cities.filter(city => city.country === "ID");

/**
 * Initializes the city setting for the prayer reminder feature.
 * Displays a list of Indonesian cities for the user to choose from,
 * then updates the chosen city in the user's configuration settings.
 */
async function initializeCitySetting() {
    // Retrieve and sort city names for display in a user-friendly way
    const cityNames = indonesiaCities.map(city => city.name).sort();

    // Prompt the user to select a city from the list
    const selectedCity = await vscode.window.showQuickPick(cityNames, {
        placeHolder: "Pilih kota Anda untuk pengingat doa harian"
    });

    // If a city is selected, update the configuration; otherwise, show a warning
    if (selectedCity) {
        const config = vscode.workspace.getConfiguration("doaHarianKatolik");
        await config.update("city", selectedCity, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Kota telah diatur ke ${selectedCity} untuk pengingat doa.`);
    } else {
        vscode.window.showWarningMessage("Pengaturan kota dibatalkan.");
    }
}

module.exports = { initializeCitySetting };
