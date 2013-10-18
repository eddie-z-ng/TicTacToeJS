/** 
Created by: 
Eddie Ng
 
Date: 
8/17/2013

Summary: 
A game of tic tac toe where you can choose your player and the difficulty setting of the computer opponent
**/

var TICTACTOE = {};

/** Initialize and clear game board for new game **/
function clearBoard () {
	/*  A 9-element array represents the board with each index represented as a grid shown below    
		[0][1][2]
		[3][4][5]
		[6][7][8]
		
		"0" = free cell
		"1" = player X cell
		"2" = player O cell
	*/
	TICTACTOE.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	// Remove the player tiles
	// Add a hover class as it doesn't seem possible to remove a pseudo class
	$('.tile').removeClass("playerX").removeClass("playerO").addClass("hover_add");
	
	TICTACTOE.winCombos = [	[0,1,2], [3,4,5], [6,7,8],
							[0,3,6], [1,4,7], [2,5,8],
							[0,4,8], [2,4,6]	];
	/* Array of potential win combinations shown above, with 1 representing still possible */
	TICTACTOE.potentialCombos = [1, 1, 1, 1, 1, 1, 1, 1];
	TICTACTOE.compMoves = [];
	
	TICTACTOE.turn = 0;
	TICTACTOE.gameover = false;
	
	var playerIndex = $('#playerSelect [name="players"]:checked').index();
	if (playerIndex === 0) {
		TICTACTOE.player = 1;
	} 
	else {
		TICTACTOE.player = 2;
	}
	
	var playerString = "You are player " + (TICTACTOE.player === 1? "X":"O");
	$('#playername p').contents().last()[0].nodeValue = playerString;
	
	var difficultyIndex = $('#difficultySelect [name="difficulty"]:checked').index();
	TICTACTOE.difficulty = difficultyIndex/2;
	
	var difficultyString= "";
	switch(TICTACTOE.difficulty) {
		case 0:
			difficultyString = "EASY MODE";
			break;
		case 1:
			difficultyString = "NORMAL MODE";
			break;
		case 2:
			difficultyString = "HARD MODE";
			break;
	}
	$('#difficultyname p').contents().last()[0].nodeValue = difficultyString;
	
	$('#gameOverText').hide();
	
	if (TICTACTOE.player === 2) {
		setTimeout(function () { 
				compTurn();
			}, 500); // make a move after half a second 
	}
};

/** Add the provided player's marker to the board at the provided tileNum cell **/
function addPlayerMarker (player, tileNum) {
	var playerClass = (player===1)?"playerX":"playerO";
	var tileElem = $('#tile'+tileNum);
	tileElem.removeClass("hover_add");
	tileElem.addClass(playerClass);
	TICTACTOE.board[tileNum] = player;
	TICTACTOE.turn++;
};

/** Check if the provided player is a winner **/
function checkWin (player) {
	// Player X winValue = 1*1*1 ==> 1
	// Player O winValue = 2*2*2 ==> 8
	// Empty cell has value of 0!
	var winValue = player*player*player; 
	var victory = false;
	for (var i = 0; i < 3; i++) {
		// Check rows and columns
		if ( ((TICTACTOE.board[i*3] * TICTACTOE.board[i*3+1] * TICTACTOE.board[i*3+2]) === winValue) || 
          	 ((TICTACTOE.board[i] * TICTACTOE.board[i+3] * TICTACTOE.board[i+6]) === winValue) ) { 
			victory = true;
			return victory;
		};
	}
	// Check diagonals
	if ( ((TICTACTOE.board[0] * TICTACTOE.board[4] * TICTACTOE.board[8]) === winValue) ||
	     ((TICTACTOE.board[2] * TICTACTOE.board[4] * TICTACTOE.board[6]) === winValue) ) {
		 victory = true;
		 return victory;
	}	 
	return victory;
};

/** Function for computer to make a move **/
function compTurn (playerIndex) {
	if (TICTACTOE.gameover === true) {
		return;
	}
	
	var compPlayer = TICTACTOE.player%2+1;
	var compCombo;
	var compMove = -1;
	
	/* a) update the potential winning combinations list */
	for (var i = 0; i < TICTACTOE.winCombos.length; i++) {
		if(TICTACTOE.potentialCombos[i] !== 0) {
			for (var j = 0; j < TICTACTOE.winCombos[i].length; j++) {
				if (TICTACTOE.winCombos[i][j] === playerIndex) {
					TICTACTOE.potentialCombos[i] = 0;
					//alert("winning combination index no longer possible " + i);
					break;
				}
			}
		}
	}
	
	if (TICTACTOE.difficulty > 0)  { // normal/hard mode
		/* 1) see if the computer can make a winning move */
		compMove = getWinMove();
		if (compMove !== -1) {
			addPlayerMarker(compPlayer, compMove);
			TICTACTOE.compMoves.push(compMove);
			
			$('.tile').removeClass("hover_add");
			TICTACTOE.gameover = true;
			TICTACTOE.losses++;
			$('#p1losses').text(TICTACTOE.losses);
			
			var gameOverString = "A LOSER IS YOU!";
			$('#gameOverText p').contents().last()[0].nodeValue = gameOverString;
			$('#gameOverText').show();
			//alert("You lose! GAMEOVER!");
			return;
		}
		
		if (TICTACTOE.difficulty === 2) { // hard mode
			/* 2) see if the computer needs to block the player */
			compMove = getBlockMove();
			if (compMove !== -1) {
				addPlayerMarker(compPlayer, compMove);
				TICTACTOE.compMoves.push(compMove);
				return;
			}
		}
	
		/* 3) follow a winning combination */

		// For the remaining potential win combinations, use the first one that the computer has made a move in
		for (var i = 0; i < TICTACTOE.potentialCombos.length && compCombo === undefined; i++) {
			if (TICTACTOE.potentialCombos[i]) {
				for (var k = 0; k < TICTACTOE.compMoves.length; k++) {
					if ( (TICTACTOE.winCombos[i][0] === TICTACTOE.compMoves[k]) || 
						 (TICTACTOE.winCombos[i][1] === TICTACTOE.compMoves[k]) ||
						 (TICTACTOE.winCombos[i][2] === TICTACTOE.compMoves[k]) ) {
						compCombo = TICTACTOE.winCombos[i];
						break;
					}
				}
			}
		}
	
		if (compCombo !== undefined) {
			for (var i = 0; i < compCombo.length; i++) {
				if (TICTACTOE.board[compCombo[i]] === 0) {
					compMove = compCombo[i];
					addPlayerMarker(compPlayer, compMove);
					TICTACTOE.compMoves.push(compMove);
					return;
				}
			}
		}
	}
	
	/* 4) make a random move */
	// Couldn't find a winning combination/computer hasn't made a move yet
	while (compMove === -1) {
		var number =  Math.floor(Math.random()*9); // generate a number between 0 and 8 inclusive
		if (TICTACTOE.board[number] === 0) {
			compMove = number;
			addPlayerMarker(compPlayer, compMove);
			TICTACTOE.compMoves.push(compMove);
			return;
		}
	}
};

/** Get winning move for computer, if possible **/
function getWinMove() {
	var comp = TICTACTOE.player%2+1;
	for (var i = 0; i < TICTACTOE.board.length; i++) {
		var cell = TICTACTOE.board[i];
		if (cell === 0) {
			// See what happens if the computer moved here
			TICTACTOE.board[i] = comp;
			if (checkWin(comp) === true) {
				TICTACTOE.board[i] = 0; // restore empty cell
				return i;
			} 
			else {
				TICTACTOE.board[i] = 0;	// restore empty cell
			}
		}
	}
	return -1; // no winning move
};

/** Get blocking move for computer, if possible **/
function getBlockMove() {
	for (var i = 0; i < TICTACTOE.board.length; i++) {
		var cell = TICTACTOE.board[i];
		if (cell === 0) {
			// See what happens if the player moved here
			TICTACTOE.board[i] = TICTACTOE.player;
			if (checkWin(TICTACTOE.player) === true) {
				TICTACTOE.board[i] = 0; // restore empty cell
				return i;
			} 
			else {
				TICTACTOE.board[i] = 0;	// restore empty cell
			}
		}
	}
	return -1; // no blocking move
};

/** Check if game is a draw **/
function checkGameOver() {
	if (TICTACTOE.gameover === false) {
		if (TICTACTOE.turn > 8) {
			TICTACTOE.gameover = true;
			TICTACTOE.draws++;
			$('#p1draws').text(TICTACTOE.draws);
			
			var gameOverString = "TIE GAME!";
			$('#gameOverText p').contents().last()[0].nodeValue = gameOverString;
			$('#gameOverText').show();
			
			//alert("DRAW! GAMEOVER!");
		}
	}
};

$(function () {
	TICTACTOE.wins = 0;
	TICTACTOE.losses = 0;
	TICTACTOE.draws = 0;
	
	clearBoard();
	
	$('#startButton').click(function () {
		clearBoard();
	});
	
	$('.bigButton').button();
	
	$('#playerSelect').buttonset();
	$('#difficultySelect').buttonset();
	
	$('span[id*=tile]').click(function () {
		// Only do anything if it's our turn
		if ( (TICTACTOE.turn%2+1) === TICTACTOE.player && (TICTACTOE.gameover === false)) {
			var index = $('span[id*=tile]').index(this);
			//alert($('span[id*=tile]').index(this));
			//alert{"index is " + index);
			var tileRef = $('#tile'+index);
			if (TICTACTOE.board[index] === 0 && tileRef.hasClass("hover_add")) {
				addPlayerMarker(TICTACTOE.player, index);
									
				if(checkWin(TICTACTOE.player) === true) {
					$('.tile').removeClass("hover_add");
					TICTACTOE.gameover = true;
					TICTACTOE.wins++;
					$('#p1wins').text(TICTACTOE.wins);
					
					var gameOverString = "A WINNER IS YOU!";
					$('#gameOverText p').contents().last()[0].nodeValue = gameOverString;
					$('#gameOverText').show();
					//alert("You win! GAMEOVER!");
				}
				else {
					checkGameOver();
					setTimeout(function () { 
						compTurn(index);
						checkGameOver();
					}, 500); // make a move after half a second
				}
			}
		} 
	});
});