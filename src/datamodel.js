const path = require('path');
const sqlite3 = require('sqlite3').verbose();
// const dbPath = path.resolve(process.resourcesPath, 'database/main.db').replace('app.asar', 'app.asar.unpacked');
const dbPath = path.resolve(__dirname, '../database/main.db');
let db = new sqlite3.Database(dbPath);

function readTable(table) {
    return new Promise((resolve) => {
        let sql = `SELECT * FROM ${table}`;
        db.all(sql, function (err, rows) {
            if (err) {
                console.error(err);
                return;
            }
            resolve(rows);
        });
    });
};

function updateUserPass(obj) {
    return new Promise((resolve) => {
        const sql = `UPDATE Users SET User_Password=? WHERE User_Name=?`;
        db.run(sql, [obj.newPassword, obj.curUsername], function (err){
            if (err) resolve(err);
            resolve();
        });
    });
};

function filterTable(table, obj) {
    return new Promise((resolve, reject) => {
        // Filter out keys where value is null, undefined, or an empty string
        const keys = Object.keys(obj).filter(key => obj[key] !== null && obj[key] !== undefined && obj[key] !== '');

        // If there are no non-empty keys, return all rows from the table
        if (keys.length === 0) {
            let sql = `SELECT * FROM ${table}`;
            db.all(sql, function (err, rows) {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                resolve(rows);
            });
            return;
        }

        // Construct WHERE clause
        const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
        const params = keys.map(key => obj[key]);

        // Construct SQL query
        let sql = `SELECT * FROM ${table} WHERE ${whereClause}`;

        // Execute query
        db.all(sql, params, function (err, rows) {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};


function addTable(table, obj) {
    return new Promise((resolve) => {
        let keys = Object.keys(obj).join(',');
        let values = Object.values(obj).map(value => `'${value}'`).join(',');

        let sql = `INSERT INTO ${table} (${keys}) VALUES (${values})`;
        db.run(sql, function (err) {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`Row inserted into ${table}`);
            resolve();
        });
    });
};

function updateTable(table, obj) {
    return new Promise((resolve) => {
        // Clone the object to not modify the original
        let objCopy = { ...obj };
        // Remove the PLATENO property from objCopy and store it in plateNo
        let { PLATE_NO: plateNo, ...rest } = objCopy;
        let updates = Object.entries(rest).map(([key, value]) => `${key}='${value}'`).join(',');

        let sql = `UPDATE ${table} SET ${updates} WHERE PLATE_NO='${plateNo}'`;
        db.run(sql, function (err) {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`Row updated in ${table}`);
            resolve();
        });
    });
}


function deleteTable(table, PLATE_NO) {
    return new Promise((resolve) => {
        let sql = `DELETE FROM ${table} WHERE PLATE_NO = "${PLATE_NO}"`;
        console.log(sql);
        db.run(sql, function (err){
            if (err) {
                console.error(err);
                return;
            }
            resolve();
        });
    });
};

module.exports = {
    readTable,
    addTable,
    deleteTable,
    updateTable,
    filterTable,
    updateUserPass
};