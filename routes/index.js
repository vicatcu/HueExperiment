var expressPromiseRouter = require("express-promise-router");
var router = expressPromiseRouter();
var Promise = require("bluebird");
var huewrapper = require("../huewrapper");

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/lights', function(req, res){
  Promise.try(function(){
    return huewrapper.getLights();
  }).then(function(lights){
    return res.json(lights);
  }).catch(function(err){
    console.log(err);
    return res.json([]);
  });
});

router.post('/light/:id/on', function(req, res){
  //console.log(req.params.id);
  //console.log(req.body);
  Promise.try(function() {
    return huewrapper.setOn(req.params.id);
  }).then(function(){
    res.send({ok: true});
  }).catch(function(err){
    res.send({ok: false, err: err});
  });
});

router.post('/light/:id/off', function(req, res){
  //console.log(req.params.id);
  //console.log(req.body);
  Promise.try(function(){
    return huewrapper.setOff(req.params.id);
  }).then(function(){
    res.send({ok: true});
  }).catch(function(err){
    res.send({ok: false, err: err});
  });
});

module.exports = router;
