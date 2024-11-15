const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

/**
 * Displays the Bible view in a new webview panel.
 * Shows skeleton loading while loading Bible data, retrieves unique book names, and generates the HTML view.
 * @param {object} context - The extension context for accessing resources.
 */
async function showBible(context) {
    const panel = vscode.window.createWebviewPanel(
        "bible",
        "Alkitab",
        vscode.ViewColumn.One, {
            enableScripts: true
        }
    );

    // Display skeleton loading HTML while Bible data is loading
    panel.webview.html = generateSkeletonLoadingHTML();

    const bibleData = loadBibleData(context);
    if (!bibleData) return;

    const uniqueBooks = getUniqueBooks(bibleData);
    panel.webview.html = generateBibleHTML(bibleData, uniqueBooks);
}

/**
 * Loads Bible data from the "kitab.json" file in the extension's resources folder.
 * Parses the data and returns it as a JSON object.
 * @param {object} context - The extension context for accessing resources.
 * @returns {Array} - Array of Bible data or null if loading fails.
 */
function loadBibleData(context) {
    const biblePath = path.join(context.extensionPath, "resources", "kitab.json");
    try {
        const data = fs.readFileSync(biblePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        vscode.window.showErrorMessage("Gagal memuat data Alkitab.");
        console.error("Error loading Bible data:", error);
        return null;
    }
}

/**
 * Extracts unique book names from the Bible data and returns them in sorted order.
 * @param {Array} bibleData - The array of Bible data.
 * @returns {Array} - Array of unique book names.
 */
function getUniqueBooks(bibleData) {
    return [...new Set(bibleData.map(verse => verse.namaPanjang))].sort();
}

/**
 * Generates the HTML content for the Bible webview.
 * Includes dropdown filters and the container for displaying verses.
 * @param {Array} bibleData - Array of Bible data.
 * @param {Array} uniqueBooks - Array of unique book names.
 * @returns {string} - The generated HTML content.
 */
function generateBibleHTML(bibleData, uniqueBooks) {
    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <title>Alkitab</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <style>${generateStyles()}</style>
    </head>
    <body>
        <h1>Alkitab</h1>
        ${generateFilterContainer(uniqueBooks)}
        <div class="container" id="bibleContainer"></div>
        <div id="copyToast" class="toast">Teks berhasil disalin</div>
        <script>${generateScript(bibleData)}</script>
    </body>
    </html>`;
}

/**
 * Generates the CSS styles for the Bible webview.
 * Styles include layout, card appearance, dropdowns, and toast notifications.
 * @returns {string} - The CSS styles as a string.
 */
function generateStyles() {
    return `
        body { font-family: Arial, sans-serif; background-color: #121212; color: #e0e0e0; padding: 20px; margin: 0; }
        h1 { color: #ffffff; text-align: center; margin-bottom: 20px; font-size: 2em; }
        
        .filter-container {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }
        
        select {
            padding: 10px;
            font-size: 1em;
            border-radius: 5px;
            border: 1px solid #333;
            background-color: #1f1f1f;
            color: #ffffff;
            min-width: 150px;
            max-width: 200px;
            width: 100%;
            box-sizing: border-box;
        }

        .container {
            display: flex;
            flex-direction: column;
            gap: 20px;
            max-width: 830px;
            width: 100%;
            margin: auto;
            padding: 0 10px;
        }

        .card {
            background-color: #1f1f1f;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
            width: 100%;
            box-sizing: border-box;
        }

        .verse-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .title { font-size: 1.1em; font-weight: bold; color: #bb86fc; flex-grow: 1; }
        .content { font-size: 1em; color: #fca311; line-height: 1.6; margin-top: 10px; }

        .copy-button {
            background: none;
            border: none;
            color: #61dafb;
            font-size: 1.2em;
            cursor: pointer;
            transition: color 0.2s;
        }
        .copy-button:hover { color: #bb86fc; }

        .toast {
            visibility: hidden;
            min-width: 200px;
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
            transform: translateX(-50%);
            transition: opacity 0.5s, visibility 0.5s;
        }
        .toast.show { visibility: visible; opacity: 1; }
    `;
}

/**
 * Generates skeleton loading HTML content.
 * Displays animated skeleton cards to indicate loading.
 * @returns {string} - HTML content with skeleton loading effect.
 */
function generateSkeletonLoadingHTML() {
    const skeletonCard = `
        <div class="card skeleton">
            <div class="skeleton-title"></div>
            <div class="skeleton-content"></div>
            <div class="skeleton-content short"></div>
        </div>
    `;
    const skeletonCards = Array(5).fill(skeletonCard).join("");
    return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <title>Loading Alkitab</title>
        <style>
            ${generateStyles()}
            .skeleton {
                position: relative;
                overflow: hidden;
                background-color: #1f1f1f;
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
            .skeleton-title, .skeleton-content {
                background-color: #333;
                border-radius: 4px;
                margin: 10px 0;
            }
            .skeleton-title {
                width: 50%;
                height: 20px;
                margin-bottom: 15px;
            }
            .skeleton-content {
                width: 100%;
                height: 16px;
            }
            .skeleton-content.short {
                width: 70%;
            }
        </style>
    </head>
    <body>
        <h1>Memuat Alkitab...</h1>
        <div class="container">${skeletonCards}</div>
    </body>
    </html>`;
}

/**
 * Generates the filter container with dropdowns for book, chapter, start verse, and end verse.
 * @param {Array} uniqueBooks - Array of unique book names.
 * @returns {string} - HTML content for the filter container.
 */
function generateFilterContainer(uniqueBooks) {
    return `
        <div class="filter-container">
            <select id="bookSelect">
                <option value="">Pilih Kitab</option>
                ${uniqueBooks.map(book => `<option value="${book}">${book}</option>`).join("")}
            </select>
            <select id="chapterSelect" disabled><option value="">Bab</option></select>
            <select id="startVerseSelect" disabled><option value="">Ayat Mulai</option></select>
            <select id="endVerseSelect" disabled><option value="">Ayat Akhir</option></select>
        </div>`;
}

/**
 * Generates the JavaScript code for the Bible webview.
 * Includes functions for handling dropdown selections, filtering, and displaying verses.
 * @param {Array} bibleData - Array of Bible data.
 * @returns {string} - JavaScript code as a string.
 */
function generateScript(bibleData) {
    return `
        const bibleData = ${JSON.stringify(bibleData)};
        const bookSelect = document.getElementById("bookSelect");
        const chapterSelect = document.getElementById("chapterSelect");
        const startVerseSelect = document.getElementById("startVerseSelect");
        const endVerseSelect = document.getElementById("endVerseSelect");
        const bibleContainer = document.getElementById("bibleContainer");

        bookSelect.addEventListener("change", populateChapters);
        chapterSelect.addEventListener("change", populateVerses);
        startVerseSelect.addEventListener("change", setEndVerseOptions);
        endVerseSelect.addEventListener("change", filterVerses);

        function populateChapters() {
            const selectedBook = bookSelect.value;
            resetSelect(chapterSelect, 'Bab');
            resetVerseOptions();

            if (!selectedBook) return;

            const chapters = [...new Set(bibleData.filter(verse => verse.namaPanjang === selectedBook).map(verse => verse.bab))];
            chapters.sort((a, b) => a - b);

            chapters.forEach(chapter => {
                const option = document.createElement("option");
                option.value = chapter;
                option.textContent = chapter;
                chapterSelect.appendChild(option);
            });

            chapterSelect.disabled = false;
        }

        function populateVerses() {
            const selectedBook = bookSelect.value;
            const selectedChapter = parseInt(chapterSelect.value);
            resetSelect(startVerseSelect, 'Ayat Mulai');
            resetSelect(endVerseSelect, 'Ayat Akhir');

            if (!selectedBook || !selectedChapter) return;

            const verses = bibleData
                .filter(verse => verse.namaPanjang === selectedBook && verse.bab === selectedChapter)
                .map(verse => verse.ayat);

            verses.forEach(verse => {
                const option = document.createElement("option");
                option.value = verse;
                option.textContent = verse;
                startVerseSelect.appendChild(option);
            });

            startVerseSelect.disabled = false;
        }

        function setEndVerseOptions() {
            const selectedBook = bookSelect.value;
            const selectedChapter = parseInt(chapterSelect.value);
            const startVerse = parseInt(startVerseSelect.value);
            resetSelect(endVerseSelect, 'Ayat Akhir');

            if (!selectedBook || !selectedChapter || !startVerse) return;

            const verses = bibleData
                .filter(verse => verse.namaPanjang === selectedBook && verse.bab === selectedChapter && verse.ayat >= startVerse)
                .map(verse => verse.ayat);

            verses.forEach(verse => {
                const option = document.createElement("option");
                option.value = verse;
                option.textContent = verse;
                endVerseSelect.appendChild(option);
            });

            endVerseSelect.disabled = false;
        }

        function filterVerses() {
            const selectedBook = bookSelect.value;
            const selectedChapter = chapterSelect.value ? parseInt(chapterSelect.value) : null;
            const startVerse = startVerseSelect.value ? parseInt(startVerseSelect.value) : null;
            const endVerse = endVerseSelect.value ? parseInt(endVerseSelect.value) : startVerse;

            const filteredVerses = bibleData.filter(verse => {
                const bookMatch = !selectedBook || verse.namaPanjang === selectedBook;
                const chapterMatch = !selectedChapter || verse.bab === selectedChapter;
                const verseRangeMatch = !startVerse || (verse.ayat >= startVerse && verse.ayat <= endVerse);

                return bookMatch && chapterMatch && verseRangeMatch;
            });

            displayVerses(filteredVerses.length > 0 ? filteredVerses : [{ namaPanjang: "", bab: "", ayat: "", firman: "Tidak ada hasil ditemukan." }]);
        }

        function resetSelect(select, defaultOption) {
            select.innerHTML = '<option value="">' + defaultOption + '</option>';
            select.disabled = true;
        }

        function resetVerseOptions() {
            resetSelect(startVerseSelect, 'Ayat Mulai');
            resetSelect(endVerseSelect, 'Ayat Akhir');
        }

        function displayVerses(verses) {
            bibleContainer.innerHTML = verses.length
                ? verses.map(verse => createCard(verse)).join("")
                : "<p>Tidak ada hasil ditemukan.</p>";

            document.querySelectorAll('.copy-button').forEach(button => {
                button.addEventListener('click', copyToClipboard);
            });
        }

        function createCard(verse) {
            return (
                '<div class="card">' +
                    '<div class="verse-container">' +
                        '<div class="title">' + verse.namaPanjang + ' ' + verse.bab + ':' + verse.ayat + ' - ' + (verse.judul || "") + '</div>' +
                        '<button class="copy-button" data-text="' + verse.firman + '" title="Copy"><i class="fas fa-copy"></i></button>' +
                    '</div>' +
                    '<p class="content">' + verse.firman + '</p>' +
                '</div>'
            );
        }

        function copyToClipboard(event) {
            const text = event.target.getAttribute('data-text');
            navigator.clipboard.writeText(text).then(showToast).catch(console.error);
        }

        function showToast() {
            const toast = document.getElementById("copyToast");
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 3000);
        }

        filterVerses();
    `;
}

module.exports = {
    showBible
};
