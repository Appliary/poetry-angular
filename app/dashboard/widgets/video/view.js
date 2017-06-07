app.controller( 'dashboard/widgets/video/view', function VideoWidget(
    $scope,
    $sce
) {
    $scope.trustUrl = $sce.trustAsResourceUrl;
} );
