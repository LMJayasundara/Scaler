const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const port = new SerialPort({
    path: 'COM6',
    baudRate: 9600,
  }, false);

SerialPort.list().then(function(ports){
    ports.forEach(function(port){
      console.log("Port: ", port.path);
    })
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

let outputObj = {};

parser.on('data', function (data) {
    console.log(data);
    // Split the data string into key and value
    let [key, ...valueArr] = data.split(' ');
    let value = valueArr.join(' ').replace(/\s+/g, '').trim(); // remove additional white spaces

    key = key.replace('/', '');  // remove '/' from keys

    // Add the key-value pair to the output object
    outputObj[key] = value;

    // Check if this is the last line of data
    if (key === 'SN') { // update condition according to key modification
        console.log('Final Data:', outputObj);
    }
});

port.on('error', function(err) {
    console.log('Error: ', err.message);
});

// Port:  COM6
// TICKET NO.0001
// G    -    4.6kg
// T         0.0kg
// PT        0.0kg
// N    -    4.6kg
// P/N 422345678901
// S/N   0000000022
// Final Data: {
//   TICKET: 'NO.0001',
//   G: '-4.6kg',
//   T: '0.0kg',
//   PT: '0.0kg',
//   N: '-4.6kg',
//   PN: '422345678901',
//   SN: '0000000022'
// }