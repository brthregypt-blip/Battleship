import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GamePhase,
  GameTurn,
  PlacedShip,
  CellData,
  ShipType,
  Orientation,
  LogEntry,
  GameStats,
  AIDifficulty,
  WeaponType,
  SpecialWeapons,
  Language,
} from './types';
import {
  createEmptyGrid,
  DEFAULT_SHIPS,
  generateRandomFleet,
  canPlaceShip,
  getShipCoordinates,
  processSingleShot,
  processAirstrike,
  processTorpedo,
  toCoordString,
  AIPlayer,
  BOARD_SIZE,
} from './utils/gameLogic';
import { soundManager } from './utils/audio';
import { GridBoard } from './components/GridBoard';
import { ShipRoster } from './components/ShipRoster';
import { BattleLog } from './components/BattleLog';
import { GameOverModal } from './components/GameOverModal';
import { HelpModal } from './components/HelpModal';
import {
  AnchorDoodle,
  TargetDoodle,
  PlaneDoodle,
  TorpedoDoodle,
  RocketDoodle,
} from './components/HandDrawnIcons';
import {
  Volume2,
  VolumeX,
  RotateCw,
  Shuffle,
  Trash2,
  Play,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Globe,
  Crosshair,
  Shield,
  Zap,
} from 'lucide-react';

export default function App() {
  // Localization state
  const [lang, setLang] = useState<Language>('ar');
  const isAr = lang === 'ar';

  // Game state
  const [phase, setPhase] = useState<GamePhase>('placement');
  const [turn, setTurn] = useState<GameTurn>('player');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('admiral');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'computer' | null>(null);

  // Weapon systems
  const [activeWeapon, setActiveWeapon] = useState<WeaponType>('regular');
  const [playerWeapons, setPlayerWeapons] = useState<SpecialWeapons>({
    airstrikes: 2,
    torpedoes: 2,
  });
  const [computerWeapons, setComputerWeapons] = useState<SpecialWeapons>({
    airstrikes: 1,
    torpedoes: 1,
  });

  // Animation states
  const [animatingCell, setAnimatingCell] = useState<{
    x: number;
    y: number;
    type: 'rocket' | 'explosion' | 'splash';
  } | null>(null);
  const [torpedoLine, setTorpedoLine] = useState<{
    index: number;
    direction: 'row' | 'col';
  } | null>(null);
  const [showPlaneFlyover, setShowPlaneFlyover] = useState<boolean>(false);
  const [isProcessingShot, setIsProcessingShot] = useState<boolean>(false);

  // Boards and Ships
  const [playerGrid, setPlayerGrid] = useState<CellData[][]>(() =>
    createEmptyGrid()
  );
  const [computerGrid, setComputerGrid] = useState<CellData[][]>(() =>
    createEmptyGrid()
  );
  const [playerShips, setPlayerShips] = useState<PlacedShip[]>([]);
  const [computerShips, setComputerShips] = useState<PlacedShip[]>([]);

  // Placement mode states
  const [selectedShipType, setSelectedShipType] = useState<ShipType | null>(
    DEFAULT_SHIPS[0]
  );
  const [placementOrientation, setPlacementOrientation] =
    useState<Orientation>('horizontal');
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(
    null
  );

  // Battle logs & stats
  const [battleLogs, setBattleLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<GameStats>({
    playerShots: 0,
    playerHits: 0,
    playerMisses: 0,
    computerShots: 0,
    computerHits: 0,
    computerMisses: 0,
    turns: 0,
    airstrikesUsed: 0,
    torpedoesUsed: 0,
    startTime: Date.now(),
  });

  // AI controller instance
  const aiRef = useRef<AIPlayer>(new AIPlayer());
  const turnTimeoutRef = useRef<number | null>(null);

  // Sync sound manager state
  useEffect(() => {
    soundManager.enabled = soundEnabled;
  }, [soundEnabled]);

  // Handle keyboard shortcuts (e.g. 'r' to rotate, '1,2,3' for weapons)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === 'placement') {
        if (e.key === 'r' || e.key === 'R') {
          setPlacementOrientation(prev =>
            prev === 'horizontal' ? 'vertical' : 'horizontal'
          );
          soundManager.playPenClick();
        }
      } else if (phase === 'battle' && turn === 'player') {
        if (e.key === '1') {
          setActiveWeapon('regular');
          soundManager.playPenClick();
        } else if (e.key === '2' && playerWeapons.airstrikes > 0) {
          setActiveWeapon('airstrike');
          soundManager.playPenClick();
        } else if (e.key === '3' && playerWeapons.torpedoes > 0) {
          setActiveWeapon('torpedo');
          soundManager.playPenClick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, turn, playerWeapons]);

  // Check victory condition
  useEffect(() => {
    if (phase !== 'battle') return;

    const allComputerShipsSunk =
      computerShips.length > 0 && computerShips.every(s => s.sunk);
    const allPlayerShipsSunk =
      playerShips.length > 0 && playerShips.every(s => s.sunk);

    if (allComputerShipsSunk) {
      setWinner('player');
      setPhase('game-over');
      soundManager.playVictory();
      setStats(prev => ({ ...prev, endTime: Date.now() }));
    } else if (allPlayerShipsSunk) {
      setWinner('computer');
      setPhase('game-over');
      soundManager.playDefeat();
      setStats(prev => ({ ...prev, endTime: Date.now() }));
    }
  }, [computerShips, playerShips, phase]);

  // Rotate Ship orientation
  const handleRotate = useCallback(() => {
    setPlacementOrientation(prev =>
      prev === 'horizontal' ? 'vertical' : 'horizontal'
    );
    soundManager.playPenClick();
  }, []);

  // Auto deploy random fleet
  const handleAutoDeploy = useCallback(() => {
    soundManager.playScribble();
    const randomFleet = generateRandomFleet();
    setPlayerShips(randomFleet);
    setSelectedShipType(null);
  }, []);

  // Clear fleet placement
  const handleClearFleet = useCallback(() => {
    soundManager.playPenClick();
    setPlayerShips([]);
    setSelectedShipType(DEFAULT_SHIPS[0]);
  }, []);

  // Place ship on click
  const handlePlacementClick = useCallback(
    (x: number, y: number) => {
      if (!selectedShipType) return;

      const isValid = canPlaceShip(
        playerShips,
        x,
        y,
        selectedShipType.size,
        placementOrientation
      );

      if (isValid) {
        soundManager.playScribble();
        const newShip: PlacedShip = {
          id: `ship_${selectedShipType.id}_${Date.now()}`,
          shipId: selectedShipType.id,
          name: selectedShipType.name,
          nameAr: selectedShipType.nameAr,
          size: selectedShipType.size,
          x,
          y,
          orientation: placementOrientation,
          hits: 0,
          sunk: false,
        };

        const updatedFleet = [
          ...playerShips.filter(s => s.shipId !== selectedShipType.id),
          newShip,
        ];
        setPlayerShips(updatedFleet);

        const nextUnplaced = DEFAULT_SHIPS.find(
          def => !updatedFleet.some(s => s.shipId === def.id)
        );
        setSelectedShipType(nextUnplaced || null);
      }
    },
    [selectedShipType, playerShips, placementOrientation]
  );

  // Start Battle
  const handleStartBattle = useCallback(() => {
    if (playerShips.length !== DEFAULT_SHIPS.length) return;

    soundManager.playPenClick();
    soundManager.playSonarPing();

    const enemyFleet = generateRandomFleet();
    setComputerShips(enemyFleet);
    setComputerGrid(createEmptyGrid());
    setPlayerGrid(createEmptyGrid());
    setBattleLogs([]);
    setWinner(null);
    aiRef.current.reset();

    setPlayerWeapons({ airstrikes: 2, torpedoes: 2 });
    setComputerWeapons({ airstrikes: 1, torpedoes: 1 });
    setActiveWeapon('regular');

    setStats({
      playerShots: 0,
      playerHits: 0,
      playerMisses: 0,
      computerShots: 0,
      computerHits: 0,
      computerMisses: 0,
      turns: 0,
      airstrikesUsed: 0,
      torpedoesUsed: 0,
      startTime: Date.now(),
    });

    setPhase('battle');
    setTurn('player');
  }, [playerShips]);

  // Restart Entire Game
  const handleRestart = useCallback(() => {
    soundManager.playPenClick();
    if (turnTimeoutRef.current) {
      clearTimeout(turnTimeoutRef.current);
    }
    setPhase('placement');
    setTurn('player');
    setPlayerShips([]);
    setComputerShips([]);
    setPlayerGrid(createEmptyGrid());
    setComputerGrid(createEmptyGrid());
    setSelectedShipType(DEFAULT_SHIPS[0]);
    setBattleLogs([]);
    setWinner(null);
    setActiveWeapon('regular');
    setAnimatingCell(null);
    setTorpedoLine(null);
    setShowPlaneFlyover(false);
    setIsProcessingShot(false);
    aiRef.current.reset();
  }, []);

  // Compute preview coordinates based on active weapon
  const getWeaponPreviewCoords = useCallback(
    (x: number, y: number): { coords: { x: number; y: number }[]; valid: boolean } => {
      if (phase === 'placement' && selectedShipType) {
        const coords = getShipCoordinates(
          x,
          y,
          selectedShipType.size,
          placementOrientation
        );
        const valid = canPlaceShip(
          playerShips,
          x,
          y,
          selectedShipType.size,
          placementOrientation
        );
        return { coords, valid };
      }

      if (phase === 'battle') {
        if (activeWeapon === 'regular') {
          return { coords: [{ x, y }], valid: true };
        }
        if (activeWeapon === 'airstrike') {
          const coords = [
            { x, y },
            { x: x - 1, y },
            { x: x + 1, y },
            { x, y: y - 1 },
            { x, y: y + 1 },
          ].filter(
            c => c.x >= 0 && c.x < BOARD_SIZE && c.y >= 0 && c.y < BOARD_SIZE
          );
          return { coords, valid: playerWeapons.airstrikes > 0 };
        }
        if (activeWeapon === 'torpedo') {
          const coords: { x: number; y: number }[] = [];
          for (let i = 0; i < BOARD_SIZE; i++) {
            coords.push({ x: i, y }); // row sweep
          }
          return { coords, valid: playerWeapons.torpedoes > 0 };
        }
      }

      return { coords: [], valid: true };
    },
    [phase, selectedShipType, placementOrientation, playerShips, activeWeapon, playerWeapons]
  );

  // Player Fires Weapon
  const handlePlayerAttack = async (x: number, y: number) => {
    if (
      phase !== 'battle' ||
      turn !== 'player' ||
      isProcessingShot ||
      winner !== null
    ) {
      return;
    }

    // Check if cell already targeted (for regular shot)
    if (
      activeWeapon === 'regular' &&
      (computerGrid[y][x].status === 'hit' ||
        computerGrid[y][x].status === 'miss')
    ) {
      return;
    }

    setIsProcessingShot(true);

    if (activeWeapon === 'airstrike') {
      // 1. AIRSTRIKE ATTACK
      if (playerWeapons.airstrikes <= 0) {
        setIsProcessingShot(false);
        return;
      }

      setShowPlaneFlyover(true);
      setPlayerWeapons(prev => ({
        ...prev,
        airstrikes: prev.airstrikes - 1,
      }));
      setStats(prev => ({
        ...prev,
        airstrikesUsed: prev.airstrikesUsed + 1,
      }));

      await soundManager.playAirstrike();
      setShowPlaneFlyover(false);

      const res = processAirstrike(computerGrid, computerShips, x, y);
      setComputerGrid(res.updatedGrid);
      setComputerShips(res.updatedShips);

      // Play sound based on result with spatial stereo panning
      const pan = (x / 9) * 1.6 - 0.8;
      if (res.sunkShips.length > 0) {
        soundManager.playShipSunk();
      } else if (res.hitsCount > 0) {
        soundManager.playExplosion(pan);
      } else {
        soundManager.playSplash(pan);
      }

      // Add log entries
      const newLogs: LogEntry[] = [
        {
          id: `log_${Date.now()}`,
          turnNumber: stats.turns + 1,
          attacker: 'player',
          coordinate: `${toCoordString(x, y)} [${isAr ? 'قصف جوي' : 'Airstrike'}]`,
          result: res.hitsCount > 0 ? (res.sunkShips.length > 0 ? 'sunk' : 'hit') : 'miss',
          weapon: 'airstrike',
          shipName: res.sunkShips[0]?.name,
          shipNameAr: res.sunkShips[0]?.nameAr,
          timestamp: new Date().toLocaleTimeString(),
        },
      ];

      setBattleLogs(prev => [...newLogs, ...prev]);
      setStats(prev => ({
        ...prev,
        playerShots: prev.playerShots + res.results.length,
        playerHits: prev.playerHits + res.hitsCount,
        playerMisses: prev.playerMisses + (res.results.length - res.hitsCount),
        turns: prev.turns + 1,
      }));

      setActiveWeapon('regular');
      setIsProcessingShot(false);

      // Check if win before computer turn
      if (!res.updatedShips.every(s => s.sunk)) {
        setTurn('computer');
      }
    } else if (activeWeapon === 'torpedo') {
      // 2. TORPEDO ATTACK
      if (playerWeapons.torpedoes <= 0) {
        setIsProcessingShot(false);
        return;
      }

      setTorpedoLine({ index: y, direction: 'row' });
      setPlayerWeapons(prev => ({
        ...prev,
        torpedoes: prev.torpedoes - 1,
      }));
      setStats(prev => ({
        ...prev,
        torpedoesUsed: prev.torpedoesUsed + 1,
      }));

      await soundManager.playTorpedoLaunch();
      setTorpedoLine(null);

      const res = processTorpedo(computerGrid, computerShips, y, 'row');
      setComputerGrid(res.updatedGrid);
      setComputerShips(res.updatedShips);

      if (res.sunkShips.length > 0) {
        soundManager.playShipSunk();
      } else if (res.hitsCount > 0) {
        soundManager.playExplosion(0);
      } else {
        soundManager.playSplash(0);
      }

      const newLogs: LogEntry[] = [
        {
          id: `log_${Date.now()}`,
          turnNumber: stats.turns + 1,
          attacker: 'player',
          coordinate: `${isAr ? 'الصف' : 'Row'} ${y + 1} [${isAr ? 'طوربيد' : 'Torpedo'}]`,
          result: res.hitsCount > 0 ? (res.sunkShips.length > 0 ? 'sunk' : 'hit') : 'miss',
          weapon: 'torpedo',
          shipName: res.sunkShips[0]?.name,
          shipNameAr: res.sunkShips[0]?.nameAr,
          timestamp: new Date().toLocaleTimeString(),
        },
      ];

      setBattleLogs(prev => [...newLogs, ...prev]);
      setStats(prev => ({
        ...prev,
        playerShots: prev.playerShots + res.results.length,
        playerHits: prev.playerHits + res.hitsCount,
        playerMisses: prev.playerMisses + (res.results.length - res.hitsCount),
        turns: prev.turns + 1,
      }));

      setActiveWeapon('regular');
      setIsProcessingShot(false);

      if (!res.updatedShips.every(s => s.sunk)) {
        setTurn('computer');
      }
    } else {
      // 3. REGULAR MISSILE SHOT
      setAnimatingCell({ x, y, type: 'rocket' });

      // Realistic Missile flight sound whoosh in the air
      await soundManager.playRocketFlight();

      const { updatedGrid, updatedShips, result } = processSingleShot(
        computerGrid,
        computerShips,
        x,
        y
      );

      setComputerGrid(updatedGrid);
      setComputerShips(updatedShips);

      const pan = (x / 9) * 1.6 - 0.8;
      if (result.hit) {
        setAnimatingCell({ x, y, type: 'explosion' });
        if (result.sunkShip) {
          soundManager.playShipSunk();
        } else {
          soundManager.playExplosion(pan);
        }
      } else {
        setAnimatingCell({ x, y, type: 'splash' });
        soundManager.playSplash(pan);
      }

      setTimeout(() => {
        setAnimatingCell(null);
      }, 550);

      const newLog: LogEntry = {
        id: `log_${Date.now()}`,
        turnNumber: stats.turns + 1,
        attacker: 'player',
        coordinate: toCoordString(x, y),
        result: result.sunkShip ? 'sunk' : result.hit ? 'hit' : 'miss',
        weapon: 'regular',
        shipName: result.sunkShip?.name,
        shipNameAr: result.sunkShip?.nameAr,
        timestamp: new Date().toLocaleTimeString(),
      };

      setBattleLogs(prev => [newLog, ...prev]);
      setStats(prev => ({
        ...prev,
        playerShots: prev.playerShots + 1,
        playerHits: prev.playerHits + (result.hit ? 1 : 0),
        playerMisses: prev.playerMisses + (result.hit ? 0 : 1),
        turns: prev.turns + 1,
      }));

      setIsProcessingShot(false);

      if (!updatedShips.every(s => s.sunk)) {
        setTurn('computer');
      }
    }
  };

  // AI Computer Turn
  useEffect(() => {
    if (phase !== 'battle' || turn !== 'computer' || winner !== null) return;

    turnTimeoutRef.current = window.setTimeout(async () => {
      // Choose AI action
      const target = aiRef.current.getNextMove(playerGrid, difficulty);

      // Sound and visual animation for enemy incoming missile
      setAnimatingCell({ x: target.x, y: target.y, type: 'rocket' });
      await soundManager.playRocketFlight();

      const { updatedGrid, updatedShips, result } = processSingleShot(
        playerGrid,
        playerShips,
        target.x,
        target.y
      );

      setPlayerGrid(updatedGrid);
      setPlayerShips(updatedShips);
      aiRef.current.registerShotResult(result, updatedGrid);

      const pan = (target.x / 9) * 1.6 - 0.8;
      if (result.hit) {
        setAnimatingCell({ x: target.x, y: target.y, type: 'explosion' });
        if (result.sunkShip) {
          soundManager.playShipSunk();
        } else {
          soundManager.playExplosion(pan);
        }
      } else {
        setAnimatingCell({ x: target.x, y: target.y, type: 'splash' });
        soundManager.playSplash(pan);
      }

      setTimeout(() => {
        setAnimatingCell(null);
      }, 550);

      const newLog: LogEntry = {
        id: `log_ai_${Date.now()}`,
        turnNumber: stats.turns + 1,
        attacker: 'computer',
        coordinate: toCoordString(target.x, target.y),
        result: result.sunkShip ? 'sunk' : result.hit ? 'hit' : 'miss',
        weapon: 'regular',
        shipName: result.sunkShip?.name,
        shipNameAr: result.sunkShip?.nameAr,
        timestamp: new Date().toLocaleTimeString(),
      };

      setBattleLogs(prev => [newLog, ...prev]);
      setStats(prev => ({
        ...prev,
        computerShots: prev.computerShots + 1,
        computerHits: prev.computerHits + (result.hit ? 1 : 0),
        computerMisses: prev.computerMisses + (result.hit ? 0 : 1),
      }));

      if (!updatedShips.every(s => s.sunk)) {
        setTurn('player');
      }
    }, 700);

    return () => {
      if (turnTimeoutRef.current) {
        clearTimeout(turnTimeoutRef.current);
      }
    };
  }, [turn, phase, playerGrid, playerShips, difficulty, winner, stats.turns]);

  const previewInfo = hoverCoord
    ? getWeaponPreviewCoords(hoverCoord.x, hoverCoord.y)
    : { coords: [], valid: true };

  const isFleetReady = playerShips.length === DEFAULT_SHIPS.length;

  return (
    <div
      className="min-h-screen bg-[#f4eee2] text-[#1a3a5f] p-3 sm:p-6 lg:p-8 flex flex-col justify-between font-clean"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Main Navigation Header */}
      <header className="max-w-7xl mx-auto w-full mb-6 pb-4 border-b-2 border-[#1a3a5f] border-dashed">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white border-2 border-[#1a3a5f] artistic-box-shadow rounded-md rotate-[-2deg]">
              <AnchorDoodle size={28} className="text-[#1a3a5f]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide text-[#1a3a5f] font-cairo">
                {isAr ? 'معركة البوارج الحربية' : 'BATTLESHIP NOTEBOOK'}
              </h1>
              <p className="text-xs sm:text-sm text-[#1a3a5f] opacity-80 font-clean mt-0.5">
                {isAr
                  ? 'نسخة كراسة التكتيكات البحرية مع الضربات الجوية والطوربيدات'
                  : 'Tactical Naval Combat Edition with Airstrikes & Torpedoes'}
              </p>
            </div>
          </div>

          {/* Quick Controls Bar */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => {
                setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
                soundManager.playPenClick();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-[#1a3a5f] bg-white border-2 border-[#1a3a5f] rounded artistic-btn font-cairo cursor-pointer"
              title={isAr ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe size={15} />
              <span>{isAr ? 'English' : 'عربي'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(prev => !prev);
                soundManager.playPenClick();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-[#1a3a5f] bg-white border-2 border-[#1a3a5f] rounded artistic-btn font-cairo cursor-pointer"
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{soundEnabled ? (isAr ? 'الصوت مفعّل' : 'Sound ON') : (isAr ? 'مكتوم' : 'Sound OFF')}</span>
            </button>

            {/* AI Difficulty */}
            {phase === 'placement' && (
              <div className="flex items-center gap-1 bg-white p-1 rounded border-2 border-[#1a3a5f] sketch-border font-cairo text-xs font-bold">
                <span className="px-1.5 text-[#1a3a5f] opacity-75">{isAr ? 'الذكاء:' : 'AI:'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setDifficulty('cadet');
                    soundManager.playPenClick();
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    difficulty === 'cadet'
                      ? 'bg-[#1a3a5f] text-white'
                      : 'text-[#1a3a5f] hover:bg-[#d1e4f0]/50'
                  }`}
                >
                  {isAr ? 'مبتدئ' : 'Cadet'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDifficulty('admiral');
                    soundManager.playPenClick();
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    difficulty === 'admiral'
                      ? 'bg-[#1a3a5f] text-white'
                      : 'text-[#1a3a5f] hover:bg-[#d1e4f0]/50'
                  }`}
                >
                  {isAr ? 'أميرال ذكي' : 'Admiral'}
                </button>
              </div>
            )}

            {/* Field Guide / Help Modal */}
            <button
              type="button"
              onClick={() => {
                setShowHelp(true);
                soundManager.playPenClick();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-[#1a3a5f] bg-amber-50 border-2 border-[#1a3a5f] rounded artistic-btn font-cairo cursor-pointer"
            >
              <HelpCircle size={16} className="text-amber-800" />
              <span>{isAr ? 'دليل الأسلحة والقواعد' : 'Weapons Guide'}</span>
            </button>

            {/* Restart Match */}
            {phase !== 'placement' && (
              <button
                type="button"
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-[#cc3333] bg-red-50 border-2 border-[#cc3333] rounded artistic-btn font-cairo cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>{isAr ? 'إعادة التشغيل' : 'Restart'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Game Stage Area */}
      <main className="max-w-7xl mx-auto w-full flex-1">
        {/* Placement Mode Header & Actions */}
        {phase === 'placement' && (
          <div className="bg-[#fdfaf5]/90 border-2 border-[#1a3a5f] p-4 sm:p-5 rounded-lg mb-6 artistic-box-shadow flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a3a5f] font-cairo flex items-center gap-2">
                <Shield size={22} className="text-[#1a3a5f]" />
                <span>{isAr ? 'مرحلة نشر وتوزيع أسطولك' : 'Fleet Deployment Phase'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#1a3a5f] opacity-85 font-clean">
                {isAr
                  ? 'انقر على السفينة لاختيارها، ثم انقر على الشبكة لوضعها. استخدم زر (R) للتدوير.'
                  : 'Select a ship from the roster, then click the grid to place. Press (R) or button to rotate.'}
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleAutoDeploy}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-[#1a3a5f] bg-white border-2 border-[#1a3a5f] rounded artistic-btn font-cairo cursor-pointer"
              >
                <Shuffle size={16} />
                <span>{isAr ? 'توزيع عشوائي' : 'Auto Deploy'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearFleet}
                disabled={playerShips.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-[#cc3333] bg-white border-2 border-[#cc3333]/80 rounded artistic-btn font-cairo cursor-pointer disabled:opacity-40"
              >
                <Trash2 size={15} />
                <span>{isAr ? 'مسح' : 'Clear'}</span>
              </button>

              <button
                type="button"
                disabled={!isFleetReady}
                onClick={handleStartBattle}
                className={`
                  flex items-center gap-2 px-6 py-2.5 text-sm sm:text-base font-extrabold rounded border-2 font-cairo cursor-pointer transition-all
                  ${
                    isFleetReady
                      ? 'bg-[#1a3a5f] text-white border-[#1a3a5f] artistic-box-shadow animate-pulse'
                      : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                  }
                `}
                style={{
                  borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
                }}
              >
                <Play size={18} />
                <span>
                  {isFleetReady
                    ? isAr
                      ? 'بدء المعركة البحرية!'
                      : 'ENGAGE BATTLE!'
                    : isAr
                    ? `انشر البقية (${playerShips.length}/${DEFAULT_SHIPS.length})`
                    : `Deploy All (${playerShips.length}/${DEFAULT_SHIPS.length})`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Battle Mode Special Weapons Bar */}
        {phase === 'battle' && (
          <div className="bg-[#fdfaf5]/90 border-2 border-[#1a3a5f] p-3.5 sm:p-4 rounded-lg mb-6 artistic-box-shadow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-amber-600 animate-pulse" />
                <h3 className="text-base sm:text-lg font-extrabold text-[#1a3a5f] font-cairo">
                  {isAr ? 'ترسانة الأسلحة والتكتيكات:' : 'Tactical Weapon Arsenal:'}
                </h3>
              </div>

              {/* Weapon Choice Buttons */}
              <div className="flex items-center flex-wrap gap-2.5">
                {/* Regular Fire */}
                <button
                  type="button"
                  disabled={turn !== 'player'}
                  onClick={() => {
                    setActiveWeapon('regular');
                    soundManager.playPenClick();
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded border-2 font-cairo font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    activeWeapon === 'regular'
                      ? 'bg-[#1a3a5f] text-white border-[#1a3a5f] shadow-md scale-105'
                      : 'bg-white text-[#1a3a5f] border-[#1a3a5f]/40 hover:bg-[#d1e4f0]/40'
                  }`}
                  style={{
                    borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
                  }}
                >
                  <RocketDoodle size={18} />
                  <span>{isAr ? 'صاروخ عادي [1]' : 'Regular Missile [1]'}</span>
                  <span className="text-[11px] opacity-75 font-clean">
                    {isAr ? 'غير محدود' : 'Unlimited'}
                  </span>
                </button>

                {/* Airstrike */}
                <button
                  type="button"
                  disabled={turn !== 'player' || playerWeapons.airstrikes <= 0}
                  onClick={() => {
                    if (playerWeapons.airstrikes > 0) {
                      setActiveWeapon('airstrike');
                      soundManager.playPenClick();
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded border-2 font-cairo font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    activeWeapon === 'airstrike'
                      ? 'bg-amber-600 text-white border-amber-800 shadow-md scale-105'
                      : playerWeapons.airstrikes > 0
                      ? 'bg-amber-50 text-amber-900 border-amber-500/60 hover:bg-amber-100'
                      : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                  }`}
                  style={{
                    borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
                  }}
                >
                  <PlaneDoodle size={18} />
                  <span>{isAr ? 'ضربة جوية بالطائرة [2]' : 'Airstrike Bomber [2]'}</span>
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-display bg-amber-900/20">
                    {playerWeapons.airstrikes} {isAr ? 'متبقية' : 'left'}
                  </span>
                </button>

                {/* Torpedo */}
                <button
                  type="button"
                  disabled={turn !== 'player' || playerWeapons.torpedoes <= 0}
                  onClick={() => {
                    if (playerWeapons.torpedoes > 0) {
                      setActiveWeapon('torpedo');
                      soundManager.playPenClick();
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded border-2 font-cairo font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    activeWeapon === 'torpedo'
                      ? 'bg-cyan-700 text-white border-cyan-900 shadow-md scale-105'
                      : playerWeapons.torpedoes > 0
                      ? 'bg-cyan-50 text-cyan-900 border-cyan-500/60 hover:bg-cyan-100'
                      : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                  }`}
                  style={{
                    borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
                  }}
                >
                  <TorpedoDoodle size={18} />
                  <span>{isAr ? 'طوربيد بحري مسار كامل [3]' : 'Torpedo Salvo [3]'}</span>
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-display bg-cyan-900/20">
                    {playerWeapons.torpedoes} {isAr ? 'متبقية' : 'left'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Boards & Side Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Player Defense Grid (Left / 5 cols) */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-4">
            <GridBoard
              id="player-board"
              title={isAr ? 'أسطولك البحري الدفاعي' : 'Your Fleet Formation'}
              subTitle={
                phase === 'placement'
                  ? isAr
                    ? 'انقر لتثبيت وتوزيع سفنك على الشبكة'
                    : 'Place and deploy your 5 combat vessels'
                  : isAr
                  ? 'متابعة الأضرار وإصابات سفنك'
                  : 'Incoming enemy artillery impacts'
              }
              badge={isAr ? 'قاعدتك' : 'BASE'}
              grid={playerGrid}
              placedShips={playerShips}
              showShips={true}
              isInteractive={phase === 'placement'}
              onCellClick={handlePlacementClick}
              onCellHover={(x, y) => setHoverCoord({ x, y })}
              onCellLeave={() => setHoverCoord(null)}
              previewCoords={phase === 'placement' ? previewInfo.coords : []}
              previewValid={phase === 'placement' ? previewInfo.valid : true}
              turnHighlight={phase === 'battle' && turn === 'computer'}
              animatingCell={
                turn === 'computer' || phase === 'battle' ? animatingCell : null
              }
              isRtl={isAr}
            />

            {/* Player Ship Roster */}
            <ShipRoster
              title={isAr ? 'حالة قطع الأسطول' : 'Your Naval Roster'}
              ships={playerShips}
              selectedShipId={selectedShipType?.id}
              orientation={placementOrientation}
              isPlacementMode={phase === 'placement'}
              onSelectShip={ship => setSelectedShipType(ship)}
              onRotate={handleRotate}
              lang={lang}
            />
          </div>

          {/* Enemy Radar Grid (Right / 5 cols) or Battle Logs */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-4">
            {phase === 'placement' ? (
              <div
                className="bg-[#fdfaf5]/90 border-2 border-[#1a3a5f] p-5 sm:p-6 artistic-box-shadow space-y-4 font-clean"
                style={{
                  borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
                }}
              >
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#1a3a5f] border-dashed">
                  <TargetDoodle size={24} className="text-[#1a3a5f]" />
                  <h3 className="text-xl font-bold font-cairo text-[#1a3a5f]">
                    {isAr ? 'تعليمات التجهيز والاستعداد' : 'Battle Readiness Briefing'}
                  </h3>
                </div>

                <div className="space-y-3 text-sm text-[#1a3a5f] opacity-90 leading-relaxed">
                  <p>
                    {isAr
                      ? '⚓ قم بتوزيع جميع السفن الخمس يدوياً بالنقر على أيقونات السفن ثم النقر على الخريطة، أو اضغط على "توزيع عشوائي" للبدء فوراً.'
                      : '⚓ Position your five naval vessels manually or use the "Auto Deploy" button to generate a fleet layout instantly.'}
                  </p>
                  <p>
                    {isAr
                      ? '✈️ بمجرد بدء المعركة، ستتاح لك ضربات الطائرات الاستطلاعية (Airstrikes) والطوربيدات الخطية (Torpedoes) مع مؤثرات صوتية لرحلة الصاروخ والانفجارات والاصطدام بالماء.'
                      : '✈️ During battle, tactical Airstrikes & Torpedoes unlock with dynamic rocket flight whistling, explosion detonations, and water splashes!'}
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded border border-amber-400 font-cairo text-xs font-bold text-amber-900">
                  💡 {isAr ? 'نصيحة تكتيكية: احرص على عدم حشر سفنك متجاورة لتجنب رصدها بالضربات الجوية!' : 'Tactical tip: Spread out your fleet to minimize vulnerability to enemy airstrikes!'}
                </div>
              </div>
            ) : (
              <GridBoard
                id="enemy-board"
                title={isAr ? 'رادار العدو (منطقة الهجوم)' : 'Enemy Radar Sector'}
                subTitle={
                  turn === 'player'
                    ? isAr
                      ? 'انقر على أي مربع لإطلاق الصاروخ أو السلاح المختار!'
                      : 'Click target to launch selected salvo!'
                    : isAr
                    ? 'الكمبيوتر يفكر في خطوته القادمة...'
                    : 'Enemy tactical computer calculating...'
                }
                badge={isAr ? 'الهدف' : 'TARGET'}
                grid={computerGrid}
                placedShips={computerShips}
                showShips={false}
                isInteractive={turn === 'player' && !isProcessingShot}
                onCellClick={handlePlayerAttack}
                onCellHover={(x, y) => setHoverCoord({ x, y })}
                onCellLeave={() => setHoverCoord(null)}
                previewCoords={phase === 'battle' ? previewInfo.coords : []}
                previewValid={phase === 'battle' ? previewInfo.valid : true}
                activeWeapon={activeWeapon}
                turnHighlight={turn === 'player'}
                animatingCell={
                  turn === 'player' ? animatingCell : null
                }
                torpedoLine={torpedoLine}
                showPlaneFlyover={showPlaneFlyover}
                isRtl={isAr}
              />
            )}

            {/* Enemy Sunk Ships Tracker (In Battle) */}
            {phase === 'battle' && (
              <ShipRoster
                title={isAr ? 'أسطول العدو المرصود' : 'Enemy Armada Status'}
                ships={computerShips}
                isPlacementMode={false}
                lang={lang}
              />
            )}
          </div>

          {/* Captain's Log (Rightmost / 2 cols on XL, or bottom) */}
          <div className="lg:col-span-12 xl:col-span-2">
            <BattleLog logs={battleLogs} lang={lang} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full mt-8 pt-4 border-t-2 border-[#1a3a5f] border-dashed text-center text-xs text-[#1a3a5f] opacity-80 font-clean">
        <p>
          {isAr
            ? 'لعبة معركة البوارج البحرية التكتيكية • محاكاة صوتية متكاملة لصوت رحلة الصاروخ، الانفجارات، واصطدام المياه • ضربات الطائرات والطوربيدات'
            : 'Tactical Battleship Notebook Edition • Realistic Rocket Flight, Explosion, and Hydrodynamic Splash Sounds • Airstrikes & Torpedo Strikes'}
        </p>
      </footer>

      {/* Game Over Victory / Defeat Modal */}
      {phase === 'game-over' && winner && (
        <GameOverModal
          winner={winner}
          stats={stats}
          onRestart={handleRestart}
          lang={lang}
        />
      )}

      {/* Rules & Weapons Field Guide Modal */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        lang={lang}
      />
    </div>
  );
}
