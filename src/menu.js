const { app, Menu, dialog } = require('electron');
const { autoUpdater } = require("electron-updater");

class main_menu {
    constructor(mainWindow){
        const winMenu = [
            {
                label: 'Home',
                click: function () {
                    mainWindow.webContents.send('state', "sub11");
                }
            },
            
            {
                label: 'Add New',
                click: function () {
                    mainWindow.webContents.send('state', "sub21");
                }
            },

            {
                label: 'Download',
                click: function () {
                    mainWindow.webContents.send('state', "sub31");
                }
            },
            {
                label: 'Setting',
                submenu: [
                    {
                        label: 'Change Password',
                        click: function () {
                            mainWindow.webContents.send('state', "sub41");
                        }
                    },
                    {
                        label: 'Change COM Port',
                        click: function () {
                            mainWindow.webContents.send('state', "sub42");
                        }
                    }
                ]
            },
            {
                label: 'Window',
                submenu: [
                    {
                        label: 'Relaod',
                        click: function () {
                            mainWindow.reload();
                            mainWindow.webContents.once('did-finish-load', () => {
                                mainWindow.webContents.send('version', app.getVersion());
                                mainWindow.webContents.send('state', 'sub11');
                            });
                        }
                    },
                    {
                        label: 'Update',
                        click: function () {
                            autoUpdater.checkForUpdates()
                        }
                    },
                    {
                        label: 'About',
                        click: function () {
                            mainWindow.webContents.send('state', "sub61");
                        }
                    },
                ]
            },
            // {
            //     label: 'Logout',
            //     click: function () {
            //         Menu.setApplicationMenu(null);
            //         mainWindow.webContents.send('state', "sub51");
            //     }
            // },
            {
                label: 'Logout',
                click: function () {
                    const options = {
                        type: 'question',
                        buttons: ['Yes', 'No'],
                        defaultId: 1,
                        title: 'Confirm',
                        message: 'Are you sure you want to logout?',
                    };
                    
                    let response = dialog.showMessageBoxSync(mainWindow, options);
                    if (response === 0) { // The 'Yes' button is clicked
                        Menu.setApplicationMenu(null);
                        mainWindow.webContents.send('state', "sub51");
                    }
                }
            },
            {
                label: 'Developer',
                submenu: [
                    { role: 'toggleDevTools' },
                ]
            },
        ];

        return [ winMenu ];
    }
}

module.exports = main_menu;