var HueApi = require("node-hue-api").HueApi;
var hue = require("node-hue-api");
var Promise = require("bluebird");
var fs = require("fs");
var path = require('path');
Promise.promisifyAll(fs);

module.exports = (function(bridgeip){
    var api;
    var bridegip;
    var username = "temporary";
    var credentials_filename = path.join(__dirname, 'huecredentials.json');
    var ready = false;

    Promise.try(function(){
        // try and load the credentials file
        return fs.readFileAsync(credentials_filename, "utf8");
    }).then(function(fileContents){
        // if it exists grab the 'username' out of it
        var obj = JSON.parse(fileContents);
        username = obj.username;
    }).catch(function(exception){
        // if it doesn't exist, no big deal, but we'll have to create a user
        console.log("No config file created yet");
    }).then(function(){
        return hue.nupnpSearch().then(function(bridge) {
            // find the hub
            console.log("Hue Bridge Found: " + JSON.stringify(bridge));
            if(bridge.length > 0) {
                bridegip = bridge[0].ipaddress;
            }
            else{
                throw "Hue Bridge not found";
            }
        }).then(function(){
            // create the api object
            api = new HueApi(bridegip, username);

            // and ask for the config, to validate your authentication
            return api.config();
        }).then(function(config){
            // check whether the existing username is authenticated
            console.log("Hue Bridge API Version: " + config.apiversion);
            if(!config.ipaddress){ // not authenticated
                // if not, create a new user
                return createNewUser();
            }
            else{
                console.log("Successfully Logged in with Existing User");
                ready = true;
            }
        }).catch(function(err){
            console.log(err);
        });
    });

    function createNewUser(){
        return api.registerUser(bridegip, "Air Quality Egg").then(function(result){
            console.log("New User Successfully Created");
            username = result;
            ready = true;
            return fs.writeFileAsync(credentials_filename, JSON.stringify({username: username}));
        }).fail(function(err){
            console.log(err);
        }).done();
    }

    var getLights = function(){
        if(ready){
            var lights = [];
            return Promise.try(function(){
                return api.lights().then(function(results){
                    if(results.lights){
                        return results.lights;
                    }
                    return [];
                });
            }).map(function(light){
                var obj = {};
                obj[light.id] = {};
                return obj;
            }).map(function(task){
                // for each light, ask the hub for its full state
                var id = Object.keys(task)[0];
                return Promise.try(function(){
                    return api.lightStatus(id);
                }).then(function(light){
                    task[id] = light;
                    return task;
                });
            }).filter(function(task){
                // we only care about those lights which are reachable
                var id = Object.keys(task)[0];
                return task[id].state.reachable;
            }).map(function(task){
                var id = Object.keys(task)[0];
                var obj = task[id];
                obj.id = id;
                return obj;
            }).then(function(tasks){
                    return tasks;
            });
        }
        else{
            return [];
        }
    };

    function setColorXY(id, x, y){

    }

    function setBrightness(id, brightness){

    }

    function setOn(id){
        if(ready){
            return api.setLightState(id, {"on": true});
        }
        else{
            throw "API not ready";
        }
    }

    function setOff(id){
        if(ready){
            return api.setLightState(id, {"on": false});
        }
        else{
            throw "API not ready";
        }
    }

    return {
        username: username,
        getLights: getLights,
        setColorXY: setColorXY,
        setBrightness: setBrightness,
        setOn: setOn,
        setOff: setOff
    };
})();