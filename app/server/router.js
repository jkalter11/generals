/**
 * Most of our game logic is done with Socket.IO
 * @param  {Object} app        The express framework application
 * @param  {Object} controller The game controller which handles our games
 */
exports.handle = function(app, controller, config) {

    app.get('/purge-db', function(request, response) {
        response.send({
            gameCount: controller.purgeGameDb()
        });
    });

    app.get('/stats', function(request, response) {
        response.send({
            gameCount: controller.gameDb.count.toLocaleString(),
            siteVisits: siteVisitCounter.toLocaleString()
        });
    });

}