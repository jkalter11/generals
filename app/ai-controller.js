// our socket io client
var io = require('socket.io-client');
// the names of our AIs will be randomly picked from this list
var aiNames = [ 'Jayjay', 'Myka', 'Jojo', 'Marjun', 'Joy', 'May Joy' ];

// this object contains all the event names that will
// be communicated on Socket.IO, we take this from the
// server so that we don't have to duplicate the names
// at client side (see the "connected" IO event)
var IOEvents;
// our AI player object
var player;

/**
 * When our server requests for a new AI player
 * Data: gameId, url (socket URL)
 */
process.on('message', function(data) {
    // let's connect our socket
    var socket = io.connect(data.url);
    // initialize our AI player
    player = new AIPlayer(aiNames[Math.floor(Math.random() * aiNames.length)], data.gameId);

    // when we connected, we want to watch for some events
    // which are defined in the server (IOEvents)
    socket.on('connected', function(data) {
        // let's get the event names from the server
        IOEvents = data;

        console.log('AI player "%s" connected to game "%s".', player.name, player.gameId);

        // now let's attach all our IO events (the only event that matters for our AI)
        socket.on(IOEvents.PLAYER_JOINED, onPlayerJoined);
        socket.on(IOEvents.PLAYER_TAKES_TURN, onPlayerTakesTurn);
        socket.on(IOEvents.PLAYER_LEFT, onPlayerLeft);

        // let our AI join the game
        socket.emit(IOEvents.PLAYER_JOIN, {
            playerName: player.name,
            gameId: player.gameId
        });
    });

    socket.on('disconnected', function() {
        console.log('AI player "%s" left the game "%s".', player.name, player.gameId);
    });

});

/**
 * @class AIPlayer
 * @param {String} name   The name of our AI player
 * @param {String} gameId The ID of the game our AI player will join to
 */
function AIPlayer(name, gameId) {
    this.name = name;
    this.gameId = gameId;
    this.pieces = [];
 }

AIPlayer.prototype = {

    generatePieces: function() {
        // our flag will be placed on the last row so we create a reference here
        var flag = { code: 'FLG' };

        this.pieces.push({ code: 'GOA' });
        this.pieces.push({ code: 'SPY' });
        this.pieces.push({ code: 'SPY' });
        this.pieces.push({ code: 'GEN' });
        this.pieces.push({ code: 'LTG' });
        this.pieces.push({ code: 'MAG' });
        this.pieces.push({ code: 'BRG' });
        this.pieces.push({ code: 'COL' });
        this.pieces.push({ code: 'LTC' });
        this.pieces.push({ code: 'MAJ' });
        this.pieces.push({ code: 'CPT' });
        this.pieces.push({ code: '1LT' });
        this.pieces.push({ code: '2LT' });
        this.pieces.push({ code: 'SGT' });
        for (var i = 0; i < 6; i++) {
            this.pieces.push({ code: 'PVT' });
        }
        this.pieces.push(flag);

        // now let's add the positions randomly
        // first lets build the array of positions
        var start = 45, end = 71;
        var positions = [];
        while (start <= end) {
            positions.push(start);
            start++;
        }
        // Knuth Shuffle our positions
        var i = positions.length, j, temp;
        while (i--) {
            j = Math.floor(Math.random() * (i - 1));
            temp = positions[i];
            positions[i] = positions[j];
            positions[j] = temp;
        }
        // now inject the random positions
        for (var i = 0, j = this.pieces.length; i < j; i++) {
            this.pieces[i].position = positions[i];
        }
        // we simply need our flag at the last row randomly
        var position = Math.floor(Math.random() * (71 - 63 + 1)) + 63;
        var piece = this.getPiece(position);
        if (piece) {
            piece.position = flag.position;
        }
        flag.position = position;
    },

    /**
     * Selects a random game piece and a random move
     * @return {Object} The game piece and the new position
     */
    movePiece: function() {
        var piece, newPosition;
        do {
            piece = this.pieces[Math.floor(Math.random() * this.pieces.length)];
            if (piece.position != -1) {
                newPosition = this.nextMove(piece);
            }
        } while (!newPosition);
        return {
            piece: piece,
            newPosition: newPosition
        };
    },

    /**
     * Computes the next possible move of the given game piece
     * @param  {Object}  piece The game piece to move
     * @return {Integer}       The new position
     */
    nextMove: function(piece) {

        var position = piece.position;
        var row = Math.floor(position / 9);
        var nextPositions = [], nextPosition;

        // top and bottom
        nextPosition = position + 9;
        if (this.isValidPosition(nextPosition) && !this.getPiece(nextPosition)) {
            nextPositions.push(nextPosition);
        }
        nextPosition = position - 9;
        if (this.isValidPosition(nextPosition) && !this.getPiece(nextPosition)) {
            nextPositions.push(nextPosition);
        }
        // left and still on the same row
        nextPosition = position + 1;
        if (this.isValidPosition(nextPosition) && row == Math.floor((nextPosition) / 9) && !this.getPiece(nextPosition)) {
            nextPositions.push(nextPosition);
        }
        // right and still on the same row
        nextPosition = position - 1;
        if (this.isValidPosition(nextPosition) && row == Math.floor((nextPosition) / 9) && !this.getPiece(nextPosition)) {
            nextPositions.push(nextPosition);
        }

        return nextPositions[Math.floor(Math.random() * nextPositions.length)];
    },

    isValidPosition: function(position) {
        return position > -1 && position < 72;
    },

    /**
     * Get the piece from the specified position
     */
    getPiece: function(position) {
        for (var i = 0, j = this.pieces.length; i < j; i++) {
            if (this.pieces[i].position == position) {
                return this.pieces[i];
            }
        }
        return null;
    }
};

////////////////////////
/// IO Event Handlers //
////////////////////////

/**
 * Source:  Socket.IO
 * Handles: When the server says the player has joined the game
 * Data:    success, gameId, playerId, playerName
 */
function onPlayerJoined(data) {
    // we are always the one joining an existing game
    player.id = data.playerId;
    player.generatePieces();
    // then submit immediately after some time
    // so the human player can view the message
    var socket = this;
    setTimeout(function() {
        socket.emit(IOEvents.SUBMIT_PIECES, {
            gameId: player.gameId,
            playerId: player.id,
            gamePieces: player.pieces
        });
    }, 1000);
}

/**
 * Source:  Socket.IO
 * Handles: When the player has taken turn
 * Data:    success, playerId
 */
function onPlayerTakesTurn(data) {
    if (data.isGameOver) {
        return;
    }

    // get the next turn
    if (data.playerId == player.id) {

        // let's see if the human player challenged and defeated/drawed us
        if (data.result.isChallenge) {
            var piece = player.getPiece(data.result.newPosition);
            if (data.result.isChallenge && data.result.challengeResult != -1) {
                // okay we are defeated or drawed
                piece.position = -1;
            }
        }
        // let's randomly move our game piece
        var result = player.movePiece();
        // emit selection so the human player can view which piece we are going to move
        this.emit(IOEvents.PIECE_SELECTED, {
            gameId: player.gameId,
            position: result.piece.position
        });

        var socket = this;
        // emit after some time so the human player can see our selection and move
        setTimeout(function() {
            socket.emit(IOEvents.PLAYER_TAKES_TURN, {
                gameId: player.gameId,
                playerId: player.id,
                oldPosition: result.piece.position,
                newPosition: result.newPosition
            });
        }, 1000);

    } else {
        var piece = player.getPiece(data.result.oldPosition);
        if (data.result.isChallenge && data.result.challengeResult != 1) {
            piece.position = -1;
        } else {
            piece.position = data.result.newPosition;
        }
    }
}

/**
 * Source:  Socket.IO
 * Handles: A player has left the game by closing his browser
 *          or navigating to another address
 */
function onPlayerLeft(data) {
    this.disconnect();
    process.exit(0);
}
