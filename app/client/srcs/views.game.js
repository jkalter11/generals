/**
 * The game view object which wraps UI interaction with the client player
 */
TGO.Views.gameView = (function() {

    var view = new TGO.Models.EventEmitter();
    // just a local reference to our game object
    // useful for minification as well as long typing
    var game = TGO.Models.game;
    // the following are jQuery objects which represents different DOM
    // elements that will be updated upon game state changes
    var message, gameId, fallenPieces;
    // some user action buttons to
    //      submit the game pieces (readyButton)
    //      play the game again (newGameButton)
    var readyButton, newGameButton, playAIButton;
    // and our game board jQuery object and numbers
    var gameBoard, gameBoardNumbers;
    // flag that controls whether the player con move his game pieces or not
    var isGameBoardLocked = false;
    // flag that controls whether the view is animating something
    var isAnimating = false;
    // flag that controls whether any player has made a single move
    // or basically if the game has actually started
    var hasStarted = false;

    /**
     * Initializes our jQuery view objects
     * These view objects are not yet present when we are at the welcome page
     * so jquery can't find them until this view has been loaded from the template
     */
    function init() {
        message = $('.game-message');
        gameId = $('.game-id');
        gameId.on('click', function() {
            $(this).select();
        });
        // let's build the game board
        gameBoard = $('#game-board');
        var tbody = $('<tbody></tbody>');
        for (var i = 0; i < 8; i++) {
            tbody.append('<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>')
        }
        gameBoard.append(tbody);
        // let's build the game board numbers for testing purposes only
        /*
        gameBoardNumbers = $('#game-board-numbers');
        var tbody = $('<tbody></tbody>');
        for (var i = 0; i < 8; i++) {
            tbody.append('<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>')
        }
        gameBoardNumbers.append(tbody);
        */

        fallenPieces = $('#fallen-pieces');

        readyButton = $('#ready');
        readyButton.on('click', onReadyButtonClick);

        playAIButton = $('#play-ai');
        playAIButton.on('click', function() {
            view.emit(TGO.Views.Events.PLAY_AI);
            playAIButton.hide();
            setGameMessage('Contacting server for AI player. Please wait...')
        });

        newGameButton = $('#new-game');
        newGameButton.on('click', function(e) {
            e.stopPropagation();
            window.location.reload();
        });

        viewCheatSheetButton = $('#view-cheat-sheet');
        viewCheatSheetButton.on('click', function(e) {
            e.stopPropagation();
            TGO.Views.utils.openSmallWindow('/cs.html', 'TGO');
        });

        $(document).delegate('.content', 'click', function(e) {
            e.preventDefault();
            if (!isGameBoardLocked) {
                clearSelectionStyles();
            }
        });

        gameBoard.on('contextmenu', onGamePieceMoved);
        gameBoard.delegate('.game-piece', 'click', onGamePieceSelected);
    }

    /**
     * Changes the main message for player
     * @param {String} msg The message that can be string or HTML
     */
    function setGameMessage(msg) {
        var callback = null;
        var args = Array.prototype.slice.call(arguments, 0);
        if (typeof args[args.length - 1] == 'function') {
            callback = args.pop();
        }
        // first, replace placeholders and translate this text
        msg = TGO.Views.utils.i18n.apply(null, args);

        TGO.Views.utils.fadeToView(message, msg, callback);
    }

    /**
     * This function is called when the game has been successfully created.
     * @param  {Object} _game The game object
     */
    function onGameCreated() {
        gameId.val(game.id);
        setGameMessage('WELCOME <span class="highlight">%s</span>! Your game ID is <span class="highlight">%s</span>. Send this to your opponent or if you want to practice, play against an AI.', game.playerName, game.id);
    }

    /**
     * This function is called when a player has joined the game successfully
     * and also let's give them the button to submit their game pieces (readyButton)
     */
    function onPlayerJoined() {

        if (game.isCreated) {
            setGameMessage('<span class="highlight">%s</span> connected. ARRANGE your pieces.',
                game.opponentName);
        } else {
            setGameMessage('WELCOME <span class="highlight">%s</span>! ARRANGE your game pieces.',
                game.playerName, game.opponentName);
        }

        playAIButton.hide();
        readyButton.show();
        gameId.val(game.id);
        initGameBoardPositions();
    }

    /**
     * Both players will have different start and end positions
     * for their game pieces because obviously they share the same
     * board and we need to take that into account
     *
     * We are also adding an "initialized" class to all boxes that
     * belong to a players "territory" so that we can style those
     * boxes when the user arranges his/her game pieces
     */
    function initGameBoardPositions() {
        if (game.isCreated) {
            var row = 9, column = 0, position = 0, td;
            while (row > 0) {
                if (column == 0) {
                    row--;
                    column = 9;
                }
                td = gameBoard
                    .find('tr:nth-child(' + row + ') td:nth-child(' + column + ')')
                    .attr('data-pos', position)
                    .data('position', position);
                //gameBoardNumbers.find('tr:nth-child(' + row + ') td:nth-child(' + column + ')').html(position);
                if (row > 5) {
                    td.addClass('initialized');
                }
                column--;
                position++;
            }
        } else {
            var row = 1, column = 1, position = 0;
            while (row < 9) {
                if (column > 9) {
                    row++;
                    column = 1;
                }
                td = gameBoard
                    .find('tr:nth-child(' + row + ') td:nth-child(' + column + ')')
                    .attr('data-pos', position)
                    .data('position', position);
                //gameBoardNumbers.find('tr:nth-child(' + row + ') td:nth-child(' + column + ')').html(position);
                if (row > 5) {
                    td.addClass('initialized');
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
    function onGamePiecesCreated() {
        var gamePieces = [];
        for (var i = 0, j = game.pieces.length; i < j; i++) {
            gamePieces.push(createGamePiece(game.pieces[i]));
        }
        addGamePiecesToBoard(gamePieces);
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
            gamePiece.removeData('init-pos');
        }
    }

    /**
     * Create a jQuery game piece object
     * @param  {Object} piece The game piece data
     * @return {jQuery}       The jQuery object representing the game piece
     */
    function createGamePiece(piece) {

        var element = $('<div>');
        element.addClass('game-piece');
        // okay, we assume this is an opponent's game piece
        // since we are not given the code/rank
        if (!piece.code) {
            element.addClass('opponent');
        } else {
            element.addClass('game-piece-' + piece.code);
            element.html('<span class="code">' + piece.code + '</span>');
        }
        // set our initial position so it can be added in the game board UI
        element.data('init-pos', piece.position);
        return element;
    }

    /**
     * Handles the event when the ready button was clicked
     */
    function onReadyButtonClick(e) {
        e.stopPropagation();
        view.emit(TGO.Views.Events.SUBMIT_PIECES, {
            gameId: game.id,
            playerId: game.playerId,
            gamePieces: getGamePiecesOnBoard()
        });
        playAIButton.hide();
        readyButton.hide();
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
     * @param  {Array}  positions An array of integer positions of the submitted pieces
     *                            The codes/ranks are not given of course
     */
    function onGamePiecesSubmitted(playerId, positions, isStarted) {
        // if we are the player who submits it
        if (game.playerId == playerId) {
            setGameMessage('Game pieces submitted. Waiting for <span class="highlight">%s</span> to submit game pieces.', game.opponentName);
        } else {
            if (!isStarted) {
                setGameMessage('<span class="highlight">%s</span> has submitted game pieces. Submit yours after arranging them.', game.opponentName);
                // allow the user submit game pieces
                readyButton.show();
            }

            // if not then we need to get those game piece positions in our board
            var gamePieces = [];
            for (var i = 0; i < positions.length; i++) {
                gamePieces.push(createGamePiece({
                    position: positions[i]
                }));
            }
            addGamePiecesToBoard(gamePieces);
        }
    }

    function waitPlayersTurn() {
        setGameMessage('<span class="highlight">YOUR TURN! MAKE YOUR MOVE.</span>');
        isGameBoardLocked = false;
        hasStarted = true;
        clearSelectionStyles();
    }

    function waitForOpponentsTurn() {
        setGameMessage('Waiting for <span class="highlight">%s\'s</span> move. Please wait.', game.opponentName);
        isGameBoardLocked = true;
        hasStarted = true;
        clearSelectionStyles();
    }

    function clearSelectionStyles() {
        gameBoard.find('.game-piece').removeClass('selected');
        gameBoard.find('td').removeClass('challengeable')
                            .removeClass('possible-move');
        if (hasStarted) {
            gameBoard.find('td').removeClass('initialized');
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
        if (container.find('.game-piece').length == 0) {
            container.addClass('possible-move');
        } else if (gamePiece.hasClass('opponent')) {
            if (container.find('.game-piece').not('.opponent').length) {
                container.addClass('challengeable');
            }
        } else if (container.find('.game-piece.opponent').length) {
            container.addClass('challengeable');
        }
    }

    /**
     * Handles the event when the user clicks on a game piece
     */
    function onGamePieceSelected(e) {
        e.stopPropagation();
        var gamePiece = $(this);

        // we can't select anything if we are in the first two states
        // and we can't select an opponent's game piece
        if (isGameBoardLocked ||
            isAnimating ||
            gamePiece.hasClass('opponent')) {
            return;
        }

        clearSelectionStyles();
        gamePiece.addClass('selected');
        // and if the game has already started,
        // then we should show the user all the possible
        // moves including possible challenges
        if (hasStarted) {
            highlightPossibleMoves(gamePiece);
        }
        view.emit(TGO.Views.Events.GAME_PIECE_SELECTED, {
            gameId: game.id,
            position: gamePiece.parent().data('pos')
        });
    }

    function onOpponentGamePieceSelected(position) {
        clearSelectionStyles();
        var gamePiece = gameBoard.find('td[data-pos="' + position + '"] .game-piece');
        gamePiece.addClass('selected');
        highlightPossibleMoves(gamePiece);
    }

    /**
     * Handles the event where the user right clicks
     * the gameboard or a game piece to swap/challenge
     */
    function onGamePieceMoved(e) {
        e.stopPropagation();
        e.preventDefault();

        if (isGameBoardLocked || isAnimating) {
            return;
        }

        var gamePiece = gameBoard.find('.game-piece.selected');
        if (gamePiece.length == 0) {
            return;
        }

        var newParent = $(e.target);
        while (newParent.prop('tagName') != 'TD') {
            newParent = newParent.parent();
        }
        // if the parent is not a target parent, then we should not
        if (hasStarted &&
            !newParent.hasClass('possible-move') &&
            !newParent.hasClass('challengeable')) {
            return;
        }

        // if the game has started then we should show possible moves and challenges
        if (hasStarted) {

            // now let's see if we can really move a piece
            // or challenge an opponent's piece
            // NOTE: these client side validation is not foolproof
            //       so we also have server side validation (no cheating)
            isGameBoardLocked = true;
            view.emit(TGO.Views.Events.TAKE_TURN, {
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

            // let's move/swap game pieces
            isAnimating = true;

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
            currentParent.addClass('target');
            newParent.addClass('target');
            // let's track if both animations are done
            // because we want to do "something" after both
            // are done, we will NOT know who will finish first
            // so we do this
            var animationCount = 0;
            TGO.Views.utils.moveElementAnim(gamePiece, newParent, function() { animationCount++; });
            TGO.Views.utils.moveElementAnim(newParentChild, currentParent, function() { animationCount++; });
            // then, we do that "something" here
            (function afterAnim() {
                if (animationCount == 2) {
                    // remove our styling class since we are done
                    currentParent.removeClass('target');
                    newParent.removeClass('target');
                    // and allow other things to happen
                    isAnimating = false;
                } else {
                    setTimeout(afterAnim, 200);
                }
            })();
        }
    }

    function moveGamePiece(gamePiece, newParent, callback) {
        // prevent other user moves
        isAnimating = true;
        // add some styling to our target newParent
        newParent.addClass('target');
        // get the old and new positions
        var oldPos = gamePiece.parent().data('pos');
        var newPos = newParent.data('pos');

        TGO.Views.utils.moveElementAnim(gamePiece, newParent, function() {
            // remove our styling class since we are done
            newParent.removeClass('target');
            // update the game piece's position (except an opponent since we don't have them)
            var piece =  game.getPiece(oldPos);
            if (piece) {
                piece.position = newPos;
            }
            // and allow other things to happen
            isAnimating = false;
            if (typeof callback == 'function') {
                callback();
            }
        });
    }

    function throwGamePiece(gamePiece) {
        var piece = TGO.Models.game.getPiece(gamePiece.parent().data('pos'));
        if (piece) {
            piece.position = -1;
        }
        // if this is your game piece, then we will show it in the fallen pieces list
        // but if an opponent, remove it from the board
        if (gamePiece.hasClass('opponent')) {
            gamePiece.remove();
        } else {
            isAnimating = true;
            TGO.Views.utils.moveElementAnim(gamePiece, fallenPieces, function() {
                gamePiece.removeClass('selected');
                isAnimating = false;
            });
        }
    }

    /**
     * Moves the game piece after validated by the server
     * @param {Object} moveResult The result object based from the server
     */
    function onGamePieceMovedOrChallenged(moveResult, callback) {
        var gamePiece = gameBoard.find('td[data-pos="' + moveResult.oldPosition + '"] .game-piece');
        var newParent = gameBoard.find('td[data-pos="' + moveResult.newPosition + '"]');

        if (moveResult.isChallenge) {
            // for the current player, you might be the referred opponentPiece
            var opponentPiece = newParent.find('.game-piece');
            if (moveResult.challengeResult == 1) {
                throwGamePiece(opponentPiece);
                moveGamePiece(gamePiece, newParent, callback);
            } else if (moveResult.challengeResult == 0) {
                throwGamePiece(opponentPiece);
                throwGamePiece(gamePiece);
                callback();
            } else {
                throwGamePiece(gamePiece);
                moveGamePiece(opponentPiece, newParent, callback);
            }
        } else {
            moveGamePiece(gamePiece, newParent, callback);
        }
    }

    function showGameOver(data) {
        if (data.playerId) {
            if (data.is50MoveRule) {
                if (data.playerId == game.playerId) {
                    setGameMessage('<span class="highlight">YOU WIN BY THE 50-MOVE RULE!</span>');
                } else {
                    setGameMessage('<span class="highlight">YOU LOSE BY THE 50-MOVE RULE!</span>');
                }
            } else {
                if (data.playerId == game.playerId) {
                    setGameMessage('<span class="highlight">YOU WIN!</span>');
                } else {
                    setGameMessage('<span class="highlight">YOU LOSE!</span>');
                }
            }
        } else {
            setGameMessage('<span class="highlight">THIS GAME IS A DRAW BY THE 50-MOVE RULE!</span>');
        }

        // then, let's reveal all the opponent pieces
        for (var i = 0; i < data.pieces.length; i++) {
            if (data.pieces[i].position != -1) {
                var gamePiece = gameBoard.find('td[data-pos="' + data.pieces[i].position + '"] .game-piece');
                if (gamePiece.hasClass('opponent')) {
                    gamePiece.addClass('game-piece-' + data.pieces[i].code);
                    gamePiece.html('<span class="code">' + data.pieces[i].code + '</span>');
                }
            }
        }
        var lastPieceMoved = $('.game-piece.selected');
        clearSelectionStyles();
        if (lastPieceMoved.length) {
            lastPieceMoved.addClass('selected');
            lastPieceMoved.parent().addClass('target');
        }
        isGameBoardLocked = true;
    }

    // public API
    view.init = init;
    view.onGameCreated = onGameCreated;
    view.onPlayerJoined = onPlayerJoined;
    view.onGamePiecesCreated = onGamePiecesCreated;
    view.onGamePiecesSubmitted = onGamePiecesSubmitted;
    view.onOpponentGamePieceSelected = onOpponentGamePieceSelected;
    view.waitPlayersTurn = waitPlayersTurn;
    view.waitForOpponentsTurn = waitForOpponentsTurn;
    view.onGamePieceMovedOrChallenged = onGamePieceMovedOrChallenged;
    view.showGameOver = showGameOver;

    return view;

})();
