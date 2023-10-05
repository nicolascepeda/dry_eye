// Modules to control application life and create native browser window
const { app, BrowserWindow, Notification, Tray, nativeImage, Menu } = require('electron')
const path = require('path')

const imageTracking = "src/img/visible-eye.png";
const imageNoTracking = "src/img/no-tracking.png";
const imagePaused = "src/img/paused.png";

let tray, mainWindow;
let paused = false;
let debug = false;

function getContextMenu() {
  return Menu.buildFromTemplate([
    {
      label: paused ? "Resume" : "Pause", click: () => {
        paused = !paused;
        tray.setContextMenu(getContextMenu());
      }
    },
    { type: 'separator' },
    {
      label: "Debug Mode", type: 'checkbox', checked: debug, click: () => {
        debug = !debug;
        tray.setContextMenu(getContextMenu());
        if (debug) {
          mainWindow.show();
        } else {
          mainWindow.hide();
        }
      }
    },
    { label: 'Exit' , click : () => {
      console.log("quit");
      app.exit();
      //app.quit();
    }}
  ]);
}

async function doOnReady() {
  tray = new Tray(imageTracking);
  tray.setContextMenu(getContextMenu());

  // Create the browser window.
  mainWindow = new BrowserWindow({
    icon : imageTracking,
    show: debug,
    modal: true,
    frame: false,
    webPreferences: {
      pageVisibility: true,
      backgroundThrottling: false,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true
    }
  });

  let popupWindow = new BrowserWindow({ show: false, frame: false, modal :true, roundedCorners : false, icon : imageTracking,});
  popupWindow.maximize();
  popupWindow.loadFile('src/popup.html');

  let isTracking = {state : false};

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (message.indexOf("EVENT.") >= 0) {
      if (paused) {
        tray.setImage(imagePaused);
      } else {
        if (message === "EVENT.FACE_TRACKING_ENABLED" && !isTracking.state) {
          isTracking.state = true;
          tray.setImage(imageTracking);
          const notf = new Notification({title: "Tracking Enabled",body: "Tracking Enabled", silent : true, icon : imageTracking});
          notf.show()
          setTimeout(() => {
            notf.close()
          }, 1000)
        } else if (message === "EVENT.FACE_TRACKING_DISABLED" && isTracking.state) {
          isTracking.state = false;
          tray.setImage(imageNoTracking);
          const notf = new Notification({title: "Tracking Disabled",body: "Tracking Disabled", silent : true, icon : imageNoTracking});
          notf.show()
          setTimeout(() => {
            notf.close()
          }, 1000)
        }

        if (message === "EVENT.BLINK_WARNING_CLOSE") {
          console.log("BLINK_CLOSE");
          popupWindow.hide();
        } else if (message === "EVENT.BLINK_WARNING_OPEN_1") {
          //new Notification({ title: "Blink "}).show();
        } else if (message === "EVENT.BLINK_WARNING_OPEN_3") {
          console.log("BLINK_OPEN");
          popupWindow.show();
        }
      }
    }
  });

  mainWindow.loadFile('src/index.html')
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

  app.dock.hide()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
