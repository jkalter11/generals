tgo.views.welcomeView = (function() {

    var view = new tgo.views.View();
    var playerName, gameId;

    view.templateId = 'welcome-template';
    view.init = function() {
        playerName = $('#player-name-input');
        gameId = $('#game-id-input');
        // let's use the last saved name to spare the user from
        // retyping his name all over again
        playerName.val(getSavedPlayerName());

        $('#create-game').on('click', onCreateGameButtonClick);
        $('#join-game').on('click', onJoinGameGameButtonClick);
    };

    function onCreateGameButtonClick(e) {
        e.stopPropagation();

        if (!areFieldsNotEmpty(playerName))
            return;

        savePlayerName(playerName.val());
        view.emit(tgo.views.Events.CREATE_GAME, {
            playerName: playerName.val()
        });
    }

    function onJoinGameGameButtonClick(e) {
        e.stopPropagation();

        if (!areFieldsNotEmpty(playerName, gameId))
            return;

        savePlayerName(playerName.val());
        view.emit(tgo.views.Events.JOIN_GAME, {
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

    return view;

})();
