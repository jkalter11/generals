TGO.Views.welcomeView = (function() {

    var view = new TGO.Models.EventEmitter();
    var playerName, gameId;

    function init() {
        playerName = $('#player-name-input');
        gameId = $('#game-id-input');

        playerName.val(getSavedPlayerName());

        $('#create-game').on('click', onCreateGameButtonClick);
        $('#join-game').on('click', onJoinGameGameButtonClick);

        $('.content a, .footer a').attr('target', '_blank');
    }

    function onCreateGameButtonClick(e) {
        e.stopPropagation();

        if (!areFieldsNotEmpty(playerName))
            return;

        savePlayerName(playerName.val());
        view.emit(TGO.Views.Events.CREATE_GAME, { playerName: playerName.val() });
    }

    function onJoinGameGameButtonClick(e) {
        e.stopPropagation();

        if (!areFieldsNotEmpty(playerName, gameId))
            return;

        savePlayerName(playerName.val());
        view.emit(TGO.Views.Events.JOIN_GAME, {
            playerName: playerName.val(),
            gameId: gameId.val()
        });
    }

    function areFieldsNotEmpty() {
        for (var i = 0, j = arguments.length; i < j; i++) {
            var field = arguments[i];
            if (!field.val() || !field.val()) {
                field.focus();
                return false;
            }
        }
        return true;
    }

    function getSavedPlayerName() {
        if (window.localStorage && window.localStorage['player-name']) {
            return window.localStorage['player-name'];
        }
    }

    function savePlayerName(playerName) {
        if (window.localStorage) {
            window.localStorage['player-name'] = playerName;
        }
    }

    view.init = init;
    return view;

})();
