// our socket-io client simulator
var io = require('socket.io-client');

// the names of our AI Players will be randomly picked from this list
var AI_PLAYER_NAMES = [
    'JayJay', 'Myka', 'Jojo', 'Marjun', 'Joy', 'Mary Joy', 'Primo', 'JayR',
    'Dodong', 'LG', 'John', 'GM', 'Gorio', 'Boy', 'Carmen', 'Bossing', 'En-en',
    'Ayen', 'Bebe', 'Dondon', 'Dayne'
    ];

var IOEvents, player;

/**
 * Handles process messages from the controller process
 * @param  {Object} data A hashset of
 *                       url    (for socket connection) and the
 *                       gameId of the game to join to
 */
process.on('message', function(data) {
    // connect our client socket
    var socket = io.connect(data.url);
    // pick a name for our AI
    var aiName = AI_PLAYER_NAMES[Math.floor(Math.random() * AI_PLAYER_NAMES.length)];
    // create our AI player object
    player = new AIPlayer(aiName, data.gameId);
    // once connected, let's attach our SocketIO event handlers
    socket.on('connected', function(data) {

        console.log('AI player "%s" connected to game "%s".', player.name, player.gameId);

        IOEvents = data;
        socket.on(IOEvents.PLAYER_JOINED, onPlayerJoined);
        socket.on(IOEvents.PLAYER_TAKES_TURN, onPlayerTakesTurn);
        socket.on(IOEvents.PLAYER_LEFT, onPlayerLeft);

        // let our AI PLAYER join the game
        socket.emit(IOEvents.PLAYER_JOIN, {
            playerName: player.name,
            gameId: player.gameId
        });
    });
    // we exit the process once the socket is disconnected
    socket.on('disconnected', function() {
        console.log('AI player "%s" disconnected from the game "%s".', player.name, player.gameId);
        process.exit(0);
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

        // then, Knuth Shuffle these positions
        var i = positions.length, j, temp;
        while (i--) {
            j = Math.floor(Math.random() * i);
            temp = positions[i];
            positions[i] = positions[j];
            positions[j] = temp;
        }

        // inject the random positions to the game pieces
        // or effectively place the game pieces in the board
        for (var i = 0, j = this.pieces.length; i < j; i++) {
            this.pieces[i].position = positions[i];
        }

        // we simply need our flag at the last row randomly
        var position = Math.floor(Math.random() * (71 - 63 + 1)) + 63;
        var piece = this.getPiece(position);
        // swap with the existing game piece if there is
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
     * NOTE: Our AI is pretty dumb for now, we can upgrade this
     * since this is done on a separate process so intensive
     * computation will be tolerated. Question is can I make
     * one good algorithm for this? LOL!
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

        // we have 0 to 4 available positions
        // so let's randomly pick from them (yeah, dumb)
        return nextPositions[Math.floor(Math.random() * nextPositions.length)];
    },

    /**
     * Check if position is within range
     * @param  {Number}  position The position to check
     * @return {Boolean}          true for a valid position
     */
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
    // then submit immediately after "some" time
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
    // we don't have to do anything here if it's game over
    if (data.isGameOver) {
        return;
    }

    // let's make the AI move a game piece
    if (data.playerId == player.id) {

        // let's see if the human player challenged and defeated/drawed us
        if (data.result.isChallenge) {
            var piece = player.getPiece(data.result.newPosition);
            if (data.result.isChallenge && data.result.challengeResult != -1) {
                // okay we are defeated or drawed so remove the piece from our board
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
        // emit after "some" time so the human player can see our selection and before we move the game piece
        setTimeout(function() {
            socket.emit(IOEvents.PLAYER_TAKES_TURN, {
                gameId: player.gameId,
                playerId: player.id,
                oldPosition: result.piece.position,
                newPosition: result.newPosition
            });
        }, 1000);

    } else {
        // let's respond to our move from the above code
        // and update our game piece's position
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
 * Handles: The human player left the game so let's destroy this process
 */
function onPlayerLeft(data) {
    this.disconnect();
}
