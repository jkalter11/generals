$(function() {
    // first, remove our javascript notice
    $('.javascript-notice-container').remove();
    $('body')
        .css('overflow', 'auto')
        // all anchor links should be opened in a new tab/window
        // except the header
        .delegate('.content a, .footer a, .social-links a', 'click', function(e) {
            e.preventDefault();
            e.returnValue = false;
            window.open(this.href);
        });
});

/**
 * The name of view events that will be published and subscribed to
 * we placed it in an object because we want to use these event
 * names in the controller
 * @type {Object}
 */
tgo.views.Events = {
    CREATE_GAME: 'create-game',
    PLAY_AI: 'play-ai',
    JOIN_GAME: 'join-game',
    SUBMIT_PIECES: 'submit-pieces',
    GAME_PIECE_SELECTED: 'game-piece-selected',
    TAKE_TURN: 'take-turn',
    CHAT_MESSAGE: 'chat-message'
};

tgo.views.View = function() {
    this.templateId = '';
};
tgo.views.View.prototype = new tgo.models.EventEmitter();
tgo.views.View.prototype.show = function(callback) {
    var container = $('.content .container');
    var content = $('#' + this.templateId).html();
    var self = this;

    container.hide(function() {
        container.fadeOut(function() {
            container.html(content);
            container.show(function() {
                if (typeof self.init == 'function') {
                    self.init();
                }
                if (typeof callback == 'function') {
                    callback();
                }
            });
        });
    });
};
