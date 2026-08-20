export type Orientation = 'horizontal' | 'vertical';

export type Language = 'ar' | 'en';

export interface ShipType {
  id: string;
  name: string;
  nameAr: string;
  size: number;
  color?: string;
  iconName?: string;
}

export interface PlacedShip {
  id: string;
  shipId: string;
  name: string;
  nameAr?: string;
  size: number;
  x: number;
  y: number;
  orientation: Orientation;
  hits: number;
  sunk: boolean;
}

export type CellStatus = 'empty' | 'ship' | 'hit' | 'miss';

export interface CellData {
  x: number;
  y: number;
  status: CellStatus;
  shipId?: string;
  sunkShipId?: string;
  isRecent?: boolean;
  isScouted?: boolean;
}

export type GamePhase = 'placement' | 'battle' | 'game-over';

export type GameTurn = 'player' | 'computer';

export type AIDifficulty = 'cadet' | 'admiral';

export type WeaponType = 'regular' | 'airstrike' | 'torpedo';

export interface SpecialWeapons {
  airstrikes: number; // e.g. 1 or 2 per game
  torpedoes: number; // e.g. 2 per game
}

export interface ShotResult {
  x: number;
  y: number;
  hit: boolean;
  sunkShip?: PlacedShip;
}

export interface LogEntry {
  id: string;
  turnNumber: number;
  attacker: 'player' | 'computer';
  coordinate: string;
  result: 'hit' | 'miss' | 'sunk';
  weapon?: WeaponType;
  shipName?: string;
  shipNameAr?: string;
  timestamp: string;
}

export interface GameStats {
  playerShots: number;
  playerHits: number;
  playerMisses: number;
  computerShots: number;
  computerHits: number;
  computerMisses: number;
  turns: number;
  airstrikesUsed: number;
  torpedoesUsed: number;
  startTime: number;
  endTime?: number;
}
