// player
// create and storing player information
const player = (() => {
  const _players = [];
  const _factory = (name, mark) => {
    return { name, mark };
  };
  const create = (num, name, mark) => {
    if (name === '') name = 'unnamed';
    _players[num] = _factory(name, mark);
  };

  const getName = (num) => _players[num].name;
  const getMark = (num) => _players[num].mark;

  return {
    create,
    getName,
    getMark,
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
      console.log(`${selectedElements.length} has been selected`);
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
  let _board = [[], [], []];
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

  const getBoard = (r, c) => _board[r][c];

  return {
    add: addMarkToBoard,
    get: getBoard,
    isWon: checkWinCondition,
  };
})();

// dom display
// control webpage visua display
const displayController = (() => {
  const _messageBlock = dom.select('.game-message__text');
  const _overlay = dom.select('.overlay');
  const _inputPage = dom.select('.player-input');
  const _gamePage = dom.select('.game-page');
  const _gameEndPage = dom.select('.game-end');
  const _playerNameDisplay = dom.selectAll('.player-name-display');

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
    _messageBlock.classList.add('game-message__text', state);
  };
  return {
    showScreen,
    showPlayersName,
    showMarkOnPage,
    displayMessage,
  };
})();

// game controller
// control flow of page and game play
const gameController = (() => {
  const init = () => {
    displayController.showScreen(1);
    const startButton = dom.select('#start-btn');
    startButton.addEventListener('click', gameStart);
    startButton.addEventListener('click', () => {
      startButton.removeEventListener('click', gameStart);
    });
  };
  const gameStart = () => {
    // create player
    const player1Name = dom.select('#player1-name').value;
    const player2Name = dom.select('#player2-name').value;
    player.create(0, player1Name, 'x');
    player.create(1, player2Name, 'o');
    displayController.showPlayersName(player.getName(0), player.getName(1));
    displayController.showScreen(2);
    displayController.displayMessage(`Game Started!!! <br/> Player 1 : ${player.getName(0)}'s Turn`, 'success');

    // game
    const gameBoardGrids = dom.selectAll('.gameboard__item');
    let playerTurn;
    let currentPlayerMark;

    const gridClickEvent = (e) => {
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
      console.log(gameBoard.isWon(currentPlayerMark));

      if (gameBoard.isWon(currentPlayerMark)) {
        gameBoardGrids.forEach((item) => item.removeEventListener('click', gridClickEvent));
        gameEnd();
      }
    };
    gameBoardGrids.forEach((item) => item.addEventListener('click', gridClickEvent));
  };
  const gameEnd = () => {
    displayController.showScreen(3);
  };
  return {
    init,
  };
})();

// run the game when the page load
gameController.init();
