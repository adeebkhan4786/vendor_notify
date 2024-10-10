// import mysql from 'mysql'
import mysql from 'mysql2/promise';

var connection = mysql.createPool({
  connectionLimit: 10, //important
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  // port: 3306,  
  multipleStatements: true,
});


// // Attempt to connect to the database
// connection.connect((err) => {
//   if (err) {
//     if (err.code === 'ECONNREFUSED') {
//       console.error('Connection refused: Unable to connect to the database.');
//       // Handle the connection refused error
//     } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
//       console.error('Access denied: Check your username and password.');
//       // Handle access denied error
//     } else {
//       console.error('Error connecting to the database:', err);
//       // Handle other errors
//     }
//     return;
//   }

//   console.log('Connected to the database.');
// });


export default connection;