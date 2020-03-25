let express = require('express');
let router = express.Router();
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
  MongoClient.connect(url, (err, client) => {
    let communityNames = '';
    if (err) {
      console.log(err);
      res.render('homepage');
    }
    const db = client.db(dbName);
    let communities = db.collection('communities');
    communities.find({}).toArray((err, communityRecords) => {
      client.close();
      // console.log(communityRecords);
      let objArray = [];

      for(let i in communityRecords){
        let community = communityRecords[i];
        objArray.push(community.communityName);
      }

      for(let i=0; i<objArray.length; i++){
        communityNames = communityNames + '<option>' + objArray[i] + '</option>\n';
      }

      res.render('addcandidate', { communityRecords: communityNames });
    });

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

  MongoClient.connect(url, (err, client) => {
    if (err) {
      console.log(err);
      res.render('homepage');
    }
    const db = client.db(dbName);
    let communities = db.collection('communities');
    communities.find({}).toArray((err, communityRecords) => {
      
      for(let i in communityRecords){
        let eachCommunity = communityRecords[i];
        for(let attribute in eachCommunity){
          let com = String(req.body.community);
          if(eachCommunity[attribute] <= com && eachCommunity[attribute] >= com ){
            // console.log("hit")
            let array=[];
            array.push(eachCommunity)
            newCandidate.communityAddress = array;
          }
        }
      }
      let candidates = db.collection('candidates');

      const result = candidates.insertOne(newCandidate, {}, (error, result) => {
        if(error){
          console.log(error.message);
        }
      });

      client.close();
      res.redirect("candidates");
    });
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
      // console.log(candidateRecords)

      let count = 1;
      let tableRow = ""
      let value=""
      
      for(let index in candidateRecords){
        let eachCandidate = candidateRecords[index];
        tableRow =  tableRow + "<tr>\n<th scope=\"row\">" + count + "</th>\n";
        for (let attribute in eachCandidate) {
          if(attribute != '_id'){
            // console.log(eachCandidate[attribute])
            value = eachCandidate[attribute];
            if(attribute == "permanentAddress"){
              value = value[0]['region'];
            } else if(attribute == "communityAddress"){
              console.log(value[0])
              console.log("hitttttttttttttt")
              if(value[0]) {
                value = value[0]['communityName'];
              } else {
                value = "";
              }
            }

            tableRow = tableRow + "<td>" + value + "</td>\n";
          }
        }
        tableRow = tableRow + "</tr>\n"
        count++
      }
      res.render('candidates', { candidateRecords: tableRow});
    });

  });
});


module.exports = router;
