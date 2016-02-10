(function(){
    var app = angular.module('hue-lights', [ 'ngMaterial' ]);

    app.controller('LightsController', [ '$http', function($http){
        var mv = this;
        mv.target_light_id = 0;
        mv.lights = [];
        mv.current_colorxy = 0;
        mv.current_x = 0;
        mv.current_y = 0;
        mv.current_bri = 0;
        mv.current_colorxy = 0;
        mv.current_light_name = "Enter Light Name Here";

        // for the purposes of mapping a sliding scale onto the line
        mv.x_min = 0.13791673;
        mv.x_max = 0.70235455;
        mv.y_min = 0.06569707;
        mv.y_max = 0.2579223;

        var bri_min = 0;
        var bri_max = 255;

        mv.setXYColorBrightness = function(){
            $http.post('/light/' + mv.target_light_id + '/xybri', {
                x: mv.current_x,
                y: mv.current_y,
                brightness: mv.current_bri }
            ).success(function(data){
                console.log(data);
            }).error(function(err){
                console.log(err);
            });
        }

        mv.setOn = function(){
            $http.post('/light/' + mv.target_light_id + '/on').success(function(data){
                console.log(data);
            }).error(function(err){
                console.log(err);
            });
        }

        mv.setOff = function(){
            $http.post('/light/' + mv.target_light_id + '/off').success(function(data){
                console.log(data);
            }).error(function(err){
                console.log(err);
            });
        }

        mv.onBrightnessChange = function(){
            console.log("Brightness Slider: " + mv.current_bri);
            $http.post('/light/' + mv.target_light_id + '/xybri', {
                x: mv.current_x,
                y: mv.current_y,
                brightness: mv.current_bri
            }).success(function(data){
                console.log(data);
            }).error(function(err){
                console.log(err);
            });
        }

        mv.onXYColorChange = function(){
            console.log("ColorXY Slider: " + mv.current_colorxy );
            var x_span = mv.x_max - mv.x_min;
            var y_span = mv.y_max - mv.y_min;
            var slope = y_span / x_span;
            mv.current_x = mv.x_min + x_span * (mv.current_colorxy / 100);
            mv.current_y = mv.y_min + slope * mv.current_x;

            $http.post('/light/' + mv.target_light_id + '/xybri', {
                x: mv.current_x,
                y: mv.current_y,
                brightness: mv.current_bri
            }).success(function(data){
                console.log(data);
            }).error(function(err){
                console.log(err);
            });
        }

        mv.setLightName = function(){
            $http.post('/light/' + mv.target_light_id + '/name', {
                name: mv.current_light_name
            }).success(function(data){
                console.log(data);
                discoverLights();
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