let express = require('express');
let router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'test';
const getDb = require("./database").getDb;
// const initDb = require("./database").initDb;


/* GET login page. */
router.get('/login', function (req, res, next) {
  res.render('login');
});


// GET home page
router.get('/', function (req, res) {
  res.render('homepage');
});

router.get('/communities', (req, res) => {
  const db = getDb();
  let communities = db.collection('communities');
  let candidates = db.collection('candidates');
  communities.find({}).toArray((err, communityRecords) => {
    candidates.find({}).toArray((err, candidateRecords) => {
      res.render('communities', { communityRecords: communityRecords, candidateRecords: candidateRecords});
    });
  });
});


router.get('/candidates', (req, res) => {
  const db = getDb();
  let candidates = db.collection('candidates');
  candidates.find({}).toArray((err, candidateRecords) => {
    console.log(candidateRecords)
    res.render('candidates', { candidateRecords: candidateRecords });
  });
});

router.get('/addcommunity', function (req, res) {
  res.render('addcommunity');
});

router.post('/addcommunity', function (req, res) {
  let newCommunity = {
    "communityName": req.body.communityName,
    "communitySaint": req.body.communitySaint,
    "communityPhone": req.body.communityPhone,
    "houseNumber2": req.body.houseNumber2,
    "street2": req.body.street2,
    "ward2": req.body.ward2,
    "district2": req.body.district2,
    "city2" : req.body.city2
  };

  const db = getDb();
  let communities = db.collection('communities');
  communities.insertOne(newCommunity, {}, (error, result) => {
    if(error){
      console.log(error.message);
    }
  });
  res.redirect("communities");
});

router.get('/addcandidate', (req, res) => {
  const db = getDb();
  let communities = db.collection('communities');
  let objArray = [];
  communities.find({}).toArray((err, communityRecords) => {
    for(let i in communityRecords){
      let community = communityRecords[i];
      objArray.push(community.communityName);
    }
    res.render('addcandidate', { communityNames: objArray });
  });
});

// NOTE: needs to be updated to work with mongoDB api
// https://www.npmjs.com/package/mongodb
router.post('/addcandidate', (req, res) => {
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
    "communityAddress": {}
  };

  const db = getDb();
  let communities = db.collection('communities');
  communities.find({}).toArray((err, communityRecords) => {
    for(let i in communityRecords){
      let eachCommunity = communityRecords[i];
      for(let attribute in eachCommunity){
        let com = String(req.body.community);
        if(eachCommunity[attribute] <= com && eachCommunity[attribute] >= com ){
          let array=[];
          array.push(eachCommunity)
          newCandidate.communityAddress = array;
        }
      }
    }
    let candidates = db.collection('candidates');
    candidates.insertOne(newCandidate, {}, (error, result) => {
      if(error){
        console.log(error.message);
      }
    });
    res.redirect("candidates");
  });
});


module.exports = router;
