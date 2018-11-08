const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const mdns = require('mdns');
const path = require('path');

let mainWindow
let splash

app.on('ready', () => {
  mainWindow = new BrowserWindow({
      titleBarStyle: 'hidden',
      width: 1920,
      height: 1080,
      show: false,
      webPreferences: {
          nodeIntegration: false,
      },
      icon: path.join(__dirname, 'assets/icons/volumio-icon.png')
  });
  splash = new BrowserWindow({width: 800, height: 400, transparent: true, frame: false, alwaysOnTop: true, icon: path.join(__dirname, 'assets/icons/volumio-icon.png')});
  mainWindow.setMenu(null);
  splash.loadURL(`file://${__dirname}/assets/splash.html`);
  startMDNSBrowser();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

function startMDNSBrowser(){
    var found = false;
    const mdnsBrowser = mdns.createBrowser(mdns.tcp('Volumio'));
    mdnsBrowser.start();
    mdnsBrowser.on('serviceUp', function(service) {
        for (var i in service.addresses) {
            if (service.addresses[i].length < 20) {
                var endpoint = 'http://' + service.addresses[i] + '/';
                found = true;
                mainWindow.loadURL(endpoint);
                splash.destroy();
                mainWindow.show();
            }
        }
    });

    mdnsBrowser.on('error', function(err) {
        //console.log(err);
    });

    setTimeout(()=>{
        console.log('timeout')
        if (!found) {
            console.log('Device not found, sending to myvolumio');
            mainWindow.loadURL('https://myvolumio.org');
            splash.destroy();
            mainWindow.show();
        }
    }, 3000);
}