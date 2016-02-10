(function(){
    var app = angular.module('hue-lights', [ ]);

    app.controller('LightsController', [ '$http', function($http){
        var mv = this;
        mv.target_light_id = 0;
        mv.lights = [];

        mv.on = function(){
            $http.post('/light/' + mv.target_light_id + '/on').success(function(data){
                console.log(data);
            }).error(function(err){
                console.log(err);
            });
        }

        mv.off = function(){
            $http.post('/light/' + mv.target_light_id + '/off').success(function(data){
                console.log(data);
            }).error(function(err){
                console.log(err);
            });
        }

        // kick off a timer to get the lights every 15 seconds
        function discoverLights(){
            $http.get("/lights").success(function(data){
                mv.lights = data;
            }).error(function(err){
                console.log(err);
            });
        }

        setTimeout( function(){
            discoverLights();
        }, 3000);

        setInterval(function(){
            discoverLights();
        }, 15000);

    }]);

})();