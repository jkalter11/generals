// The name of view events that will be published and subscribed to
// we placed it in an object because we want to use these event
// names in the controller
TGO.Views.Events = {
    CREATE_GAME: 'create-game',
    JOIN_GAME: 'join-game',
    SUBMIT_PIECES: 'submit-pieces',
    TAKE_TURN: 'take-turn'
};

// Utility methods that can be used by all view objects
TGO.Views.utils = {
    /**
     * Changes the html content of a jQuery object with fade animation
     * @param  {jQuery}   element  The element whose HTML will be changed
     * @param  {String}   content  The HTML content
     * @param  {Function} callback The function to call once completed (optional)
     */
    fadeToView: function(element, content, callback) {
        // fade out first and fast
        element.fadeOut('fast', function() {
            // fill up html after this element is gone (faded out)
            element.html(content);
            // start fading in fast
            element.fadeIn('fast', function() {
                if (typeof callback == 'function') {
                    callback();
                }
            });
        });
    },

    /**
     * Internationalizes text
     * @param  {String} text The text to translate
     * @return {String}      The translated text
     */
    i18n: function(text) {

        // if we are not passed a string, output nothing
        if (typeof text !== 'string') {
            return '';
        }

        // let's see if there is a transalation for this text
        // default to the same text if none
        text = window.i18n[text] ? window.i18n[text] : text;

        // now let's replace placeholders (%s) with the arguments passed
        var argIndex = 1;
        while (text.indexOf('%s') != -1 && argIndex < arguments.length) {
            text = text.replace('%s', arguments[argIndex]);
            argIndex++;
        }

        // return the possibly translated text
        return text;
    },

    /**
     * Move a jQuery element to a new parent with animation.
     * The parent is expected to contain the new child as it's only child
     * so if the parent has already a child, that child should be removed
     * and that childs offset position should be the moved element's new position
     * @param  {jQuery}   element   The element to be moved
     * @param  {jQuery}   newParent The new parent of the @element
     * @param  {Function} callback  The function to call after the animation completed
     */
    moveElementAnim: function(element, newParent, callback) {

        // let's make sure we have an element to move
        if (!element.length) {
            // although we will still call their callback
            if (typeof callback == 'function') {
                callback();
            }
            return;
        }
        // old offset location of the element
        var oldOffset = element.offset();
        // append the element to get the new offset position
        element.prependTo(newParent);
        var newOffset = element.offset();

        // create a clone to be used for animation ONLY
        var cloned = element.clone().appendTo('body');
        cloned.css('position', 'absolute')
              .css('left', oldOffset.left)
              .css('top', oldOffset.top)
              .css('zIndex', 100);

        // let's hide the element now while we animate the clone
        element.hide();
        cloned.animate({
                'top': newOffset.top,
                'left': newOffset.left
            }, 'fast', function() {
                // show the element since we are done
                element.show();
                // the clone has served its purpose
                // so we'll remove it from the DOM
                cloned.remove();
                // and we finally call the after callback if there is
                if (typeof callback == 'function') {
                    callback();
                }
            });
    },
    /**
     * Open's a modal-less window
     */
    openSmallWindow: function(url, windowName) {
        return window.open(url, windowName, 'width=500,height=500,directories=0,titlebar=0,toolbar=0,location=0,status=0,menubar=0,scrollbars=1');
    }
};

// A basic implementation of a simple message box using redcat's message box
TGO.Views.msgbox = {
    show: function(message, callback) {
        message = TGO.Views.utils.i18n.apply(null, arguments);
        // use the appliation name as the title of all message box calls
        $.msgbox.show(message, TGO.appName, callback);
    }
};
