// Modules to control application life and create native browser window
const {app, BrowserWindow, Notification, Tray, nativeImage, Menu} = require('electron')
const path = require('path')

const imageTracking = "src/img/visible-eye.png";
const imageNoTracking = "src/img/no-tracking.png";


async function  doOnReady () {
  const tray = new Tray(imageTracking);

//  tray.setContextMenu(contextMenu);
//  tray.setToolTip('This is my application');

  const showScreen = true;

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    show : showScreen,
    webPreferences: {
    //  preload: path.join(__dirname, 'preload.js')
      //offscreen: true,
      pageVisibility: true,
      backgroundThrottling: false,
      nodeIntegration : true,
      nodeIntegrationInSubFrames : true
    }
  });

  let popupWindow = new BrowserWindow({show : showScreen,  frame : false});
  popupWindow.maximize();
  popupWindow.loadFile('src/popup.html');

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if(message.indexOf("EVENT.") >= 0){
      if(message === "EVENT.FACE_TRACKING_ENABLED"){
        tray.setImage(imageTracking);
      } else if(message === "EVENT.FACE_TRACKING_DISABLED"){
        tray.setImage(imageNoTracking);
      }


      if(message === "EVENT.BLINK_WARNING_CLOSE"){
        console.log("BLINK_CLOSE");
        popupWindow.hide();
        popupWindow.hide();
      } else if(message === "EVENT.BLINK_WARNING_OPEN"){
        console.log("BLINK_OPEN");
        popupWindow.show();
      }
    }
      });

  /*
  let myNotification = undefined;

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if(message === "BLINK_WARNING_CLOSE" && myNotification){
      console.log("BLINK_CLOSE");
      myNotification.close();
    } else if(message === "BLINK_WARNING_OPEN"){
      console.log("BLINK_OPEN");
      myNotification = new Notification('Blink', {
        title : "Blink Now",
        body: 'Blink Esa',
        timeoutType : 'never',
        silent : false,
        urgency : "critical"
      });
      myNotification.show();
    }
  });
   */
  // and load the index.html of the app.
  mainWindow.loadFile('src/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  doOnReady()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) doOnReady()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
