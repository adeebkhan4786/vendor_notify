// const mysql = require('mysql');
import mysql from 'mysql';
var sql_con = mysql.createPool({
    connectionLimit: 10, //important
    host: 'stagdb.chxtd8lawqy5.ap-south-1.rds.amazonaws.com',
    user: 'admin',
    password: 'wXETG5aOJK1w8YaFHgFv',
    database: 'vendorportal_db_stage',
    // ssl:
    // {
    //    ca: config.db_ssl_ca,
    //    key: config.db_ssl_key,
    //    cert: config.db_ssl_cert
    // },
    multipleStatements: true
});

sql_con.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database successfully');
        connection.release(); // release the connection back to the pool
    }
});

setTimeout(async()=>{

    const tableName = 'vendor_notify as vendor';
    const projection = 'vendor.*, item.item_code, item.item_name, item.demand_count, item.remarks, item.vendor_id';
    const condition = `mail_flag=0`;
    const joins = 'left join item_notify as item on vendor.id = item.vendor_id'
    
    const query = `SELECT * FROM vendor_notify`;
    const data = sql_con.query(query, function (err, add_result) {
        if (!err) {
            console.log(add_result);
        } else {
            console.log(err);            
        }
    });


},5000)



// module.exports = sql_con;
