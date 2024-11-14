const vscode = require("vscode");
const { showLiturgicalCalendar } = require("./liturgicalCalendar");
const { initializePrayerReminders } = require("./prayerReminder");
const { initializeCitySetting } = require("./citySetting");

function activate(context) {
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = "$(calendar) Doa Harian Katolik";
    statusBar.tooltip = "Klik untuk melihat kalender atau pengaturan pengingat doa harian";
    statusBar.command = "doa-harian-katolik.showOptions";
    statusBar.show();
    context.subscriptions.push(statusBar);

    const disposable = vscode.commands.registerCommand("doa-harian-katolik.showOptions", async () => {
        const options = ["Tampilkan Kalender Liturgi", "Pengaturan Kota dan Pengingat Doa"];
        const choice = await vscode.window.showQuickPick(options, { placeHolder: "Pilih opsi" });
        
        if (choice === "Tampilkan Kalender Liturgi") {
            showLiturgicalCalendar();
        } else if (choice === "Pengaturan Kota dan Pengingat Doa") {
            await initializeCitySetting();
            vscode.commands.executeCommand("workbench.action.openSettings", "doaHarianKatolik");
        }
    });

    context.subscriptions.push(disposable);
    initializePrayerReminders();
}

function deactivate() {}

module.exports = { activate, deactivate };
