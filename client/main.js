const { app, BrowserWindow, globalShortcut, dialog } = require('electron')
const os = require('os');
const fs = require('fs');


function loadConfig(){
  let path = "config.json"
  try {
    const json = JSON.parse(fs.readFileSync(path));
	
	return json;
  } catch (err) {
    console.log(err)
  }
  return false;
}

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    frame: false,
    autoHideMenuBar: true,
    kiosk: true,
    webPreferences: {
      nodeIntegration: true
    }
  })
  
  // remove x-frame-options
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: Object.fromEntries(Object.entries(details.responseHeaders).filter(header => !/x-frame-options/i.test(header[0]))) });
  });
  
  let error = false;

  let config = loadConfig();
  if(config !== false){
    if(!("url" in config)){
      error = "URL not defined!";
    }
    if(!("uid" in config)){
      error = "UID not defined!";
	}
  }else{
    error = "Config could not be loaded!";
  }

  if(error !== false){
    dialog.showErrorBox("Error", error);
    app.quit();
  }else{
	if("debug" in config && config["debug"] === true){
      win.webContents.openDevTools()
    }
    const url = config["url"];
    const computerName = os.hostname()	  
    const uid = config["uid"];
    win.loadURL(`${url}?hostname=${computerName}&uid=${uid}`);  
  }

  globalShortcut.register('Escape', () => {
    app.quit();
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})