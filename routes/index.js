let express = require('express');
let router = express.Router();
const getDb = require("./database").getDb;
var ObjectId = require('mongodb').ObjectID;
var csvtojson = require('csvtojson');
const formidableMiddleware = require('express-formidable');

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
    candidates.find({ $and: [{ candidacyType: { $nin: ['Ex-Candidate'] } }, { communityAddress: { $nin: [{}] } }] }).toArray((err, candidateRecords) => {
      res.render('communities', { communityRecords: communityRecords, candidateRecords: candidateRecords });
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
      if (candidate.candidacyType === 'Ex-Candidate') {
        excandidateArray.push(candidate);
      } else {
        activeArray.push(candidate);
      }
    });
    res.render('candidates', { activeArray: activeArray, excandidateArray: excandidateArray });
  });
});

router.get('/companions', (req, res) => {
  res.render('companions', { communityNames: [] });
});

router.get('/specializedmajor', (req, res) => {
  const db = getDb();
  let candidates = db.collection('candidates');
  candidates.find({}).toArray((err, candidateRecords) => {
    let candidateArray = [];
    candidateRecords.forEach(candidate => {
      if (candidate.candidacyType != 'Ex-Candidate') {
        if (candidateArray.length == 0) {
          candidateArray.push({ 'uniName': candidate.university, 'count': 1, candidates: [candidate] });
        } else {
          let candidateUpdated = false;
          for (let i = 0; i < candidateArray.length; i++) {
            let uni = candidateArray[i];
            if (uni.uniName === candidate.university) {
              uni.count = uni.count + 1;
              uni.candidates.push(candidate);
              candidateUpdated = true;
              break;
            }
          }
          if (!candidateUpdated) {
            candidateArray.push({ 'uniName': candidate.university, 'count': 1, candidates: [candidate] });
          }
        }
      }
    });
    res.render('specializedmajor', { candidateArray: candidateArray });
  });
});

router.get('/addresses', (req, res) => {
  const db = getDb();
  let candidates = db.collection('candidates');
  candidates.find({}).toArray((err, candidateRecords) => {
    res.render('addresses', { candidateRecords: candidateRecords });
  });
});

router.get('/candidatetypes', (req, res) => {
  const db = getDb();
  let candidates = db.collection('candidates');
  candidates.find({}).toArray((err, candidateRecords) => {
    res.render('candidatetypes', { candidateRecords: candidateRecords });
  });
});

router.get('/statistics', (req, res) => {
  const db = getDb();
  let communities = db.collection('communities');
  let candidates = db.collection('candidates');
  candidates.find({}).toArray((err, candidatesRecords) => {
    if(err) console.log(err);
    
    communities.find({}).toArray((err2, communityRecords) => {
      if(err2) console.log(err2);
      
      let communityNamesArray = [];
      let canComQuantityArray = [];
      let typeQuantityArray = [0, 0, 0, 0];
      let regionQuantityArray= [0,0,0];
      let uniNamesArray = [];
      let uniQuantityArray = [];

      for (let i = 0; i < communityRecords.length; i++) {
        communityNamesArray.push(communityRecords[i].communityName);
        canComQuantityArray.push(0);
      }
      let uniCount =0;
      for (let i = 0; i < candidatesRecords.length; i++) {

        for (let j = 0; j < communityNamesArray.length; j++) {
          if (candidatesRecords[i].communityAddress.communityName === communityNamesArray[j]) {
            canComQuantityArray[j] = canComQuantityArray[j] + 1;
          }
        }

        if (candidatesRecords[i].candidacyType === 'Interior') {
          typeQuantityArray[0] = typeQuantityArray[0] + 1;
        } else if (candidatesRecords[i].candidacyType === 'Exterior') {
          typeQuantityArray[1] = typeQuantityArray[1] + 1;
        } else if (candidatesRecords[i].candidacyType === 'Pre-Novice') {
          typeQuantityArray[2] = typeQuantityArray[2] + 1;
        } else if (candidatesRecords[i].candidacyType === 'Ex-Candidate') {
          typeQuantityArray[3] = typeQuantityArray[3] + 1;
        }

        if(candidatesRecords[i].permanentAddress.region === 'Northern') {
          regionQuantityArray[0] = regionQuantityArray[0] + 1;
        }else if(candidatesRecords[i].permanentAddress.region === 'Central') {
          regionQuantityArray[1] = regionQuantityArray[1] + 1;
        }else if(candidatesRecords[i].permanentAddress.region === 'Southern') {
          regionQuantityArray[2] = regionQuantityArray[2] + 1;
        }

        
        if(uniNamesArray.includes(candidatesRecords[i].univeristy)){
          let index = uniNamesArray.indexOf(candidatesRecords[i].university);
          uniQuantityArray[index] = uniQuantityArray + 1;
        } else {
          uniNamesArray.push(candidatesRecords[i].university);
          uniQuantityArray.push(1);
        }

      }

      res.render('statistics', {
        data1: {
          labels: communityNamesArray,
          series: canComQuantityArray
        },
        data2: {
          labels: ['Interior', 'Exterior', 'Pre-Novice', 'Ex-Candidate'],
          series: typeQuantityArray
        },
        data3: {
          labels: ['Northern', 'Central', 'Southern'],
          series: regionQuantityArray
        },
        data4: {
          labels: uniNamesArray,
          series: uniQuantityArray
        }
      });

    });
  });
});

router.get('/searching', (req, res) => {
  console.log(req.body);

  let searchFilter = req.query.searchFilter;
  let searchValue = req.query.searchValue;
  const db = getDb();
  console.log(searchFilter);
  console.log(searchValue);

  try {
    if (searchFilter === 'Candidate Name' || searchFilter === 'University Name' || searchFilter === 'City Name') {
      let candidates = db.collection('candidates');
      if (searchFilter === 'Candidate Name') {
        candidates.find({
          $or:
            [
              { "firstname": searchValue },
              { "surnameMiddlename": searchValue }
            ]
        }).toArray((err, searchRecords) => {
          if (err) {
            console.log(err);
          } else {
            console.log(searchRecords);
            res.render('search', { searchRecords: searchRecords });
          }
        });
      } else if (searchFilter === 'University Name') {
        candidates.find({ "univeristy": searchValue }).toArray((err, searchRecords) => {
          if (err) {
            console.log(err);
          } else {
            console.log(searchRecords);
            res.render('search', { searchRecords: searchRecords });
          }
        });
      } else {
        candidates.find({ "permanentAddress.city1": searchValue }).toArray((err, searchRecords) => {
          if (err) {
            console.log(err);
          } else {
            console.log(searchRecords);
            res.render('search', { searchRecords: searchRecords });
          }
        });
      }
    } else if (searchFilter === 'Community Name') {
      let communities = db.collection('communities');
      communities.find({ communityName: searchValue }).toArray((err, searchRecords) => {
        if (err) {
          console.log(err);
        } else {
          console.log(searchRecords);
          res.render('search', { searchRecords: searchRecords });
        }
      });
    } else if (searchFilter === 'Companion Name') {
      // searchFilter should be Companion Name
      res.render('search', { searchRecords: "test" });
    } else {
      res.render('search', { searchRecords: "test" });
    }
  } catch (e) {
    console.log(e);
  }

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
    "city2": req.body.city2
  };
  const db = getDb();
  let communities = db.collection('communities');
  communities.insertOne(newCommunity, {}, (error, result) => {
    if (error) {
      console.log(error.message);
    }
  });
  res.redirect("communities");
});

router.post('/addcommunity/import', formidableMiddleware(), (req, res) => {
  // console.log(req.files);

  csvtojson()
    .fromFile(req.files.file.path)
    .then(csvData => {
      console.log(csvData);

      const db = getDb();
      let communities = db.collection('communities');
      communities.insertMany(csvData, (err, result) => {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log("Inserted: " + result.insertedCount + " rows");
        res.send({ message: "Inserted: " + result.insertedCount + " rows" })
      });
    });
});

router.delete('/deletecommunity/:id', (req, res) => {
  let id = req.params.id;
  const db = getDb();
  let communities = db.collection('communities');

  try {
    communities.findOneAndDelete({ "_id": ObjectId(id) }, (err, result) => {
      if (err) {
        console.log("Did not delete")
      } else {
        console.log("Deleted community id: " + id + " successfully")
      }
    });
  } catch (e) {
    console.log(e);
  }
  res.send({ message: "community deleted" });
});

router.get('/updatecommunity/:id', (req, res) => {
  let id = req.params.id;
  const db = getDb();
  let communities = db.collection('communities');
  try {
    communities.findOne({ "_id": ObjectId(id) })
      .then(communityFound => {
        console.log(communityFound);

        res.render('updatecommunity', { communityFound: communityFound })
      });
  } catch (e) {
    console.log(e);
  }
});

router.post('/updatecommunity/:id', (req, res) => {
  let id = req.params.id;
  let updatedCommunity = {
    "communityName": req.body.communityName,
    "communitySaint": req.body.communitySaint,
    "communityPhone": req.body.communityPhone,
    "houseNumber2": req.body.houseNumber2,
    "street2": req.body.street2,
    "ward2": req.body.ward2,
    "district2": req.body.district2,
    "city2": req.body.city2
  };
  const db = getDb();
  let communities = db.collection('communities');
  communities.findOneAndUpdate({ "_id": ObjectId(id) }, { $set: updatedCommunity })
    .then(result => {
      console.log(result);

    });

  let candidates = db.collection('candidates')
  communities.find({}).toArray((err, communityRecords) => {
    candidates.find({ $and: [{ candidacyType: { $nin: ['Ex-Candidate'] } }, { communityAddress: { $nin: [{}] } }] }).toArray((err, candidateRecords) => {
      res.render('communities', { communityRecords: communityRecords, candidateRecords: candidateRecords });
    });
  });
});


router.get('/addcandidate', (req, res) => {
  const db = getDb();
  let communities = db.collection('communities');
  let objArray = [];
  communities.find({}).toArray((err, communityRecords) => {
    for (let i in communityRecords) {
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
    "permanentAddress": {
      "houseNumber1": req.body.houseNumber1,
      "street1": req.body.street1,
      "ward1": req.body.ward1,
      "district1": req.body.district1,
      "city1": req.body.city1,
      "region": req.body.region
    },
    "communityAddress": {}
  };
  const db = getDb();
  let communities = db.collection('communities');
  communities.find({}).toArray((err, communityRecords) => {
    for (let i in communityRecords) {
      let perCommunity = communityRecords[i];
      for (let attribute in perCommunity) {
        let selectedCommunity = String(req.body.community);
        if (perCommunity[attribute] <= selectedCommunity && perCommunity[attribute] >= selectedCommunity) {
          newCandidate.communityAddress = perCommunity;
          break
        }
      }
    }
    let candidates = db.collection('candidates');
    candidates.insertOne(newCandidate, {}, (error, result) => {
      if (error) {
        console.log(error.message);
      }
    });
    res.redirect("candidates");
  });
});

router.post('/addcandidate/import', formidableMiddleware(), (req, res) => {
  // console.log(req.files);

  csvtojson()
    .fromFile(req.files.file.path)
    .then(csvData => {
      console.log(csvData);
      const db = getDb();

      let communities = db.collection('communities');
      communities.find({}).toArray((err, communityRecords) => {
        for (let i = 0; i < csvData.length; i++) {
          let candidate = csvData[i];
          let addressChanged = false;
          for (let j = 0; j < communityRecords.length; j++) {
            let community = communityRecords[j];

            if (candidate.communityAddress.communityName === community.communityName) {
              candidate.communityAddress = community;
              addressChanged = true;
              break;
            }
          }
          if (!addressChanged) {
            candidate.communityAddress = {};
          }
        }
        console.log(csvData);
        let candidates = db.collection('candidates');
        candidates.insertMany(csvData, (err, result) => {
          if (err) {
            console.log(err);
            throw err;
          }
          console.log("Inserted: " + result.insertedCount + " rows");
          res.send({ message: "Inserted: " + result.insertedCount + " rows" })
        });
      });
    });
});

router.delete('/deletecandidate/:id', (req, res) => {
  let id = req.params.id;
  const db = getDb();
  let candidates = db.collection('candidates');

  try {
    candidates.findOneAndDelete({ "_id": ObjectId(id) }, (err, result) => {
      if (err) {
        console.log("Did not delete")
      } else {
        console.log("Deleted user id: " + id + " successfully")
      }
    });
  } catch (e) {
    console.log(e);
  }
});

router.get('/updatecandidate/:id', (req, res) => {
  let id = req.params.id;
  const db = getDb();
  let candidates = db.collection('candidates');
  let communities = db.collection('communities');
  try {
    let communityNamesArray = []
    communities.find({}).toArray((err, communityRecords) => {
      for (let i in communityRecords) {
        let community = communityRecords[i];
        communityNamesArray.push(community.communityName);
      }
      candidates.findOne({ "_id": ObjectId(id) })
        .then(candidateFound => {
          console.log(candidateFound);

          res.render('updatecandidate', { candidateFound: candidateFound, communityNames: communityNamesArray });
        })
    });
  } catch (e) {
    console.log(e);

  }

});

router.post('/updatecandidate/:id', (req, res) => {

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
    "permanentAddress": {
      "houseNumber1": req.body.houseNumber1,
      "street1": req.body.street1,
      "ward1": req.body.ward1,
      "district1": req.body.district1,
      "city1": req.body.city1,
      "region": req.body.region
    },
    "communityAddress": {}
  };

  const db = getDb();
  let communities = db.collection('communities');
  communities.find({}).toArray((err, communityRecords) => {
    for (let i in communityRecords) {
      let perCommunity = communityRecords[i];
      for (let attribute in perCommunity) {
        let selectedCommunity = String(req.body.community);
        if (perCommunity[attribute] <= selectedCommunity && perCommunity[attribute] >= selectedCommunity) {
          updatedcandidate.communityAddress = perCommunity;
        }
      }
    }

    try {
      let candidates = db.collection('candidates');

      let id = req.params.id;
      console.log(updatedcandidate);

      candidates.findOneAndUpdate({ "_id": ObjectId(id) }, { $set: updatedcandidate })
        .then(result => {
          console.log(result);

        });
      candidates.find({}).toArray((err, candidateRecords) => {
        let activeArray = [];
        let excandidateArray = [];
        candidateRecords.forEach(candidate => {
          if (candidate.candidacyType === 'Ex-Candidate') {
            excandidateArray.push(candidate);
          } else {
            activeArray.push(candidate);
          }
        });
        res.render('candidates', { activeArray: activeArray, excandidateArray: excandidateArray });
      });
    } catch (e) {
      console.log(e);

    }

  });
});


module.exports = router;
