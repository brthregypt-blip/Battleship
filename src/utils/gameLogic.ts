import {
  ShipType,
  PlacedShip,
  CellData,
  Orientation,
  AIDifficulty,
  ShotResult,
} from '../types';

export const BOARD_SIZE = 10;
export const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const COL_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export const DEFAULT_SHIPS: ShipType[] = [
  { id: 'carrier', name: 'Carrier', nameAr: 'حاملة الطائرات', size: 5 },
  { id: 'battleship', name: 'Battleship', nameAr: 'البارجة الحربية', size: 4 },
  { id: 'cruiser', name: 'Cruiser', nameAr: 'الطراد المدرع', size: 3 },
  { id: 'submarine', name: 'Submarine', nameAr: 'الغواصة الحربية', size: 3 },
  { id: 'destroyer', name: 'Destroyer', nameAr: 'المدمرة السريعة', size: 2 },
];

export function createEmptyGrid(): CellData[][] {
  const grid: CellData[][] = [];
  for (let y = 0; y < BOARD_SIZE; y++) {
    const row: CellData[] = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      row.push({
        x,
        y,
        status: 'empty',
      });
    }
    grid.push(row);
  }
  return grid;
}

export function toCoordString(x: number, y: number): string {
  if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return '??';
  return `${ROW_LABELS[y]}${x + 1}`;
}

export function getShipCoordinates(
  x: number,
  y: number,
  size: number,
  orientation: Orientation
): { x: number; y: number }[] {
  const coords: { x: number; y: number }[] = [];
  for (let i = 0; i < size; i++) {
    if (orientation === 'horizontal') {
      coords.push({ x: x + i, y });
    } else {
      coords.push({ x, y: y + i });
    }
  }
  return coords;
}

export function canPlaceShip(
  placedShips: PlacedShip[],
  x: number,
  y: number,
  size: number,
  orientation: Orientation,
  ignoreShipId?: string
): boolean {
  if (orientation === 'horizontal') {
    if (x < 0 || x + size > BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return false;
  } else {
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y + size > BOARD_SIZE) return false;
  }

  const newCoords = getShipCoordinates(x, y, size, orientation);

  for (const ship of placedShips) {
    if (ignoreShipId && ship.id === ignoreShipId) continue;
    const existingCoords = getShipCoordinates(
      ship.x,
      ship.y,
      ship.size,
      ship.orientation
    );

    for (const nc of newCoords) {
      if (existingCoords.some(ec => ec.x === nc.x && ec.y === nc.y)) {
        return false;
      }
    }
  }

  return true;
}

export function generateRandomFleet(): PlacedShip[] {
  const placed: PlacedShip[] = [];

  for (const shipType of DEFAULT_SHIPS) {
    let placedSuccessfully = false;
    let attempts = 0;

    while (!placedSuccessfully && attempts < 200) {
      attempts++;
      const orientation: Orientation =
        Math.random() > 0.5 ? 'horizontal' : 'vertical';
      const maxX =
        orientation === 'horizontal' ? BOARD_SIZE - shipType.size : BOARD_SIZE - 1;
      const maxY =
        orientation === 'vertical' ? BOARD_SIZE - shipType.size : BOARD_SIZE - 1;

      const x = Math.floor(Math.random() * (maxX + 1));
      const y = Math.floor(Math.random() * (maxY + 1));

      if (canPlaceShip(placed, x, y, shipType.size, orientation)) {
        placed.push({
          id: `ship_${shipType.id}_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 6)}`,
          shipId: shipType.id,
          name: shipType.name,
          nameAr: shipType.nameAr,
          size: shipType.size,
          x,
          y,
          orientation,
          hits: 0,
          sunk: false,
        });
        placedSuccessfully = true;
      }
    }
  }

  return placed;
}

export function processSingleShot(
  targetGrid: CellData[][],
  placedShips: PlacedShip[],
  x: number,
  y: number
): { updatedGrid: CellData[][]; updatedShips: PlacedShip[]; result: ShotResult } {
  const newGrid = targetGrid.map(row =>
    row.map(cell => ({ ...cell, isRecent: false }))
  );
  const newShips = placedShips.map(s => ({ ...s }));

  const cell = newGrid[y][x];
  cell.isRecent = true;

  // Already targeted check
  if (cell.status === 'hit' || cell.status === 'miss') {
    return {
      updatedGrid: newGrid,
      updatedShips: newShips,
      result: { x, y, hit: cell.status === 'hit' },
    };
  }

  let hitShipIndex = -1;
  for (let i = 0; i < newShips.length; i++) {
    const ship = newShips[i];
    const coords = getShipCoordinates(
      ship.x,
      ship.y,
      ship.size,
      ship.orientation
    );
    if (coords.some(c => c.x === x && c.y === y)) {
      hitShipIndex = i;
      break;
    }
  }

  if (hitShipIndex !== -1) {
    const hitShip = newShips[hitShipIndex];
    cell.status = 'hit';
    cell.shipId = hitShip.id;
    hitShip.hits += 1;

    let justSunk = false;
    if (hitShip.hits >= hitShip.size) {
      hitShip.sunk = true;
      justSunk = true;

      // Mark all coordinates of this ship as sunk
      const sunkCoords = getShipCoordinates(
        hitShip.x,
        hitShip.y,
        hitShip.size,
        hitShip.orientation
      );
      for (const sc of sunkCoords) {
        if (newGrid[sc.y] && newGrid[sc.y][sc.x]) {
          newGrid[sc.y][sc.x].sunkShipId = hitShip.id;
        }
      }
    }

    return {
      updatedGrid: newGrid,
      updatedShips: newShips,
      result: {
        x,
        y,
        hit: true,
        sunkShip: justSunk ? hitShip : undefined,
      },
    };
  } else {
    cell.status = 'miss';
    return {
      updatedGrid: newGrid,
      updatedShips: newShips,
      result: {
        x,
        y,
        hit: false,
      },
    };
  }
}

export const processShot = processSingleShot;

// Process Airstrike (Strikes center + adjacent cross cells = 5 cells)
export function processAirstrike(
  targetGrid: CellData[][],
  placedShips: PlacedShip[],
  cx: number,
  cy: number
): {
  updatedGrid: CellData[][];
  updatedShips: PlacedShip[];
  results: ShotResult[];
  hitsCount: number;
  sunkShips: PlacedShip[];
} {
  const targetCoords: { x: number; y: number }[] = [
    { x: cx, y: cy },
    { x: cx - 1, y: cy },
    { x: cx + 1, y: cy },
    { x: cx, y: cy - 1 },
    { x: cx, y: cy + 1 },
  ].filter(c => c.x >= 0 && c.x < BOARD_SIZE && c.y >= 0 && c.y < BOARD_SIZE);

  let currentGrid = targetGrid;
  let currentShips = placedShips;
  const results: ShotResult[] = [];
  let hitsCount = 0;
  const sunkShips: PlacedShip[] = [];

  for (const { x, y } of targetCoords) {
    if (
      currentGrid[y][x].status === 'hit' ||
      currentGrid[y][x].status === 'miss'
    ) {
      continue;
    }
    const res = processSingleShot(currentGrid, currentShips, x, y);
    currentGrid = res.updatedGrid;
    currentShips = res.updatedShips;
    results.push(res.result);
    if (res.result.hit) {
      hitsCount++;
    }
    if (res.result.sunkShip) {
      sunkShips.push(res.result.sunkShip);
    }
  }

  return {
    updatedGrid: currentGrid,
    updatedShips: currentShips,
    results,
    hitsCount,
    sunkShips,
  };
}

// Process Torpedo Strike (Fires along a row horizontally or column vertically)
export function processTorpedo(
  targetGrid: CellData[][],
  placedShips: PlacedShip[],
  index: number,
  direction: 'row' | 'col'
): {
  updatedGrid: CellData[][];
  updatedShips: PlacedShip[];
  results: ShotResult[];
  hitsCount: number;
  sunkShips: PlacedShip[];
} {
  const targetCoords: { x: number; y: number }[] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (direction === 'row') {
      targetCoords.push({ x: i, y: index });
    } else {
      targetCoords.push({ x: index, y: i });
    }
  }

  let currentGrid = targetGrid;
  let currentShips = placedShips;
  const results: ShotResult[] = [];
  let hitsCount = 0;
  const sunkShips: PlacedShip[] = [];

  for (const { x, y } of targetCoords) {
    if (
      currentGrid[y][x].status === 'hit' ||
      currentGrid[y][x].status === 'miss'
    ) {
      continue;
    }
    const res = processSingleShot(currentGrid, currentShips, x, y);
    currentGrid = res.updatedGrid;
    currentShips = res.updatedShips;
    results.push(res.result);
    if (res.result.hit) {
      hitsCount++;
    }
    if (res.result.sunkShip) {
      sunkShips.push(res.result.sunkShip);
    }
  }

  return {
    updatedGrid: currentGrid,
    updatedShips: currentShips,
    results,
    hitsCount,
    sunkShips,
  };
}

// Tactical AI implementation
export class AIPlayer {
  private targetQueue: { x: number; y: number }[] = [];
  private lastHitCoord: { x: number; y: number } | null = null;
  private currentTargetHits: { x: number; y: number }[] = [];

  public reset() {
    this.targetQueue = [];
    this.lastHitCoord = null;
    this.currentTargetHits = [];
  }

  public registerShotResult(result: ShotResult, currentGrid: CellData[][]) {
    if (result.hit) {
      this.currentTargetHits.push({ x: result.x, y: result.y });
      this.lastHitCoord = { x: result.x, y: result.y };

      if (result.sunkShip) {
        this.currentTargetHits = [];
        this.lastHitCoord = null;
        this.targetQueue = [];
      } else {
        this.addAdjacentTargets(result.x, result.y, currentGrid);
      }
    }
  }

  private addAdjacentTargets(x: number, y: number, grid: CellData[][]) {
    const adjacents = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];

    for (const adj of adjacents) {
      if (
        adj.x >= 0 &&
        adj.x < BOARD_SIZE &&
        adj.y >= 0 &&
        adj.y < BOARD_SIZE
      ) {
        const cell = grid[adj.y][adj.x];
        if (cell.status !== 'hit' && cell.status !== 'miss') {
          if (!this.targetQueue.some(t => t.x === adj.x && t.y === adj.y)) {
            this.targetQueue.unshift(adj);
          }
        }
      }
    }
  }

  public getNextMove(
    grid: CellData[][],
    difficulty: AIDifficulty
  ): { x: number; y: number } {
    while (this.targetQueue.length > 0) {
      const candidate = this.targetQueue.shift()!;
      if (
        candidate.x >= 0 &&
        candidate.x < BOARD_SIZE &&
        candidate.y >= 0 &&
        candidate.y < BOARD_SIZE
      ) {
        const cell = grid[candidate.y][candidate.x];
        if (cell.status !== 'hit' && cell.status !== 'miss') {
          return candidate;
        }
      }
    }

    if (difficulty === 'admiral') {
      const checkerboardMoves: { x: number; y: number }[] = [];
      for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
          if (
            (x + y) % 2 === 0 &&
            grid[y][x].status !== 'hit' &&
            grid[y][x].status !== 'miss'
          ) {
            checkerboardMoves.push({ x, y });
          }
        }
      }

      if (checkerboardMoves.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * checkerboardMoves.length
        );
        return checkerboardMoves[randomIndex];
      }
    }

    const availableMoves: { x: number; y: number }[] = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (grid[y][x].status !== 'hit' && grid[y][x].status !== 'miss') {
          availableMoves.push({ x, y });
        }
      }
    }

    if (availableMoves.length === 0) {
      return { x: 0, y: 0 };
    }

    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }
}
