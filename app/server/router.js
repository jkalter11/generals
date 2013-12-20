/**
 * Most of our game logic is done with Socket.IO
 * @param  {Object} app        The express framework application
 * @param  {Object} controller The game controller which handles our games
 */
exports.handle = function(app, controller) {

    app.get('/stats', function(request, response) {

        var gameInfos = [];

        for (var id in controller.gameDb._cache) {
            var game = controller.gameDb._cache[id];
            gameInfos.push({
                id: game.id,
                state: game.state,
                started: game.started,
                lastActivity: game.lastActivity,
                noChallengeCount: game.noChallengeCount,
                playerAName: game.playerA.name,
                playerBName: game.playerB ? game.playerB.name : ''
            });
        }

        response.send({
            count: gameInfos.length,
            online: gameInfos
        });
    });

};
