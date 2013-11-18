// Import our game module
var gm = require('./game.js');

// let's instantiate our game in-memory database
// Our game does not really track a game after it's over
// This is like "play the game and forget after" so we don't
// really need persistence although to be able to scale,
// we may need to do that but for now, this will serve us.
// Let's tackle scalability later on
var gameDb = new gm.GameDb();

// The socket io object and the client socket object
var io = null, socket= null;

// this object holds name event constants both client and server
var IOEvents = {
    // from client
    CREATE_GAME: 'create-game',
    // from server
    GAME_CREATED: 'game-created',
    // from client
    PLAYER_JOIN: 'player-join',
    // from server
    PLAYER_JOINED: 'player-joined',
    // from client
    SUBMIT_PIECES: 'submit-pieces',
    // from server
    PIECES_SUBMITTED: 'pieces-submitted',
    // from client
    PIECE_SELECTED: 'piece-selected',
    // from client and server (cyclic)
    PLAYER_TAKES_TURN: 'player-takes-turn',
    // from client
    DISCONNECT: 'disconnect',
    // from server
    PLAYER_LEFT: 'player-left'
};

/**************************************************************
 PUBLIC API
 **************************************************************/

module.exports = {
    /**
     * This function is called by index.js to handle Socket.IO communications
     * @param io     The Socket.IO object
     * @param socket The Socket object from the connecting client
     */
    handle: function(_io, _socket) {

        io = _io;
        socket = _socket;

        socket.on(IOEvents.CREATE_GAME, onCreateGame);
        socket.on(IOEvents.PLAYER_JOIN, onPlayerJoin);
        socket.on(IOEvents.SUBMIT_PIECES, onSubmitPieces);
        socket.on(IOEvents.PIECE_SELECTED, onPieceSelected);
        socket.on(IOEvents.PLAYER_TAKES_TURN, onPlayerTakesTurn);
        socket.on(IOEvents.DISCONNECT, onDisconnect);

        // we send this event names at client side so it can be re-used
        socket.emit('connected', IOEvents);
    },

    /**
     * Let's expose the game database so that it can be accessed in the router
     * So that client can request some information from the database
     */
    gameDb: gameDb,

    /**
     * Cleans up our game database with inactive games
     */
    purgeGameDb: purgeGameDb
}

/*********************************************************************************************
 *
 * NOTES:
 *     Most emitted events have a "success" boolean flag to determine success or failure
 *     All error emitted events must have a "message" property that contains the error message
 *
 *********************************************************************************************/

/**
 * Called when a player at client side creates a new game
 * Handles: IOEvents.CREATE_GAME,
 * Emits:   IOEvents.GAME_CREATED
 * Data:    playerName
 */
function onCreateGame(data) {

    // let's do a clean up everytime a new game is requested
    // NOTE: Although we can do this outside of the application
    //       but we can do this for now, let's just take note.
    purgeGameDb();

    try {
        // let's create a new game
        var game = new gm.Game();
        // create our first player who creates this game
        game.createPlayer(data.playerName, true);

        // add the new game to our game database
        gameDb.add(game);

        // let's create a game room for this game
        this.join(game.id);

        // then we will let the client know that we are done
        // and since the player who emits this event is also
        // the only client for now, we'll talk to him/her directly
        this.emit(IOEvents.GAME_CREATED, {
            success: true,
            gameId: game.id,
            playerId: game.playerA.id,
            playerName: data.playerName
        });

    } catch (error) {
        emitError(this, IOEvents.GAME_CREATED, error);
    }
}

/**
 * Called when a new client connects to an existing game
 * Handles: IOEvents.PLAYER_JOIN
 * Emits:   IOEvents.PLAYER_JOINED
 * Data:    gameId, playerName
 */
function onPlayerJoin(data) {

    try {
        // let's retrieve the game from the database
        var game = gameDb.get(data.gameId);

        // TRY to join to the game (if possible)
        // these lines of codes will throw exception
        // when the game state is not valid
        game.createPlayer(data.playerName, false);

        // it looks like we are fine so, join the game room
        this.join(game.id);

        // and emit the "joined" event in the same room to ALL clients
        io.sockets.in(game.id).emit(IOEvents.PLAYER_JOINED, {
            success: true,
            gameId: game.id,
            playerId: game.playerB.id,
            playerName: data.playerName,
            opponentName: game.playerA.name
        });

    } catch (error) {
        emitError(this, IOEvents.PLAYER_JOINED, error);
    }
}

/**
 * Handles when one of the clients submit his/her game pieces
 * Handles: IOEvents.SUBMIT_PIECES
 * Emits:   IOEvents.PIECES_SUBMITTED
 * Data:    gameId, playerId, gamePieces(Array)
 */
function onSubmitPieces(data) {
    try {
        // let's get the game from the database
        var game = gameDb.get(data.gameId);

        // okay, let's do this, this method throws excetions for validation errors
        game.setPlayerPieces(data.playerId, data.gamePieces);

        // now, these game pieces needs to be broadcasted to the other
        // clients but we don't want to expose the ranks, just the positions
        var positions = [];
        for (var i = 0; i < data.gamePieces.length; i++) {
            positions.push(data.gamePieces[i].position);
        }

        // we emit the IOEvents.PIECES_SUBMITTED just for notification purposes
        // of the sender and putting the sent game-pieces of the other
        io.sockets.in(game.id).emit(IOEvents.PIECES_SUBMITTED, {
            success: true,
            playerId: data.playerId,
            positions: positions,
            // now we need to tell the client also that both
            // players have submitted their game pieces and
            // we can start the game starting with player A
            isStarted: game.state == gm.Game.States.START
        });

    } catch (error) {
        emitError(this, IOEvents.PIECES_SUBMITTED, error);
    }
}

/**
 * Handles the IO event where the player selects a game piece
 * Handles: IOEvents.PIECE_SELECTED
 * Emits:   IOEvents.PIECE_SELECTED
 * data:    position
 */
function onPieceSelected(data) {
    try {
        // let's get the game from the database
        var game = gameDb.get(data.gameId);
        this.broadcast.to(game.id).emit(IOEvents.PIECE_SELECTED, data);
    } catch (error) {
        emitError(this, IOEvents.PIECE_SELECTED, error);
    }
}

/**
 * Handles the IO event where the player submits his/her move to the server
 * This is a cyclic event, meaning both client and server sends
 * and receives this event until someone wins or someone disconnects
 * Handles: IOEvents.PLAYER_TAKES_TURN
 * Emits:   IOEvents.PLAYER_TAKES_TURN
 * data:    gameId, playerId, oldPosition, newPosition, isGameOver,
 *         result(Object - see game.board.movePiece())
 *         pieces(Array - all the game pieces when the game is over)
 */
function onPlayerTakesTurn(data) {

    try {
        // let's get the game from the database
        var game = gameDb.get(data.gameId);
        var result = game.takeTurn(data.playerId, data.oldPosition, data.newPosition);

        // let's augment the result object with the passed positions for the opponent
        result.oldPosition = data.oldPosition;
        result.newPosition = data.newPosition;

        // now, notify the clients
        if (result.success) {
            var isGameOver = game.checkGameOver();
            var pieces = false;
            // if it's game over, we will also send the game
            // pieces so that there will be no controversy
            if (isGameOver) {
                pieces = game.playerA.pieces.concat(game.playerB.pieces);
            }
            io.sockets.in(game.id).emit(IOEvents.PLAYER_TAKES_TURN, {
                success: true,
                playerId: game.currentPlayer ? game.currentPlayer.id : false,
                result: result,
                isGameOver: isGameOver,
                pieces: pieces,
                is30MoveRule: game.noChallengeCount > 30
            });
        } else {
            this.emit(IOEvents.PLAYER_TAKES_TURN, {
                success: false,
                error: 'Invalid move.'
            });
        }

    } catch (error) {
        emitError(this, IOEvents.PLAYER_TAKES_TURN, error);
    }
}

function onDisconnect() {
    // let's emit an event ONLY when we are not in the default blank room
    for (var room in io.sockets.manager.roomClients[this.id]) {
        if (room) {
            // this client has joined this non-empty room, hence we will notify
            // all the clients of this room that this client has left
            io.sockets.in(room.substr(1)).emit('player-left');
        }
    }
}

/**************************************************************
 UTILITY FUNCTIONS
 **************************************************************/

/**
 * Cleans up our database for orphaned games
 */
function purgeGameDb() {
    // io.sockets.manager.rooms is a hash, with the room name as a key to an array of socket IDs.
    var gameIds = [];
    for (var key in io.sockets.manager.rooms) {
        // NOTE: The room names will have a leading / character.
        gameIds.push(key.substr(1));
    }

    // now let's get all game ids from our game database
    var gameDbIds = gameDb.getAllIds();
    // let's keep track of the games deleted
    var deleted = 0;

    // now, delete the game if it's not being tracked by socket.io
    for (var i in gameDbIds) {
        var gameId = gameDbIds[i];
        if (gameIds.indexOf(gameId) == -1 && gameDb.remove(gameId)) {
            deleted++;
        }
    }
}

/**
 * A helper method to broadcast an error event, we broadcast the error
 * to the same event to the same client. We also log them so we can see
 * what actually happened.
 * @param  {String} eventName The name of the event
 * @param  {Object} error     The details of the Error
 */
function emitError(socket, eventName, error) {
    console.log(error);
    console.log(error.stack);
    socket.emit(eventName, { success: false, error: error.message });
}
