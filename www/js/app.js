// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })
  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('map', {
        url: '/',
        templateUrl: 'templates/map.html',
        controller: 'MapCtrl'
      });

    $urlRouterProvider.otherwise("/");

  })
  .controller('MapCtrl', function ($scope, $state, $cordovaGeolocation, $ionicModal, $http) {
    var options = {timeout: 10000, enableHighAccuracy: true};

    //Disse bruges til at sende med, når vi registrerer.
    var myLat;
    var myLng;

    //Getting current location with callback.
    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {

      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      myLat = position.coords.latitude;
      myLng = position.coords.longitude;

      console.log("myLat:" + myLat); //DET STØRSTE TAL (1)

      var mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      console.log("myLat--- " + myLat);
      console.log("myLng--- " + myLng);

      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

      //Wait until the map is loaded, this adds a marker to the center og the map, where we're located.
      google.maps.event.addListenerOnce($scope.map, 'idle', function () {

        var marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          icon: new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/icons/" + "blue.png"),
          position: latLng
        });

        //Wait until the map is loaded, adds popup with location info. (the "content")
        var infoWindow = new google.maps.InfoWindow({
          content: "Here I am!"
        });

        google.maps.event.addListener(marker, 'click', function () {
          infoWindow.open($scope.map, marker);
        });

      });

    }, function (error) {
      console.log("Could not get location");
    });

    //MODAL CODE
    $ionicModal.fromTemplateUrl('my-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function () {
      $scope.modal.show();
    };
    $scope.closeModal = function () {
      $scope.modal.hide();
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
      // Execute action
    });

    $scope.user = {};
    $scope.registerUser = function (user) {
      $scope.modal.hide();
      user.loc = [];
      user.loc.push(myLng); //Important, longitude first
      user.loc.push(myLat);
      console.log(JSON.stringify(user));

      $http({
        method: "POST",
        url: "http://ionicbackend-plaul.rhcloud.com/api/friends/register/" + user.distance,
        data: user
      }).then(function (res, req) {
        console.log(res);

        if (res.data.length >= 1) {
          console.log("USERS SIZE: " + res.data.length);

          for (var i = 0; i < res.data.length; i++) {

            google.maps.event.addListenerOnce($scope.map, 'idle', function () {

              var latLng = new google.maps.LatLng(parseFloat(res.data[i].loc[1]), parseFloat(res.data[i].loc[0]));

              //Create a marker in the users LatLng
              var marker = new google.maps.Marker({
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                icon: new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/icons/" + "red.png"),
                position: latLng
              });

              //adds popup with location info. (the "content")
              var infoWindow = new google.maps.InfoWindow({
                content: res.data[i].userName
              });

              //Shows the stuff when the marker is clicked
              google.maps.event.addListener(marker, 'click', function () {
                infoWindow.open($scope.map, marker);
              });

            }, function (error) {
              console.log("Could not get location");
            });
          }
        } else {
          alert("No friends found in selected distence!")
        }


      })
    };


  });
