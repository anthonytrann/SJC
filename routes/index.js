var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'test';

/* GET login page. */
router.get('/login', function (req, res, next) {
  res.render('login', { title: 'Express' });
});

// GET home page
router.get('/homepage', function (req, res) {
  res.render('homepage');
});

router.get('/addcandidate', (req, res) => {
  res.render('addcandidate');
});



// NOTE: needs to be updated to work with mongoDB api
// https://www.npmjs.com/package/mongodb
router.post('/candidate', (req, res) => {
  let newCandidate = {
    "patronSaint": req.body.patronSaint,
    "surnameMiddlename": req.body.surnameMiddlename,
    "firstname": req.body.firstname,
    "dob": req.body.dob,
    "email": req.body.email,
    "phoneNumber": req.body.phoneNumber,
    "university": req.body.university,
    "major": req.body.major,
    "educationStatus": req.body.educationStatus,
    "formator": req.body.formator,
    "spiritualDirector": req.body.spiritualDirector,
    "candidacyType": req.body.candidacyType,
    "candidacyDate": req.body.candidacyDate,
    "communityDate": req.body.communityDate,
    "permanentAddress": [{
      "houseNumber1": req.body.houseNumber1,
      "street1": req.body.street1,
      "ward1": req.body.ward1,
      "district1": req.body.district1,
      "city1": req.body.city1,
      "region": req.body.region
    }],
    "communityAddress": [{
      "communityName": req.body.communityName,
      "communitySaint": req.body.communitySaint,
      "communityPhone": req.body.communityPhone,
      "houseNumber2": req.body.houseNumber2,
      "street2": req.body.street2,
      "ward2": req.body.ward2,
      "district2": req.body.district2,
      "city2": req.body.city2
    }]
    
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
  res.redirect("candidates");
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


module.exports = router;
