const tiles = [];
let grids = [];

const width  = window.innerWidth;
const height = window.innerHeight;
const dim = 25;

const bigT      = 0;
const corner0   = 1;
const cross     = 2;
const empty     = 3;
const lineH     = 4;
const corner90  = 5;
const corner180 = 6;
const corner270 = 7;
const lineV     = 8;

const w = width / dim;
const h = height / dim;

//   [up, right, down, left]
const neighbors = {
  [bigT]:      [0, 1, 1, 1],
  [corner0]:   [1, 1, 0, 0],
  [cross]:     [1, 1, 1, 1],
  [empty]:     [0, 0, 0, 0],
  [lineH]:     [0, 1, 0, 1],
  [corner90]:  [0, 1, 1, 0],
  [corner180]: [0, 0, 1, 1],
  [corner270]: [1, 0, 0, 1],
  [lineV]:     [1, 0, 1, 0]
};

function preload() {
  tiles[bigT]      = loadImage('./tiles/bigT.png');
  tiles[corner0]   = loadImage('./tiles/corner.png');
  tiles[corner90]  = loadImage('./tiles/corner90.png');
  tiles[corner180] = loadImage('./tiles/corner180.png');
  tiles[corner270] = loadImage('./tiles/corner270.png');
  tiles[cross]     = loadImage('./tiles/cross.png');
  tiles[empty]     = loadImage('./tiles/empty.png');
  tiles[lineH]     = loadImage('./tiles/lineH.png');
  tiles[lineV]     = loadImage('./tiles/lineV.png');
}

function initGrids() {
  for (let i = 0; i < dim * dim; i++) {
    grids[i] = {
      collapsed: false,
      options: [bigT, corner0, corner90, corner180, corner270, cross, empty, lineH, lineV]
    };
  }
}

function getRandomInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}


function checkCorner(currentEdges, neighborOptions, dir, currentTile) {
  const dirIndex = { up: 0, right: 1, bottom: 2, left: 3 };
  const d = dirIndex[dir];
  const opposite = (d + 2) % 4;

  const filtered = neighborOptions.filter(opt => {
    return neighbors[opt][opposite] === currentEdges[d];
  });

   
  const noRepeat = filtered.filter(opt => opt !== currentTile);

  if (noRepeat.length > 0) return noRepeat;
  if (filtered.length > 0) return filtered;
  return [empty]; 
}

function setup() {
  createCanvas(width, height);
  background(222);
  initGrids();
  stroke(255);
  strokeWeight(1);
  fill(10, 30, 90);

  const allOptions = [bigT, corner0,empty ,corner90, corner180, corner270, cross,lineH, lineV];
  const firstChoice = allOptions[getRandomInt(0, allOptions.length - 1)];
  grids[0].collapsed = true;
  grids[0].options = [firstChoice];
  image(tiles[firstChoice], 0, 0, w, h);

}

function draw() {
  grids.forEach((g, idx) => {
    if (!g.collapsed) {
      const x = (idx % dim) * w;
      const y = Math.floor(idx / dim) * h;
     
      rect(x, y, w, h);
    }
  });

  let entropy = grids
    .map((cell, index) => ({ cell, index }))
    .filter(e => !e.cell.collapsed)
    .sort((a, b) => a.cell.options.length - b.cell.options.length);

  if (entropy.length === 0) {
    console.log("✅ Finished!");
    noLoop();
    return;
  }

  const minLen = entropy[0].cell.options.length;
  entropy = entropy.filter(e => e.cell.options.length === minLen);

  const { cell, index } = entropy[getRandomInt(0, entropy.length - 1)];

  const choice = cell.options[getRandomInt(0, cell.options.length - 1)];
  cell.options = [choice];
  cell.collapsed = true;

  const edges = neighbors[choice];
  const col = index % dim;
  const row = Math.floor(index / dim);

  const updateNeighbor = (colOffset, rowOffset, dir) => {
    const nc = col + colOffset;
    const nr = row + rowOffset;
    if (nc >= 0 && nc < dim && nr >= 0 && nr < dim) {
      const idx = nc + nr * dim;
      const neighbor = grids[idx];
      if (!neighbor.collapsed) {
        neighbor.options = checkCorner(edges, neighbor.options, dir, choice);
      }
    }
  };

  updateNeighbor(0, -1, 'up');
  updateNeighbor(1, 0, 'right');
  updateNeighbor(0, 1, 'bottom');
  updateNeighbor(-1, 0, 'left');

  image(tiles[choice], col * w, row * h, w, h);
}
