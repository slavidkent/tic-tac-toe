// player
// create and storing player information
const player = (() => {
  const _players = [];
  const _factory = (name, mark) => {
    return { name, mark };
  };
  const create = (num, name, mark) => {
    if (name === '') {
      name = 'unnamed';
    } else {
      name = name.trim();
    }
    _players[num] = _factory(name, mark);
  };

  const getName = (num) => _players[num].name;
  const getMark = (num) => _players[num].mark;
  const reset = () => (_players.length = 0);

  return {
    create,
    getName,
    getMark,
    reset,
  };
})();

// dom selection
// select element from dom and error checking
const dom = (() => {
  const select = (select) => {
    const selectedElement = document.querySelector(select);
    if (selectedElement) return selectedElement;
    throw new Error(`${select} can't be selected`);
  };
  const selectAll = (select) => {
    const selectedElements = document.querySelectorAll(select);
    if (selectedElements) {
      return selectedElements;
    }
    throw new Error(`${select} can't be selected`);
  };

  return {
    select,
    selectAll,
  };
})();

// board logic and state
// checking game winning condition check board turn error, storing state of games
const gameBoard = (() => {
  const _board = [[], [], []];
  const _checkBoardEmpty = (r, c) => (_board[r][c] === undefined ? true : false);

  const checkWinCondition = (mark) => {
    const checkColumnWin = () => {
      let markMatched = 0;
      for (let col = 0; col <= 2; col++) {
        markMatched = 0;
        for (let row = 0; row <= 2; row++) {
          if (_board[row][col] === mark) {
            markMatched++;
          }
        }

        if (markMatched === 3) {
          return true;
        }
      }
      return false;
    };

    const checkRowWin = () => {
      let markMatched = 0;
      for (let row = 0; row <= 2; row++) {
        markMatched = 0;

        for (let col = 0; col <= 2; col++) {
          if (_board[row][col] === mark) {
            markMatched++;
          }
        }

        if (markMatched === 3) {
          return true;
        }
      }
      return false;
    };

    const checkDiagonalWin = () => {
      const diagonalArr = [
        [_board[0][0], _board[1][1], _board[2][2]],
        [_board[2][0], _board[1][1], _board[0][2]],
      ];
      return diagonalArr.some((arr) => arr.every((x) => x === mark));
    };

    return checkColumnWin() || checkRowWin() || checkDiagonalWin() ? true : false;
  };

  const addMarkToBoard = (mark, positionX, positionY) => {
    if (_checkBoardEmpty(positionX, positionY)) {
      _board[positionX][positionY] = mark;
    } else {
      throw new Error(`position already occupied by ${_board[positionX][positionY]}`);
    }
  };
  const reset = () => {
    for (let r = 0; r <= 2; r++) {
      for (let c = 0; c <= 2; c++) {
        _board[r][c] = undefined;
      }
    }
  };

  return {
    add: addMarkToBoard,
    isWon: checkWinCondition,
    reset,
  };
})();

// dom display
// control webpage visual display
const displayController = (() => {
  const _messageBlock = dom.select('.game-message__text');
  const _overlay = dom.select('.overlay');
  const _inputPage = dom.select('.player-input');
  const _gamePage = dom.select('.game-page');
  const _gameEndPage = dom.select('.game-end');
  const _playerNameDisplay = dom.selectAll('.player-name-display');
  const _gameEndMessage = dom.select('.game-end__text');

  const showScreen = (screenNumber) => {
    switch (screenNumber) {
      case 1:
        _overlay.classList.remove('hidden');
        _inputPage.classList.remove('hidden');
        _gamePage.classList.add('hidden');
        _gameEndPage.classList.add('hidden');
        break;
      case 2:
        _overlay.classList.add('hidden');
        _inputPage.classList.add('hidden');
        _gamePage.classList.remove('hidden');
        _gameEndPage.classList.add('hidden');
        break;
      case 3:
        _overlay.classList.add('hidden');
        _inputPage.classList.add('hidden');
        _gamePage.classList.add('hidden');
        _gameEndPage.classList.remove('hidden');
        break;
    }
  };
  const showPlayersName = (player1, player2) => {
    _playerNameDisplay.item(0).textContent = player1;
    _playerNameDisplay.item(1).textContent = player2;
  };
  const showMarkOnPage = (grid, mark) => {
    let crossOrCircle = mark === 'x' ? 'cross' : 'circle';
    grid.classList.add(crossOrCircle);
  };

  const displayMessage = (message, state) => {
    _messageBlock.innerHTML = message;
    _messageBlock.classList.remove(..._messageBlock.classList);
    if (state === '') {
      _messageBlock.classList.add('game-message__text');
    } else {
      _messageBlock.classList.add('game-message__text', state);
    }
  };
  const showEndScreenMessage = (message) => {
    _gameEndMessage.innerHTML = message;
  };
  const reset = () => {
    showPlayersName('', '');
    displayMessage('', '');
    dom.selectAll('.gameboard__item').forEach((item) => item.classList.remove('cross', 'circle'));
  };
  return {
    showScreen,
    showPlayersName,
    showMarkOnPage,
    displayMessage,
    showEndScreenMessage,
    reset,
  };
})();

// game controller
// control flow of page and game play
const gameController = (() => {
  const startButton = dom.select('#start-btn');
  const inputPlayer1 = dom.select('#player1-name');
  const inputPlayer2 = dom.select('#player2-name');

  const init = () => {
    displayController.showScreen(1);
    inputPlayer1.value = '';
    inputPlayer2.value = '';
    startButton.addEventListener('click', gameStart);
  };
  const gameStart = () => {
    startButton.removeEventListener('click', gameStart);
    // create player
    const player1Name = inputPlayer1.value;
    const player2Name = inputPlayer2.value;
    player.create(0, player1Name, 'x');
    player.create(1, player2Name, 'o');
    displayController.showPlayersName(player.getName(0), player.getName(1));
    displayController.showScreen(2);
    displayController.displayMessage(`Game Started!!! <br/> Player 1 ${player.getName(0)}'s Turn`, 'info');

    // game
    const gameBoardGrids = dom.selectAll('.gameboard__item');
    let playerTurn = 1;
    let currentPlayerMark;

    const gridClickEvent = (e) => {
      displayController.displayMessage(`Player ${playerTurn + 1} ${player.getName(playerTurn)}  turn`, 'info');

      //data to determine what to put on board
      if (playerTurn === undefined || playerTurn === 1) {
        playerTurn = 0;
      } else {
        playerTurn = 1;
      }
      currentPlayerMark = player.getMark(playerTurn);
      const row = e.target.dataset.row;
      const col = e.target.dataset.col;
      gameBoard.add(currentPlayerMark, row, col);
      displayController.showMarkOnPage(e.target, currentPlayerMark);

      if (gameBoard.isWon(currentPlayerMark)) {
        gameBoardGrids.forEach((item) => item.removeEventListener('click', gridClickEvent));
        displayController.displayMessage('Game Over', 'success');
        setTimeout(gameEnd, 1000, playerTurn);
      }
    };
    gameBoardGrids.forEach((item) => item.addEventListener('click', gridClickEvent));
  };
  const gameEnd = (playerNum) => {
    const restartBtn = dom.select('.reset-btn');

    displayController.showScreen(3);
    displayController.showEndScreenMessage(`player ${playerNum + 1} ${player.getName(playerNum)} WIN !!!`);

    const restartBtnHandler = () => {
      player.reset();
      gameBoard.reset();
      displayController.reset();
      restartBtn.removeEventListener('click', restartBtnHandler);
      init();
    };
    restartBtn.addEventListener('click', restartBtnHandler);
  };
  return {
    init,
  };
})();

// run the page logic when the page load
gameController.init();
