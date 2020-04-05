const assert = require("assert");
const client = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'test';

let _db;

function initDb(callback) {
  if (_db) {
      console.warn("Trying to init DB again!");
      return callback(null, _db);
  }

  // client.connect(url, (err, db) => {
  //   if (err) {
  //     return callback(err);
  //   }
  //   assert.equal(null,err);
  //   console.log("DB initialized - connected to: ");
  //   // console.log("DB initialized - connected to: " + config.db.connectionString.split("@")[1]);
  //   _db = db;
  //   return callback(null, _db);
  // });
  
  client.connect(url, { useNewUrlParser: true}, (err, db) => {
    if(err) {
      return console.log(err);
    }
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    _db = db.db(dbName);
  });

}

function getDb() {
  assert.ok(_db, "Db has not been initialized. Please called init first.");
  return _db;
}

module.exports = {
  getDb,
  initDb
};