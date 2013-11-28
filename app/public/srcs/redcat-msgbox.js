/**
 * jQuery MessageBox Library
 *     by Marjun 'redcat' Tacder
 *     (mttacder13.blogspot.com)
 *
 *     This is a jquery extension that doesn't extend the fn function
 *     but rather just using the $ sign for simple namespacing and since
 *     it internally uses jquery as well.
 *
 *     License? well, there is none. You are free to use it, modify it
 *     or you can fork the source codes and submit some good enhancements
 *     and we'll see if it needs to be included. I would love to be mentioned
 *     where ever that may be but you are not obligued to.
 * 
 *     v2.0.0 - 2013-08-29
 *         - overhauled the library
 *         - removed dependency from twitter bootstrap
 *         - updated UI to look more like the dialog box in Yahoo! Mail
 *             (like when you delete all messages in your spam folder)
 *         - updated documentation
 *         - added more sophisticated examples in the test HTML page
 *
 * Simplest example:
 *     $.msgbox('Hello World!');
 *     $.msgbox('Hello World!', 'I Have a Title!');
 * 
 * APIs:
 *     $.msgbox([params]);
 *     $.msgbox({options});
 *     $.msgbox.show([params]);
 *     $.msgbox.ask([params]);
 *     $.msgbox.confirm([params]);
 *     $.msgbox.prompt([params]);
 *     $.msgbox.notify([params]);
 * 
 * See (at the bottom of this file)
 *     $.msgbox.defaults for more explanation on the options
 *     $.msgbox.i18n     for internationalization
 * 
 */
(function() {

    /**
     * Shows a message box by passing string parameter(s)
     * or pass an object containing all the options you set.
     * @param  {[mixed]}  options if a string, then assumed as the message
     * @param  {[string]} title   optional, if you passed a string in @param:options
     *                            ignored,  if you passed an object in @param:options
     * @return {MessageBox}
     */
    $.msgbox = function(options, title) {
        if (typeof options == 'string') {
            options = { title: title, message: options };
        }
        return new MessageBox(options);
    };

    /**
     * Shows a message box with an OK button. You can pass a callback here is as well
     * so you will be informed once the user clicks on OK but it's optional
     * @param  {string}   message  the message to be shown
     * @param  {string}   title    optional, the title to be shown
     * @param  {Function} callback optional, callback called when the user clicks the OK button
     * @return {MessageBox}
     */
    $.msgbox.show = function(message, title, callback) {

        if (typeof title == 'function') {
            callback = title;
            title = '';
        }

        return new MessageBox({
            title: title,
            message: message,
            buttons: [
                {
                    label: $.msgbox.i18n.OK,
                    default: true,
                    action: callback
                }
            ]
        });
    };

    /**
     * Shows a message box that asks some question(s) and you would expect a yes/no answer.
     * @param  {string}   message     the message to be shown
     * @param  {string}   title       optional, the title to be shown
     * @param  {function} yesCallback function to be called when the user clicks YES button
     * @param  {function} noCallback  function to be called when the user clicks NO button
     * @return {MessageBox}
     */
    $.msgbox.ask = function(message, title, yesCallback, noCallback) {

        if (typeof title == 'function') {
            if (typeof yesCallback == 'function') {
                noCallback = yesCallback;
            }
            yesCallback = title;
            title = '';
        }

        return new MessageBox({
            title: title,
            message: message,
            buttons: [
                {
                    label: $.msgbox.i18n.YES,
                    action: yesCallback
                },
                {
                    label: $.msgbox.i18n.NO,
                    default: true,
                    action: noCallback
                }
            ]
        });
    };

    /**
     * Shows a message box that asks for confirmation.
     * @param  {string}   message        the message to be shown
     * @param  {string}   title          optional, the title to be shown
     * @param  {function} okCallback     the function to be called when the user clicks OK button
     * @param  {function} cancelCallback the function to be called when the user clicks CANCEL button
     * @return {MessageBox}
     */
    $.msgbox.confirm = function(message, title, okCallback, cancelCallback) {

        if (typeof title == 'function') {
            if (typeof okCallback == 'function') {
                cancelCallback = okCallback;
            }
            okCallback = title;
            title = '';
        }

        return new MessageBox({
            title: title,
            message: message,
            buttons: [
                {
                    label: $.msgbox.i18n.OK,
                    action: okCallback
                },
                {
                    label: $.msgbox.i18n.CANCEL,
                    default: true,
                    action: cancelCallback
                }
            ]
        });
    };

    /**
     * Show a message box that acts as a prompt message box.
     * The control by default is an input[text] but you can pass your own control, see @param:$control.
     * @param  {string}   message        the message to be shown
     * @param  {string}   title          optional, the title to be shown
     * @param  {function} okCallback     the function to be called when OK is clicked
     * @param  {function} cancelCallback optional, the function to be called when Cancel is clicked
     * @param  {[mixed]}  $control       optional, can be an HTML string, a jQuery object or an HTMLElement
     *                                   that you want the user to input the value
     * @return {MessageBox}
     */
    $.msgbox.prompt = function(message, title, okCallback, cancelCallback, $control) {

        if (typeof cancelCallback != 'undefined') {
            if (cancelCallback instanceof HTMLElement || typeof cancelCallback == 'string') {
                $control = $(cancelCallback);
            } else if (cancelCallback instanceof jQuery) {
                $control = cancelCallback;
            }
        }

        if (typeof title == 'function') {
            if (typeof okCallback == 'function') {
                cancelCallback = okCallback;
            } else if (okCallback instanceof HTMLElement || typeof okCallback == 'string') {
                $control = $(okCallback);
            } else if (okCallback instanceof jQuery) {
                $control = okCallback;
            }
            okCallback = title;
            title = '';
        }

        if (typeof $control == 'undefined') {
            $control = $('<input type="text">');
        } else if ($control instanceof HTMLElement || typeof $control == 'string') {
            $control = $($control);
        }

        $control.css('width', '100%');
        $control.on('keypress.redcat-msgbox', function(e) {
            if (e.keyCode == 13 && !e.shiftKey) {
                e.preventDefault();
            }
        });

        var $message = $('<p/>');
        $message.html(message);
        $message.append('<br>');
        $message.append($control);
        if ($control[0].tagName.toLowerCase() == 'textarea') {
            $message.append('<p><small>' + $.msgbox.i18n.TEXTAREA_NOTICE + '</small></p>');
        }

        return new MessageBox({
            title: title,
            message: $message,
            buttons: [
                {
                    label: $.msgbox.i18n.OK,
                    default: true,
                    action: function() {
                        okCallback($control.val());
                    }
                },
                {
                    label: $.msgbox.i18n.CANCEL,
                    action: cancelCallback
                }
            ],
            onShown: function(msgbox) {
                $control.focus();
            }
        });
    };

    /**
     * Shows a message box but then disappears after a given amount of time.
     * Acts like a notification box.
     * @param  {string} message the message to be shown
     * @param  {string} title   optional, the title to be shown
     * @param  {number} secs    the number of seconds the message should be shown
     *                          defaults to 2 seconds
     * @return {MessageBox}
     */
    $.msgbox.notify = function(message, title, secs) {

        if (typeof title == 'number') {
            secs = title;
            title = '';
        }

        if (!secs) {
            secs = 2;
        }

        if ($.msgbox.currentNotification) {
            $.msgbox.currentNotification.close();
        }

        return new MessageBox({
            title: title,
            message: message,
            buttons: [],
            autoClose: secs * 1000,
            isModal: false,
            topLocation: 20,
            onShown: function(msgbox) {
                $.msgbox.currentNotification = msgbox;
            },
            onClosed: function(msgbox) {
                $.msgbox.currentNotification = false;
            }
        });
    };

    $.msgbox.uniqueId = function(prefix) {
        if (typeof prefix == 'undefined') {
            prefix = '';
        }
        prefix = 'redcat-msgbox-' + prefix;
        return prefix + (Math.round(new Date().getTime() + (Math.random() * 100)));
    };

    /////////////////////////////////
    // MessageBox class definition //
    /////////////////////////////////
    /**
     * @class MessageBox
     * @param {object} options contains all possible options to create a MessageBox object
     */
    function MessageBox(options) {
        this.id = 0;
        this.options = null;
        this.$overlay = null;
        this.$content = null;

        this.initialize(options);
        this.build();
        this.attachEventHandlers();

        if (this.options.autoShow) {
            this.show();
        }
    }

    MessageBox.prototype.initialize = function(options) {
        this.id = $.msgbox.uniqueId();
        this.options = $.extend({}, $.msgbox.defaults, options);
    };

    MessageBox.prototype.build = function() {
        var html = this.createHtml();
        var $html = $(html);

        if (this.options.isModal) {
            this.$overlay = $html.eq(0);
            this.$content = $html.eq(1);
        } else {
            this.$content = $html.eq(0);
        }

        this.adjustContent();

        $html.appendTo('body');
    };

    MessageBox.prototype.createHtml = function() {
        var buttonsHtml = [];
        $.each(this.options.buttons, function(i, button) {
            buttonsHtml.push(
                '<button class="msgbox-button',
                (button.default ? ' msgbox-button-default' : ''),
                '" type="button">',
                button.label,
                '</button>');
        });
        return [
            this.options.isModal ? '<div class="msgbox-overlay" tabindex="1"></div>' : '',
            '<div class="msgbox" draggable="true">',
                '<h2 class="msgbox-header">',
                    this.options.title, '<button type="button" class="msgbox-button-close">&times;</button>',
                '</h2>',
                '<div class="msgbox-body">',
                    (typeof this.options.message == 'string' ? this.options.message : ''),
                '</div>',
                '<div class="msgbox-footer">',
                    buttonsHtml.join(''),
                '</div>',
            '</div>'
        ].join('');
    };

    MessageBox.prototype.adjustContent = function() {
        if (typeof this.options.message != 'string') {
            this.$content.find('.msgbox-body').append(this.options.message);
        }
        if (!this.options.title) {
            var $closeButton = this.$content.find('.msgbox-header .msgbox-button-close');
            this.$content.find('.msgbox-body').prepend($closeButton);
            this.$content.find('.msgbox-header').remove();
        }
        if (this.$content.find('.msgbox-footer .msgbox-button').length === 0) {
            this.$content.find('.msgbox-footer').remove();
            this.$content.find('.msgbox-body').css('padding-bottom', 20);
        }
    };

    MessageBox.prototype.adjustContentHeight = function() {
        var $background = this.$overlay;
        if (!$background) {
            $background = $(window);
        }
        var maxHeight = $background.outerHeight() - 40;
        maxHeight -= this.$content.find('.msgbox-header').outerHeight();
        maxHeight -= this.$content.find('.msgbox-footer').outerHeight();
        this.$content.find('.msgbox-body').css({
            'max-height': maxHeight,
            'overflow-y': 'auto'
        });
    };

    MessageBox.prototype.attachEventHandlers = function() {
        var self = this;

        $(window).on('resize.redcat-msgbox', { msgbox: self }, self.eventHandlers.onResize)
                 .on('keyup.redcat-msgbox', { msgbox: self }, self.eventHandlers.onKeyUp)
                 .trigger('resize');

        if (self.options.closeOverlayClick) {
            self.$overlay.on('click.redcat-msgbox', { msgbox: self }, self.eventHandlers.onCloseMessageBox);
        }

        self.$content.find('.msgbox-button-close')
                     .on('click.redcat-msgbox', { msgbox: self }, self.eventHandlers.onCloseMessageBox);

        self.$content.find('.msgbox-footer .msgbox-button').each(function(i, button) {
            $(button).on('click.redcat-msgbox', { msgbox: self, index: i }, self.eventHandlers.onActionButtonClicked);
        });
    };

    MessageBox.prototype.show = function() {
        var self = this;

        if (self.$overlay) {
            self.$overlay.fadeIn(self.options.fadeTime);
            self.$overlay.focus();
        }

        self.$content.fadeIn(self.options.fadeTime, function() {
            self.options.onShown(self);
            if (self.options.autoClose) {
                window.setTimeout(function() { self.close(); }, self.options.autoClose);
            }
        });
        self.$content.find('.msgbox-button-default').focus();
        self.adjustContentHeight();
    };

    MessageBox.prototype.close = function() {
        var self = this;
        $(window).off('.redcat-msgbox');
        self.$content.fadeOut(self.options.fadeTime, function() {
            self.$content.remove();
            if (self.$overlay) {
                self.$overlay.fadeOut(self.options.fadeTime, function() {
                    self.$overlay.remove();
                    self.options.onClosed(self);
                });
            } else {
                self.options.onClosed(self);
            }
        });
    };

    MessageBox.prototype.eventHandlers = {
        onResize: function(e) {

            var $background = e.data.msgbox.$overlay;
            if (!$background) {
                $background = $(window);
            }

            var x = $background.width();
            var y = e.data.msgbox.$content.width();
            var top = e.data.msgbox.options.topLocation;
            var left = (x / 2) - (y / 2);

            if (top === 0) {
                x = $background.height();
                y = e.data.msgbox.$content.height();
                top = (x / 2) - (y / 2);
                if (top <= 0) {
                    top = 10;
                }
            }

            e.data.msgbox.$content.css({
                'margin-top': top,
                'margin-left': left
            });
            e.data.msgbox.adjustContentHeight();
        },
        onKeyUp: function(e) {
            if (e.keyCode == 13 && !e.shiftKey) {
                var $defaultButton = e.data.msgbox.$content.find('.msgbox-button-default');
                if ($defaultButton.length && !$defaultButton.is(e.target)) {
                    $defaultButton.trigger('click');
                }
                e.preventDefault();
            } else if (e.keyCode == 27) {
                e.data.msgbox.close();
                e.preventDefault();
            }
        },
        onCloseMessageBox: function(e) {
            e.data.msgbox.close();
        },
        onActionButtonClicked: function(e) {
            var action = e.data.msgbox.options.buttons[e.data.index].action;
            if (typeof action == 'function') {
                action();
            }
            e.data.msgbox.close();
            return false;
        }
    };

})();

$.msgbox.defaults = {
    /**
     * Show the message box as modal dialog or not
     * @type {Boolean}
     */
    isModal: true,
    /**
     * topLocation holds the x location of the message box.
     * If 0, the message box is centered vertically
     * @type {Number}
     */
    topLocation: 0,
    /**
     * The title to be shown, can contain HTML tags so you can style the title
     * @type {String}
     */
    title: '',
    /**
     * Message can be a string, HTML or even a jQuery or HTMLElement object
     * @type {[mixed]}
     */
    message: '---',
    /**
     * The time (in milliseconds) it takes to fade in and out the message box
     * @type {Number}
     */
    fadeTime: 130,
    /**
     * The buttons to be shown, you can add as many buttons as you like
     * Each button should have the following properties
     *     {string}   label   text of the button
     *     {boolean}  default optional, whether this button is the default or not
     *                        (when the user presses the ENTER key)
     *     {function} action  what the button will do when it is clicked
     * @type {Array}
     */
    buttons: [],
    /**
     * Close the message box after @param:autoClose amount of time (in milliseconds)
     * If the value is 0 (which is the default), then the message box will not be auto closed.
     * @type {Number}
     */
    autoClose: 0,
    /**
     * Show the message box on the constructor (this is the most common scenario).
     * @type {Boolean}
     */
    autoShow: true,
    /**
     * Close the message box if the user clicks outside of it (on the overlay).
     * @type {Boolean}
     */
    closeOverlayClick: false,
    /**
     * Function to be called when the message box is completely shown after all animations.
     */
    onShown: function() {},
    /**
     * Function to be called when the message box is completely removed from the DOM after all animations.
     */
    onClosed: function() {}
};

$.msgbox.i18n = {
    OK:               'OK',
    CANCEL:           'Cancel',
    YES:              'Yes',
    NO:               'No',
    TEXTAREA_NOTICE: '* Shift+Enter for multiline input.'
};
