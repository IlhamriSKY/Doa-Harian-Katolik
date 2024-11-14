const vscode = require("vscode");
const axios = require("axios");
const cheerio = require("cheerio");
// Fungsi untuk menampilkan kalender liturgi dengan animasi loading
async function showLiturgicalCalendar() {
    const panel = vscode.window.createWebviewPanel(
        "liturgicalCalendar",
        "Kalender Liturgi",
        vscode.ViewColumn.One,
        { enableScripts: true }
    );
    panel.webview.html = generateLoadingHTML();
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 4 }, (_, i) => (currentYear - 2 + i).toString());
    const selectedYear = await vscode.window.showQuickPick(yearOptions, {
        placeHolder: "Pilih Tahun",
    });
    if (!selectedYear) {
        panel.webview.html = generateErrorHTML("Tahun tidak dipilih. Silakan pilih tahun terlebih dahulu.");
        return;
    }
    const monthOptions = [
        { label: "Januari", value: "01" }, { label: "Februari", value: "02" },
        { label: "Maret", value: "03" }, { label: "April", value: "04" },
        { label: "Mei", value: "05" }, { label: "Juni", value: "06" },
        { label: "Juli", value: "07" }, { label: "Agustus", value: "08" },
        { label: "September", value: "09" }, { label: "Oktober", value: "10" },
        { label: "November", value: "11" }, { label: "Desember", value: "12" },
    ];
    const selectedMonth = await vscode.window.showQuickPick(
        monthOptions.map(option => option.label), 
        { placeHolder: "Pilih Bulan" }
    );
    if (!selectedMonth) {
        panel.webview.html = generateErrorHTML("Bulan tidak dipilih. Silakan pilih bulan terlebih dahulu.");
        return;
    }
    const monthValue = monthOptions.find(option => option.label === selectedMonth).value;
    const yearMonth = `${selectedYear}-${monthValue}`;
    const calendarData = await fetchLiturgicalCalendar(yearMonth);
    if (Array.isArray(calendarData) && calendarData.length > 0) {
        panel.webview.html = generateCalendarHTML(calendarData);
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === "fetchReadingDetails") {
                await openReadingDetailsPanel(message.url);
            }
        });
    } else {
        panel.webview.html = generateErrorHTML("Gagal memuat data kalender. Silakan coba lagi.");
    }
}
// Fungsi untuk mengambil data kalender dengan banyak bacaan
async function fetchLiturgicalCalendar(yearMonth) {
    const url = `https://www.imankatolik.or.id/kalender.php?t=${yearMonth.slice(0, 4)}&b=${yearMonth.slice(5, 7)}`;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const calendarData = [];
        $(".k_tbl_td").each((_, element) => {
            const date = $(element).find(".k_tgl").text().trim();
            const name = $(element).find(".k_perayaan").text().trim();
            const readingsElements = $(element).find(".k_alkitab a");
            const readings = [];
            // Menyimpan setiap bacaan dengan linknya
            readingsElements.each((i, el) => {
                const readingText = $(el).text().trim();
                const readingLink = $(el).attr("href");
                if (readingLink) {
                    readings.push({
                        text: readingText,
                        url: `https://www.imankatolik.or.id${readingLink}`
                    });
                }
            });
            const color = $(element).find(".k_pakaian").text().replace("Warna Liturgi ", "").trim();
            if (date) {
                calendarData.push({
                    localDate: `${date} ${yearMonth.slice(5, 7)} ${yearMonth.slice(0, 4)}`,
                    name,
                    readings,
                    color,
                });
            }
        });
        return calendarData;
    } catch (error) {
        vscode.window.showErrorMessage("Gagal mengambil data kalender liturgi.");
        console.error("Error fetching calendar data:", error);
        return [];
    }
}
// Fungsi untuk menampilkan animasi loading
function generateLoadingHTML() {
    const skeletonCard = `
        <div class="card skeleton">
            <div class="skeleton-date"></div>
            <div class="skeleton-event"></div>
            <div class="skeleton-reading"></div>
            <div class="skeleton-reading"></div>
            <div class="skeleton-reading"></div>
            <div class="skeleton-color"></div>
        </div>
    `;
    const skeletonCards = Array(6).fill(skeletonCard).join("");
    return `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Loading</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #121212; color: #e0e0e0; padding: 20px; }
                h1 { color: #ffffff; text-align: center; margin-bottom: 20px; }
                .container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1200px; margin: auto; }
                .card {
                    background-color: #1f1f1f;
                    border-radius: 10px;
                    padding: 20px;
                    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
                    transition: transform 0.2s;
                }
                /* Skeleton loading styles */
                .skeleton {
                    position: relative;
                    overflow: hidden;
                }
                .skeleton::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -150px;
                    height: 100%;
                    width: 150px;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    animation: loading 1.5s infinite;
                }
                @keyframes loading {
                    0% { left: -150px; }
                    100% { left: 100%; }
                }
                .skeleton-date, .skeleton-event, .skeleton-reading, .skeleton-color {
                    background-color: #333;
                    border-radius: 4px;
                    margin: 10px 0;
                }
                .skeleton-date {
                    width: 70%;
                    height: 20px;
                    margin-bottom: 15px;
                }
                .skeleton-event {
                    width: 50%;
                    height: 16px;
                    margin-bottom: 10px;
                }
                .skeleton-reading {
                    width: 90%;
                    height: 12px;
                }
                .skeleton-color {
                    width: 30%;
                    height: 12px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <h1>Memuat Kalender Liturgi...</h1>
            <div class="container">${skeletonCards}</div>
        </body>
        </html>
    `;
}
// Fungsi untuk menampilkan skeleton loading khusus untuk halaman detail bacaan
function generateReadingSkeletonHTML() {
    const skeletonItem = `
        <div class="skeleton-verse"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
        <hr class="separator">
    `;
    // Membuat beberapa skeleton item untuk simulasi loading banyak bacaan
    const skeletonContent = Array(5).fill(skeletonItem).join("");
    return `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Loading Detail Bacaan</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    background-color: #1e1e1e; 
                    color: #d4d4d4; 
                    padding: 20px; 
                    max-width: 800px;
                    margin: auto;
                }
                h2 {
                    color: #bb86fc;
                    text-align: center;
                    font-size: 1.8em;
                    margin-bottom: 20px;
                }
                .container {
                    background-color: #2d2d2d;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
                }
                /* Skeleton styles */
                .skeleton-verse, .skeleton-text {
                    background-color: #333;
                    border-radius: 4px;
                    position: relative;
                    overflow: hidden;
                    margin-bottom: 10px;
                }
                .skeleton-verse {
                    width: 30%;
                    height: 20px;
                }
                .skeleton-text {
                    width: 90%;
                    height: 16px;
                }
                .skeleton-text.short {
                    width: 70%;
                }
                /* Skeleton loading animation */
                .skeleton-verse::before, .skeleton-text::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -150px;
                    height: 100%;
                    width: 150px;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    animation: loading 1.5s infinite;
                }
                @keyframes loading {
                    0% { left: -150px; }
                    100% { left: 100%; }
                }
                .separator {
                    height: 1px;
                    background-color: #444;
                    border: none;
                    margin: 15px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Memuat Detail Bacaan...</h2>
                ${skeletonContent}
            </div>
        </body>
        </html>
    `;
}
// Fungsi untuk menghasilkan HTML tampilan kalender dengan banyak bacaan
function generateCalendarHTML(data) {
    const colorMapping = {
        Hijau: "#00FF00", Putih: "#FFFFFF", Ungu: "#800080", Merah: "#FF0000",
        Kuning: "#FFFF00", Hitam: "#000000",
    };
    function formatDate(localDate) {
        const [day, month, year] = localDate.split(" ");
        const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        return `${parseInt(day, 10)} ${monthNames[parseInt(month, 10)]} ${year}`;
    }
    function getColorPill(color) {
        const colors = color.split("/").map(c => colorMapping[c.trim()] || "#d4d4d4");
        return colors.map(c => `<span class="color-pill" style="background-color: ${c};"></span>`).join("");
    }
    const calendarHTML = data.map(item => `
        <div class="card">
            <h3 class="date">${formatDate(item.localDate)}</h3>
            <p class="event"><strong>Perayaan:</strong> ${item.name}</p>
            <p><strong>Bacaan:</strong></p>
            <ul class="readings">
                ${item.readings.map(reading => `
                    <li><a href="#" data-url="${reading.url}" class="reading-link">${reading.text}</a></li>
                `).join("")}
            </ul>
            <p class="liturgical-color"><strong>Warna Liturgi: </strong> ${getColorPill(item.color)}</p>
        </div>
    `).join("");
    return `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Kalender Liturgi</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #121212; color: #e0e0e0; padding: 20px; }
                h1 { color: #ffffff; text-align: center; margin-bottom: 20px; }
                .container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1200px; margin: auto; }
                .card {
                    background-color: #1f1f1f;
                    border-radius: 10px;
                    padding: 20px;
                    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
                    transition: transform 0.2s;
                }
                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.3);
                }
                .date {
                    font-size: 1.2em;
                    font-weight: bold;
                    color: #bb86fc;
                    margin-bottom: 10px;
                }
                .event {
                    font-size: 1em;
                    margin-bottom: 10px;
                    color: #fca311;
                }
                .readings {
                    list-style-type: none;
                    padding: 0;
                    margin: 10px 0;
                }
                .readings li {
                    margin: 5px 0;
                }
                .readings a {
                    color: #03dac5;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .readings a:hover {
                    color: #bb86fc;
                    text-decoration: underline;
                }
                .liturgical-color {
                    display: flex;
                    align-items: center;
                    font-size: 0.9em;
                    color: #f4f4f4;
                }
                .color-pill {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    margin-right: 5px;
                }
            </style>
        </head>
        <body>
            <h1>Kalender Liturgi</h1>
            <div class="container">${calendarHTML}</div>
            <script>
                const vscode = acquireVsCodeApi();
                document.querySelectorAll('.reading-link').forEach(link => {
                    link.addEventListener('click', (event) => {
                        event.preventDefault();
                        vscode.postMessage({
                            command: 'fetchReadingDetails',
                            url: event.target.getAttribute('data-url')
                        });
                    });
                });
            </script>
        </body>
        </html>
    `;
}
// Fungsi untuk membuka panel baru dengan detail bacaan
async function openReadingDetailsPanel(url) {
    const panel = vscode.window.createWebviewPanel(
        "readingDetails",
        "Detail Bacaan",
        vscode.ViewColumn.One,
        { enableScripts: true }
    );
    panel.webview.html = generateReadingSkeletonHTML(); // Menampilkan skeleton loading
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        let content = "";
        $("table tr").each((_, element) => {
            const verse = $(element).find("td.v b").text().trim();
            const text = $(element).find("td.v").last().text().trim();
            if (verse && text) {
                content += `
                    <div class="verse-container">
                        <p class="verse">${verse}</p>
                        <button class="copy-button" data-text="${verse}: ${text}" title="Copy">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <p class="text">${text}</p>
                    <hr class="separator">
                `;
            }
        });
        if (!content) {
            content = "<p>Bacaan tidak ditemukan atau format tidak sesuai.</p>";
        }
        panel.webview.html = generateReadingHTML(content);
    } catch (error) {
        console.error("Error fetching reading details:", error);
        panel.webview.html = generateErrorHTML("Gagal memuat data bacaan. Periksa koneksi internet Anda dan coba lagi.");
    }
}
// Fungsi untuk menampilkan semua detail bacaan dalam format HTML yang lebih menarik
function generateReadingHTML(content) {
    return `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Detail Bacaan</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    background-color: #1e1e1e; 
                    color: #d4d4d4; 
                    padding: 20px; 
                    line-height: 1.6;
                    max-width: 800px;
                    margin: auto;
                }

                h2 {
                    color: #bb86fc;
                    text-align: center;
                    font-size: 1.8em;
                    margin-bottom: 20px;
                }

                .verse-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .verse {
                    color: #61dafb;
                    font-weight: bold;
                    margin-bottom: 5px;
                    flex: 1;
                }

                .text {
                    color: #e0e0e0;
                    font-size: 1em;
                    margin-bottom: 15px;
                    padding-left: 10px;
                    border-left: 3px solid #61dafb;
                }

                .separator {
                    margin: 25px 0;
                    height: 1px;
                    background-color: #444;
                    border: none;
                }

                .container {
                    background-color: #2d2d2d;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
                }

                .copy-button {
                    background: none;
                    border: none;
                    color: #61dafb;
                    font-size: 1.2em;
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .copy-button:hover {
                    color: #bb86fc;
                }

                /* Toast Styles */
                .toast {
                    visibility: hidden;
                    min-width: 200px;
                    margin-left: -100px;
                    background-color: #323232;
                    color: #ffffff;
                    text-align: center;
                    border-radius: 8px;
                    padding: 16px;
                    position: fixed;
                    z-index: 1;
                    bottom: 30px;
                    left: 50%;
                    font-size: 17px;
                    opacity: 0;
                    transition: opacity 0.5s, visibility 0.5s;
                }

                .toast.show {
                    visibility: visible;
                    opacity: 1;
                }

            </style>
        </head>
        <body>
            <div class="container">
                <h2>Detail Bacaan</h2>
                ${content}
            </div>

            <!-- Toast Notification -->
            <div id="copyToast" class="toast">Teks berhasil disalin</div>

            <script>
                const vscode = acquireVsCodeApi();

                // Fungsi untuk menampilkan toast
                function showToast() {
                    const toast = document.getElementById("copyToast");
                    toast.classList.add("show");
                    setTimeout(() => {
                        toast.classList.remove("show");
                    }, 3000);
                }

                // Menambahkan event listener untuk tombol copy
                document.querySelectorAll('.copy-button').forEach(button => {
                    button.addEventListener('click', () => {
                        const text = button.getAttribute('data-text');
                        navigator.clipboard.writeText(text).then(() => {
                            showToast(); // Tampilkan toast setelah teks disalin
                            button.innerHTML = '<i class="fas fa-check"></i>';
                            setTimeout(() => {
                                button.innerHTML = '<i class="fas fa-copy"></i>';
                            }, 2000);
                        }).catch(err => {
                            console.error('Gagal menyalin teks: ', err);
                        });
                    });
                });
            </script>
        </body>
        </html>
    `;
}
// Fungsi untuk menampilkan pesan error dalam format HTML yang lebih menarik
function generateErrorHTML(message) {
    return `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Error</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    background-color: #1e1e1e; 
                    color: #d4d4d4; 
                    padding: 20px; 
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .error-container {
                    background-color: #2d2d2d;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
                    max-width: 600px;
                    text-align: center;
                }
                .error-title {
                    color: #ff5555;
                    font-size: 1.8em;
                    font-weight: bold;
                    margin-bottom: 15px;
                }
                .error-message {
                    color: #e0e0e0;
                    font-size: 1em;
                    margin-bottom: 10px;
                    line-height: 1.6;
                }
                .error-icon {
                    font-size: 3em;
                    color: #ff5555;
                    margin-bottom: 15px;
                }
                .retry-button {
                    background-color: #61dafb;
                    color: #1e1e1e;
                    padding: 10px 20px;
                    border-radius: 5px;
                    border: none;
                    cursor: pointer;
                    font-size: 1em;
                    font-weight: bold;
                    transition: background-color 0.3s;
                }
                .retry-button:hover {
                    background-color: #4fc3f7;
                }
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <div class="error-title">Terjadi Kesalahan</div>
                <div class="error-message">${message}</div>
                <button class="retry-button" onclick="history.back()">Coba Lagi</button>
            </div>
        </body>
        </html>
    `;
}
module.exports = { showLiturgicalCalendar };
