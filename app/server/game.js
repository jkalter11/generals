/**
 * Use string utility functions
 */
var util = require('util');

/**
 * @class GameDb
 * Used to track and manage games created
 */
function GameDb() {
    // A hashset, the games created using the game ID as key
    this._cache = {};
    // Used to track the number of games added since our hash
    // do not have a length property
    this.count = 0;
}

/**
 * Gather all game IDs
 * @return {Array} An array of String (game IDs)
 */
GameDb.prototype.getAllIds = function() {
    // all game IDs are also the key names of the games in the cache
    return Object.keys(this._cache);
};

/**
 * Get the game from the cache, null if game does not exist
 * @param  {String} gameId The game ID of the game to get
 * @return {Game}   Returns the game object
 */
GameDb.prototype.get = function(gameId) {
    if (!this._cache[gameId]) {
        throw new Error('Game does not exist: ' + gameId);
    }
    return this._cache[gameId];
};

/**
 * Adds a new game to the cache
 * @param  {Game} game The game object
 * @return {Boolean}
 */
GameDb.prototype.add = function(game) {
    // we only add the game when it's not yet added to our cache
    if (!this._cache[game.id]) {

        // save this game and increase our counter
        this._cache[game.id] = game;
        this.count++;

        console.log('Game %s has been added to the game database. %d games online.', game.id, this.count);
        return true;
    }
    return false;
};

/**
 * Remove a game from the cache (to release memory)
 * @param  {String} gameId The game ID of the game to be removed
 * @return {Boolean}       Returns true on success, false otherwise
 */
GameDb.prototype.remove = function(gameId) {
    if (this._cache[gameId]) {
        delete this._cache[gameId];
        this.count--;
        console.log('Game has been removed from database: ' + gameId);
        return true;
    }
    console.log('Game does not exist and so was not removed from database: ' + gameId);
    return false;
};

/**
 * @class       Game
 * @description The main application
 */
function Game() {
    // generate the game ID
    this.id = Game.uuid();

    // initialize our board
    this.board = new Board();

    // set the game state to INITIALIZED
    this.state = Game.States.INITIALIZED;

    // this flag holds the number of consecutive moves where there is challenge
    // after that 50 moves, each player's pieces will be computed and the larger's
    // value will be declared the winner (or draw if both are equal)
    this.noChallengeCount = 0;
}

Game.prototype.createPlayer = function(playerName, isPlayerA) {
    // we only create the next player when we are in INITIALIZED state
    if (this.state != Game.States.INITIALIZED) {
        throw new Error('Game is not initialized. Game state: ' + this.state);
    }
    // and that the player is not yet set
    if ((this.playerA && isPlayerA) ||
        (this.playerB && !isPlayerA)) {
        throw new Error('Player is already set.');
    }
    // a player name is required for the opponent
    if (!playerName) {
        throw new Error('Player name is required to create a player.');
    }
    // create the player and set it below
    var player = new Player(Game.uuid(), playerName);
    if (isPlayerA) {
        this.playerA = player;
        // player A is always the first player
        this.currentPlayer = this.playerA;
    } else {
        this.playerB = player;
        // change the game state to READY since
        // we assume both players are already set
        this.state = Game.States.READY;
    }
};

/**
 * A helper method to get the player object from a player ID.
 * Returns null if not found
 * @param  {String} playerId The ID of the player
 * @return {Player}          The player object
 */
Game.prototype.getPlayer = function(playerId) {
    return playerId == this.playerA.id ? this.playerA : playerId == this.playerB.id ? this.playerB : null;
};

/**
 * Set the player pieces in the board and perform validation
 * @param {String} playerId The player to associate the pieces to
 * @param {Array} pieces    The Array of GamePieces
 */
Game.prototype.setPlayerPieces = function(playerId, pieces) {
    // we need 21 pieces
    if (!(pieces instanceof Array) || pieces.length != 21) {
        throw new Error('There should be 21 pieces.');
    }

    // we are expecting these game pieces to be just purely data
    // so we create the objects here
    for (var i = 0, j = pieces.length; i < j; i++) {
        var data = pieces[i];
        pieces[i] = new Piece(data.code);
        pieces[i].position = data.position;
    }

    // get the player based from ID
    var player = this.getPlayer(playerId);
    // place the pieces to the board, throws exception upon validation failure
    this.board.placePieces(pieces, playerId == this.playerA.id);
    // associate the pieces to the player
    player.setPieces(pieces);
    // if both players have submitted their pieces,
    // then we'll change the game state to START
    if (this.playerA.hasPieces() && this.playerB.hasPieces()) {
        this.state = Game.States.START;
    }
};

/**
 * Decides who will win in a challenge
 * @param  {GamePiece} challenger The challenger game piece
 * @param  {GamePiece} challenged The challenged game piece
 * @return {Number}               Returns  0 for equal,
 *                                         1 if challenger wins,
 *                                        -1 if challenger loses
 */
Game.prototype.challenge = function(challenger, challenged) {

    // equal ranks that are not flag, both pieces are eliminated
    if (challenger.rank == challenged.rank && challenger.rank) {
        return 0;
    }
    // if challenger is a spy against anything not pvt or
    // if challenger is pvt and challenged is spy, challenger wins
    if (challenger.code == 'SPY' && challenged.code != 'PVT' ||
        challenger.code == 'PVT' && challenged.code == 'SPY') {
        return 1;
    }
    // if challenger is not a private and challenged is a spy or
    // challenger is a spy but challenged is pvt, challenger loses
    if (challenger.code != 'PVT' && challenged.code == 'SPY' ||
        challenger.code == 'SPY' && challenged.code == 'PVT') {
        return -1;
    }
    // if both flags, challenger wins
    if (challenger.rank === 0 && challenged.rank === 0) {
        return 1;
    }
    // otherwise, determine based on rank
    return challenger.rank > challenged.rank ? 1 : challenger.rank == challenged.rank ? 0 : -1;
};

/**
 * A player takes his/her turn
 * @param  {String} playerId    The player ID of the player who takes turn
 * @param  {Number} oldPosition The old position of the piece in the game board
 * @param  {Number} newPosition The new position of the piece in the game board
 * @return {Boolean}            Returns true on successful move, false otherwise
 */
Game.prototype.takeTurn = function(playerId, oldPosition, newPosition) {
    // we should be in a start state to be able to move pieces
    if (this.state != Game.States.START) {
        throw new Error('Game should have been started. Game state: ' + this.state);
    }
    // the current player should also be the player ID passed
    if (this.currentPlayer.id != playerId) {
        throw new Error('Player ID passed is not the current player');
    }

    var player = this.getPlayer(playerId);
    var piece = player.getPiece(oldPosition);
    var result = this.board.movePiece(player, piece, newPosition, this.challenge);

    // let's move the piece, if a valid move, then change the current player and return true
    if (result.success) {
        this.currentPlayer = this.currentPlayer == this.playerA ? this.playerB : this.playerA;
    }
    // and to keep track of the 50-move rule
    if (result.isChallenge) {
        this.noChallengeCount = 0;
    } else {
        this.noChallengeCount++;
    }
    // and we will let the players know of the noChallengeCount
    result.noChallengeCount = this.noChallengeCount;
    return result;
};

/**
 * Checks if the game is over. The current player is the game winner.
 * @return {Boolean}
 */
Game.prototype.checkGameOver = function() {
    // it will be over if teh flag has reached the end
    // and the owner is also the current player
    if (this.board.hasFlagReachedEnd(this.currentPlayer, this.currentPlayer.id == this.playerA.id)) {
        this.state = Game.States.OVER;
        return true;
    }
    // it will be over when an opponent has no more flag piece in the board
    if (this.playerA.getFlag().position == -1) {
        this.state = Game.States.OVER;
        this.currentPlayer = this.playerB;
        return true;
    }
    // it will be over when an opponent has no more flag piece in the board
    if (this.playerB.getFlag().position == -1) {
        this.state = Game.States.OVER;
        this.currentPlayer = this.playerA;
        return true;
    }
    // now we'll see if the 50-move rule has been reached
    if (this.noChallengeCount > 50) {
        this.state = Game.States.OVER;
        var valueA = this.playerA.value();
        var valueB = this.playerB.value();

        if (valueA == valueB) {
            this.currentPlayer = null;
        } else if (valueA > valueB) {
            this.currentPlayer = this.playerA;
        } else {
            this.currentPlayer = this.playerB;
        }
        return true;
    }
    return false;
};

/**
 * A simple short UUID generator
 * @return {String} The ID generated
 */
Game.uuid = function() {
    return ('00000' + (Math.random() * Math.pow(36, 5) << 0).toString(36)).substr(-5);
};

/**
 * this is for testing only (unit testing), we generate pieces at client-side
 * although we validate them upon submition at server-side
 */
Game.generatePieces = function() {
    var pieces = [];
    pieces.push(new Piece('GOA'));
    pieces.push(new Piece('SPY'));
    pieces.push(new Piece('SPY'));
    pieces.push(new Piece('GEN'));
    pieces.push(new Piece('LTG'));
    pieces.push(new Piece('MAG'));
    pieces.push(new Piece('BRG'));
    pieces.push(new Piece('COL'));
    pieces.push(new Piece('LTC'));
    pieces.push(new Piece('MAJ'));
    pieces.push(new Piece('CPT'));
    pieces.push(new Piece('1LT'));
    pieces.push(new Piece('2LT'));
    pieces.push(new Piece('SGT'));
    pieces.push(new Piece('FLG'));
    for (var i = 0; i < 6; i++) {
        pieces.push(new Piece('PVT'));
    }
    return pieces;
};

/**
 * @enum INITIALIZED the game is created
 *       READY       the game has 2 players joined
 *       START       the players are taking turns
 *       OVER        the game is over
 */
Game.States = {
    INITIALIZED: 0,
    READY: 1,
    START: 2,
    OVER: 3
};

/**
 * @class          Player
 * @description    Represents the client side player data and behaviour
 */
function Player(id, name) {
    this.id = id;
    this.name = name;
    this.pieces = null;
}

/**
 * Associate the pieces to this player
 * @param {Array} pieces The game pieces of this player
 */
Player.prototype.setPieces = function(pieces) {
    // the game checks the number of pieces
    // the board checks the positioning of the pieces
    // now we check if all ranks are complete
    var allRanks = [
        'GOA', 'GEN', 'LTG', 'MAG', 'BRG', 'COL', 'LTC', 'MAJ', 'CPT', '1LT',
        '2LT', 'SGT', 'PVT', 'PVT', 'PVT', 'PVT', 'PVT', 'PVT', 'SPY', 'SPY', 'FLG'
        ];

    for (var i = 0, j = pieces.length; i < j; i++) {
        var index = allRanks.indexOf(pieces[i].code);

        if (index !== -1) {
            allRanks.splice(index, 1);
        }
    }
    if (allRanks.length) {
        throw new Error('The following ranks are NOT found: ' + JSON.stringify(allRanks));
    }
    this.pieces = pieces;
};

/**
 * Checks if the player already has pieces (and complete)
 * @return {Boolean}
 */
Player.prototype.hasPieces = function() {
    return this.pieces instanceof Array && this.pieces.length == 21;
};

/**
 * Checks whether this player has the parameter piece
 * @param  {Piece}   piece The game piece to check
 * @return {Boolean}
 */
Player.prototype.hasPiece = function(piece) {
    return this.pieces instanceof Array && this.pieces.indexOf(piece) !== -1;
};

/**
 * Get the flag piece of this player
 * @return {Piece} The Flag game piece
 */
Player.prototype.getFlag = function() {
    // we will cache the flag, btw
    if (!this.flag) {
        for (var i = 0, j = this.pieces.length; i < j; i++) {
            if (this.pieces[i].isFlag()) {
                this.flag = this.pieces[i];
                break;
            }
        }
    }
    return this.flag;
};

Player.prototype.value = function() {
    var value = 0;
    for (var i = 0, j = this.pieces.length; i < j; i++) {
        if (this.pieces[i].position != -1) {
            value += this.pieces[i].value;
        }
    }
    // let's round to 2 decimal places because Javascript
    // is not very good with numbers...tsk3x..
    return Math.round(value * 100) / 100;
};

/**
 * Get player's game piece by position
 * @param  {Number} position the position of the game piece
 * @return {Object}          The game piece
 */
Player.prototype.getPiece = function(position) {
    for (var i = 0; i < this.pieces.length; i++) {
        if (this.pieces[i].position == position) {
            return this.pieces[i];
        }
    }
    throw new Error('There is no game piece on the specified position: ' + position);
};

/**
 * @class       Piece
 * @description The rank is used in comparing, while value is used for computing when the game is a draw
 *              A position of -1 means the game piece is not on the game board
 * @param       {string} code the 3 digit code of the piece
 */
function Piece(code) {
    switch(code) {
        case 'GOA': this.rank = 14; this.value = 7.80; break;
        case 'SPY': this.rank = 13; this.value = 7.50; break;
        case 'GEN': this.rank = 12; this.value = 6.95; break;
        case 'LTG': this.rank = 11; this.value = 6.15; break;
        case 'MAG': this.rank = 10; this.value = 5.40; break;
        case 'BRG': this.rank =  9; this.value = 4.70; break;
        case 'COL': this.rank =  8; this.value = 4.05; break;
        case 'LTC': this.rank =  7; this.value = 3.45; break;
        case 'MAJ': this.rank =  6; this.value = 2.90; break;
        case 'CPT': this.rank =  5; this.value = 2.40; break;
        case '1LT': this.rank =  4; this.value = 1.95; break;
        case '2LT': this.rank =  3; this.value = 1.55; break;
        case 'SGT': this.rank =  2; this.value = 1.20; break;
        case 'PVT': this.rank =  1; this.value = 1.37; break;
        case 'FLG': this.rank =  0; this.value = 0.00; break;
        default: throw new Error('Game piece code is invalid: ' + code);
    }
    this.code = code;
    this.position = -1;
}

Piece.prototype.isFlag = function() {
    return this.code == 'FLG';
};

/**
 * @class       Board
 * @description A single-dimensional array representing the 9x8 board
 */
function Board() {
    this.pieces = new Array(72);
}

/**
 * Place the pieces to the board but perform validation before that
 * @param  {Array}  pieces    the game pieces
 * @param  {Boolean} isPlayerA Flag if the pieces are for the main player or not
 */
Board.prototype.placePieces = function(pieces, isPlayerA) {

    // the players start and end positions differ in the board
    // so we distinguish them here
    var minPos = isPlayerA ?  0 : 45,
        maxPos = isPlayerA ? 26 : 71;

    // first, validate the pieces' positions
    var takenPositions = [];
    for (var i = 0; i < pieces.length; i++) {
        var piece = pieces[i];
        // check if a piece has a position
        if (piece.position == -1) {
            throw new Error(util.format('[%s] has invalid position: -1', piece.code));
        }

        // check if the position is within range
        if (piece.position < minPos || piece.position > maxPos) {
            throw new Error(util.format('[%s]\'s position (%d) is out of range (%d, %d).', piece.code, piece.position, minPos, maxPos));
        }
        
        // check if there are no duplicate positions
        if (takenPositions.indexOf(piece.position) == -1) {
            takenPositions.push(piece.position);
        } else {
            throw new Error(util.format('[%s]\'s position (%d) is duplicate.', piece.code, piece.position));
        }

        // check if there is no other piece for that position
        if (this.pieces[piece.position]) {
            throw new Error(util.format('[%s]\'s position (%d) is taken.', piece.code, piece.position));
        }
    }

    // it passed so we set the board pieces
    for (var i = 0; i < pieces.length; i++) {
        this.pieces[pieces[i].position] = pieces[i];
    }
};

/**
 * Let's try to move the piece in the game board
 * @param  {Player}   player            The player who moves his/her piece
 * @param  {Piece}    piece             The game piece to be moved
 * @param  {Number}   newPosition       The new position of the game piece in the board
 * @param  {Function} challengeCallback If an opponent piece is present in the target position,
 *                                      then we have a challenge and we need to determine who will remain
 * @return {Object}                     The result object which contains the ff information:
 *                                          success: if the move is successful or not
 *                                          isChallenge: if this move has a challenge
 *                                          challengeResult: the result of the challenge
 *                                                           0 - equal or both pieces are removed
 *                                                           1 - challenger won
 *                                                          -1 - challenger lost
 */
Board.prototype.movePiece = function(player, piece, newPosition, challengeCallback) {

    var result = {
        success: false,
        isChallenge: false,
        challengeResult: 0
    };

    // check if the piece is actuall moving
    if (piece.position == newPosition || !this.isNewPositionValid(piece.position, newPosition)) {
        return result;
    }

    // check if we are moving on our own piece's position
    var newPositionPiece = this.pieces[newPosition];
    if (player.hasPiece(newPositionPiece)) {
        // you can't challenge your own piece
        return result;
    }

    // ok, we can safely move the piece
    // remove the piece from the board
    result.success = true;

    this.pieces[piece.position] = null;
    piece.position = -1;

    // if this is a challenge
    if (newPositionPiece) {
        result.isChallenge = true;
        result.challengeResult = challengeCallback(piece, newPositionPiece);

        if (result.challengeResult === 1) {
            // since this is a challenge and you beat the newPositionPiece
            newPositionPiece.position = -1;
            // let's move to the target position
            this.pieces[newPosition] = piece;
            piece.position = newPosition;
        } else if (result.challengeResult === 0) {
            newPositionPiece.position = -1;
            this.pieces[newPosition] = null;
        }
    } else {
        // let's move to the target position
        this.pieces[newPosition] = piece;
        piece.position = newPosition;
    }
    return result;
};

/**
 * Checks if the new position is a valid position in the game Board
 * A valid position is forward, backward and sideways only (1 block)
 * @param  {Number}  oldPos The old position
 * @param  {Number}  newPos The new position
 * @return {Boolean}
 */
Board.prototype.isNewPositionValid = function(oldPos, newPos) {
    return (
        oldPos - newPos == 9 || newPos - oldPos == 9 ||
        oldPos + 1 == newPos || oldPos - 1 == newPos
    );
};

/**
 * Checks whether the player's flag reached the opponent's end of the board
 * @param  {Player}  player    The player who moves his flag
 * @param  {Boolean} isPlayerA Flag if this is the main player (for determining the correct board position)
 * @return {Boolean}
 */
Board.prototype.hasFlagReachedEnd = function(player, isPlayerA) {
    return (
        player.getFlag().position >= (isPlayerA ? 63 : 0) && player.getFlag().position <= (isPlayerA ? 71 : 8)
    );
};

/**
 * Let's bring all these objects outside
 */
module.exports = {
    Game: Game,
    Piece: Piece,
    Player: Player,
    Board: Board,
    GameDb: GameDb
};
