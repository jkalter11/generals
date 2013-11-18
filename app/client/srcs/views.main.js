/**
 * The main view object that holds .container .content div
 * which can transition from different views
 * (welcome and game and maybe possibly more)
 */
TGO.Views.mainView = (function() {

    // we create a view that has a capability to recieve/broadcast events
    // so that we can notify the controller our actions
    var view = new TGO.Models.EventEmitter();

    // the main content element which is transitioned from a welcome page to a game view page
    var content = $('.container .content');

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
                callback();
            }
        });
    }

    /**
     * Change the content of a container from a handlebars template
     * @param  {String}   templateId The name (or ID) of the template to use
     * @param  {Function} callback   The function to use when the changing of the view has completed
     */
    function showTemplate(container, templateId, callback) {
        // get the html content first which may container handlebars variables
        var html = $('#' + templateId).html();
        // compile this template. Do we need to precompile this?
        var template = Handlebars.compile(html);
        // add international flavor
        html = template(window.i18n);
        // change the view
        TGO.Views.utils.fadeToView(container, html, callback);
    }

    // API
    view.showWelcomeView = showWelcomeView;
    view.showGameView = showGameView;
    return view;

})();
