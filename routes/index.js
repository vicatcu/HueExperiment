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
  });
});

module.exports = router;
