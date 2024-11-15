const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

/**
 * Displays a collection of prayers in a new webview panel.
 * Loads prayers data from "kumpulandoa.json" and generates HTML content for display.
 * @param {object} context - The extension context for accessing resources.
 */
async function showPrayers(context) {
    const panel = vscode.window.createWebviewPanel(
        "prayers",
        "Kumpulan Doa",
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    // Load the prayers data from "kumpulandoa.json"
    const prayersPath = path.join(context.extensionPath, "resources", "kumpulandoa.json");
    let prayers = [];
    try {
        const data = fs.readFileSync(prayersPath, "utf8");
        prayers = JSON.parse(data);
    } catch (error) {
        vscode.window.showErrorMessage("Gagal memuat kumpulan doa.");
        console.error("Error loading prayers:", error);
        return;
    }

    // Generate and set the HTML content for the prayers panel
    panel.webview.html = generatePrayersHTML(prayers);
}

/**
 * Generates the HTML content for displaying the collection of prayers.
 * Each prayer is presented in a card format with a title and content.
 * Also includes a search functionality for filtering prayers.
 * @param {Array} prayers - Array of prayer objects with "nama" and "isiDoa" properties.
 * @returns {string} - The generated HTML content.
 */
function generatePrayersHTML(prayers) {
    // Create cards for each prayer, sorted by "urutan" property
    const prayerCards = prayers
        .sort((a, b) => a.urutan - b.urutan)
        .map(
            (prayer) => `
        <div class="card" data-name="${prayer.nama.toLowerCase()}">
            <h3 class="title">${prayer.nama}</h3>
            <p class="content">${prayer.isiDoa}</p>
        </div>
    `
        )
        .join("");

    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <title>Kumpulan Doa</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #121212; color: #e0e0e0; padding: 20px; }
            h1 { color: #ffffff; text-align: center; margin-bottom: 20px; }
            
            /* Search Container Styling */
            .search-container {
                display: flex;
                justify-content: center;
                margin-bottom: 20px;
            }

            /* Search Input Styling */
            #searchInput {
                width: 100%;
                max-width: 600px;
                padding: 12px 20px;
                font-size: 1em;
                border-radius: 25px;
                border: 1px solid #333;
                background-color: #1f1f1f;
                color: #ffffff;
                outline: none;
                transition: box-shadow 0.3s ease, background-color 0.3s ease;
            }

            /* Search Input Focus Styling */
            #searchInput:focus {
                background-color: #333;
            }

            /* Prayer Cards Container */
            .container { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
                gap: 20px; 
                max-width: 1200px; 
                margin: auto; 
            }

            /* Card Styling */
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

            /* Title and Content Styling */
            .title {
                font-size: 1.2em;
                font-weight: bold;
                color: #bb86fc;
                margin-bottom: 10px;
            }
            .content {
                font-size: 1em;
                color: #fca311;
                line-height: 1.6;
            }

            /* Responsive Styling */
            @media (max-width: 768px) {
                .container {
                    grid-template-columns: 1fr;
                }
                #searchInput {
                    width: 90%;
                }
            }
        </style>
    </head>
    <body>
        <h1>Kumpulan Doa</h1>
        <div class="search-container">
            <input type="text" id="searchInput" placeholder="Cari doa..."/>
        </div>
        <div class="container" id="prayerContainer">${prayerCards}</div>

        <script>
            const searchInput = document.getElementById('searchInput');
            
            // Add event listener for the search input
            searchInput.addEventListener('input', function() {
                const filter = searchInput.value.toLowerCase();
                const cards = document.querySelectorAll('.card');

                // Show or hide prayers based on the search input
                cards.forEach(card => {
                    const name = card.getAttribute('data-name');
                    if (name.includes(filter)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        </script>
    </body>
    </html>
    `;
}

module.exports = { showPrayers };
