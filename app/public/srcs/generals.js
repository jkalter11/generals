window.tgo={models:{},views:{}},tgo.models.game={isCreated:!1,opponentName:"",pieces:[],isAgainstAI:!1,hasStarted:!1,noChallengeCount:0,init:function(a,b,c){this.id=a,this.playerId=b,this.playerName=c},generatePieces:function(){this.pieces.push({code:"GOA"}),this.pieces.push({code:"SPY"}),this.pieces.push({code:"SPY"}),this.pieces.push({code:"GEN"}),this.pieces.push({code:"LTG"}),this.pieces.push({code:"MAG"}),this.pieces.push({code:"BRG"}),this.pieces.push({code:"COL"}),this.pieces.push({code:"LTC"}),this.pieces.push({code:"MAJ"}),this.pieces.push({code:"CPT"}),this.pieces.push({code:"1LT"}),this.pieces.push({code:"2LT"}),this.pieces.push({code:"SGT"}),this.pieces.push({code:"FLG"});for(var a=0;6>a;a++)this.pieces.push({code:"PVT"});var b=0,c=26;this.isCreated||(b=45,c=71);for(var d=[];c>=b;)d.push(b),b++;for(d.sort(function(){return Math.random()-.5}),a=0,j=this.pieces.length;j>a;a++)this.pieces[a].position=d[a]},getPiece:function(a){for(var b=0,c=this.pieces.length;c>b;b++)if(this.pieces[b].position==a)return this.pieces[b];return null}},tgo.models.EventEmitter=function(){this._listeners={}},tgo.models.EventEmitter.prototype={on:function(a,b){this._listeners[a]=b},emit:function(a,b){this._listeners[a]&&this._listeners[a](b||{})}},$(function(){$(".javascript-notice-container").remove(),$("body").css("overflow","auto").delegate(".content a, .footer a, .social-links a","click",function(a){a.preventDefault(),a.returnValue=!1,window.open(this.href)})}),tgo.views.Events={CREATE_GAME:"create-game",PLAY_AI:"play-ai",JOIN_GAME:"join-game",SUBMIT_PIECES:"submit-pieces",GAME_PIECE_SELECTED:"game-piece-selected",TAKE_TURN:"take-turn",CHAT_MESSAGE:"chat-message"},tgo.views.View=function(){this.templateId=""},tgo.views.View.prototype=new tgo.models.EventEmitter,tgo.views.View.prototype.show=function(a){var b=$(".content .container"),c=$("#"+this.templateId).html(),d=this;b.hide(function(){b.fadeOut(function(){b.html(c),b.animate({height:"show"},function(){"function"==typeof d.init&&d.init(),"function"==typeof a&&a()})})})},tgo.views.welcomeView=function(){function a(a){a.stopPropagation(),c(g)&&(e(g.val()),i.emit(tgo.views.Events.CREATE_GAME,{playerName:g.val()}))}function b(a){a.stopPropagation(),c(g,h)&&(e(g.val()),i.emit(tgo.views.Events.JOIN_GAME,{playerName:g.val(),gameId:h.val()}))}function c(){for(var a=0,b=arguments.length;b>a;a++){var c=arguments[a];if(!c.val()||!c.val())return c.focus(),!1}return!0}function d(){return window.localStorage&&window.localStorage["player-name"]?window.localStorage["player-name"]:f(10)}function e(a){window.localStorage&&(window.localStorage["player-name"]=a)}function f(a){var b,c="bcdfghjklmnpqrstvwxyz",d="aeiou",e=function(a){return Math.floor(Math.random()*a)},f="",a=parseInt(a,10),c=c.split(""),d=d.split("");for(b=0;a/2>b;b++){var g=c[e(c.length)],h=d[e(d.length)];f+=0===b?g.toUpperCase():g,f+=a-1>2*b?h:""}return f}var g,h,i=new tgo.views.View;return i.templateId="welcome-template",i.init=function(){g=$("#player-name-input"),h=$("#game-id-input"),g.val(d()),$("#create-game").on("click",a),$("#join-game").on("click",b)},i}(),tgo.views.gameView=function(){function a(){C=$(".main-message .message-content"),M=$("#game-board"),N=M.find("td"),F=$("#game-board-overlay"),D=$("#player-fallen-pieces"),E=$("#opponent-fallen-pieces"),G=$(".turn-indicator").not(".opponent"),H=$(".turn-indicator.opponent"),O=$(".fifty-move-rule-count"),P=$(".pieces-remaining-count"),I=$('<button class="button submit">'),I.text("SUBMIT GAME PIECES"),L=$('<button class="button submit">'),L.text("PLAY WITH AI"),L.on("click",function(a){a.stopPropagation(),b()}),K=$('<button class="button submit">'),K.text("START NEW GAME"),K.on("click",function(a){a.stopPropagation(),window.location.href=window.location.href}),J=$('<button class="button default">'),J.text("Close this Message"),J.on("click",function(a){a.stopPropagation(),z()}),M.on("click",function(a){a.stopPropagation(),a.preventDefault(),n($(a.target))}),M.on("contextmenu",function(a){a.stopPropagation(),a.preventDefault(),n($(a.target),!0)}),M.delegate(".game-piece","click",function(a){a.stopPropagation(),a.preventDefault(),m($(this))}),R.playerName=A(R.playerName),R.isCreated&&y('Welcome <span class="emphasize">'+R.playerName+'</span> to the <span class="emphasize">GAME OF THE GENERALS ONLINE</span>! Your GAME ID is <span class="emphasize">'+R.id+"</span>. Send this ID to your friend (opponent) to play with a human player OR if you want to play with an AI Player to practice first, then click on the PLAY WITH AI button.").done(function(){C.append(L),$(".game-id").text(R.id),O.text(0)})}function b(){Q.emit(tgo.views.Events.PLAY_AI),L.remove(),y("Contacting server to create a new AI player. Please wait..."),R.isAgainstAI=!0}function c(){var a="";return R.opponentName=A(R.opponentName),a=R.isCreated?'<span class="emphasize">'+R.opponentName+"</span> has successfully connected to your game session. ":'Welcome <span class="emphasize">'+R.playerName+'</span> to the <span class="emphasize">GAME OF THE GENERALS ONLINE</span>. ',y(a).done(function(){C.append('Arrange your game pieces strategically to prepare them to battle against your opponent. After that, click on the SUBMIT GAME PIECES button to officially start the game. <span class="emphasize">GOOD LUCK!</span>'),C.append(I),I.on("click",function(a){a.stopPropagation(),h()}),$(".opponent-name").text((R.isAgainstAI?"(AI) ":"")+R.opponentName),$(".game-id").text(R.id),O.text(0),d()})}function d(){var a,b,c,d;if(R.isCreated)for(a=9,b=0,c=0;a>0;)0===b&&(a--,b=9),d=M.find("tr:nth-child("+a+") td:nth-child("+b+")").attr("data-pos",c).data("position",c),a>5&&d.addClass("player-box-highlight"),b--,c++;else for(a=1,b=1,c=0;9>a;)b>9&&(a++,b=1),d=M.find("tr:nth-child("+a+") td:nth-child("+b+")").attr("data-pos",c).data("position",c),a>5&&d.addClass("player-box-highlight"),b++,c++}function e(){for(var a=[],b=0,c=R.pieces.length;c>b;b++)a.push(f(R.pieces[b]));g(a)}function f(a){var b=$("<div>");return b.addClass("game-piece"),a.code?(b.addClass("game-piece-"+a.code),b.html('<span class="code">'+a.code+"</span>")):(b.addClass("opponent"),b.data("hash",a.hash)),b.data("init-pos",a.position),b}function g(a){for(;a.length;){var b=a.pop();M.find('td[data-pos="'+b.data("init-pos")+'"]').append(b),b.removeData("init-pos")}}function h(){Q.emit(tgo.views.Events.SUBMIT_PIECES,{gameId:R.id,playerId:R.playerId,gamePieces:i()}),B(),z()}function i(){var a=[];return M.find(".game-piece").not(".opponent").each(function(b,c){a.push(R.getPiece($(c).parent().data("pos")))}),a}function j(a,b){if(R.hasStarted?z():R.playerId==a?(y('Your game pieces have been submitted. Now waiting for <span class="emphasize">'+R.opponentName+"</span> to submit his/her game pieces."),P.text(M.find(".game-piece").not(".opponent").length)):y('<span class="emphasize">'+R.opponentName+"</span> has submitted his/her game pieces. Submit your game pieces after arrangging them strategically.").done(function(){C.append(I),I.text("SUBMIT GAME PIECES"),I.on("click",function(a){a.stopPropagation(),h()})}),a!=R.playerId&&b){for(var c=[],d=0;d<b.length;d++)c.push(f(b[d]));g(c)}}function k(){B(!1),p(),G.addClass("active")}function l(){B(),R.isAgainstAI?M.find(".game-piece").not(".opponent").removeClass("selected"):p(),H.addClass("active")}function m(a){a.hasClass("opponent")?n(a.parent()):s(a)}function n(a,b){var c=M.find(".game-piece.selected");if(0!==c.length){if(b)for(;"TD"!=a.prop("tagName");)a=a.parent();if(a.hasClass("targetable")||a.hasClass("targeted")||a.hasClass("player-box-highlight"))if(B(),R.hasStarted)Q.emit(tgo.views.Events.TAKE_TURN,{gameId:R.id,playerId:R.playerId,oldPosition:c.parent().data("pos"),newPosition:a.data("pos")});else{if(R.isCreated&&a.data("pos")>26||!R.isCreated&&a.data("pos")<45)return p(),void 0;var d=c.parent(),e=a.find(".game-piece"),f=R.getPiece(d.data("pos")),g=R.getPiece(a.data("pos"));f.position=a.data("pos"),g&&(g.position=d.data("pos")),e.length&&d.addClass("targeted"),a.addClass("targeted");$.when(o(c,a),o(e,d)).done(function(){d.removeClass("targeted"),a.removeClass("targeted"),B(!1)})}}}function o(a,b){if(0===a.length)return null;var c=a.offset();a.prependTo(b);var d=a.offset(),e=a.clone().appendTo("body");e.css("position","absolute").css("left",c.left).css("top",c.top).css("zIndex",1e3),a.hide();var f=$.when(e.animate({top:d.top,left:d.left},"fast")).done(function(){a.show(),e.remove()});return f}function p(){M.find(".game-piece").removeClass("selected"),R.hasStarted&&(N.removeClass("targetable").removeClass("targeted").removeClass("player-box-highlight"),H.removeClass("active"),G.removeClass("active"))}function q(a){var b=a.parent().data("pos"),c=Math.floor(b/9);r(a,M.find('td[data-pos="'+(b+9)+'"]')),r(a,M.find('td[data-pos="'+(b-9)+'"]')),c==Math.floor((b+1)/9)&&r(a,M.find('td[data-pos="'+(b+1)+'"]')),c==Math.floor((b-1)/9)&&r(a,M.find('td[data-pos="'+(b-1)+'"]'))}function r(a,b){0!==b.length&&(0===b.find(".game-piece").length?b.addClass("targetable"):a.hasClass("opponent")?b.find(".game-piece").not(".opponent").length&&b.addClass("targetable"):b.find(".game-piece.opponent").length&&b.addClass("targeted"))}function s(a){a.hasClass("opponent")||(p(),R.hasStarted&&G.addClass("active"),a.addClass("selected"),R.hasStarted&&(Q.emit(tgo.views.Events.GAME_PIECE_SELECTED,{gameId:R.id,position:a.parent().data("pos")}),q(a)))}function t(a){p();var b=M.find('td[data-pos="'+a+'"] .game-piece');b.addClass("selected"),q(b)}function u(a){var b=M.find('td[data-pos="'+a.oldPosition+'"] .game-piece'),c=M.find('td[data-pos="'+a.newPosition+'"]'),d=null;if(B(),a.isChallenge){var e=c.find(".game-piece");d=1===a.challengeResult?$.when(w(e),v(b,c)):0===a.challengeResult?$.when(w(e),w(b)):$.when(w(b),v(e,c))}else d=$.when(v(b,c));return d.done(function(){B(!1),O.text(R.noChallengeCount),P.text(M.find(".game-piece").not(".opponent").length)})}function v(a,b){b.addClass("targetable");var c=a.parent().data("pos"),d=b.data("pos");return $.when(o(a,b)).done(function(){b.removeClass("targetable");var a=R.getPiece(c);a&&(a.position=d)})}function w(a){var b=R.getPiece(a.parent().data("pos")),c=null;return b&&(b.position=-1),c=a.hasClass("opponent")?o(a,E):o(a,D),c.done(function(){a.css("display","inline-block"),a.removeClass("selected")})}function x(a){var b=null;b=a.playerId?a.noChallengeCount>50?a.playerId==R.playerId?y('<span class="emphasize">CONGRATULATIONS '+R.playerName+"! YOU WIN BY THE 50-MOVE RULE!</span>"):y('<span class="emphasize">SORRY '+R.playerName+"! YOU LOSE BY THE 50-MOVE RULE!</span>"):a.playerId==R.playerId?y('<span class="emphasize">CONGRATULATIONS '+R.playerName+"! YOU WIN!</span>"):y('<span class="emphasize">SORRY '+R.playerName+"! YOU LOSE!</span>"):y('<span class="emphasize">THIS GAME IS DECLARED A DRAW BY THE 50-MOVE RULE!</span>');var c={};for(var d in a.pieceInfos)c[a.pieceInfos[d].HASH]=d;$(".game-area .game-piece.opponent").each(function(a,b){var d=$(b),e=d.data("hash"),f=c[e];d.addClass("game-piece-"+f),d.html('<span class="code">'+f+"</span>")}),p(),B(),b.done(function(){C.append(J),C.append(K)})}function y(a){return C.html(a),$.when(C.parent().animate({height:"show"},"fast"))}function z(){return $.when(C.parent().animate({height:"hide"}))}function A(a){return A.span=A.span||$("<span/>"),A.span.text(a).html()}function B(a){a=void 0===a?!0:a,a?F.show():F.hide()}var C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q=new tgo.views.View,R=tgo.models.game;return Q.init=a,Q.templateId="game-template",Q.playerJoined=c,Q.createGamePieces=e,Q.gamePiecesSubmitted=j,Q.onOpponentGamePieceSelected=t,Q.waitPlayersTurn=k,Q.waitForOpponentsTurn=l,Q.onGamePieceMovedOrChallenged=u,Q.showGameOver=x,Q.showMainMessage=y,Q.closeMainMessage=z,Q.lock=B,Q}(),tgo.views.chatView=function(){var a=new tgo.views.View;return a.init=function(){messageList=$("#chat-content"),chatInput=$("#chat-input"),chatInput.removeAttr("readonly"),chatInput.on("keydown",function(b){13==b.keyCode&&this.value&&(b.cancelBubble=!0,b.preventDefault(),b.stopPropagation(),a.emit(tgo.views.Events.CHAT_MESSAGE,this.value),this.value="")})},a.addMessage=function(a,b){var c=$('<li><span class="sender">'+a+'</span><span class="message">'+b+"</span></li>");messageList.append(c),messageList.scrollTop(messageList[0].scrollHeight)},a}(),$(function(){function a(a){try{q.emit(p.CREATE_GAME,a)}catch(b){alert("The game is still preparing. Please try again in a few seconds. Thanks")}}function b(a){a.success?(s.init(a.gameId,a.playerId,a.playerName),s.isCreated=!0,u.show()):o(a)}function c(){q.emit(p.PLAY_AI,{gameId:s.id,url:window.location.href})}function d(a){q.emit(p.PLAYER_JOIN,a)}function e(a){a.success?s.isCreated?(s.opponentName=a.playerName,u.playerJoined().done(function(){s.generatePieces(),u.createGamePieces(),v.init()})):(s.init(a.gameId,a.playerId,a.playerName),s.opponentName=a.opponentName,s.isCreated=!1,u.show(function(){u.playerJoined().done(function(){s.generatePieces(),u.createGamePieces(),v.init()})})):o(a)}function f(a){q.emit(p.SUBMIT_PIECES,a)}function g(a){a.success?(s.hasStarted=a.isStarted,u.gamePiecesSubmitted(a.playerId,a.gamePieces,a.isStarted),a.isStarted&&(s.isCreated?u.waitPlayersTurn():u.waitForOpponentsTurn())):o(a)}function h(a){q.emit(p.PIECE_SELECTED,a)}function i(a){u.onOpponentGamePieceSelected(a.position)}function j(a){a.success?(s.noChallengeCount=a.noChallengeCount,u.onGamePieceMovedOrChallenged(a.result).done(function(){a.isGameOver?(u.showGameOver(a),s.hasStarted=!1):a.playerId==s.playerId?u.waitPlayersTurn():u.waitForOpponentsTurn()})):o(a)}function k(a){q.emit(p.PLAYER_TAKES_TURN,a)}function l(){u.lock(),s.hasStarted=!1,u.showMainMessage("Your opponent has left the game. This game is over. Click on the header link to start a new game.")}function m(a){q.emit(p.CHAT_MESSAGE,{gameId:s.id,playerId:s.playerId,message:a})}function n(a){v.addMessage(a.playerId==s.playerId?s.playerName:s.opponentName,a.message)}function o(a){alert(a.error),console.log(a)}var p,q=io.connect(window.location.href),r=tgo.views.Events,s=tgo.models.game,t=tgo.views.welcomeView,u=tgo.views.gameView,v=tgo.views.chatView;q.on("connected",function(a){p=a,q.on(p.GAME_CREATED,b),q.on(p.PLAYER_JOINED,e),q.on(p.PIECES_SUBMITTED,g),q.on(p.PIECE_SELECTED,i),q.on(p.PLAYER_TAKES_TURN,j),q.on(p.PLAYER_LEFT,l),q.on(p.CHAT_MESSAGE,n)}),q.on("error",function(){alert("ERROR: Unable to connect Socket.IO. Please try again by clicking on the header link to start a new game."),u.lock(),s.hasStarted=!1}),t.on(r.CREATE_GAME,a),t.on(r.JOIN_GAME,d),u.on(r.PLAY_AI,c),u.on(r.SUBMIT_PIECES,f),u.on(r.GAME_PIECE_SELECTED,h),u.on(r.TAKE_TURN,k),v.on(r.CHAT_MESSAGE,m),t.show(),window.onbeforeunload=function(a){s.hasStarted&&(a||(a=window.event),a.cancelBubble=!0,a.returnValue="Are you sure you want to leave this current game?",a.stopPropagation&&(a.stopPropagation(),a.preventDefault()))}});