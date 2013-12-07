/**
 * The game view object which wraps UI interaction with the client player
 */
tgo.views.gameView = (function() {

    var view = new tgo.views.View();
    // just a local reference to our game object
    // useful for minification as well as long typing
    var game = tgo.models.game;
    // the following are jQuery objects which represents different DOM
    // elements that will be updated upon game state changes
    var mainMessage, playerFallenPieces, opponentFallenPieces, gameBoardBlocker,
        playerTurnIndicator, opponentTurnIndicator;
    // some user action buttons to
    //      submit the game pieces (submitGamePiecesButton)
    //      play the game again (newGameButton)
    //      practice (playAIButton)
    var submitGamePiecesButton, closeMainMessageButton, newGameButton, playAIButton;
    // and our game board jQuery object and numbers (for testing), and a cache for our tds
    var gameBoard, gameBoardTDs, fiftyMoveRuleCount, piecesRemainingCount;

    /**
     * Initializes our jQuery view objects
     * These view objects are not yet present when we are at the welcome page
     * so jquery can't find them until this view has been loaded from the template
     */
    function init() {
        mainMessage = $('.main-message .message-content');
        gameBoard = $('#game-board');
        gameBoardTDs = gameBoard.find('td');
        gameBoardBlocker = $('#game-board-overlay');
        playerFallenPieces = $('#player-fallen-pieces');
        opponentFallenPieces = $('#opponent-fallen-pieces');
        playerTurnIndicator = $('.turn-indicator').not('.opponent');
        opponentTurnIndicator = $('.turn-indicator.opponent');
        fiftyMoveRuleCount = $('.fifty-move-rule-count');
        piecesRemainingCount = $('.pieces-remaining-count');

        submitGamePiecesButton = $('<button class="button submit">');
        submitGamePiecesButton.text('SUBMIT GAME PIECES');

        playAIButton = $('<button class="button submit">');
        playAIButton.text('PLAY WITH AI');
        playAIButton.on('click', function(e) {
            e.stopPropagation();
            onPlayWithAI();
        });

        newGameButton = $('<button class="button submit">');
        newGameButton.text('START NEW GAME');
        newGameButton.on('click', function(e) {
            e.stopPropagation();
            window.location.href = window.location.href;
        });

        closeMainMessageButton = $('<button class="button default">');
        closeMainMessageButton.text('Close this Message');
        closeMainMessageButton.on('click', function(e) {
            e.stopPropagation();
            closeMainMessage();
        });

        gameBoard.on('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            playerMoveGamePiece($(e.target));
        });
        gameBoard.on('contextmenu', function(e) {
            e.stopPropagation();
            e.preventDefault();
            playerMoveGamePiece($(e.target), true);
        });
        gameBoard.delegate('.game-piece', 'click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            onGamePieceClicked($(this));
        });

        game.playerName = sanitizeHtml(game.playerName);

        // let's show a main message that allows the user to select his opponent
        // if he/she is the creator of this game
        if (game.isCreated) {
            showMainMessage(
                'Welcome <span class="emphasize">' + game.playerName +
                '</span> to the <span class="emphasize">GAME OF THE GENERALS ONLINE</span>! ' +
                'Your GAME ID is <span class="emphasize">' + game.id + '</span>. Send this ID to your friend (opponent) ' +
                'to play with a human player OR if you want to play with an AI Player to practice first, then ' +
                'click on the PLAY WITH AI button.')
            .done(function() {
                mainMessage.append(playAIButton);
                $('.game-id').text(game.id);
                fiftyMoveRuleCount.text(0);
            });
        }
    }

    /**
     * When the player wants to practice playing with an AI
     */
    function onPlayWithAI() {
        view.emit(tgo.views.Events.PLAY_AI);
        playAIButton.remove();
        showMainMessage('Contacting server to create a new AI player. Please wait...');
        game.isAgainstAI = true;
    }

    /**
     * This function is called when a player has joined the game successfully
     * and also let's give them the button to submit their game pieces
     */
    function playerJoined() {
        var message = '';
        game.opponentName = sanitizeHtml(game.opponentName);
        if (game.isCreated) {
            message = '<span class="emphasize">' + game.opponentName + '</span> has successfully connected to your game session. ';
        } else {
            message = 'Welcome <span class="emphasize">' + game.playerName + '</span> to the <span class="emphasize">GAME OF THE GENERALS ONLINE</span>. ';
        }

        return showMainMessage(message).done(function() {
            mainMessage.append(
                'Arrange your game pieces strategically to prepare them to battle against your opponent. After that, ' +
                'click on the SUBMIT GAME PIECES button to officially start the game. <span class="emphasize">GOOD LUCK!</span>'
                );

            mainMessage.append(submitGamePiecesButton);
            submitGamePiecesButton.on('click', function(e) {
                e.stopPropagation();
                onSubmitGamePieces();
            });
            $('.opponent-name').text((game.isAgainstAI ? '(AI) ' : '') + game.opponentName);
            $('.game-id').text(game.id);
            fiftyMoveRuleCount.text(0);
            initGameBoardPositions();
        });
    }

    /**
     * Both players will have different start and end positions
     * for their game pieces because obviously they share the same
     * board and we need to take that into account
     *
     * We are also adding an "targetable" class to all boxes that
     * belong to a players "territory" so that we can style those
     * boxes when the user arranges his/her game pieces
     */
    function initGameBoardPositions() {
        var row, column, position, td;
        if (game.isCreated) {
            row = 9;
            column = 0;
            position = 0;
            while (row > 0) {
                if (column === 0) {
                    row--;
                    column = 9;
                }
                td = gameBoard
                    .find('tr:nth-child(' + row + ') td:nth-child(' + column + ')')
                    .attr('data-pos', position)
                    .data('position', position);
                if (row > 5) {
                    td.addClass('player-box-highlight');
                }
                column--;
                position++;
            }
        } else {
            row = 1;
            column = 1;
            position = 0;
            while (row < 9) {
                if (column > 9) {
                    row++;
                    column = 1;
                }
                td = gameBoard
                    .find('tr:nth-child(' + row + ') td:nth-child(' + column + ')')
                    .attr('data-pos', position)
                    .data('position', position);
                if (row > 5) {
                    td.addClass('player-box-highlight');
                }
                column++;
                position++;
            }
        }
    }

    /**
     * This function is called when the game object has successfully created
     * the game pieces for the current player. We then add the game pieces
     * to the game board.
     */
    function createGamePieces() {
        var gamePieces = [];
        for (var i = 0, j = game.pieces.length; i < j; i++) {
            gamePieces.push(createGamePiece(game.pieces[i]));
        }
        addGamePiecesToBoard(gamePieces);
    }

    /**
     * Create a jQuery game piece object
     * @param  {Object} piece The game piece data
     * @return {jQuery}       The jQuery object representing the game piece
     */
    function createGamePiece(piece) {
        var element = $('<div>');
        element.addClass('game-piece');
        if (piece.code) {
            element.addClass('game-piece-' + piece.code);
            element.html('<span class="code">' + piece.code + '</span>');
        } else {
            // okay, we assume this is an opponent's game piece
            // since we are not given the code/rank
            element.addClass('opponent');
            // add the hashcode for this code
            // so that we can show the original piece to the opponent after the game is over
            element.data('hash', piece.hash);
        }
        // set our initial position so it can be added in the game board UI
        element.data('init-pos', piece.position);
        return element;
    }

    /**
     * Add an array of game pieces jQuery object elements to the game board
     * @param {Array} gamePieces An array of game pieces jquery objects
     */
    function addGamePiecesToBoard(gamePieces) {
        while (gamePieces.length) {
            var gamePiece = gamePieces.pop();
            gameBoard.find('td[data-pos="' + gamePiece.data('init-pos') + '"]')
                     .append(gamePiece);
            // now remove the position since it will become useless
            // we refer to the parent position from now on
            // THINK: do we have any better idea than this???
            gamePiece.removeData('init-pos');
        }
    }

    /**
     * When the user is ready to submit his arranged game pieces
     */
    function onSubmitGamePieces() {
        view.emit(tgo.views.Events.SUBMIT_PIECES, {
            gameId: game.id,
            playerId: game.playerId,
            gamePieces: getGamePiecesOnBoard()
        });
        lockGameBoard();
        closeMainMessage();
    }

    /**
     * Get the game pieces on the board for submission
     * NO opponent game pieces should be included if available
     * @return {Array} The game pieces
     */
    function getGamePiecesOnBoard() {
        var pieces = [];
        gameBoard.find('.game-piece').not('.opponent').each(function(index, element) {
            pieces.push(game.getPiece($(element).parent().data('pos')));
        });
        return pieces;
    }

    /**
     * This function is called once we have submitted the game pieces successfully
     * @param  {String} playerId  The player who submitted the game pieces
     * @param  {Array}  pieces    An array of integer positions and hashcodes of the submitted pieces
     *                            The codes/ranks are not given explicitely of course
     */
    function gamePiecesSubmitted(playerId, pieces) {
        if (game.hasStarted) {
            closeMainMessage();
        } else {
            if (game.playerId == playerId) {
                showMainMessage('Your game pieces have been submitted. Now waiting for <span class="emphasize">' + game.opponentName + '</span> to submit his/her game pieces.');
                piecesRemainingCount.text(gameBoard.find('.game-piece').not('.opponent').length);
            } else {
                showMainMessage('<span class="emphasize">' + game.opponentName + '</span> has submitted his/her game pieces. Submit your game pieces after arrangging them strategically.')
                    .done(function() {
                        mainMessage.append(submitGamePiecesButton);
                        // ie appears like removing the text of this jquery object
                        // once it's removed from the DOM.. smh...
                        submitGamePiecesButton.text('SUBMIT GAME PIECES');
                        submitGamePiecesButton.on('click', function(e) {
                            e.stopPropagation();
                            onSubmitGamePieces();
                        });
                    });
            }
        }

        if (playerId != game.playerId && pieces) {
            // then we need to get those opponent game piece gamePieces in our board
            var gamePieces = [];
            for (var i = 0; i < pieces.length; i++) {
                gamePieces.push(createGamePiece(pieces[i]));
            }
            addGamePiecesToBoard(gamePieces);
        }
    }

    function waitPlayersTurn() {
        lockGameBoard(false);
        clearSelectionStyles();
        playerTurnIndicator.addClass('active');
    }

    function waitForOpponentsTurn() {
        lockGameBoard();
        // this is a little hack since AI's responds so quickly the selections are cleared immediately
        // so we don't have to clear all selections for AI
        if (game.isAgainstAI) {
            gameBoard.find('.game-piece').not('.opponent').removeClass('selected');
        } else {
            clearSelectionStyles();
        }
        opponentTurnIndicator.addClass('active');
    }

    function onGamePieceClicked(gamePiece) {
        if (gamePiece.hasClass('opponent')) {
            playerMoveGamePiece(gamePiece.parent());
        } else {
            onGamePieceSelected(gamePiece);
        }
    }

    /**
     * Handles the event where the user clicks a new square, opponent or the same game piece (swap when rearranging)
     */
    function playerMoveGamePiece(newParent, swap) {

        var gamePiece = gameBoard.find('.game-piece.selected');
        if (gamePiece.length === 0) {
            // there's nothing to move to
            return;
        }

        // if we want to swap, we need to make sure our newParent
        // is actually a parent (TD) element
        if (swap) {
            while (newParent.prop('tagName') != 'TD') {
                newParent = newParent.parent();
            }
        }

        // if the parent is not a target parent, then we should not allow moving this piece
        if (!newParent.hasClass('targetable') && !newParent.hasClass('targeted') && !newParent.hasClass('player-box-highlight')) {
            return;
        }

        // let's block any user moves starting here
        lockGameBoard();

        if (game.hasStarted) {

            // now let's see if we can really move a piece or challenge an opponent's piece
            // NOTE: this client side validation is not foolproof
            //       so we also have server side validation (no cheating)
            view.emit(tgo.views.Events.TAKE_TURN, {
                gameId: game.id,
                playerId: game.playerId,
                oldPosition: gamePiece.parent().data('pos'),
                newPosition: newParent.data('pos')
            });

        // or if we are still arranging the piece items, then we are free to move
        // our game pieces anywhere within our "bounderies"
        } else {

            // prevent moves outside the player's bounderies and clear the selection
            if ( game.isCreated && newParent.data('pos') > 26 ||
                !game.isCreated && newParent.data('pos') < 45) {
                clearSelectionStyles();
                return;
            }

            // before we move, let's see first if there is already a piece on the new parent
            var currentParent = gamePiece.parent();
            var newParentChild = newParent.find('.game-piece');

            // first, since we may be swapping game pieces,
            // we can't use moveGamePiece() here
            // because it will just lead to a cyclic move
            // let's update our data first
            var piece1 = game.getPiece(currentParent.data('pos'));
            var piece2 = game.getPiece(newParent.data('pos'));
            piece1.position = newParent.data('pos');
            if (piece2) {
                piece2.position = currentParent.data('pos');
            }
            // then the animations
            if (newParentChild.length) {
                // the current parent will also be a target
                // when we are swapping game pieces
                currentParent.addClass('targeted');
            }
            newParent.addClass('targeted');
            // let's track if both animations are done
            // because we want to do "something" after both
            // are done, we will NOT know who will finish first
            // so we do this
            var animationCount = 0;
            $.when(
                animateElementMove(gamePiece, newParent),
                animateElementMove(newParentChild, currentParent)
                ).done(function() {
                    // remove our styling class since we are done
                    currentParent.removeClass('targeted');
                    newParent.removeClass('targeted');
                    // and allow other things to happen
                    lockGameBoard(false);
                });
        }
    }

    /**
     * Moves a jquery element to a new parent with animation
     * @param  {jQuery} element   The element to be moved
     * @param  {jQuery} newParent The target parent
     * @return {Object}           A jQuery deferred object
     */
    function animateElementMove(element, newParent) {

        if (element.length === 0) {
            return null;
        }

        var oldOffset = element.offset();
        // append the element to get the new offset position
        element.prependTo(newParent);
        var newOffset = element.offset();

        // create a clone to be used for animation ONLY
        var cloned = element.clone().appendTo('body');
        cloned.css('position', 'absolute')
              .css('left', oldOffset.left)
              .css('top', oldOffset.top)
              .css('zIndex', 1000);

        // let's hide the element now while we animate the clone
        element.hide();

        var deferred = $.when(
            cloned.animate({
                top: newOffset.top,
                left: newOffset.left
            }, 'fast')
        ).done(function() {
            element.show();
            // the clone has served its purpose so we'll remove it from the DOM
            cloned.remove();
        });

        // then let the calling code attach anything to the deferred object
        return deferred;
    }

    function clearSelectionStyles() {
        gameBoard.find('.game-piece').removeClass('selected');
        if (game.hasStarted) {
            gameBoardTDs.removeClass('targetable')
                        .removeClass('targeted')
                        .removeClass('player-box-highlight');
            opponentTurnIndicator.removeClass('active');
            playerTurnIndicator.removeClass('active');
        }
    }

    function highlightPossibleMoves(gamePiece) {
        var position = gamePiece.parent().data('pos');
        var row = Math.floor(position / 9);

        // top and bottom
        highlightGamePieceContainer(gamePiece, gameBoard.find('td[data-pos="' + (position + 9) + '"]'));
        highlightGamePieceContainer(gamePiece, gameBoard.find('td[data-pos="' + (position - 9) + '"]'));
        // left and still on the same row
        if (row == Math.floor((position + 1) / 9)) {
            highlightGamePieceContainer(gamePiece, gameBoard.find('td[data-pos="' + (position + 1) + '"]'));
        }
        // right and still on the same row
        if (row == Math.floor((position - 1) / 9)) {
            highlightGamePieceContainer(gamePiece, gameBoard.find('td[data-pos="' + (position - 1) + '"]'));
        }
    }

    function highlightGamePieceContainer(gamePiece, container) {
        if (container.length === 0) {
            return;
        }
        if (container.find('.game-piece').length === 0) {
            container.addClass('targetable');
        } else if (gamePiece.hasClass('opponent')) {
            if (container.find('.game-piece').not('.opponent').length) {
                container.addClass('targetable');
            }
        } else if (container.find('.game-piece.opponent').length) {
            container.addClass('targeted');
        }
    }

    /**
     * Handles the event when the user clicks on a game piece
     */
    function onGamePieceSelected(gamePiece) {
        // we can't select an opponent's game piece
        if (gamePiece.hasClass('opponent')) {
            return;
        }

        clearSelectionStyles();
        if (game.hasStarted) {
            playerTurnIndicator.addClass('active');
        }
        gamePiece.addClass('selected');
        // and if the game has already started,
        // then we should show the user all the possible
        // moves including possible challenges
        if (game.hasStarted) {
            view.emit(tgo.views.Events.GAME_PIECE_SELECTED, {
                gameId: game.id,
                position: gamePiece.parent().data('pos')
            });
            highlightPossibleMoves(gamePiece);
        }
    }

    function onOpponentGamePieceSelected(position) {
        clearSelectionStyles();
        var gamePiece = gameBoard.find('td[data-pos="' + position + '"] .game-piece');
        gamePiece.addClass('selected');
        highlightPossibleMoves(gamePiece);
    }

    /**
     * Moves the game piece after validated by the server
     * @param {Object} moveResult The result object based from the server
     */
    function onGamePieceMovedOrChallenged(moveResult) {
        var gamePiece = gameBoard.find('td[data-pos="' + moveResult.oldPosition + '"] .game-piece');
        var newParent = gameBoard.find('td[data-pos="' + moveResult.newPosition + '"]');
        var deferred = null;

        lockGameBoard();
        if (moveResult.isChallenge) {
            // for the current player, you might be the referred opponentPiece
            var opponentPiece = newParent.find('.game-piece');
            if (moveResult.challengeResult === 1) {
                deferred = $.when(
                    throwGamePiece(opponentPiece),
                    moveGamePiece(gamePiece, newParent)
                    );
            } else if (moveResult.challengeResult === 0) {
                deferred = $.when(
                    throwGamePiece(opponentPiece),
                    throwGamePiece(gamePiece)
                    );
            } else {
                deferred = $.when(
                    throwGamePiece(gamePiece),
                    moveGamePiece(opponentPiece, newParent)
                    );
            }
        } else {
            deferred = $.when(
                moveGamePiece(gamePiece, newParent)
                );
        }

        return deferred.done(function() {
            lockGameBoard(false);
            fiftyMoveRuleCount.text(game.noChallengeCount);
            piecesRemainingCount.text(gameBoard.find('.game-piece').not('.opponent').length);
        });
    }

    function moveGamePiece(gamePiece, newParent, callback) {
        // add some styling to our target newParent
        newParent.addClass('targetable');
        // get the old and new positions
        var oldPos = gamePiece.parent().data('pos');
        var newPos = newParent.data('pos');

        return $.when(animateElementMove(gamePiece, newParent))
            .done(function() {
                // remove our styling class since we are done
                newParent.removeClass('targetable');
                // update the game piece's position
                var piece =  game.getPiece(oldPos);
                if (piece) {
                    piece.position = newPos;
                }
            });
    }

    function throwGamePiece(gamePiece) {
        var piece = game.getPiece(gamePiece.parent().data('pos'));
        var deferred = null;
        if (piece) {
            piece.position = -1;
        }
        // transfer this to the fallen pieces area
        if (gamePiece.hasClass('opponent')) {
            deferred = animateElementMove(gamePiece, opponentFallenPieces);
        } else {
            deferred = animateElementMove(gamePiece, playerFallenPieces);
        }
        return deferred.done(function() {
            gamePiece.css('display', 'inline-block');
            gamePiece.removeClass('selected');
        });
    }

    function showGameOver(data) {
        var deferred = null;
        if (data.playerId) {
            if (data.noChallengeCount > 50) {
                if (data.playerId == game.playerId) {
                    deferred = showMainMessage('<span class="emphasize">CONGRATULATIONS ' + game.playerName + '! YOU WIN BY THE 50-MOVE RULE!</span>');
                } else {
                    deferred = showMainMessage('<span class="emphasize">SORRY ' + game.playerName + '! YOU LOSE BY THE 50-MOVE RULE!</span>');
                }
            } else {
                if (data.playerId == game.playerId) {
                    deferred = showMainMessage('<span class="emphasize">CONGRATULATIONS ' + game.playerName + '! YOU WIN!</span>');
                } else {
                    deferred = showMainMessage('<span class="emphasize">SORRY ' + game.playerName + '! YOU LOSE!</span>');
                }
            }
        } else {
            deferred = showMainMessage('<span class="emphasize">THIS GAME IS DECLARED A DRAW BY THE 50-MOVE RULE!</span>');
        }

        // let's build a hash of hash-code for faster accessing when we show the opponent game pieces
        var hashCodes = {};
        for (var key in data.pieceInfos) {
            hashCodes[data.pieceInfos[key].HASH] = key;
        }

        // then, let's reveal all the opponent pieces
        $('.game-area .game-piece.opponent').each(function(i, el) {
            var element = $(el);
            var hash = element.data('hash');
            var code = hashCodes[hash];
            element.addClass('game-piece-' + code);
            element.html('<span class="code">' + code + '</span>');
        });

        clearSelectionStyles();
        lockGameBoard();

        deferred.done(function() {
            mainMessage.append(closeMainMessageButton);
            mainMessage.append(newGameButton);
        });
    }

    function showMainMessage(message) {
        mainMessage.html(message);
        return $.when(mainMessage.parent().animate({ height: 'show' }, 'fast'));
    }

    function closeMainMessage() {
        return $.when(mainMessage.parent().animate({ height: 'hide' }));
    }

    function sanitizeHtml(string) {
        sanitizeHtml.span = sanitizeHtml.span || $('<span/>');
        return sanitizeHtml.span.text(string).html();
    }

    function lockGameBoard(state) {
        state = state === undefined ? true : state;
        if (state) {
            gameBoardBlocker.show();
        } else {
            gameBoardBlocker.hide();
        }
    }

    // public API
    view.init = init;
    view.templateId = 'game-template';
    view.playerJoined = playerJoined;
    view.createGamePieces = createGamePieces;
    view.gamePiecesSubmitted = gamePiecesSubmitted;
    view.onOpponentGamePieceSelected = onOpponentGamePieceSelected;
    view.waitPlayersTurn = waitPlayersTurn;
    view.waitForOpponentsTurn = waitForOpponentsTurn;
    view.onGamePieceMovedOrChallenged = onGamePieceMovedOrChallenged;
    view.showGameOver = showGameOver;
    view.showMainMessage = showMainMessage;
    view.closeMainMessage = closeMainMessage;
    view.lock = lockGameBoard;

    return view;

})();
