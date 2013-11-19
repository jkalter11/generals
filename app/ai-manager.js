// our socket io client
var io = require('socket.io-client');

/**
 * When our server requests for a new AI player
 * Data: gameId, url (socket URL)
 */
process.on('message', function(data) {

    var socket = io.connect(data.url);
    var player = new AIPlayer('Jayjay', data.gameId);

    // this object contains all the event names that will
    // be communicated on Socket.IO, we take this from the
    // server so that we don't have to duplicate the names
    // at client side (see the "connected" IO event)
    var IOEvents;

    // when we connected, we want to watch for some events
    // which are defined in the server (IOEvents)
    socket.on('connected', function(data) {
        // let's get the event names from the server
        IOEvents = data;

        // now let's attach all our IO events
        socket.on(IOEvents.PLAYER_JOINED, onPlayerJoined);
        socket.on(IOEvents.PLAYER_TAKES_TURN, onPlayerTakesTurn);
        socket.on(IOEvents.PLAYER_LEFT, onPlayerLeft);

        // let our AI join the game
        socket.emit(IOEvents.PLAYER_JOIN, {
            playerName: player.name,
            gameId: player.gameId
        });
    });

    /**
     * Source:  Socket.IO
     * Handles: When the server says the player has joined the game
     * Data:    success, gameId, playerId, playerName
     */
    function onPlayerJoined(data) {
        // we are always the one joining this existing game
        player.id = data.playerId;
        // TODO: arrange game pieces
        player.generatePieces();
        // then submit immediately
        socket.emit(IOEvents.SUBMIT_PIECES, {
            gameId: player.gameId,
            playerId: player.id,
            gamePieces: player.pieces
        });
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

            // let's see if the human player challenges us and defeated us
            if (data.result.isChallenge) {
                var piece = player.getPiece(data.result.newPosition);
                if (data.result.isChallenge && data.result.challengeResult == 1) {
                    piece.position = -1;
                }
            }
            var result = player.movePiece();
            // select then take turn
            socket.emit(IOEvents.PIECE_SELECTED, {
                gameId: player.gameId,
                position: result.piece.position
            });
            setTimeout(function() {
                // emit so the human player can see our move
                socket.emit(IOEvents.PLAYER_TAKES_TURN, {
                    gameId: player.gameId,
                    playerId: player.id,
                    oldPosition: result.piece.position,
                    newPosition: result.newPosition
                });
                // update our position
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
        socket.disconnect();
        socket = null;
    }

});

function AIPlayer(name, gameId) {
    this.name = name;
    this.gameId = gameId;
    this.pieces = [];
 }

AIPlayer.prototype = {

    generatePieces: function() {
        this.pieces.length = 0;
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
        this.pieces.push({ code: 'FLG' });
        for (var i = 0; i < 6; i++) {
            this.pieces.push({ code: 'PVT' });
        }

        // now let's add the positions randomly
        // first lets build the array
        var start = 0, end = 26;
        if (!this.isCreated) {
            start = 45, end = 71;
        }
        var positions = [];
        while (start <= end) {
            positions.push(start);
            start++;
        }
        // simple randomization
        positions.sort(function() {
            return Math.random() - 0.5;
        });
        // now inject the random positions
        for (var i = 0, j = this.pieces.length; i < j; i++) {
            this.pieces[i].position = positions[i];
        }
    },
    movePiece: function() {
        var piece, newPosition;
        do {
            piece = this.pieces[Math.floor(Math.random() * this.pieces.length)];
            newPosition = this.nextMove(piece);
        } while (!newPosition);
        return {
            piece: piece,
            newPosition: newPosition
        };
    },
    nextMove: function(piece) {

        var position = piece.position;
        var row = Math.floor(position / 9);
        var nextPositions = [], nextPosition;

        // top and bottom
        nextPosition = position + 9;
        if (nextPosition < 72 && !this.getPiece(nextPosition)) {
            nextPositions.push(nextPosition);
        }
        nextPosition = position - 9;
        if (nextPosition > 0 && !this.getPiece(nextPosition)) {
            nextPositions.push(nextPosition);
        }
        // left and still on the same row
        nextPosition = position + 1;
        if (nextPosition < 72 && row == Math.floor((nextPosition) / 9) && !this.getPiece(nextPosition)) {
            nextPositions.push(nextPosition);
        }
        // right and still on the same row
        nextPosition = position - 1;
        if (nextPosition < 72 && row == Math.floor((nextPosition) / 9) && !this.getPiece(nextPosition)) {
            nextPositions.push(nextPosition);
        }

        return nextPositions[Math.floor(Math.random() * nextPositions.length)];
    },
    getPiece: function(position) {
        for (var i = 0, j = this.pieces.length; i < j; i++) {
            if (this.pieces[i].position == position) {
                return this.pieces[i];
            }
        }
        return null;
    }
};
