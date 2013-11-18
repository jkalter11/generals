/**
 * This contains our main namespace as well as library wrappers that should not go to controller and models
 * libraries used in views are exempted
 */

// declare our topmost namespace
TGO = {
    appName: 'The Generals Online v0.0.1',
    // our topmost namespace for models
    Models: {},
    // our topmost namespace for views
    Views: {}
};

/**
 * Our game object which mostly contains data and utility functions
 * because our game logic stays on the server (all validations are performed their)
 */
TGO.Models.game = {

    /**
     * This flag controls whether this client created the game
     * or this client just joined an existing game
     * @type {Boolean}
     */
    isCreated: false,

    /**
     * The name of the opponent
     * @type {String}
     */
    opponentName: 'Opponent',

    /**
     * The game pieces of the game, including the opponent
     * @type {Array}
     */
    pieces: [],

    /**
     * Initializes the game object
     * @param  {String} gameId     The id of the newly created game
     * @param  {String} playerId   The id of the client player
     * @param  {String} playerName The nam of the client player
     */
    init: function(gameId, playerId, playerName) {
        this.id = gameId;
        this.playerId = playerId;
        this.playerName = playerName;
    },

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
        // we need 6 privates
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

    /**
     * A helper method to get the game piece according to its position
     * @param  {Number} position The position of the game piece
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

/**
 * @class TGO.EventEmitter
 * A class that can manage event publishing and subscribing
 */
TGO.Models.EventEmitter = function() {
    // a hashset of all callback listeners for all events
    this._listeners = {};
};
TGO.Models.EventEmitter.prototype = {
    /**
     * Attach a callback to an event
     * @param  {String}   eventName Name of the event
     * @param  {Function} callback  The function to call when the event is emitted
     */
    on: function(eventName, callback) {
        this._listeners[eventName] = callback;
    },
    /**
     * Emits an event and calls all listening callbacks
     * @param  {String} eventName Name of the event
     * @param  {Object} args      (Optional) A hashset of arguments that wil be recieved by all listeners
     */
    emit: function(eventName, args) {
        if (this._listeners[eventName]) {
            this._listeners[eventName](args || {});
        }
    }
};
