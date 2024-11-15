const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

/**
 * Displays a list of saints in a new webview panel.
 * Loads saint data from "orangkudus.json" and generates HTML content for display.
 * @param {object} context - The extension context for accessing resources.
 */
async function showSaints(context) {
    const panel = vscode.window.createWebviewPanel(
        "saints",
        "Orang Kudus",
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    // Load the saint data from "orangkudus.json"
    const saintsPath = path.join(context.extensionPath, "resources", "orangkudus.json");
    let saints = [];
    try {
        const data = fs.readFileSync(saintsPath, "utf8");
        saints = JSON.parse(data);
    } catch (error) {
        vscode.window.showErrorMessage("Gagal memuat daftar orang kudus.");
        console.error("Error loading saints:", error);
        return;
    }

    // Generate and set the HTML content for the saints panel
    panel.webview.html = generateSaintsHTML(saints);
}

/**
 * Generates the HTML content for displaying the list of saints.
 * Each saint is presented in a card format with their type, name, date, and a brief history.
 * Also includes a search functionality for filtering saints by name.
 * @param {Array} saints - Array of saint objects with properties like "nama", "tgl", "bulan", "tipe", and "riwayat".
 * @returns {string} - The generated HTML content.
 */
function generateSaintsHTML(saints) {
    const monthNames = [
        "", "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // Create cards for each saint, sorted by "noID"
    const saintCards = saints
        .sort((a, b) => a.noID - b.noID)
        .map((saint) => {
            const formattedDate = `${saint.tgl}, ${monthNames[saint.bulan]}`;
            // Display type only if it is "Santo", "Santa", "Beato", or "Beata"
            const typeDisplay = (saint.tipe === "Santo" || saint.tipe === "Santa" || saint.tipe === "Beato" || saint.tipe === "Beata") 
                ? `<p class="type">${saint.tipe}</p>` 
                : "";
            
            return `
                <div class="card" data-name="${saint.nama.toLowerCase()}">
                    ${typeDisplay}
                    <h3 class="title">${saint.nama}</h3>
                    <p class="date"><strong>Tanggal:</strong> ${formattedDate}</p>
                    <p class="content">${saint.riwayat}</p>
                </div>
            `;
        })
        .join("");

    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <title>Orang Kudus</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #121212; color: #e0e0e0; padding: 20px; }
            h1 { color: #ffffff; text-align: center; margin-bottom: 20px; }

            /* Search Container Styling */
            .search-container {
                display: flex;
                justify-content: center;
                margin-bottom: 20px;
            }
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
            #searchInput:focus {
                background-color: #333;
            }

            /* Container and Card Styling */
            .container { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
                gap: 20px; 
                max-width: 1200px; 
                margin: auto; 
            }
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
            .title {
                font-size: 1.2em;
                font-weight: bold;
                color: #bb86fc;
                margin-bottom: 10px;
            }
            .type {
                font-size: 1.1em;
                font-weight: bold;
                color: #ffdd57;
                margin-bottom: 5px;
            }
            .date {
                font-size: 0.9em;
                color: #bbbbbb;
                margin-bottom: 8px;
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
        <h1>Orang Kudus</h1>
        <div class="search-container">
            <input type="text" id="searchInput" placeholder="Cari orang kudus..."/>
        </div>
        <div class="container" id="saintContainer">${saintCards}</div>

        <script>
            const searchInput = document.getElementById('searchInput');
            
            // Add event listener for the search input
            searchInput.addEventListener('input', function() {
                const filter = searchInput.value.toLowerCase();
                const cards = document.querySelectorAll('.card');

                // Show or hide saints based on the search input
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

module.exports = { showSaints };
