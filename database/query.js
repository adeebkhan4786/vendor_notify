import mysql from 'mysql2/promise';
import connection from "../database/connection.js";

const  poolConnect= async()=> {
  try {
    const pool = mysql.createPool({
      connectionLimit: 10, //important
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: 3306,  
      multipleStatements: true,
    });
    console.log('Connected to the database.');
    return pool;
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error('Connection refused: Unable to connect to the database.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied: Check your username and password.');
    } else {
      console.error('Error connecting to the database:', err);
    }
    throw err;
  }
}

class Query {
  // To get the object with the help of conditions
  async getObjectByConditions(table, projection, condition, joins, orderBy, groupBy) {
    let client;
    try {
      orderBy = orderBy ? `ORDER BY ${orderBy}` : "";
      groupBy = groupBy ? `GROUP BY ${groupBy}` : "";
      let filter = condition ? `WHERE ${condition}` : "";
      projection = projection ? projection : "*";
      joins = joins ? joins : "";
      const query = `SELECT ${projection} FROM ${table} ${joins} ${filter} ${orderBy} ${groupBy}`;
      console.log(query)
      client=await poolConnect();
      const data = await client.query(query);
      let result = {};
      result["data"] = data[0];
      result["success"] = true;
      return result;
    } catch (error) {
      console.log(error);
      return { success: false };
    }
     finally {
      if (client) {
       await client.end();
      }
    }
  }




  // To update the object by condition
  async updateObjectByCondition(table, condition, updateData) {
    let client;
    try {
      if (!condition) {
        throw new Error(
          `Condition not provided for update operation.It may affect entire table.`
        );
      }
      const query = `UPDATE ${table} SET ${updateData} WHERE ${condition} RETURNING *`;
      client=await poolConnect();
      const data = await client.query(query);
      let result = {};
      result["data"] = data[0];
      result["success"] = true;
      return result;
    } catch (error) {
      console.log(error);
      return { success: false };
    } 
    finally {
      if (client) {
        await client.end();

      }
    }
  }




  //To update Multiple object by their condition
  async updateMultipleObjectByCondition(table, condition, dataToUpdate) {
    let client;
    try {
      if (!condition) {
        throw new Error(
          `Condition not provided for update operation.It may affect entire table.`
        );
      }
      dataToUpdate = await cleanObject(dataToUpdate);
      let objectToUpdate = await updateDataMaker(dataToUpdate);
      const query = `UPDATE ${table} SET ${objectToUpdate} WHERE ${condition}`;
       console.log(query)
       client=await poolConnect();
       const data = await client.query(query);
       let result = {};
      result["data"] = data[0];
      result["success"] = true;
      result["query"] = query;
      return result;
    } catch (error) {
      console.log(error);
      return { success: false, error };
    }
     finally {
      if (client) {
        await client.end();
      }
    }
  }


  //Update the multiple object with null values- Updated also null value in db.
  async updateMultipleObjectByConditionWithNullValues(table, condition, dataToUpdate) {
    let client;
    try {
      if (!condition) {
        throw new Error(
          `Condition not provided for update operation.It may affect entire table.`
        );
      }
      let objectToUpdate = await updateDataMaker(dataToUpdate);
      const query = `UPDATE ${table} SET ${objectToUpdate} WHERE ${condition} RETURNING *`;
       console.log(query)
      client=await poolConnect();
      const data = await client.query(query);
      let result = {};
      result["data"] = data[0];
      result["success"] = true;
      result["query"] = query;
      return result;
    } catch (error) {
      console.log(error);
      return { success: false, error };
    }
     finally {
      if (client) {
        await client.end(); 
      }
    }
  }


  //Insert multiple objects.
  async createObject(table, data) {
    let client;
    try {
      data = await cleanObject(data);
      let objectToAdd = await getDataCreate(data);
      const query = `INSERT INTO ${table} (${objectToAdd.keys}) VALUES (${objectToAdd.placeHolders}) RETURNING *`;
      console.log(query)
      client=await poolConnect();
      let response = await client.query(query, objectToAdd.values);
      let result = {};
      result["data"] = response.rows;
      result["success"] = true;
      return result;
    } catch (error) {
      console.log(error);
      return { success: false };
    } 
    finally {
      if (client) {
        await client.end();
      }
    }
  }
 


}

async function updateDataMaker(dataObject) {
  // let countObjectProperties = Object.keys(dataObject).length;
  let count = 0;
  let data = "";
  //Iterate the dataObject
  for (const property in dataObject) {
    if (typeof dataObject[property] === "string") {
      if (count === 0) {
        data += property + "=" + `'${dataObject[property]}'`;
      } else {
        data += "," + property + "=" + `'${dataObject[property]}'`;
      }
      count++;
    } else {
      if (count === 0) {
        data += property + "=" + `${dataObject[property]}`;
      } else {
        data += "," + property + "=" + `${dataObject[property]}`;
      }
      count++;
    }
  }
  return data;
}

async function getDataCreate(data) {
  let objectKeys = Object.keys(data);
  let placeHolders = [];
  let values = [];
  let keys = [];
  for (let index = 0; index < objectKeys.length; index++) {
    let key = objectKeys[index];
    keys.push(`"${key}"`);
    placeHolders.push(`$${index + 1} `);
    values.push(data[key]);
  }
  return { placeHolders, keys, values };
}


// Function for clean the object, if have {null or undefined} value then ignore that key from object.
function cleanObject(obj) {
  for (var propName in obj) {
    if (
      obj[propName] === null ||
      obj[propName] === undefined ||
      obj[propName] === "" ||
      obj[propName] === "" ||
      obj[propName] === "undefined" ||
      obj[propName] === "null"
    ) {
      delete obj[propName];
    }
  }
  return obj;
}



let obj=new Query()
export default obj;

