/**
 * The main view object that holds .container .content div
 * which can transition from different views
 * (welcome and game and maybe possibly more)
 */
TGO.Views.mainView = (function() {

    var view = new TGO.Models.EventEmitter();
    // the main content element which is transitioned from a welcome page to a game view page
    var content = $('.container .content');
    // allow user to select language
    var language = $('#language');
    language.on('change', function() {
        window.i18n.load(language.val());
    });

    /**
     * Updates the main view to the welcome view container
     * @param  {Function} callback The function to call when the changing of the view has completed
     */
    function showWelcomeView(callback) {
        showTemplate(content, 'welcome-template', function() {
            TGO.Views.welcomeView.init();
            if (typeof callback == 'function') {
                callback();
            }
        });
    }

    /**
     * Updates the main view to the game view container
     * @param  {Function} callback The function to call when the changing of the view has completed
     */
    function showGameView(callback) {
        showTemplate(content, 'game-template', function() {
            TGO.Views.gameView.init();
            if (typeof callback == 'function') {
                window.i18n.load(language.val());
                callback();
            }
        });
    }

    /**
     * Change the content of a container
     * @param  {String}   templateId The name (or ID) of the template to use
     * @param  {Function} callback   The function to use when the changing of the view has completed
     */
    function showTemplate(container, templateId, callback) {
        var html = $('#' + templateId).html();
        TGO.Views.utils.fadeToView(container, html, function() {
            window.i18n.load();
            callback();
        });
    }

    view.showWelcomeView = showWelcomeView;
    view.showGameView = showGameView;
    return view;

})();
