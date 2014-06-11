function startGame() {

    prepareGame();

    /**
     * Handles OI Server-Client Communication
     */
    var socket = io.connect(window.location.href);

    /**
     * Event names
     */
    var IOEvents, // we'll get these event names from server side once connected
        ViewEvents = tgo.views.Events; // these are event names used by our view/controller

    // our local reference for the objects to prevent too much typing as well as useful in minification
    var game = tgo.models.game,
        welcomeView = tgo.views.welcomeView,
        gameView = tgo.views.gameView,
        chatView = tgo.views.chatView;

    // when we connected, we want to watch for some events
    // which are defined in the server (IOEvents)
    socket.on('connected', function(data) {
        // let's get the event names from the server
        IOEvents = data;

        // now let's attach all our Socket.IO events
        socket.on(IOEvents.GAME_CREATED, onGameCreated);
        socket.on(IOEvents.PLAYER_JOINED, onPlayerJoined);
        socket.on(IOEvents.PIECES_SUBMITTED, onPiecesSubmitted);
        socket.on(IOEvents.PIECE_SELECTED, onOpponentGamePieceSelected);
        socket.on(IOEvents.PLAYER_TAKES_TURN, onPlayerTakesTurn);
        socket.on(IOEvents.PLAYER_LEFT, onPlayerLeft);
        socket.on(IOEvents.CHAT_MESSAGE, onRecieveChatMessage);

    });

    socket.on('error', function(e) {
        if (game.hasStarted) {
            alert('ERROR: Unable to connect Socket.IO. Please try again by clicking on the header link to start a new game.');
            gameView.lock();
            game.hasStarted = false;
        }
    });

    // handle view events
    welcomeView.on(ViewEvents.CREATE_GAME, onViewCreateGame);
    welcomeView.on(ViewEvents.JOIN_GAME, onViewJoinGame);

    gameView.on(ViewEvents.PLAY_AI, onViewPlayAI);
    gameView.on(ViewEvents.SUBMIT_PIECES, onViewSubmitPieces);
    gameView.on(ViewEvents.GAME_PIECE_SELECTED, onViewGamePieceSelected);
    gameView.on(ViewEvents.TAKE_TURN, onViewMovesGamePiece);

    chatView.on(ViewEvents.CHAT_MESSAGE, onSendChatMessage);

    // Now, let's start and see the welcome view
    welcomeView.show();

    /**
     * Source:  View
     * Handles: When the player want's to create a new game
     * Data:    playerName
     */
    function onViewCreateGame(data) {
        try {
            socket.emit(IOEvents.CREATE_GAME, data);
        } catch (err) {
            alert('The game is still preparing. Please try again in a few seconds. Thanks!');
            welcomeView.enableButtons();
        }
    }

    /**
     * Source:  Socket.IO
     * Handles: When the server says we have created a new game
     * Data:    success, gameId, playerId, playerName
     */
    function onGameCreated(data) {
        if (data.success) {
            game.init(data.gameId, data.playerId, data.playerName);
            game.isCreated = true;
            gameView.show();
        } else {
            logError(data);
            welcomeView.enableButtons();
        }
    }

    /**
     * Source:  View
     * Handles: When a user likes to play with AI
     * Data:    gameId, playerName
     */
    function onViewPlayAI() {
        socket.emit(IOEvents.PLAY_AI, {
            gameId: game.id,
            // THINK: i have been looking for a way to get this url from the server side
            // but i am not successful, so we just get it here, Node/Express needs more documentation
            url: window.location.href
        });
    }

    /**
     * Source:  View
     * Handles: When a user likes to join an existing game
     * Data:    gameId, playerName
     */
    function onViewJoinGame(data) {
        socket.emit(IOEvents.PLAYER_JOIN, data);
    }

    /**
     * Source:  Socket.IO
     * Handles: When the server says the player has joined the game
     * Data:    success, gameId, playerId, playerName
     */
    function onPlayerJoined(data) {
        if (data.success) {
            if (game.isCreated) {
                // we are the one creating the game so the player who joins is our opponent
                game.opponentName = data.playerName;
                gameView.playerJoined().done(function() {
                    game.generatePieces();
                    gameView.createGamePieces();
                    // we have someone to talk to now
                    chatView.init();
                    onSendChatMessage(data.playerName + ' has joined the game.', true);
                });
            } else {
                // we are joining this existing game
                game.init(data.gameId, data.playerId, data.playerName);
                game.opponentName = data.opponentName;
                // we did not create this game, we joined this game
                game.isCreated = false;
                // update the view
                gameView.show(function() {
                    gameView.playerJoined().done(function() {
                        game.generatePieces();
                        gameView.createGamePieces();
                        // we have someone to talk to now
                        chatView.init();
                        onSendChatMessage(data.opponentName + ' has joined the game.', true);
                    });
                });
            }
        } else {
            logError(data);
            welcomeView.enableButtons();
        }
    }

    /**
     * Source:  View
     * Handles: When a user clicks the ready button (submits his/her game pieces)
     * Data:    gameId, playerId, gamePieces(Array)
     */
    function onViewSubmitPieces(data) {
        socket.emit(IOEvents.SUBMIT_PIECES, data);
    }

    /**
     * Source:  Socket.IO
     * Handles: When the pieces have been submitted to the server
     * Data:    success, playerId, gamePieces(position and hash codes only), isStarted
     */
    function onPiecesSubmitted(data) {
        if (data.success) {
            game.hasStarted = data.isStarted;
            gameView.gamePiecesSubmitted(data.playerId, data.gamePieces, data.isStarted);
            onSendChatMessage((data.playerId == game.playerId ? game.playerName : game.opponentName) + ' has submitted his/her game pieces.', true);
            // if the game has started, wait for the first player's move
            if (data.isStarted) {
                onSendChatMessage('Game has officially started!', true);
                if (game.isCreated) {
                    onSendChatMessage(game.playerName + '\'s turn.', true);
                    gameView.waitPlayersTurn();
                    tryFlashWindow();
                } else {
                    onSendChatMessage(game.opponentName + '\'s turn.', true);
                    gameView.waitForOpponentsTurn();
                }
            }
        } else {
            logError(data);
        }
    }

    /**
     * Source:  View
     * Handles: When a game piece is selected
     * Data:    gameId, position
     */
    function onViewGamePieceSelected(data) {
        socket.emit(IOEvents.PIECE_SELECTED, data);
    }

    /**
     * Source:  Socket.IO
     * Handles: When the opponent has selected a game piece
     * Data:    position
     */
    function onOpponentGamePieceSelected(data) {
        gameView.onOpponentGamePieceSelected(data.position);
    }

    /**
     * Source:  Socket.IO
     * Handles: When the player has taken turn
     * Data:    success, playerId, result
     */
    function onPlayerTakesTurn(data) {
        if (data.success) {
            // let's inform the view that the move is valid
            game.noChallengeCount = data.noChallengeCount;
            gameView.onGamePieceMovedOrChallenged(data.result)
                    .done(function() {
                        if (data.isGameOver) {
                            // the current player is the winner
                            gameView.showGameOver(data);
                            game.hasStarted = false;
                            if (data.playerId) {
                                onSendChatMessage('GAME OVER! ' + (data.playerId == game.playerId ? game.playerName : game.opponentName) + ' WON THE GAME!', true);
                            } else {
                                onSendChatMessage('GAME OVER! This bout is declared a DRAW!', true);
                            }
                        } else {
                            // get the next turn
                            if (data.playerId == game.playerId) {
                                onSendChatMessage(game.opponentName + ' has taken his/her move. ' + game.playerName + '\'s turn.', true);
                                gameView.waitPlayersTurn();
                                tryFlashWindow();
                            } else {
                                onSendChatMessage(game.playerName + ' has taken his/her move. ' + game.opponentName + '\'s turn.', true);
                                gameView.waitForOpponentsTurn();
                            }
                        }
                    });
        } else {
            logError(data);
        }
    }

    function onViewMovesGamePiece(data) {
        socket.emit(IOEvents.PLAYER_TAKES_TURN, data);
    }

    /**
     * Source:  Socket.IO
     * Handles: A player has left the game by closing his browser
     *          or navigating to another address
     */
    function onPlayerLeft() {
        gameView.lock();
        game.hasStarted = false;
        gameView.showMainMessage('Your opponent has left the game. This game is over. Click on the header link to start a new game.');
    }

    /**
     * Source:  View
     * Handles: When a user chats a message
     */
    function onSendChatMessage(message, isArbiter) {
        socket.emit(IOEvents.CHAT_MESSAGE, {
            gameId: game.id,
            isArbiter: !!isArbiter,
            playerId: game.playerId,
            message: message
        });
    }

    /**
     * Handles: IOEvents.CHAT_MESSAGE
     * Emits:   IOEvents.CHAT_MESSAGE
     * data:    gameId, playerId, message
     */
    function onRecieveChatMessage(data) {
        if (data.isArbiter) {
            chatView.addMessage('<i>ARBITER</i>', data.message);
        } else {
            chatView.addMessage(data.playerId == game.playerId ? game.playerName : game.opponentName, data.message);
        }
    }

    function logError(data) {
        alert(data.error);
        console.log(data);
    }

    function tryFlashWindow() {
        if (!window.focused) {
            window.flash = window.flash || {};
            window.flash.flag = false;
            window.flash.timerId = setInterval(function() {
                window.flash.flag = !window.flash.flag;
                if (window.flash.flag) {
                    document.title = 'YOUR TURN! - Game of the Generals Online';
                } else {
                    document.title = tgo.appName;
                }
            }, 1000);
        }
    }

    window.focused = true;
    window.onfocus = function() {
        window.focused = true;
        if (window.flash && window.flash.timerId) {
            clearInterval(window.flash.timerId);
            document.title = tgo.appName;
        }
    };
    window.onblur = function() {
        window.focused = false;
    };
    window.onbeforeunload = function(e) {
        if (game.hasStarted) {
            if (!e) e = window.event;
            e.cancelBubble = true;
            e.returnValue = 'Are you sure you want to leave the current game?';
            if (e.stopPropagation) {
                e.stopPropagation();
                e.preventDefault();
            }
        }
    };

}

startGame();