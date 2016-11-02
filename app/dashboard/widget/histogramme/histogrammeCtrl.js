app.controller('histogrammeCtrl',function($scope,$interval,$log){
    
    $scope.widget.isChart = true;
    if(!$scope.widget.chartObject){
      $scope.widget.chartObject = {};
      $scope.widget.chartObject.type = "Histogram";
      $scope.widget.chartObject.data = [
          ['Dinosaur', 'Length'],
          ['Acrocanthosaurus (top-spined lizard)', Math.random() * (15 - 10) + 10],
          ['Albertosaurus (Alberta lizard)', 9.1],
          ['Allosaurus (other lizard)', 12.2],
          ['Apatosaurus (deceptive lizard)', 22.9],
          ['Archaeopteryx (ancient wing)', 0.9],
          ['Argentinosaurus (Argentina lizard)', 36.6],
          ['Baryonyx (heavy claws)', 9.1],
          ['Brachiosaurus (arm lizard)', Math.random() * (50 - 10) + 10],
          ['Ceratosaurus (horned lizard)', 6.1],
          ['Coelophysis (hollow form)', 2.7],
          ['Compsognathus (elegant jaw)', 0.9],
          ['Deinonychus (terrible claw)', 2.7],
          ['Diplodocus (double beam)', Math.random() * (30 - 20) + 20],
          ['Dromicelomimus (emu mimic)', 3.4],
          ['Gallimimus (fowl mimic)', Math.random() * (10 - 2) + 2],
          ['Mamenchisaurus (Mamenchi lizard)', 21.0],
          ['Megalosaurus (big lizard)', 7.9],
          ['Microvenator (small hunter)', 1.2],
          ['Ornithomimus (bird mimic)', 4.6],
          ['Oviraptor (egg robber)', 1.5],
          ['Plateosaurus (flat lizard)', 7.9],
          ['Sauronithoides (narrow-clawed lizard)', 2.0],
          ['Seismosaurus (tremor lizard)', 45.7],
          ['Spinosaurus (spiny lizard)', 12.2],
          ['Supersaurus (super lizard)', Math.random() * (30 - 10) + 10],
          ['Tyrannosaurus (tyrant lizard)', 15.2],
          ['Ultrasaurus (ultra lizard)', Math.random() * (30 - 10) + 10],
          ['Velociraptor (swift robber)', 1.8]
      ];

      $scope.widget.chartObject.options = {
            title: 'Lengths of dinosaurs, in meters',
            legend: { position: 'center' },
      };
    }
   
    // ------------------ Functions -----------------------

    $scope.initWidgetData=function()
    {
        var intervalPromise=$interval($scope.loadData, 1000);
         $scope.$on('$destroy', function() {
            $interval.cancel(intervalPromise);
        });
    };
})