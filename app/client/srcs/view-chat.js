tgo.views.chatView = (function() {

    var view = new tgo.views.View();

    view.init = function() {

        messageList = $('#chat-content');
        chatInput = $('#chat-input');

        chatInput.removeAttr('readonly');
        chatInput.on('keydown', function(e) {
            if (e.keyCode == 13 && this.value) {
                e.cancelBubble = true;
                e.preventDefault();
                e.stopPropagation();
                view.emit(tgo.views.Events.CHAT_MESSAGE, this.value);
                this.value = '';
            }
        });

    };

    view.addMessage = function (sender, message) {
        var li = $('<li><span class="sender">' + sender + '</span><span class="message">' + message + '</span></li>');
        messageList.append(li);
        messageList.scrollTop(messageList[0].scrollHeight);
    };

    return view;

})();