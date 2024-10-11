const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const csv = require('csv-parser');
const XLSX = require('xlsx');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, // Enable context isolation
            nodeIntegration: false, // Keep node integration disabled
        },
    });

    win.loadFile('index.html');

    ipcMain.handle('select-file', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            filters: [{ name: 'CSV files', extensions: ['csv'] }],
            properties: ['openFile'],
        });
        if (!canceled) {
            return filePaths[0]; // Return the file path to renderer
        }
    });

    ipcMain.handle('process-csv', async (event, filePath) => {
        const results = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', (error) => reject(error));
        });
    });

    ipcMain.handle('export-xlsx', async (event, tableData) => {
        const downloadsPath = path.join(os.homedir(), 'Downloads'); // Default to the Downloads folder
        const outputPath = path.join(downloadsPath, 'output.xlsx'); // Name of the file

        const worksheet = XLSX.utils.json_to_sheet(tableData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        XLSX.writeFile(workbook, outputPath); // Save file to Downloads

        return `File saved to: ${outputPath}`;
    });
}

app.whenReady().then(createWindow);
