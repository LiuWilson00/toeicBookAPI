var express = require('express');
var router = express.Router();
const dbName = 'ToeicBook';
const MongoClient = require('mongodb').MongoClient;

const url = "mongodb+srv://Wilson:A888A777@cluster0-4bhqp.gcp.mongodb.net/test?retryWrites=true&w=majority";

//connect to mongodb , set collection name by function params ex:connectToCollection("Words")
async function connectToCollection(str) {
  let client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  let collection = await client.db(dbName).collection(str);
  return collection
}


//get Collection "Words" all data
async function getAllData(target) {

  let docs = ''
  await connectToCollection(target).then(
    collection => {
      docs = collection.find().toArray();
    }
  )

  return docs

}


//get Collection "Words" data by Id (params can use string)
async function getDataById(target, filterQuery) {


  let docs = ''
  await connectToCollection(target).then(
    collection => {
      docs = collection.find(filterQuery).toArray();
    }
  )

  return docs

}

//insert data,prams target need input collection name what your want to insert 
async function insertData(target, data) {
  let resJson = {}
  function insertCallBack(res, err) {
    console.log(err);
    resJson.mongoMsg = 'mongo err:' + err;
  }

  await connectToCollection(target).then(collection => {
    collection.insertOne(data).then(insertCallBack)
  })
  /// target collection !!!

  resJson.msg = resJson.msg === undefined ? "ok" : resJson.msg;
  resJson.insertOK = data;


  return resJson

}

//delete a data,prams target need input collection name what your want to delete,
//and filterQuery may be a object what can find target
async function deleteDataById(target, filterQuery) {
  let resJson = {}
  function deleteCallBack(res, err) {
    resJson.mongoMsg = 'mongo err:' + err;
  }


  await connectToCollection(target).then(
    collection => {
      docs = collection.deleteOne(filterQuery, deleteCallBack)
    }
  )
  resJson.target = filterQuery;
  return resJson

}


//update a data,prams target need input collection name what your want to update,
//and filterQuery may be a object what can find target
async function updateData(target, filterQuery, updateQuery) {
  console.log(filterQuery, updateQuery)
  let resJson = {}
  function updateCallBack(res, err) {
    // console.log(err);
    resJson.mongoMsg = 'mongo err:' + err;
  }

  await connectToCollection(target).then(collection => {
    collection.updateOne(filterQuery, updateQuery, updateCallBack)
  })
  /// target collection !!!

  resJson.msg = resJson.msg === undefined ? "ok" : resJson.msg;
  resJson.target = filterQuery;
  resJson.update = updateQuery;


  return resJson

}

function setCORSHeader(res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
}


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
//Data read all
router.get('/getWordList', function (req, res, next) {

  setCORSHeader(res);

  // res.send(req.params.photoId);

  getAllData("Words").then(
    data => {
      res.send(data)
    }
  )


});

//Data read one
router.get('/getWordById/:wordId', function (req, res, next) {

  setCORSHeader(res);
  // res.send(req.params.photoId);

  getDataById("Words", { wordId: parseInt(req.params.wordId) }).then(
    data => {
      res.send(data)
    }
  )


});

//Data Creat one
router.post('/insertWord', function (req, res, next) {

  // console.log(req.body)
  setCORSHeader(res);

  insertData("Words", req.body).then(
    jsonMsg => {
      res.json(jsonMsg);
    }
  );

})


//Data Update one
router.put('/updateWord/:wordId', function (req, res, next) {

  // console.log(req.params.wordId, req.body)
  setCORSHeader(res);
  let reqData = req.body
  let updateObjKeys = Object.keys(reqData).filter(key => ['wordId', '_id'].indexOf(key) < 0)
  let newObj = {}
  updateObjKeys.forEach(
    key => {
      newObj[key] = reqData[key]
    }
  )
  updateData("Words", { wordId: parseInt(req.params.wordId) }, { $set: newObj }).then(
    jsonMsg => {
      res.json(jsonMsg);
    }
  );

})

//Data Delete one
router.delete('/deleteWordById/:wordId', function (req, res, next) {

  setCORSHeader(res);
  // res.send(req.params.photoId);

  deleteDataById("Words", { wordId: parseInt(req.params.wordId) }).then(
    data => {
      res.send(data)
    }
  )


});

router.get('/getNextInsertId', function (req, res, next) {
  function findNextId(Arr) {

    Arr.sort(
      (a, b) => {
        return a.wordId - b.wordId
      }
    )

    return Arr[Arr.length - 1]
  }
  setCORSHeader(res);
  // res.send(req.params.photoId);



  getAllData("Words").then(
    data => {


      res.send({ wordId: findNextId(data).wordId + 1 })
    }
  )

});

router.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.send(200);
  }
  else {
    next();
  }
});

module.exports = router;
