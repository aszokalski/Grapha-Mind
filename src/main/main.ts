/**
 * Entry point of the Election app.
 */
import { app, BrowserWindow, Menu, ipcRenderer } from 'electron';
import * as path from 'path';
import * as url from 'url';

let mainWindow: Electron.BrowserWindow | null;

function createWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 800,
        width: 1200,
        titleBarStyle: 'hidden',
        webPreferences: {
            webSecurity: false,
            devTools: process.env.NODE_ENV === 'production' ? false : true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, './index.html'),
            protocol: 'file:',
            slashes: true
        })
    );

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        if(mainWindow){
            mainWindow.webContents.send('close');
        }
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

  
function createMenu() {
    const template: Electron.MenuItemConstructorOptions[] = [(true)?{
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }:{},
        {label: 'File',
    submenu: [
        { label: 'New Project',
        click: () => {
            if(mainWindow){
                mainWindow.webContents.send('new-project');
            }
         },
        // click(){
        //     const event = new Event('newproject');
        //     document.dispatchEvent(event);
        // }
        accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N', 
    },
        { type: 'separator' },
        { label: 'Open',
        click: () => {
            if(mainWindow){
                mainWindow.webContents.send('open');
            }
         },
        accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O', },
        { type: 'separator' },
        { label: 'Save',
        click: () => {
            if(mainWindow){
                mainWindow.webContents.send('save');
            }
         },
        accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S', },
        { label: 'Save as',
        click: () => {
            if(mainWindow){
                mainWindow.webContents.send('save-as');
            }
         },
        accelerator: process.platform === 'darwin' ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',},
        { type: 'separator' },
        { label: 'Share',
        click: () => {
            if(mainWindow){
                mainWindow.webContents.send('share');
            }
         },
        accelerator: process.platform === 'darwin' ? 'Cmd+P' : 'Ctrl+P'
     },
    ]
},{
      label: 'Edit',
      submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'pasteandmatchstyle' },
          { role: 'delete' },
          { role: 'selectall' }
      ]
  },
  {
      label: 'View',
      submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools' },
          { type: 'separator' },
          { role: 'resetzoom' },
          { role: 'zoomin' },
          { role: 'zoomout' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
      ]
  },
  { role: 'window', submenu: [{ role: 'minimize' }, { role: 'close' }] },
  {
      role: 'help',
      submenu: [{
          label: 'Learn More',
          click() {
              require('electron').shell.openExternal('https://electron.atom.io');
          }
      }]
  }
  ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
    createWindow();
    createMenu();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});



// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
