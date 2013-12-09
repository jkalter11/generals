tgo.views.welcomeView = (function() {

    var view = new tgo.views.View();
    var playerName, gameId, createGameButton, joinGameButton;

    view.templateId = 'welcome-template';
    view.init = function() {
        playerName = $('#player-name-input');
        gameId = $('#game-id-input');
        // let's use the last saved name to spare the user from
        // retyping his name all over again
        playerName.val(getSavedPlayerName());

        createGameButton = $('#create-game');
        joinGameButton = $('#join-game');

        createGameButton.on('click', onCreateGameButtonClick);
        joinGameButton.on('click', onJoinGameGameButtonClick);
    };
    view.enableButtons = function() {
        createGameButton.prop('disabled', false);
        joinGameButton.prop('disabled', false);
    };

    function onCreateGameButtonClick(e) {
        e.stopPropagation();

        if (!areFieldsNotEmpty(playerName))
            return;

        savePlayerName(playerName.val());
        view.emit(tgo.views.Events.CREATE_GAME, {
            playerName: playerName.val()
        });

        this.disabled = true;
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

        this.disabled = true;
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
        return createRandomPlayerName(10);
    }

    function savePlayerName(playerName) {
        if (window.localStorage) {
            window.localStorage['player-name'] = playerName;
        }
    }

    // http://james.padolsey.com/javascript/random-word-generator/
    function createRandomPlayerName(length) {
        var consonants = 'bcdfghjklmnpqrstvwxyz',
            vowels = 'aeiou',
            rand = function(limit) {
                return Math.floor(Math.random()*limit);
            },
            i, word='', length = parseInt(length, 10),
            consonants = consonants.split(''),
            vowels = vowels.split('');

        for (i = 0; i < length / 2; i++) {
            var randConsonant = consonants[rand(consonants.length)],
                randVowel = vowels[rand(vowels.length)];
            word += (i === 0) ? randConsonant.toUpperCase() : randConsonant;
            word += i * 2 < length - 1 ? randVowel : '';
        }
        return word;
    }

    return view;

})();
