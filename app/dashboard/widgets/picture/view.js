app.controller( 'dashboard/widgets/picture/view', function VideoWidget(
    $scope,
    $sce
) {
    $scope.trustUrl = $sce.trustAsResourceUrl;
} );
