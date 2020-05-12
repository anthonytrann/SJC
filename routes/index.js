let express = require('express');
let router = express.Router();
// const MongoClient = require('mongodb').MongoClient;
// const url = 'mongodb://localhost:27017';
// const dbName = 'test';
const getDb = require("./database").getDb;
// const initDb = require("./database").initDb;
var ObjectId = require('mongodb').ObjectID;

var path = require('path');


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
    candidates.find({$and: [ {candidacyType : { $nin : ['Ex-Candidate'] } }, {communityAddress : {$nin : [{}]}} ] }).toArray((err, candidateRecords) => {
      res.render('communities', { communityRecords: communityRecords, candidateRecords: candidateRecords});
    });
  });
});

router.get('/candidates', (req, res) => {
  const db = getDb();
  let candidates = db.collection('candidates');
  candidates.find({}).toArray((err, candidateRecords) => {
    let activeArray = [];
    let excandidateArray = [];
    candidateRecords.forEach(candidate => {
      if(candidate.candidacyType != 'Ex-Candidate') {
        activeArray.push(candidate);
      } else {
        excandidateArray.push(candidate);
      }
    });
    res.render('candidates', { activeArray : activeArray, excandidateArray : excandidateArray });
  });
});

router.delete('/candidates/:id', (req, res) => {
  let id = req.params.id; 
  const db = getDb();
  let candidates = db.collection('candidates');

  try{
    candidates.findOneAndDelete({"_id" : ObjectId(id)}, (err, result) => {
      if(err){
        console.log("Did not delete")
      } else {
        console.log("Deleted user id: " + id + " successfully")   
      }
    });
  } catch(e) {
    console.log(e);

  }
  
});

router.get('/updatecandidate/:id', (req, res) => {
  let id = req.params.id;
  const db = getDb();
  let candidates = db.collection('candidates');
  let communities = db.collection('communities');
  try{
    let communityNamesArray = []
    communities.find({}).toArray((err, communityRecords) => {
      for(let i in communityRecords){
        let community = communityRecords[i];
        communityNamesArray.push(community.communityName);
      }
      candidates.findOne({"_id" : ObjectId(id) })
      .then(candidateFound => {
        res.render('updatecandidate', {candidateFound : candidateFound, communityNames: communityNamesArray});
      })
    });    
  } catch(e) {
    console.log(e);
    
  }

});

router.post('/updatecandidate/:id',(req,res) => {
  
  let updatedcandidate = {
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
      let perCommunity = communityRecords[i];
      for(let attribute in perCommunity){
        let selectedCommunity = String(req.body.community);
        if(perCommunity[attribute] <= selectedCommunity && perCommunity[attribute] >= selectedCommunity ){
          let array=[perCommunity];
          
          updatedcandidate.communityAddress = array;
        }
      }
    }

    try{
      let candidates = db.collection('candidates');

      let id = req.params.id;
      console.log(updatedcandidate);
      
      candidates.findOneAndUpdate({"_id": ObjectId(id)}, {$set: updatedcandidate})
      .then(result => {
        console.log(result.result);
        
      })
    } catch(e) {
      console.log(e);
      
    }
    
    
    res.redirect("../candidates");
  });
});

router.get('/companions', (req, res) => {
  res.render('companions', {communityNames : []});
});

router.get('/specializedmajor', (req, res) => {
  const db = getDb();
  let candidates = db.collection('candidates');
  candidates.find({}).toArray((err, candidateRecords) => {
    let candidateArray = [];
    candidateRecords.forEach( candidate => {
      if (candidate.candidacyType != 'Ex-Candidate') {
        if(candidateArray.length == 0) {
          candidateArray.push({'uniName' : candidate.university, 'count' : 1, candidates: [candidate]});
        } else {
          let candidateUpdated = false;
          for(let i = 0; i<candidateArray.length; i++){
            let uni = candidateArray[i];
            if (uni.uniName === candidate.university) {
              uni.count = uni.count + 1;
              uni.candidates.push(candidate);
              candidateUpdated = true;
              break;
            }
          }
          if(!candidateUpdated){
            candidateArray.push({'uniName' : candidate.university, 'count' : 1, candidates: [candidate]});
          }
        } 
      }
    });
    res.render('specializedmajor', {candidateArray : candidateArray});
  }); 
});

router.get('/addresses', (req, res) => {
  const db = getDb();
  let candidates = db.collection('candidates');
  candidates.find({}).toArray((err, candidateRecords) => {
    res.render('addresses', { candidateRecords : candidateRecords });
  });
});

router.get('/candidatetypes',  (req, res) => {
  const db = getDb();
  let candidates = db.collection('candidates');
  candidates.find({}).toArray((err, candidateRecords) => {
    res.render('candidatetypes', {candidateRecords : candidateRecords });
  });
});

router.get('/statistics', (req, res) => {
  res.render('statistics');
});

router.get('/addcommunity', function (req, res) {
  res.render('addcommunity');
});

router.post('/addcommunity', (req, res) => {
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
      let perCommunity = communityRecords[i];
      for(let attribute in perCommunity){
        let selectedCommunity = String(req.body.community);
        if(perCommunity[attribute] <= selectedCommunity && perCommunity[attribute] >= selectedCommunity ){
          let array=[perCommunity];
          newCandidate.communityAddress = array;
          break
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
