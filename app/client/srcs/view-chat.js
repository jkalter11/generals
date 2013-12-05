tgo.views.chatView = (function() {

    var view = new tgo.views.View();

    view.init = function() {

        messageList = $('#chat-content');
        chatInput = $('#chat-input');

        chatInput.removeAttr('readonly');
        chatInput.on('keyup', function(e) {
            if (e.keyCode == 13 && this.value) {
                view.emit(tgo.views.Events.CHAT_MESSAGE, this.value);
                this.value = '';
                e.preventDefault();
                e.stopPropagation();
                e.returnValue = false;
            }
        });

    };

    view.addMessage = function (sender, message) {
        var li = $('<li><span class="sender">' + sender + '</span>' + message + '</li>');
        messageList.append(li);
        messageList.scrollTop(messageList[0].scrollHeight);
    };

    return view;

})();