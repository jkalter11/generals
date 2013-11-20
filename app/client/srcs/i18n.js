window.i18n = {};

window.i18n.load = function(lang) {
    $.extend(window.i18n, window.i18n.en(), window.i18n[lang] ? window.i18n[lang]() : {});

    $('#player-name-header').html(i18n['player-name-header']);
    $('#player-name-input').attr('placeholder', i18n['player-name-input-placeholder']);
    $('.create-new-game-header').html(i18n['create-new-game-header']);
    $('.create-new-game-description').html(i18n['create-new-game-description']);
    $('#create-game').html(i18n['create-game-button']);
    $('.join-game-header').html(i18n['join-game-header']);
    $('.join-game-description').html(i18n['join-game-description']);
    $('#game-id-input').attr('placeholder', i18n['game-id-input-placeholder']);
    $('#join-game').html(i18n['join-game-button']);
    $('.join-game-header').html(i18n['join-game-header']);
    $('.game-info-main-header').html(i18n['game-info-main-header'])
    $('.game-info-about-header').html(i18n['game-info-about-header'])
    $('.game-info-about-description').html(i18n['game-info-about-description'])
    $('.game-info-about-online-header').html(i18n['game-info-about-online-header'])
    $('.game-info-about-online-description').html(i18n['game-info-about-online-description'])
    $('#new-game').html(i18n['new-game-button']);
    $('#view-cheat-sheet').html(i18n['view-cheat-sheet-button']);
    $('#ready').html(i18n['ready-button']);
    $('#play-ai').html(i18n['play-ai-button']);
    $('.board-instructions').html(i18n['board-instructions']);

};

window.i18n.en = function() {
    return {
        'player-name-header': 'Player Name',
        'player-name-input-placeholder': 'type your name/alias here',
        'create-new-game-header': 'Create A New Game',
        'create-new-game-description': 'Click on the CREATE GAME button and a new game session will be created where you can either play against an AI or play against a human opponent. Just send the game ID generated to your opponent through any chat apps you have.',
        'create-game-button': 'CREATE GAME',
        'join-game-header': 'Join Existing Game',
        'join-game-description': 'If your friend (or opponent) already created a GAME, ask for the GAME ID. If you have the GAME ID of a created GAME SESSION by your friend (or opponent), then you can INPUT that GAME ID in the textbox below and click on the JOIN GAME button.',
        'game-id-input-placeholder': 'type the game ID here',
        'join-game-button': 'JOIN GAME',
        'game-info-main-header': 'Small Introduction',
        'game-info-about-header': 'About Game of the Generals',
        'game-info-about-description': 'This is a proudly Filipino-invented game by <a href="http://en.wikipedia.org/wiki/Special:Search/Sofronio_H._Pasola,_Jr."> Sofronio H. Pasola, Jr.</a> in 1970. The game simulates armies at war trying to outflank and outmaneuver each other. The main objective of the game is to eliminate or capture the opponent\'s FLAG piece or alternatively, bring your own FLAG piece to the opponent\'s end of the board. This is easy to play. All you have to do is remember who\'s rank is greater than who (eg: a 5 star general (GOA) is greater than a 3 star (LTG) or 4 star general (GEN) but all these generals and ranked pieces are no match to the spy (SPY) yet the spy (SPY) is no match to the unranked private (PVT)). Intrigued? For more information, here\'s a <a href="http://en.wikipedia.org/wiki/Game_of_the_Generals">detailed Wikipedia page</a> for this game.',
        'game-info-about-online-header': 'About this Online Version of the Game',
        'game-info-about-online-description': 'I am not the first to do this. There are versions online about this game (and even an iPhone app - not free) but they are too serious, requires registration and some are NOT FREE. My purpose was just to play the game and then forget about it after. I don\'t need to track each game. This is just for fun. I am not sure if I would eventually make a tournament feature (highly unlikely) but for now, it\'s just play and forget. No ranking, no registration, just pure playing, immediately.<br>Aside from that, this is my first <a href="http://nodejs.org/">Node.js</a> application that I have shared freely online. I made this to familiarize myself more with <a href="http://nodejs.org/">Node.js</a>. This board game is not quite popular in our place and I hope that this application hopes to revive that popularity among Filipino board gamers. This is an easy yet thrilling game. I am sure you will enjoy this game.',
        'ready-button': 'SUBMIT GAME PIECES',
        'new-game-button': 'New Game',
        'view-cheat-sheet-button': 'View Cheat Sheet',
        'play-ai-button': 'PRACTICE FIRST',
        'board-instructions': 'LEFT-CLICK : Select your own game piece.<br>RIGHT-CLICK: To a blank board position to move your game piece or right-click to an opponent\'s game piece to challenge an opponent\'s game piece.'
    };
};
