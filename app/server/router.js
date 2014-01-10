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
                started: formatDateTime(game.started),
                lastActivity: formatDateTime(game.lastActivity),
                noChallengeCount: game.noChallengeCount,
                playerAName: game.playerA.name,
                playerBName: game.playerB ? game.playerB.name : '',
                winner: game.currentPlayer ? game.currentPlayer.name : '[draw]'
            });
        }

        response.send({
            'Games since last GC': gameInfos.length,
            'Server Date and Time': formatDateTime(new Date()),
            'Games Online': gameInfos
        });
    });

};

function formatDateTime(dateTime) {
    var arr = (dateTime + '').split(' ');
    return [arr[3], arr[1], arr[2], arr[4]].join(' ');
}
