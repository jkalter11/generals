var assert = require('assert');

describe('Game', function() {

    var gameModule = require('../app/server/game.js'),
        gameDb = new gameModule.GameDb(),
        game = new gameModule.Game();

    describe('in-memory games db tests', function() {
        it('should return null for non-existing games', function() {
            assert.throws(function() {
                gameDb.get('xxxxxx');
            });
        });
        var game = new gameModule.Game();
        it('should return correct game for existing games', function() {
            gameDb.add(game);
            assert(gameDb.get(game.id) == game);
            assert(gameDb.count == 1);
        });
        it('should throw exception for setting existing games', function() {
            assert(gameDb.add(game) == false);
        });
        it('should delete the correct game', function() {
            gameDb.remove(game.id);
            assert(gameDb.count == 0);
            assert.throws(function() {
                gameDb.get(game.id);
            }, Error);
        });
        it('should return false for deleting non-existing game', function() {
            assert(gameDb.remove(game.id) == false);
        });
    });

    describe('initialization', function() {
        it('game id should have value', function() {
            assert(game.id != null && game.id.length > 0);
            console.log(game.id);
        });
        it('state should be initialized', function() {
            assert(game.state == gameModule.Game.States.INITIALIZED);
        });
        it('player one should have ID', function() {
            game.createPlayer('Jojo', true);
            assert(game.playerA.id != null && game.playerA.id.length > 0);
            console.log(game.playerA.id);
        });
        it('player two should be null', function() {
            assert(game.playerB == null);
        });
    });

    describe('player two joins', function() {
        it('player two should have ID', function() {
            game.createPlayer('Joy', false);
            assert(game.playerB != null && game.playerB.id.length > 0);
            console.log(game.playerB.id);
        });
        it('player two should not be set twice or more', function() {
            assert.throws(function() {
                game.createPlayer('Joy', false);
            }, Error);
        });
        it('state should now be ready', function() {
            assert(game.state == gameModule.Game.States.READY);
        });
        it('getPlayer() should return correct player passing their ids, null for invalid', function() {
            assert(game.getPlayer(game.playerA.id) == game.playerA);
            assert(game.getPlayer(game.playerB.id) == game.playerB);
            assert(game.getPlayer('xxx', true) == null);
        });
    });

    describe('setting the pieces', function() {
        var pieces = null;
        it('should not accept less than 21 pieces', function() {
            pieces = gameModule.Game.generatePieces();
            pieces.pop();
            assert.throws(function() {
                game.setPlayerPieces(game.playerA.id, pieces);
            }, Error);
        });
        it('should not accept pieces with no positions', function() {
            pieces = gameModule.Game.generatePieces();
            assert.throws(function() {
                game.setPlayerPieces(game.playerA.id, pieces);
            }, Error);
        });
        it('should accept 21 pieces', function() {
            pieces = gameModule.Game.generatePieces();
            for (var i = 0; i < 21; i++) {
                pieces[i].position = i;
            }
            assert.doesNotThrow(function() {
                game.setPlayerPieces(game.playerA.id, pieces);
            });
        });
        it('should not accept pieces if it has already been set', function() {
            assert.throws(function() {
                game.setPlayerPieces(game.playerA.id, pieces);
            }, Error);
        });
        it('state should be start after both players have pieces', function() {
            pieces = gameModule.Game.generatePieces();
            for (var i = 45, j = 0; j < 21; i++, j++) {
                pieces[j].position = i;
            }
            game.setPlayerPieces(game.playerB.id, pieces);
            assert(game.state == gameModule.Game.States.START);
        });
        it('current player should not be player two', function() {
            assert(game.currentPlayer != game.playerB);
        });
        it('current player should be player one', function() {
            assert(game.currentPlayer == game.playerA);
        });
    });

    describe('pieces', function() {
        it('should return GOA for GOA piece', function() {
            assert(new gameModule.Piece('GOA').code == 'GOA');
        });
    });

    describe('challenge', function() {

        it('should return 0 for GOA vs GOA', function() {
            var p1 = new gameModule.Piece('GOA'),
                p2 = new gameModule.Piece('GOA');
            assert(game.challenge(p1, p2) == 0);
        });

        it('should return 1 for GOA vs CPT', function() {
            var p1 = new gameModule.Piece('GOA'),
                p2 = new gameModule.Piece('CPT');
            assert(game.challenge(p1, p2) == 1);
        });

        it('should return -1 for GEN vs SPY', function() {
            var p1 = new gameModule.Piece('GEN'),
                p2 = new gameModule.Piece('SPY');
            assert(game.challenge(p1, p2) == -1);
        });

        it('should return 1 for FLG vs FLG, first flag wins', function() {
            var p1 = new gameModule.Piece('FLG'),
                p2 = new gameModule.Piece('FLG');
            assert(game.challenge(p1, p2) == 1);
        });

        it('should return -1 for SPY vs PVT', function() {
            var p1 = new gameModule.Piece('SPY'),
                p2 = new gameModule.Piece('PVT');
            assert(game.challenge(p1, p2) == -1);
        });

        it('should return 1 for PVT vs SPY', function() {
            var p1 = new gameModule.Piece('PVT'),
                p2 = new gameModule.Piece('SPY');
            assert(game.challenge(p1, p2) == 1);
        });

        it('should return 0 for SPY vs SPY', function() {
            var p1 = new gameModule.Piece('SPY'),
                p2 = new gameModule.Piece('SPY');
            assert(game.challenge(p1, p2) == 0);
        });

    });

    describe('taking turns', function() {

        it('should throw exception when invalid player id is passed', function() {
            // first player's turn
            assert.throws(function() {
                game.takeTurn(game.playerB.id);
            });
        });

        it('GOA is eliminated against SPY', function() {
            assert(game.takeTurn(game.playerA.id, game.board.pieces[0].position, 1).success);
        });

        it('should change the current player', function() {
            // current player should be two
            assert(game.currentPlayer == game.playerB);
        });

    });

});
