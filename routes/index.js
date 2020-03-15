var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'test';

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', { title: 'Express' });
});

// NOTE: needs to be updated to work with mongoDB api
// https://www.npmjs.com/package/mongodb
router.post('/candidate', (req, res) => {
  let newCandidate = {
    patronSaint: req.post.patronSaint,
    // so on...
  };
  MongoClient.connect(url, (err, client) => {
    if (err) {
      res.send(err);
    }
    const db = client.db(dbName);
    // add code here to insert into database
    db.candidates.insert(newCandidate);
    client.close();
    res.send();
  });
});

router.get('/candidates', (req, res) => {
  MongoClient.connect(url, (err, client) => {
    if (err) {
      console.log(err);
      res.render('homepage');
    }
    const db = client.db(dbName);
    let candidates = db.collection('candidates');
    candidates.find({}).toArray((err, candidateRecords) => {
      client.close();
      res.render('candidates', { candidateRecords: candidateRecords.map(row => JSON.stringify(row)) })
    });

  });
});

router.get('/homepage', function (req, res) {
  res.render('homepage');
});

router.get('/addCandidate')


module.exports = router;
