const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const main_menu = require('./src/menu');
const { readTable, addTable, updateTable, deleteTable, filterTable, updateUserPass } = require('./src/datamodel');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { jsPDF } = require("jspdf");
const { autoTable } = require('jspdf-autotable');
const { print } = require("pdf-to-printer");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { autoUpdater, AppUpdater } = require("electron-updater");
const ProgressBar = require('electron-progressbar');
const Store = require('electron-store');
const store = new Store();
let mainWindow, winMenu, progressBar = null;
let outputObj = {};

//Basic flags
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('update-available', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Update', 'Later'],
        noLink: true,
        title: 'Application Update',
        message: 'A new version of the application is available.',
        detail: 'The app will be restarted to install the update.'
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.downloadUpdate();
    });
});

autoUpdater.on('download-progress', (progress) => {
    if (!progressBar) {
        progressBar = new ProgressBar({
            title: 'Downloading update',
            text: 'Downloading update...',
            browserWindow: {
                parent: mainWindow,
                modal: true,
                resizable: false,
                minimizable: false,
                maximizable: false
            }
        });
    } else {
        progressBar.detail = `Downloading complete ${(progress.percent).toFixed()}%`;
        progressBar.value = (progress.percent).toFixed() / 100;
    }
});

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        noLink: true,
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
});

autoUpdater.on('error', (error) => {
    dialog.showErrorBox('Error', error.message);
});

//////////////////////////////////////////////////////////////////////////////////

function checkPort() {
    return new Promise((resolve) => {
        SerialPort.list().then((ports) => {
            resolve(ports);
        });
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 780,
        minWidth: 1200,
        minHeight: 780,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        Menu.setApplicationMenu(null);

        [winMenu] = new main_menu(mainWindow);
        // mainWindow.openDevTools();

        // checkPort().then((ports) => {
        //     console.log(ports.length);
        // })
    });

    try {
        const storedPort = store.get('port');
        const port = new SerialPort({
            path: storedPort || "COM6",
            baudRate: 9600,
        }, false);

        const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
    
        parser.on('data', function (data) {
            // console.log(data);
            // Split the data string into key and value
            let [key, ...valueArr] = data.split(' ');
            let value = valueArr.join(' ').replace(/\s+/g, '').trim(); // remove additional white spaces
        
            key = key.replace('/', '');  // remove '/' from keys
        
            // Add the key-value pair to the output object
            outputObj[key] = value;
        
            // Check if this is the last line of data
            if (key === 'SN') { // update condition according to key modification
                console.log('Final Data:', outputObj.G);
                mainWindow.webContents.send('Serial', outputObj.G);
            }
        });
        
        port.on('error', function(err) {
            console.log('Parser Error: ', err.message);
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Error',
                message: err.message,
                alwaysOnTop: true
            });
        });
    } catch (error) {
        console.log("Catch Error", error.message);
    }

    mainWindow.loadFile(path.join(__dirname, '/template/index.html'));
    mainWindow.webContents.send('version', app.getVersion());
};


app.whenReady().then(() => {
    createWindow();
    autoUpdater.checkForUpdates();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

//////////////////////////////////////////////////////////////////////////////////

ipcMain.handle('login', (event, obj) => {
    const { username, password } = obj;

    if (username == '' || password == '') {

    }
    else {
        console.log(username, password);
        const menu = Menu.buildFromTemplate(winMenu);
        Menu.setApplicationMenu(menu);
        mainWindow.webContents.send('state', "sub11");
    };
});

ipcMain.handle('error', (event, err) => {
    console.log(err);
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Error',
        message: err,
        alwaysOnTop: true
    });
});

ipcMain.handle('reqDetails', async () => {
    let data = await readTable('Details');
    mainWindow.webContents.send('resDetails', data);
});

ipcMain.handle('saveCrtlist', (event, obj) => {
    addTable("Details", obj)
});

ipcMain.handle('updateCrtlist', (event, obj) => {
    updateTable("Details", obj)
});

ipcMain.handle('deleteCrtlist', (event, obj) => {
    deleteTable("Details", obj)
});

ipcMain.handle('addPending', (event, obj) => {
    addTable("Pending", obj)
});

ipcMain.handle('reqPending', async () => {
    let data = await readTable('Pending');
    mainWindow.webContents.send('resPending', data);
});

ipcMain.handle('updatePending', (event, obj) => {
    updateTable("Pending", obj)
});

ipcMain.handle('confdeletePending', async (event, obj) => {
    const result = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to delete this record?'
    });

    // The index of the button that was clicked will be returned (0 for 'Yes', 1 for 'No')
    if (result.response === 0) {
        // Send message back to renderer process
        mainWindow.webContents.send('confdeletePending');
    }
});

ipcMain.handle('deletePending', (event, obj) => {
    deleteTable("Pending", obj.PLATE_NO)
});

ipcMain.handle('reqDownload', async () => {
    let data = await readTable('Download');
    mainWindow.webContents.send('resDownload', data);
});

ipcMain.handle('filterDownload', async (event, obj) => {
    console.log(obj);
    let data = await filterTable('Download', obj);
    console.log(data);
    mainWindow.webContents.send('resDownload', data);
});

ipcMain.handle('reqPrint', (event, obj) => {
    console.log(obj);

    try {
        let name = "Shan PVT Ltd.";
        let address = "Central province, kandalama, Dambulla";
        let phoneNumber = "070 448 6677";
        let wbnumber = 1;

        // Create a new instance of jsPDF
        let doc = new jsPDF('landscape', 'pt', 'letter');

        // Header
        doc.setFontSize(24);
        doc.text(name, 50, 80); // Name as Title

        // Body Part 1
        doc.setFontSize(18);
        doc.text(address, 50, 110); // Address

        let headers = ["", "", ""];
        let data = [
            [phoneNumber, "", `WB Number: ${wbnumber}`], // Body Part 2 - With Phone Number and Name2: Name
        ];

        // Body Part 3
        // doc.setFontSize(18);
        doc.autoTable({
            margin: { left: 50 },
            startY: 94,
            head: [headers],
            body: data,
            theme: 'plain',
            styles: { fontSize: 18 },
            columnStyles: {
                0: { cellWidth: 430 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 'wrap' },
            },
        });

        // Body Part 4 - Topics
        data = [
            [`DRIVER: ${obj.DRIVER}`, `PLATE NO: ${obj.PLATE_NO}`, `TICKET NO: ${obj.TICKET_NO}`],
            [`CUSTOMER: ${obj.CUSTOMER}`, ``, `SUPPLIER: ${obj.SUPPLIER}`],
            [`TRANSPOTER: ${obj.TRANSPOTER}`, ``, `PRODUCT: ${obj.PRODUCT}`],
            [`PRICE Per/Kg: ${1}`, ``, `TOTAL PRICE: ${100}`],
            [`DATE IN: ${obj.INDATE}`, `DATE OUT: ${obj.OUTDATE}`, `NOTE: ${obj.NOTE}`],
            [`1st WEIGHT: ${obj.WEIGHT1}`, `2nd WEIGHT: ${obj.WEIGHT2}`, `NET WEIGHT: ${obj.NETWEIGHT}`],
        ];

        doc.autoTable({
            margin: { left: 50 },
            startY: 150,
            head: [headers],
            body: data,
            theme: 'plain',
            styles: { fontSize: 16, minCellHeight: 45 },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 'auto' },
            },
        });

        data = [
            [`______________`, `______________`, `______________`],
            [`Weighbridge Operator`, `Driver/Supplier/Customer`, `Checked By`],
        ];

        doc.autoTable({
            margin: { left: 50 },
            startY: 450,
            head: [headers],
            body: data,
            theme: 'plain',
            styles: { fontSize: 18 },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 'auto' },
            },
        });

        // Save the PDF
        doc.save("./pdf/output.pdf");

        // print the document to the default printer
        print("./pdf/output.pdf", { win32: ['-print-settings "fit"'] })
            .then(async () => {
                await addTable("Download", obj);
                await deleteTable("Pending", obj.PLATE_NO);
                const options = {
                    type: "info",
                    buttons: ['OK'],
                    title: "Print Done!",
                    message: "Print page done",
                    alwaysOnTop: true
                };

                dialog.showMessageBox(mainWindow, options).then(async (response) => {
                    if (response.response === 0) { // OK button index
                        let data = await readTable('Pending');
                        mainWindow.webContents.send('resPending', data);
                    }
                });
            })
            .catch((error) => {
                const options = {
                    type: "error",
                    buttons: ['OK'],
                    title: "Print Error!",
                    message: error.message,
                    alwaysOnTop: true
                };
                dialog.showMessageBox(mainWindow, options);
            });
    } catch (error) {
        console.error(`Error generating PDF: ${error}`);
        const options = {
            type: "error",
            buttons: ['OK'],
            title: "Error generating PDF!",
            message: error.message,
            alwaysOnTop: true
        };
        dialog.showMessageBox(mainWindow, options);
    }
});

function writeCsv(data, filename) {
    // Define the headers for the CSV
    const headers = Object.keys(data[0]).map(key => ({ id: key, title: key }));

    const csvWriter = createCsvWriter({
        path: filename,
        header: headers
    });

    csvWriter
        .writeRecords(data)
        .then(() => console.log('The CSV file was written successfully'));
}

ipcMain.handle('reqCSV', async (event, obj) => {
    // Opens a dialog box for the user to select where to save the file
    const { filePath } = await dialog.showSaveDialog({
        title: "Save data as CSV",
        defaultPath: "output.csv",
        filters: [
            { name: 'CSV Files', extensions: ['csv'] }
        ]
    });

    if (!filePath) {
        console.log('File save was cancelled');
        return;
    }

    writeCsv(obj, filePath);
});

ipcMain.handle('changePass', (event, obj) => {
    const { curUsername, curPassword, newPassword, rePassword } = obj;

    readTable("Users").then((data) => {
        return data;
    }).then((data) => {
        data.forEach(async (cred) => {
            if (cred.User_Name == curUsername && cred.User_Password == curPassword) {
                if (newPassword == rePassword) {
                    updateUserPass({ curUsername, newPassword })
                        .then((error) => {
                            if (error) showErr(error);
                        }).then(async () => {
                            Menu.setApplicationMenu(null);
                            mainWindow.webContents.send('state', "sub51");
                            const options = {
                                type: 'info',
                                buttons: ['OK'],
                                title: 'Success!',
                                message: 'Password Changed!',
                                message: 'Please login again.',
                                alwaysOnTop: true,
                                noLink: true
                            };
                            dialog.showMessageBox(mainWindow, options);
                        })
                } else {
                    dialog.showMessageBox(mainWindow, {
                        type: 'info',
                        title: 'Error',
                        message: 'Password does not match!',
                        alwaysOnTop: true
                    });
                }
            }
            else {
                // dialog.showErrorBox('Error', "Invalid Username or Password!");
                dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: 'Error',
                    message: 'Invalid Username or Password!',
                    alwaysOnTop: true
                });
            }
        });
    });
});

ipcMain.handle('relaunch', (event, obj) => {
    if (obj != '') {
        store.set('port', obj);
    }
    app.relaunch();
    app.quit(0);
});

ipcMain.handle('reqPorts', (event, obj) => {
    checkPort().then((ports) => {
        console.log(ports);
        mainWindow.webContents.send('resPorts', ports);
    })
});

