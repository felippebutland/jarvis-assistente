const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,  // Permite integração com o Node.js
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

// Evento que cria a janela quando o Electron estiver pronto
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Fecha o app quando todas as janelas são fechadas (exceto no macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});