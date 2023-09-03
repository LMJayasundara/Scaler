const { ipcRenderer } = require('electron');

var crtlist, crtForm, itmdes, pendingTbl, printData, downloadTbl, portsDrop = null;
let pendingTblselectedRow = null;  // variable to store the selected row
let selectedRow = null;  // variable to store the selected row

window.onload = function () {
    crtlist = document.getElementById("crtlist");
    crtForm = document.getElementById('crtForm');
    itmdes = document.getElementById("itmdes");
    pendingTbl = document.getElementById("pendingTbl");
    downloadTbl = document.getElementById("downloadTbl");
    portsDrop = document.getElementById("portsDrop");

    let btnSave = document.getElementById("btnSave");
    let btnUpdate = document.getElementById("btnUpdate");
    let btnDelete = document.getElementById("btnDelete");
    let btnClear = document.getElementById("btnClear");

    let home_btnAdd = document.getElementById("home_btnAdd");
    let home_btnClear = document.getElementById("home_btnClear");

    let pend_btnUpdate = document.getElementById("pend_btnUpdate");
    let pend_btnDelete = document.getElementById("pend_btnDelete");
    let pend_btnPrint = document.getElementById("pend_btnPrint");

    let down_btnFilter = document.getElementById("down_btnFilter");
    let down_btnDownload = document.getElementById("down_btnDownload");
    let down_btnClear = document.getElementById("down_btnClear");

    btnSave.onclick = renderAddProduct;
    btnUpdate.onclick = renderUpdateProduct;
    btnDelete.onclick = renderDeleteProduct;
    btnClear.onclick = renderClearProduct;

    home_btnAdd.onclick = addPending;
    home_btnClear.onclick = clearHome;
    pend_btnUpdate.onclick = pendUpdate;
    pend_btnDelete.onclick = pendDelete;
    pend_btnPrint.onclick = pendPrint;

    down_btnFilter.onclick = filterDown;
    down_btnDownload.onclick = downloadDown;
    down_btnClear.onclick = clearDown;

    ipcRenderer.invoke("reqPending");
    ipcRenderer.invoke("reqDetails");
};

const loginBtn = document.getElementById('loginBtn');
loginBtn.addEventListener('click', function (e) {
    e.preventDefault();
    var username = document.getElementById("InputName");
    var password = document.getElementById("InputPassword");
    const obj = { username: username.value, password: password.value };
    ipcRenderer.invoke("login", obj);
    username.value = '';
    password.value = '';
    console.log(obj);
});

const ADDW1 = document.getElementById('ADDW1');
ADDW1.addEventListener('click', function (e) {
    e.preventDefault();
    const serial = document.getElementById('serial').value;
    if(serial){
        document.getElementById('pend_WEIGHT1').value = serial;
    }
});

const ADDW2 = document.getElementById('ADDW2');
ADDW2.addEventListener('click', function (e) {
    e.preventDefault();
    const serial = document.getElementById('serial').value;
    if(serial){
        document.getElementById('pend_WEIGHT2').value = serial;
    }
});

async function filterDown(e) {
    e.preventDefault();
    var PLATENO = document.getElementById('down_PLATENO').value;
    var DRIVER = document.getElementById('down_DRIVER').value;
    var CUSTOMER = document.getElementById('down_CUSTOMER').value;
    var SUPPLIER = document.getElementById('down_SUPPLIER').value;
    var TRANSPOTER = document.getElementById('down_TRANSPOTER').value;
    var PRODUCT = document.getElementById('down_PRODUCT').value;
    var DATEIN = document.getElementById('down_DATEIN').value;
    var DATEOUT = document.getElementById('down_DATEOUT').value;

    const obj = {
        PLATE_NO: PLATENO,
        DRIVER: DRIVER,
        CUSTOMER: CUSTOMER,
        SUPPLIER: SUPPLIER,
        TRANSPOTER: TRANSPOTER,
        PRODUCT: PRODUCT,
        INDATE: DATEIN,
        OUTDATE: DATEOUT
    };

    console.log(obj);

    ipcRenderer.invoke("filterDownload", obj);
}

async function downloadDown(e) {
    e.preventDefault();

    const fetchdowntbl = document.getElementById('fetchdowntbl');
    let data = [];

    // We'll assume that the table header names exactly match the property names in your objects
    let headers = Array.from(fetchdowntbl.rows[0].cells).map(cell => cell.innerText);

    // Loop over each row, skipping the header
    for (let i = 1; i < fetchdowntbl.rows.length; i++) {
        let row = fetchdowntbl.rows[i];
        let rowData = {};

        // Loop over each cell in the row
        for (let j = 0; j < row.cells.length; j++) {
            let cell = row.cells[j];

            // Set the property name to be the corresponding header name and the value to be the cell text
            rowData[headers[j]] = cell.innerText;
        }

        // Only add rowData to data if it is not an empty object
        if (Object.keys(rowData).length > 0) {
            data.push(rowData);
        }
    }

    if(data.length > 0){
        await ipcRenderer.invoke('reqCSV', data);
    } else {
        await ipcRenderer.invoke('error', "No Data Available!");
    }
}

async function clearDown(e) {
    e.preventDefault();
    document.getElementById('crtFormDown').reset();
    await ipcRenderer.invoke("reqDownload");
}

async function pendPrint(e) {
    e.preventDefault();
    if(printData){
        const obj = {
            PLATE_NO: printData.cells[0].innerHTML,
            INDATE: printData.cells[1].innerHTML,
            OUTDATE: printData.cells[2].innerHTML,
            WEIGHT1: printData.cells[3].innerHTML,
            WEIGHT2: printData.cells[4].innerHTML,
            NETWEIGHT: printData.cells[5].innerHTML,
            DRIVER: printData.cells[6].innerHTML,
            CUSTOMER: printData.cells[7].innerHTML,
            SUPPLIER: printData.cells[8].innerHTML,
            TRANSPOTER: printData.cells[9].innerHTML,
            PRODUCT: printData.cells[10].innerHTML,
            TICKET_NO: printData.cells[11].innerHTML,
            NOTE: printData.cells[12].innerHTML
        };
        await ipcRenderer.invoke('reqPrint', obj);
        console.log(printData.cells[0].innerHTML);
    }
    else{
        await ipcRenderer.invoke('error', "Print Error!");
    }
};

async function addPending(e) {
    e.preventDefault();
    var PLATENO = document.getElementById('itmdes').value;
    var DRIVER = document.getElementById('home_DRIVER').value;
    var CUSTOMER = document.getElementById('home_CUSTOMER').value;
    var SUPPLIER = document.getElementById('home_SUPPLIER').value
    var TRANSPOTER = document.getElementById('home_TRANSPOTER').value
    var PRODUCT = document.getElementById('home_PRODUCT').value
    var TICKETNO = document.getElementById('home_TICKETNO').value
    var NOTE = document.getElementById('home_NOTE').value

    console.log(PLATENO);
    if (PLATENO != 'Choose...') {
        const obj = {
            PLATE_NO: PLATENO,
            DRIVER: DRIVER,
            CUSTOMER: CUSTOMER,
            SUPPLIER: SUPPLIER,
            TRANSPOTER: TRANSPOTER,
            PRODUCT: PRODUCT,
            TICKET_NO: TICKETNO,
            NOTE: NOTE
        };
        await ipcRenderer.invoke('addPending', obj);
        clearHome();
        ipcRenderer.invoke("reqPending");
    }
    else {
        await ipcRenderer.invoke('error', "PLATE NO is Required!");
    }
}

async function clearHome(e) {
    // e.preventDefault();
    document.getElementById('itmdes').value = "Choose...";
    // Get all elements with the 'clearable' class
    const elements = document.getElementsByClassName('clearable');
    // Loop over all elements and set their value to an empty string
    for (let i = 0; i < elements.length; i++) {
        elements[i].value = '';
    }
}

async function pendUpdate(e) {
    e.preventDefault();
    var PLATENO = document.getElementById('pend_PLATENO').value;
    var WEIGHT1 = parseFloat(document.getElementById('pend_WEIGHT1').value.replace("kg", ""));
    var WEIGHT2 = parseFloat(document.getElementById('pend_WEIGHT2').value.replace("kg", ""));
    var INDATE = document.getElementById('pend_INDATE').value
    var OUTDATE = document.getElementById('pend_OUTDATE').value

    if (PLATENO != '') {
        const obj = {
            PLATE_NO: PLATENO,
            INDATE: INDATE,
            OUTDATE: OUTDATE,
            WEIGHT1: WEIGHT1,
            WEIGHT2: WEIGHT2
        };
        // check if both weights are not empty then calculate NETWEIGHT
        if (WEIGHT1 != '' && WEIGHT2 != '') {
            obj.NETWEIGHT = parseFloat(WEIGHT1) + parseFloat(WEIGHT2);
        }
        await ipcRenderer.invoke('updatePending', obj);
        ipcRenderer.invoke("reqPending");
    }
    else {
        await ipcRenderer.invoke('error', "PLATE NO is Required!");
    }
}

async function pendDelete(e) {
    e.preventDefault();
    var PLATENO = document.getElementById('pend_PLATENO').value;
    if (PLATENO != '') {
        await ipcRenderer.invoke('confdeletePending');
    }
    else {
        await ipcRenderer.invoke('error', "PLATE NO is Required!");
    }
}

ipcRenderer.on('confdeletePending', async(event, results) => {
    var PLATENO = document.getElementById('pend_PLATENO').value;
    const obj = {
        PLATE_NO: PLATENO
    };
    await ipcRenderer.invoke('deletePending', obj);
    ipcRenderer.invoke("reqPending");
})

async function renderAddProduct(e) {
    e.preventDefault();
    var PLATENO = document.getElementById('addnew_PLATENO').value;
    var DRIVER = document.getElementById('addnew_DRIVER').value;
    var CUSTOMER = document.getElementById('addnew_CUSTOMER').value;
    var SUPPLIER = document.getElementById('addnew_SUPPLIER').value
    var TRANSPOTER = document.getElementById('addnew_TRANSPOTER').value
    var PRODUCT = document.getElementById('addnew_PRODUCT').value

    if (PLATENO != '') {
        const obj = {
            PLATE_NO: PLATENO,
            DRIVER: DRIVER,
            CUSTOMER: CUSTOMER,
            SUPPLIER: SUPPLIER,
            TRANSPOTER: TRANSPOTER,
            PRODUCT: PRODUCT
        };
        await ipcRenderer.invoke('saveCrtlist', obj);
        crtForm.reset();
        ipcRenderer.invoke("reqDetails");
    }
    else {
        await ipcRenderer.invoke('error', "PLATE NO is Required!");
    }
};

async function renderUpdateProduct(e) {
    e.preventDefault();
    var PLATENO = document.getElementById('addnew_PLATENO').value;
    if (PLATENO != '') {
        const obj = {
            PLATE_NO: document.getElementById('addnew_PLATENO').value,
            DRIVER: document.getElementById('addnew_DRIVER').value,
            CUSTOMER: document.getElementById('addnew_CUSTOMER').value,
            SUPPLIER: document.getElementById('addnew_SUPPLIER').value,
            TRANSPOTER: document.getElementById('addnew_TRANSPOTER').value,
            PRODUCT: document.getElementById('addnew_PRODUCT').value
        }
        await ipcRenderer.invoke('updateCrtlist', obj);
        crtForm.reset();
        ipcRenderer.invoke("reqDetails");
    } else {
        await ipcRenderer.invoke('error', "PLATE NO is Required!");
    }
};

async function renderDeleteProduct(e) {
    e.preventDefault();
    var PLATENO = document.getElementById('addnew_PLATENO').value;
    if (PLATENO != '') {
        const obj = {
            PLATE_NO: document.getElementById('addnew_PLATENO').value
        }
        await ipcRenderer.invoke('deleteCrtlist', obj);
        crtForm.reset();
        ipcRenderer.invoke("reqDetails");
    } else {
        await ipcRenderer.invoke('error', "PLATE NO is Required!");
    }
};

async function renderClearProduct() {
    crtForm.reset();
};

function hideall() {
    document.getElementById('login_container').style.display = 'none';
    document.getElementById('err_container').style.display = 'none';
    document.getElementById('home_container').style.display = 'none';
    document.getElementById('addnew_container').style.display = 'none';
    document.getElementById('download_container').style.display = 'none';
    document.getElementById('settings_container').style.display = 'none';
    document.getElementById('about_container').style.display = 'none';
};

ipcRenderer.on("state", (event, sts) => {
    if (sts == 'sub11') {
        hideall();
        ipcRenderer.invoke("reqPorts");
        document.body.style.background = "none";
        document.getElementById('home_container').style.display = 'block';
        
    }
    else if (sts == 'sub21') {
        hideall();
        ipcRenderer.invoke("reqDetails");
        document.body.style.background = "none";
        document.getElementById('addnew_container').style.display = 'block';
    }
    else if (sts == 'sub31') {
        hideall();
        ipcRenderer.invoke("reqDownload");
        document.body.style.background = "none";
        document.getElementById('download_container').style.display = 'block';
    }
    else if (sts == 'sub41') {
        hideall();
        document.body.style.background = "none";
        document.getElementById('settings_container').style.display = 'block';
    }
    else if (sts == 'sub42') {
        hideall();
        ipcRenderer.invoke("reqPorts");
        document.body.style.background = "none";
        document.getElementById('err_container').style.display = 'block';
    }
    else if (sts == 'sub51') {
        hideall();
        document.body.style.background = null;
        document.getElementById('login_container').style.display = 'block';
    }
    else if (sts == 'sub61') {
        hideall();
        document.body.style.background = "none";
        document.getElementById('about_container').style.display = 'block';
    }
    // pendingTblselectedRow.style.backgroundColor = '';
    // selectedRow.style.backgroundColor = '';
});

ipcRenderer.on('version', (event, results) => {
    document.getElementById('Vno').innerHTML = results;
});

ipcRenderer.on('Serial', (event, results) => {
    document.getElementById('serial').value = results;
    console.log("xxxxxxxx", results);
});

ipcRenderer.on('resDetails', (event, results) => {
    let crtlisttbl = "";
    let itmdesdrop = '';
    const list = results;
    list.forEach(element => {
        crtlisttbl += `
            <tr>
            <tr>
                <td class="no-wrap">${element.PLATE_NO}</td>
                <td class="no-wrap">${element.DRIVER}</td>
                <td class="no-wrap">${element.CUSTOMER}</td>
                <td class="no-wrap">${element.SUPPLIER}</td>
                <td class="no-wrap">${element.TRANSPOTER}</td>
                <td class="no-wrap">${element.PRODUCT}</td>
            </tr>
            </tr>
        `;
        itmdesdrop += `
            <option>${element.PLATE_NO}</option>
        `;
    });

    crtlist.innerHTML = crtlisttbl;
    itmdes.innerHTML = `<option selected>Choose...</option>` + itmdesdrop;

    var fetchdrop = document.getElementById("fetchdrop");
    fetchdrop.addEventListener('click', function () {
        var text = itmdes.options[itmdes.selectedIndex].text;
        const findls = list.find(file => (file.PLATE_NO === text));
        if (findls) {
            document.getElementById('home_DRIVER').value = findls.DRIVER;
            document.getElementById('home_CUSTOMER').value = findls.CUSTOMER;
            document.getElementById('home_SUPPLIER').value = findls.SUPPLIER;
            document.getElementById('home_TRANSPOTER').value = findls.TRANSPOTER;
            document.getElementById('home_PRODUCT').value = findls.PRODUCT;
        };
    });
});

const fetchtbl = document.getElementById("fetchtbl");
fetchtbl.addEventListener('click', event => {
    let targetElement = event.target;
    while (targetElement && targetElement.tagName !== 'TR') {
        targetElement = targetElement.parentNode;
    }
    if (targetElement && targetElement.parentNode.tagName === 'TBODY') {
        // if there is a previously selected row, reset its background
        if (selectedRow) {
            selectedRow.style.backgroundColor = '';
        }
        // set the background of the clicked row
        targetElement.style.backgroundColor = 'skyblue';
        // store the selected row
        selectedRow = targetElement;
        document.getElementById("addnew_PLATENO").value = targetElement.cells[0].innerHTML;
        document.getElementById("addnew_DRIVER").value = targetElement.cells[1].innerHTML;
        document.getElementById("addnew_CUSTOMER").value = targetElement.cells[2].innerHTML;
        document.getElementById("addnew_SUPPLIER").value = targetElement.cells[3].innerHTML;
        document.getElementById("addnew_TRANSPOTER").value = targetElement.cells[4].innerHTML;
        document.getElementById("addnew_PRODUCT").value = targetElement.cells[5].innerHTML;
    }
});

ipcRenderer.on('resPending', (event, results) => {
    let pendingtbl = "";
    const list = results;
    list.forEach(element => {
        pendingtbl += `
            <tr>
            <tr>
                <td class="no-wrap">${element.PLATE_NO ? element.PLATE_NO : ""}</td>
                <td class="no-wrap">${element.INDATE ? element.INDATE : ""}</td>
                <td class="no-wrap">${element.OUTDATE ? element.OUTDATE : ""}</td>
                <td class="no-wrap">${element.WEIGHT1 ? element.WEIGHT1 : ""}</td>
                <td class="no-wrap">${element.WEIGHT2 ? element.WEIGHT2 : ""}</td>
                <td class="no-wrap">${element.NETWEIGHT ? element.NETWEIGHT : ""}</td>
                <td class="no-wrap">${element.DRIVER ? element.DRIVER : ""}</td>
                <td class="no-wrap">${element.CUSTOMER ? element.CUSTOMER : ""}</td>
                <td class="no-wrap">${element.SUPPLIER ? element.SUPPLIER : ""}</td>
                <td class="no-wrap">${element.TRANSPOTER ? element.TRANSPOTER : ""}</td>
                <td class="no-wrap">${element.PRODUCT ? element.PRODUCT : ""}</td>
                <td class="no-wrap">${element.TICKET_NO ? element.TICKET_NO : ""}</td>
                <td class="no-wrap">${element.NOTE ? element.NOTE : ""}</td>
            </tr>
            </tr>
            
        `;
    });

    // <td class="hideFromTbl">${element.DRIVER ? element.DRIVER : ""}</td>
    // <td class="hideFromTbl">${element.CUSTOMER ? element.CUSTOMER : ""}</td>
    // <td class="hideFromTbl">${element.SUPPLIER ? element.SUPPLIER : ""}</td>
    // <td class="hideFromTbl">${element.TRANSPOTER ? element.TRANSPOTER : ""}</td>
    // <td class="hideFromTbl">${element.PRODUCT ? element.PRODUCT : ""}</td>
    // <td class="hideFromTbl">${element.TICKET_NO ? element.TICKET_NO : ""}</td>
    // <td class="hideFromTbl">${element.NOTE ? element.NOTE : ""}</td>

    pendingTbl.innerHTML = pendingtbl;
});

const fechpendingTbl = document.getElementById("fechpendingTbl");
fechpendingTbl.addEventListener('click', event => {
    let targetElement = event.target;
    while (targetElement && targetElement.tagName !== 'TR') {
        targetElement = targetElement.parentNode;
    }
    if (targetElement && targetElement.parentNode.tagName === 'TBODY') {
        // if there is a previously selected row, reset its background
        if (pendingTblselectedRow) {
            pendingTblselectedRow.style.backgroundColor = '';
        }
        // set the background of the clicked row
        targetElement.style.backgroundColor = 'skyblue';
        printData = targetElement;
        // store the selected row
        pendingTblselectedRow = targetElement;
        document.getElementById("pend_PLATENO").value = targetElement.cells[0].innerHTML;
        document.getElementById("pend_INDATE").value = targetElement.cells[1].innerHTML;
        document.getElementById("pend_OUTDATE").value = targetElement.cells[2].innerHTML;
        document.getElementById("pend_WEIGHT1").value = targetElement.cells[3].innerHTML;
        document.getElementById("pend_WEIGHT2").value = targetElement.cells[4].innerHTML;

        // document.getElementById('itmdes').value = targetElement.cells[0].innerHTML;
        // document.getElementById('home_DRIVER').value = targetElement.cells[6].innerHTML;
        // document.getElementById('home_CUSTOMER').value = targetElement.cells[7].innerHTML;
        // document.getElementById('home_SUPPLIER').value = targetElement.cells[8].innerHTML;
        // document.getElementById('home_TRANSPOTER').value = targetElement.cells[9].innerHTML;
        // document.getElementById('home_PRODUCT').value = targetElement.cells[10].innerHTML;
        // document.getElementById('home_TICKETNO').value = targetElement.cells[11].innerHTML;
        // document.getElementById('home_NOTE').value = targetElement.cells[12].innerHTML;
    }
});

ipcRenderer.on('resDownload', (event, results) => {
    let downloadtbl = "";
    const list = results;
    list.forEach(element => {
        downloadtbl += `
            <tr>
            <tr>
                <td class="no-wrap">${element.PLATE_NO ? element.PLATE_NO : ""}</td>
                <td class="no-wrap">${element.DRIVER ? element.DRIVER : ""}</td>
                <td class="no-wrap">${element.CUSTOMER ? element.CUSTOMER : ""}</td>
                <td class="no-wrap">${element.SUPPLIER ? element.SUPPLIER : ""}</td>
                <td class="no-wrap">${element.TRANSPOTER ? element.TRANSPOTER : ""}</td>
                <td class="no-wrap">${element.PRODUCT ? element.PRODUCT : ""}</td>
                <td class="no-wrap">${element.TICKET_NO ? element.TICKET_NO : ""}</td>
                <td class="no-wrap">${element.NOTE ? element.NOTE : ""}</td>
                <td class="no-wrap">${element.INDATE ? element.INDATE : ""}</td>
                <td class="no-wrap"${element.OUTDATE ? element.OUTDATE : ""}</td>
                <td class="no-wrap">${element.WEIGHT1 ? element.WEIGHT1 : ""}</td>
                <td class="no-wrap">${element.WEIGHT2 ? element.WEIGHT2 : ""}</td>
                <td class="no-wrap">${element.NETWEIGHT ? element.NETWEIGHT : ""}</td>
            </tr>
            </tr>
        `;
    });

    downloadTbl.innerHTML = downloadtbl;
});

const relaunch = document.getElementById('relaunch');
relaunch.addEventListener('click', (event) => {
    const port = document.getElementById('portsDrop').value;
    console.log(port);
    ipcRenderer.invoke('relaunch', port);
});


/////////////////////////////////// Change Pass ///////////////////////////////////

function validatePassword() {
    const newPassword = document.getElementById('newPassword').value;
    const retypePassword = document.getElementById('retypePassword').value;

    const passwordError = document.getElementById('passwordError');
    const retypeError = document.getElementById('retypeError');

    // const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    // if(!passwordRegex.test(newPassword)) {
    //     // passwordError.textContent = 'Password should be minimum 8 characters, include at least 1 uppercase letter and 1 number';
    //     passwordError.textContent = 'Invalid Password Type!';
    // } else {
    //     passwordError.textContent = '';
    // }

    if(newPassword !== retypePassword) {
        retypeError.textContent = 'Passwords do not match';
    } else {
        retypeError.textContent = '';
    }
};

const changePass = document.getElementById('changePass');
changePass.addEventListener('click', function (e) {
    e.preventDefault();
    var curUsername = document.getElementById("username");
    var curPassword = document.getElementById("currentPassword");
    var newPassword = document.getElementById("newPassword");
    var rePassword = document.getElementById("retypePassword");

    const passwordError = document.getElementById('passwordError');
    const retypeError = document.getElementById('retypeError');

    if(passwordError.textContent || retypeError.textContent) {
        ipcRenderer.invoke('error', "Please correct the errors");
    } else{
        const obj = { 
            curUsername: curUsername.value, 
            curPassword: curPassword.value,
            newPassword: newPassword.value,
            rePassword: rePassword.value,
        };
        ipcRenderer.invoke("changePass", obj);
        curUsername.value = '';
        curPassword.value = '';
        newPassword.value = '';
        rePassword.value = '';
    }
});

ipcRenderer.on('resPorts', (event, results) => {
    if(results.length ==0){
        ipcRenderer.invoke('error', "No Ports Detected!");
    }
    let portsdrop = '';
    const list = results;
    list.forEach(element => {
        portsdrop += `
            <option>${element.path}</option>
        `;
    });

    portsDrop.innerHTML = `<option selected>Choose...</option>` + portsdrop;
});