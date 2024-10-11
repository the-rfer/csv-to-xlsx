const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectFile: () => ipcRenderer.invoke('select-file'),
    processCSV: (filePath) => ipcRenderer.invoke('process-csv', filePath),
    exportXlsx: (tableData) => ipcRenderer.invoke('export-xlsx', tableData),
    openExternal: (url) => shell.openExternal(url),
});
