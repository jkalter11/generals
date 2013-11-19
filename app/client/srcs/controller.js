/**
 * Handles OI Server-Client Communication
 */

var socket = io.connect(window.location.href);

// this object contains all the event names that will
// be communicated on Socket.IO, we take this from the
// server so that we don't have to duplicate the names
// at client side (see the "connected" IO event)
var IOEvents;

// our local reference for the objects to prevent too much typing
// as well as useful in minification
var game = TGO.Models.game,
    mainView = TGO.Views.mainView,
    welcomeView = TGO.Views.welcomeView,
    gameView = TGO.Views.gameView,
    msgbox = TGO.Views.msgbox;

// when we connected, we want to watch for some events
// which are defined in the server (IOEvents)
socket.on('connected', function(data) {
    // let's get the event names from the server
    IOEvents = data;

    // now let's attach all our IO events
    socket.on(IOEvents.GAME_CREATED, onGameCreated);
    socket.on(IOEvents.PLAYER_JOINED, onPlayerJoined);
    socket.on(IOEvents.PIECES_SUBMITTED, onPiecesSubmitted);
    socket.on(IOEvents.PIECE_SELECTED, onOpponentGamePieceSelected);
    socket.on(IOEvents.PLAYER_TAKES_TURN, onPlayerTakesTurn);
    socket.on(IOEvents.PLAYER_LEFT, onPlayerLeft);
});

// handle view events
welcomeView.on(TGO.Views.Events.CREATE_GAME, onViewCreateGame);
welcomeView.on(TGO.Views.Events.JOIN_GAME, onViewJoinGame);
gameView.on(TGO.Views.Events.PLAY_AI, onViewPlayAI);
gameView.on(TGO.Views.Events.SUBMIT_PIECES, onViewSubmitPieces);
gameView.on(TGO.Views.Events.GAME_PIECE_SELECTED, onViewGamePieceSelected);
gameView.on(TGO.Views.Events.TAKE_TURN, onViewMovesGamePiece);

// Now, let's start and see the welcome view
mainView.showWelcomeView();

/**
 * Source:  View
 * Handles: When the player want's to create a new game
 * Data:    playerName
 */
function onViewCreateGame(data) {
    socket.emit(IOEvents.CREATE_GAME, data);
}

/**
 * Source:  Socket.IO
 * Handles: When the server says we have created a game
 * Data:    success, gameId, playerId, playerName
 */
function onGameCreated(data) {
    if (data.success) {
        game.init(data.gameId, data.playerId, data.playerName);
        game.isCreated = true;
        mainView.showGameView(function() {
            gameView.onGameCreated(game);
        });
    } else {
        msgbox.show(data.error);
    }
}

/**
 * Source:  View
 * Handles: When a user likes to play with AI
 * Data:    gameId, playerName
 */
function onViewPlayAI() {
    socket.emit(IOEvents.PLAY_AI, {
        gameId: game.id
    });
}

/**
 * Source:  View
 * Handles: When a user likes to join an existing game
 * Data:    gameId, playerName
 */
function onViewJoinGame(data) {
    socket.emit(IOEvents.PLAYER_JOIN, data);
}

/**
 * Source:  Socket.IO
 * Handles: When the server says the player has joined the game
 * Data:    success, gameId, playerId, playerName
 */
function onPlayerJoined(data) {
    if (data.success) {
        // if the player is already set, then we assume we are the creator of this game
        if (game.playerId) {
            // we are the one creating the game so the player who joins is our opponent
            game.opponentName = data.playerName;
            gameView.onPlayerJoined(true);
            game.generatePieces();
            gameView.onGamePiecesCreated();
        } else {
            // we are joining this existing game
            game.init(data.gameId, data.playerId, data.playerName);
            game.opponentName = data.opponentName;
            // we did not create this game,
            // we joined this game
            game.isCreated = false;
            // update the view
            mainView.showGameView(function() {
                gameView.onPlayerJoined(false);
                game.generatePieces();
                gameView.onGamePiecesCreated();
            });
        }
    } else {
        msgbox.show(data.error);
    }
}

/**
 * Source:  View
 * Handles: When a user clicks the ready button (submits his/her game pieces)
 * Data:    gameId, playerId, gamePieces(Array)
 */
function onViewSubmitPieces(data) {
    socket.emit(IOEvents.SUBMIT_PIECES, data);
}

/**
 * Source:  Socket.IO
 * Handles: When the pieces have been submitted to the server
 * Data:    success, playerId, positions(Array of Ints), isStarted
 */
function onPiecesSubmitted(data) {
    if (data.success) {
        gameView.onGamePiecesSubmitted(data.playerId, data.positions, data.isStarted);
        // if the game has started, wait for the first player's move
        if (data.isStarted) {
            if (game.isCreated) {
                gameView.waitPlayersTurn();
            } else {
                gameView.waitForOpponentsTurn();
            }
        }
    } else {
        msgbox.show(data.error);
    }
}

/**
 * Source:  View
 * Handles: When a game piece is selected
 * Data:    gameId, position
 */
function onViewGamePieceSelected(data) {
    socket.emit(IOEvents.PIECE_SELECTED, data);
}

/**
 * Source:  Socket.IO
 * Handles: When the opponent has selected a game piece
 * Data:    position
 */
function onOpponentGamePieceSelected(data) {
    gameView.onOpponentGamePieceSelected(data.position);
}

/**
 * Source:  Socket.IO
 * Handles: When the player has taken turn
 * Data:    success, playerId, result
 */
function onPlayerTakesTurn(data) {
    if (data.success) {
        // let's inform the view that the move is valid
        gameView.onGamePieceMovedOrChallenged(data.result);
        if (data.isGameOver) {
            // the current player is the winner
            gameView.showGameOver(data);
        } else {
            // get the next turn
            if (data.playerId == game.playerId) {
                gameView.waitPlayersTurn();
            } else {
                gameView.waitForOpponentsTurn();
            }
        }
    } else {
        msgbox.show(data.error);
    }
}

function onViewMovesGamePiece(data) {
    socket.emit(IOEvents.PLAYER_TAKES_TURN, data);
}

/**
 * Source:  Socket.IO
 * Handles: A player has left the game by closing his browser
 *          or navigating to another address
 */
function onPlayerLeft(data) {
    console.log(data)
    msgbox.show('Your opponent has left the game. This game is over.', function() {
        window.location.reload();
    });
}
