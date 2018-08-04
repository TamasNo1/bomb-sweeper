import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const WIDTH = 15;
const HEIGHT = 15;
const BOMB_THRESHOLD = 0.2;
const BOMB_EMOJI = String.fromCodePoint(0x1F4A3);
const PLACEHOLDER_EMOJI = String.fromCodePoint(0x2B1C);
const SMILE_EMOJI = String.fromCodePoint(0x1F642);
const LOST_EMOJI = String.fromCodePoint(0x1F92F);
const FLAG_EMOJI = String.fromCodePoint(0x1F6A7);
const DOWN_EMOJI = String.fromCodePoint(0x1F62F);
const WIN_EMOJI = String.fromCodePoint(0x1F60E);

const NUMBERS = [
  "",
  "\u0031\uFE0F\u20E3",
  "\u0032\uFE0F\u20E3",
  "\u0033\uFE0F\u20E3",
  "\u0034\uFE0F\u20E3",
  "\u0035\uFE0F\u20E3",
  "\u0036\uFE0F\u20E3",
  "\u0037\uFE0F\u20E3",
  "\u0038\uFE0F\u20E3",
];


function countBombsAroundCell(mapWidth, mapHeight, bombs, index) {
  // Calculate row and col from index
  const row = Math.floor(index/mapWidth);
  const col = index - row * mapWidth;

  let rowsToCheck = [row];
  let colsToCheck = [col];

  // Check rows above
  if (row > 0) {
    rowsToCheck.push(row - 1);
  }
  // Check rows below
  if (row < mapHeight - 1) {
    rowsToCheck.push(row + 1);
  }
  // Check cols before
  if (col > 0) {
    colsToCheck.push(col - 1);
  }
  // Check cols after
  if (col < mapWidth - 1) {
    colsToCheck.push(col + 1);
  }

  // Get indices
  let indices = [];
  for (let rowToCheck of rowsToCheck) {
    for (let colToCheck of colsToCheck) {
      indices.push(rowToCheck * mapWidth + colToCheck)
    }
  }

  // Remove current index
  indices.splice(indices.indexOf(index), 1);

  // Count bombs in sorrounding cells
  let noBombs = 0;
  for (let i of indices) {
    if (bombs[i] === BOMB_EMOJI) {
      noBombs++;
    }
  }
  
  // Return emoji representation
  return NUMBERS[noBombs];
}

function generateMap(mapWidth, mapHeight, bombThreshold) {
  // Generate map with only bombs first
  const map = Array.from(
    {length: mapWidth * mapHeight},
    () => Boolean(Math.random() < bombThreshold) ? BOMB_EMOJI : null
  )

  // Calculate number of bombs around non-bomb cells
  for (let i=0; i < mapWidth * mapHeight; i++) {
    if (map[i] === BOMB_EMOJI) {
      continue;
    }
    map[i] = countBombsAroundCell(mapWidth, mapHeight, map, i);
  }

  return map;
}

function calculateLoser(squares) {
  // If there's a bomb displayed, the player lose
  if (squares.indexOf(BOMB_EMOJI) > -1) {
    return true;
  }
  return false;
};

function calculateWinner(squares, bombs) {
  // If there's no placeholder emoji left, loop through all squares
  // and check if they're revealed or all flags have bombs under them
  if (squares.indexOf(PLACEHOLDER_EMOJI) < 0) {
    for (let i=0; i < squares.length; i++) {
      if (squares[i] === bombs[i]) {
        continue;
      } else if (squares[i] === FLAG_EMOJI && bombs[i] === BOMB_EMOJI) {
        continue;
      } else {
        return false;
      }
    }
    return true;
  }
  return false;
};

// Square component
function Square(props) {
  return (
    <button
      className="square"
      onClick={props.onClick}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
    >
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bombs: generateMap(WIDTH, HEIGHT, BOMB_THRESHOLD),
      squares: Array(WIDTH * HEIGHT).fill(PLACEHOLDER_EMOJI),
      status: SMILE_EMOJI,
    };
  }

  handleClick(i, e) {
    let squares = this.state.squares.slice();
    let status = this.state.status;

    if (status === LOST_EMOJI | status === WIN_EMOJI) {
      return;
    }

    if (e.shiftKey) {
      squares[i] = FLAG_EMOJI
    } else {
      if (squares[i] === FLAG_EMOJI) {
        squares[i] = PLACEHOLDER_EMOJI;
      } else {
        squares[i] = this.state.bombs[i];
      }
    }
    
    if (calculateLoser(squares)) {
      squares = this.state.bombs.slice();
      status = LOST_EMOJI;
    } else if (calculateWinner(squares, this.state.bombs)) {
      status = WIN_EMOJI;
    }

    this.setState({
      squares: squares,
      status: status,
    });
  }

  mouseDown() {
    // Update face when user holds mouse button down
    let status = this.state.status;
    if (status === LOST_EMOJI || status === WIN_EMOJI) {
      return;
    }
    this.setState({
      status: DOWN_EMOJI,
    });
  }

  mouseUp() {
    // Update face when user releases mouse button
    if (this.state.status === LOST_EMOJI || this.state.status === WIN_EMOJI) {
      return;
    }
    this.setState({
      status: SMILE_EMOJI,
    });
  }

  reset() {
    if (this.state.status === SMILE_EMOJI) {
      if (!window.confirm("Are you sure you want to start a new game?")) {
        return;
      }
    }

    this.setState({
      bombs: generateMap(WIDTH, HEIGHT, BOMB_THRESHOLD),
      squares: Array(WIDTH * HEIGHT).fill(PLACEHOLDER_EMOJI),
      status: SMILE_EMOJI,
    });
  }

  renderSquare(i) {
    // Pass props
    return (
      <Square 
        value={this.state.squares[i]}
        onClick={(e) => this.handleClick(i, e)}
        onMouseDown={() => this.mouseDown()}
        onMouseUp={() => this.mouseUp()}
      />
    );
  }

  render() {
    // Generate board DOM
    let tableRows = [];
    for (let row = 0; row < HEIGHT; row++) {
      let cols = [];
      for (let col = 0; col < WIDTH; col++) {
        cols.push(this.renderSquare(row * WIDTH + col))
      }
      tableRows.push(
        <div className="board-row">
          {cols}
        </div>
      )
    }

    return (
      <div>
        <div className="status">
          <button className="reset" onClick={() => this.reset()}>
            {this.state.status}
          </button>
        </div>
        {tableRows}
      </div>
    );
  }
}
  
class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <ul>
            <li>Click on face to restart game</li>
            <li>Click on cells to reveal them</li>
            <li>Shift + Click on cells to flag them</li>
          </ul>
        </div>
      </div>
    );
  }
}
  
// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
