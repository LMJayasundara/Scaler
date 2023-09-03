const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable");
const { print } = require("pdf-to-printer");

// Define your data
let name = "Shan PVT Ltd.";
let address = "Central province, kandalama, Dambulla";
let phoneNumber = "070 448 6677";
let name2 = "WB Number";
let wbnumber = 1;

let topics = [
    { topic: "Topic1", data: "data1" },
    { topic: "Topic2", data: "data2" },
    { topic: "Topic3", data: "data3" },
    { topic: "Topic4", data: "data4" },
    { topic: "Topic5", data: "data5" },
    { topic: "Topic6", data: "data6" }
];

// Create a new instance of jsPDF
let doc = new jsPDF('landscape', 'pt', 'letter');

// Header
doc.setFontSize(24);
doc.text(name, 80, 80); // Name as Title

// Body Part 1
doc.setFontSize(18);
doc.text(address, 80, 110); // Address

let headers = ["", "", ""];
let data = [
    [phoneNumber, "", `${name2}: ${wbnumber}`], // Body Part 2 - With Phone Number and Name2: Name
];

// Body Part 3
// doc.setFontSize(18);
doc.autoTable({
    margin: { left: 80 },
    startY: 94,
    head: [headers],
    body: data,
    theme: 'plain',
    styles: { fontSize: 18 },
    columnStyles: {
        0: { cellWidth: 430 }, // Set the cell width of the first column
        1: { cellWidth: 'auto' }, // Set the cell width of the second column to be calculated automatically
        2: { cellWidth: 'wrap' }, // Set the cell width of the third column to wrap to the text
    },
});

// Body Part 4 - Topics
data = [
    [`DRIVER: ${topics[0].data}`, `PLATE NO: ${topics[1].data}`, `TICKET NO: ${topics[2].data}`],
    [`CUSTOMER: ${topics[3].data}`, ``, `SUPPLIER: ${topics[5].data}`],
    [`TRANSPOTER: ${topics[3].data}`, ``, `PRODUCT: ${topics[5].data}`],
    [`PRICE Per/Kg: ${topics[3].data}`, ``, `TOTAL PRICE: ${topics[5].data}`],
    [`DATE IN: ${topics[0].data}`, `DATE OUT: ${topics[1].data}`, `NOTE: ${topics[2].data}`],
    [`1st WEIGHT: ${topics[0].data}`, `2nd WEIGHT: ${topics[1].data}`, `NET WEIGHT: ${topics[2].data}`],
];

doc.autoTable({
    margin: { left: 80 },
    startY: 150,
    head: [headers],
    body: data,
    theme: 'plain',
    styles: { fontSize: 18, minCellHeight: 45},
    columnStyles: {
        0: { cellWidth: 'auto'}, // Set the cell width of the first column
        1: { cellWidth: 'auto' }, // Set the cell width of the second column to be calculated automatically
        2: { cellWidth: 'auto' }, // Set the cell width of the third column to wrap to the text
    },
});

// Footer
// doc.setFontSize(18);
// doc.text("______________", 80, 550); // Footer content at the bottom of the page

data = [
    [`______________`, `______________`, `______________`],
    [`Weighbridge Operator`, `Driver/Supplier/Customer`, `Checked By`],
];

doc.autoTable({
    margin: { left: 80 },
    startY: 450,
    head: [headers],
    body: data,
    theme: 'plain',
    styles: { fontSize: 18},
    columnStyles: {
        0: { cellWidth: 'auto'}, // Set the cell width of the first column
        1: { cellWidth: 'auto' }, // Set the cell width of the second column to be calculated automatically
        2: { cellWidth: 'auto' }, // Set the cell width of the third column to wrap to the text
    },
});

// Save the PDF
doc.save("./pdf/output.pdf");