/**
 * The welcome view manages two things:
 *     1 Displays a small information about the game
 *     2 A game menu which asks the user how he/she will play
 *         - create a new game
 *         - join a newly created game
 */
TGO.Views.welcomeView = (function() {

    var view = new TGO.Models.EventEmitter();
    // the playerName jQuery input element
    var playerName;
    // the gameId jQuery input element
    var gameId;

    function init() {
        // the main content jQuery object that holds the main view
        playerName = $('#player-name-input');
        gameId = $('#game-id-input');

        $('#create-game').on('click', onCreateGameButtonClick);
        $('#join-game').on('click', onJoinGameGameButtonClick);

        // now all anchor links will also have to be opened in a new window
        // we could have done this in HTML but i feel it's very redundant
        $('.content a, .footer a').attr('target', '_blank');
    }

    function onCreateGameButtonClick(e) {
        e.stopPropagation();

        if (!areFieldsNotEmpty(playerName))
            return;

        view.emit(TGO.Views.Events.CREATE_GAME, { playerName: playerName.val() });
    }

    function onJoinGameGameButtonClick(e) {
        e.stopPropagation();

        if (!areFieldsNotEmpty(playerName, gameId))
            return;

        view.emit(TGO.Views.Events.JOIN_GAME, {
            playerName: playerName.val(),
            gameId: gameId.val()
        });
    }

    /**
     * Validates the jQuery objects if they have values or not
     * This also shows a message box if empty and focuses that field
     */
    function areFieldsNotEmpty() {
        for (var i = 0, j = arguments.length; i < j; i++) {
            var field = arguments[i];
            if (!field.val() || !field.val()) {
                TGO.Views.msgbox.show('A required field has no value. Click OK and we will focus on that field.', function() { field.focus(); });
                return false;
            }
        }
        return true;
    }

    view.init = init;
    return view;

})();
