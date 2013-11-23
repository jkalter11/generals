TGO.Views.welcomeView = (function() {

    var view = new TGO.Models.EventEmitter();
    var playerName, gameId;

    function init() {
        playerName = $('#player-name-input');
        gameId = $('#game-id-input');

        $('#create-game').on('click', onCreateGameButtonClick);
        $('#join-game').on('click', onJoinGameGameButtonClick);

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

    view.init = init;
    return view;

})();
