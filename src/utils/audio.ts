// High-Fidelity Cinematic Spatial (3D / Stereo) Audio Engine for Battleship Notebook
// Professional procedural DSP sound design with physical acoustic modeling,
// stereo spatialization, synthetic convolution reverb, and master compression.

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private distortionCurve: Float32Array | null = null;
  public enabled: boolean = true;

  constructor() {
    // Lazy init on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.setupMasterBus();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Build Master Cinematic Bus with Dynamics Compression, Saturation & Spatial Reverb
  private setupMasterBus() {
    if (!this.ctx) return;

    // Master Compressor to ensure massive cinematic punch without clipping
    this.masterCompressor = this.ctx.createDynamicsCompressor();
    this.masterCompressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
    this.masterCompressor.knee.setValueAtTime(10, this.ctx.currentTime);
    this.masterCompressor.ratio.setValueAtTime(6, this.ctx.currentTime);
    this.masterCompressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.masterCompressor.release.setValueAtTime(0.18, this.ctx.currentTime);

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.9, this.ctx.currentTime);

    this.masterCompressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Generate Synthetic Oceanic / Naval Hall Stereo Convolution Reverb
    this.setupReverb();

    // Generate soft saturation curve for cinematic punch
    this.distortionCurve = this.createDistortionCurve(2.5);
  }

  private createDistortionCurve(k: number = 2): Float32Array {
    const n = 512;
    const curve = new Float32Array(n);
    const deg = Math.PI / 180;
    for (let i = 0; i < n; ++i) {
      const x = (i * 2) / n - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // Procedural Stereo Acoustic Impulse Response
  private setupReverb() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 1.8; // 1.8 second natural decay
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Exponential decay envelope with high frequency absorption
      const decay = Math.exp(-t * 3.8);
      // Decorrelated stereo diffuse reflections
      const noiseL = (Math.random() * 2 - 1) * decay;
      const noiseR = (Math.random() * 2 - 1) * decay;

      // Early discrete room reflections
      let earlyL = 0;
      let earlyR = 0;
      if (i === Math.floor(sampleRate * 0.025)) earlyL += 0.45;
      if (i === Math.floor(sampleRate * 0.045)) earlyR += 0.4;
      if (i === Math.floor(sampleRate * 0.075)) earlyL += 0.3;
      if (i === Math.floor(sampleRate * 0.095)) earlyR += 0.25;

      left[i] = noiseL * 0.6 + earlyL;
      right[i] = noiseR * 0.6 + earlyR;
    }

    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = impulse;

    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    this.reverbNode.connect(this.reverbGain);
    if (this.masterCompressor) {
      this.reverbGain.connect(this.masterCompressor);
    }
  }

  // Create Stereo Panner Helper with cross-browser fallback
  private createPanner(pan: number = 0): StereoPannerNode | GainNode {
    if (!this.ctx) throw new Error('No audio context');
    if (this.ctx.createStereoPanner) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), this.ctx.currentTime);
      return panner;
    }
    const gain = this.ctx.createGain();
    return gain;
  }

  // Connect node to both Master and Reverb bus
  private connectWithSpatialReverb(sourceNode: AudioNode, reverbSendLevel: number = 0.25) {
    if (!this.ctx || !this.masterCompressor) return;

    sourceNode.connect(this.masterCompressor);

    if (this.reverbNode && reverbSendLevel > 0) {
      const sendGain = this.ctx.createGain();
      sendGain.gain.setValueAtTime(reverbSendLevel, this.ctx.currentTime);
      sourceNode.connect(sendGain);
      sendGain.connect(this.reverbNode);
    }
  }

  // ==========================================
  // 1. REALISTIC MISSILE / ARTILLERY FLIGHT (Stereo Doppler Sweep)
  // ==========================================
  public playRocketFlight(): Promise<void> {
    return new Promise(resolve => {
      if (!this.enabled) {
        resolve();
        return;
      }
      this.initContext();
      if (!this.ctx) {
        resolve();
        return;
      }

      const t = this.ctx.currentTime;
      const duration = 0.65;

      // Stereo Panner sweeping across the stereo field from Left to Right
      const panner = this.ctx.createStereoPanner
        ? this.ctx.createStereoPanner()
        : null;
      if (panner) {
        panner.pan.setValueAtTime(-0.85, t);
        panner.pan.linearRampToValueAtTime(0.75, t + duration);
      }

      // Layer 1: Artillery Muzzle Launch Thud (Instantaneous Cannon Pressure)
      const launchThud = this.ctx.createOscillator();
      const launchGain = this.ctx.createGain();
      launchThud.type = 'sine';
      launchThud.frequency.setValueAtTime(140, t);
      launchThud.frequency.exponentialRampToValueAtTime(38, t + 0.18);

      launchGain.gain.setValueAtTime(0.65, t);
      launchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      launchThud.connect(launchGain);
      if (panner) {
        launchGain.connect(panner);
      } else {
        this.connectWithSpatialReverb(launchGain, 0.2);
      }
      launchThud.start(t);
      launchThud.stop(t + 0.2);

      // Layer 2: Rocket Solid-Propellant Combustion Roar (Filtered Stereo Pink Noise)
      const bufferSize = this.ctx.sampleRate * duration;
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
      const lData = noiseBuffer.getChannelData(0);
      const rData = noiseBuffer.getChannelData(1);
      let b0L = 0, b1L = 0, b2L = 0;
      let b0R = 0, b1R = 0, b2R = 0;

      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        const whiteR = Math.random() * 2 - 1;
        // Pink noise filter algorithm for realistic jet turbulence
        b0L = 0.99886 * b0L + whiteL * 0.0555179;
        b1L = 0.99332 * b1L + whiteL * 0.0750759;
        b2L = 0.96900 * b2L + whiteL * 0.1538520;
        b0R = 0.99886 * b0R + whiteR * 0.0555179;
        b1R = 0.99332 * b1R + whiteR * 0.0750759;
        b2R = 0.96900 * b2R + whiteR * 0.1538520;
        lData[i] = b0L + b1L + b2L + whiteL * 0.2;
        rData[i] = b0R + b1R + b2R + whiteR * 0.2;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Swept resonant bandpass for the Doppler air cut
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, t);
      filter.frequency.exponentialRampToValueAtTime(2400, t + duration * 0.45);
      filter.frequency.exponentialRampToValueAtTime(450, t + duration);
      filter.Q.setValueAtTime(3.2, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.04, t);
      noiseGain.gain.linearRampToValueAtTime(0.48, t + duration * 0.4);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + duration);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      if (panner) {
        noiseGain.connect(panner);
      } else {
        this.connectWithSpatialReverb(noiseGain, 0.3);
      }

      // Layer 3: High-velocity aerodynamic whistling air cut
      const whistleOsc = this.ctx.createOscillator();
      const whistleGain = this.ctx.createGain();
      whistleOsc.type = 'sine';
      whistleOsc.frequency.setValueAtTime(480, t);
      whistleOsc.frequency.exponentialRampToValueAtTime(1850, t + duration * 0.45);
      whistleOsc.frequency.exponentialRampToValueAtTime(380, t + duration);

      whistleGain.gain.setValueAtTime(0.02, t);
      whistleGain.gain.linearRampToValueAtTime(0.22, t + duration * 0.45);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      whistleOsc.connect(whistleGain);
      if (panner) {
        whistleGain.connect(panner);
        this.connectWithSpatialReverb(panner, 0.35);
      } else {
        this.connectWithSpatialReverb(whistleGain, 0.35);
      }

      noiseSource.start(t);
      whistleOsc.start(t);
      whistleOsc.stop(t + duration);

      setTimeout(() => {
        resolve();
      }, duration * 1000 * 0.85);
    });
  }

  // ==========================================
  // 2. CINEMATIC HEAVY NAVAL EXPLOSION (Hollywood Grade)
  // ==========================================
  public playExplosion(pan: number = 0) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 1.6;

    // Stereo Spatial Panning
    const panner = this.createPanner(pan);

    // Layer 1: Supersonic Shockwave Crack (Instant pressure wave)
    const shockOsc = this.ctx.createOscillator();
    const shockGain = this.ctx.createGain();
    shockOsc.type = 'triangle';
    shockOsc.frequency.setValueAtTime(380, t);
    shockOsc.frequency.exponentialRampToValueAtTime(25, t + 0.08);

    shockGain.gain.setValueAtTime(0.85, t);
    shockGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    shockOsc.connect(shockGain);
    shockGain.connect(panner);
    shockOsc.start(t);
    shockOsc.stop(t + 0.09);

    // Layer 2: Deep Sub-Bass Ground/Hull Rumble (30Hz - 65Hz) with Soft Warm Saturation
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    const subWaveshaper = this.ctx.createWaveShaper();
    if (this.distortionCurve) {
      subWaveshaper.curve = this.distortionCurve;
    }

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.55);

    subGain.gain.setValueAtTime(0.9, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    subOsc.connect(subWaveshaper);
    subWaveshaper.connect(subGain);
    subGain.connect(panner);
    subOsc.start(t);
    subOsc.stop(t + 0.95);

    // Layer 3: Fiery Combustion & Flying Debris (Dual-channel Stereo Pink Noise)
    const bufferSize = this.ctx.sampleRate * duration;
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const lData = noiseBuffer.getChannelData(0);
    const rData = noiseBuffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      // Modulated fire bursts
      const env = Math.exp(-i / (this.ctx.sampleRate * 0.45));
      const crackle = Math.random() > 0.92 ? (Math.random() * 2 - 1) * 1.5 : 0;
      lData[i] = ((Math.random() * 2 - 1) * 0.8 + crackle) * env;
      rData[i] = ((Math.random() * 2 - 1) * 0.8 + crackle) * env;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(2800, t);
    lowpass.frequency.exponentialRampToValueAtTime(75, t + duration * 0.85);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noiseSource.connect(lowpass);
    lowpass.connect(noiseGain);
    noiseGain.connect(panner);
    noiseSource.start(t);

    // Layer 4: Heavy Armored Steel Bulkhead Tearing (Metallic FM Resonance)
    const metalMod = this.ctx.createOscillator();
    const metalModGain = this.ctx.createGain();
    const metalCarrier = this.ctx.createOscillator();
    const metalGain = this.ctx.createGain();

    metalMod.type = 'sawtooth';
    metalMod.frequency.setValueAtTime(160, t);
    metalMod.frequency.exponentialRampToValueAtTime(45, t + 0.4);

    metalModGain.gain.setValueAtTime(320, t);
    metalModGain.gain.exponentialRampToValueAtTime(10, t + 0.4);

    metalCarrier.type = 'sine';
    metalCarrier.frequency.setValueAtTime(260, t);
    metalCarrier.frequency.exponentialRampToValueAtTime(65, t + 0.4);

    metalGain.gain.setValueAtTime(0.35, t);
    metalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    metalMod.connect(metalModGain);
    metalModGain.connect(metalCarrier.frequency);
    metalCarrier.connect(metalGain);
    metalGain.connect(panner);

    metalMod.start(t);
    metalCarrier.start(t);
    metalMod.stop(t + 0.42);
    metalCarrier.stop(t + 0.42);

    // Route Panner into Master + Long Ocean Reverb
    this.connectWithSpatialReverb(panner, 0.45);
  }

  // ==========================================
  // 3. REALISTIC HYDRODYNAMIC WATER PLUNGE & SPLASH
  // ==========================================
  public playSplash(pan: number = 0) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 0.9;

    const panner = this.createPanner(pan);

    // Layer 1: Water Cavitation Entry Impact (Heavy Hydrodynamic Thud)
    const entryThud = this.ctx.createOscillator();
    const entryGain = this.ctx.createGain();
    entryThud.type = 'sine';
    entryThud.frequency.setValueAtTime(160, t);
    entryThud.frequency.exponentialRampToValueAtTime(48, t + 0.22);

    entryGain.gain.setValueAtTime(0.7, t);
    entryGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    entryThud.connect(entryGain);
    entryGain.connect(panner);
    entryThud.start(t);
    entryThud.stop(t + 0.26);

    // Layer 2: Massive Seawater Column Surge & Cavitation Foam (Stereo Filtered Turbulence)
    const bufferSize = this.ctx.sampleRate * duration;
    const waterBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const lData = waterBuffer.getChannelData(0);
    const rData = waterBuffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const swell = Math.sin(progress * Math.PI) * Math.exp(-progress * 2.8);
      lData[i] = (Math.random() * 2 - 1) * swell;
      rData[i] = (Math.random() * 2 - 1) * swell;
    }

    const waterSource = this.ctx.createBufferSource();
    waterSource.buffer = waterBuffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1100, t);
    bandpass.frequency.exponentialRampToValueAtTime(280, t + duration);
    bandpass.Q.setValueAtTime(1.8, t);

    const waterGain = this.ctx.createGain();
    waterGain.gain.setValueAtTime(0.55, t);
    waterGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    waterSource.connect(bandpass);
    bandpass.connect(waterGain);
    waterGain.connect(panner);
    waterSource.start(t);

    // Layer 3: Ocean Spray & Falling Droplets (Spatial Bubbles)
    const bubbleOsc = this.ctx.createOscillator();
    const bubbleGain = this.ctx.createGain();
    bubbleOsc.type = 'sine';
    bubbleOsc.frequency.setValueAtTime(540, t + 0.08);
    bubbleOsc.frequency.exponentialRampToValueAtTime(180, t + 0.35);

    bubbleGain.gain.setValueAtTime(0.28, t + 0.08);
    bubbleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    bubbleOsc.connect(bubbleGain);
    bubbleGain.connect(panner);
    bubbleOsc.start(t + 0.08);
    bubbleOsc.stop(t + 0.36);

    this.connectWithSpatialReverb(panner, 0.4);
  }

  // ==========================================
  // 4. SUBMARINE TORPEDO SALVO (Hydraulic Ejection + Twin Propellers)
  // ==========================================
  public playTorpedoLaunch(): Promise<void> {
    return new Promise(resolve => {
      if (!this.enabled) {
        resolve();
        return;
      }
      this.initContext();
      if (!this.ctx) {
        resolve();
        return;
      }

      const t = this.ctx.currentTime;
      const duration = 0.85;

      // Layer 1: High-Pressure Pneumatic Torpedo Tube Launch Burst
      const tubeThud = this.ctx.createOscillator();
      const tubeGain = this.ctx.createGain();
      tubeThud.type = 'triangle';
      tubeThud.frequency.setValueAtTime(180, t);
      tubeThud.frequency.exponentialRampToValueAtTime(42, t + 0.32);

      tubeGain.gain.setValueAtTime(0.7, t);
      tubeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      tubeThud.connect(tubeGain);
      this.connectWithSpatialReverb(tubeGain, 0.3);
      tubeThud.start(t);
      tubeThud.stop(t + 0.36);

      // Layer 2: Rapid Underwater Cavitating Twin-Screw Propeller
      const propOsc1 = this.ctx.createOscillator();
      const propOsc2 = this.ctx.createOscillator();
      const propGain = this.ctx.createGain();

      propOsc1.type = 'sawtooth';
      propOsc2.type = 'triangle';

      // Modulating turbine pitch
      propOsc1.frequency.setValueAtTime(75, t + 0.12);
      propOsc1.frequency.linearRampToValueAtTime(260, t + duration);

      propOsc2.frequency.setValueAtTime(82, t + 0.12);
      propOsc2.frequency.linearRampToValueAtTime(268, t + duration);

      propGain.gain.setValueAtTime(0.01, t + 0.12);
      propGain.gain.linearRampToValueAtTime(0.35, t + 0.45);
      propGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      const propFilter = this.ctx.createBiquadFilter();
      propFilter.type = 'lowpass';
      propFilter.frequency.setValueAtTime(700, t);
      propFilter.frequency.linearRampToValueAtTime(1400, t + duration);

      propOsc1.connect(propGain);
      propOsc2.connect(propGain);
      propGain.connect(propFilter);
      this.connectWithSpatialReverb(propFilter, 0.45);

      propOsc1.start(t + 0.12);
      propOsc2.start(t + 0.12);
      propOsc1.stop(t + duration);
      propOsc2.stop(t + duration);

      // Submarine Sonar Pulse
      this.playSonarPing(0.18);

      setTimeout(() => {
        resolve();
      }, duration * 1000 * 0.85);
    });
  }

  // ==========================================
  // 5. CINEMATIC AIRSTRIKE (Twin Supersonic Jet Flyby + Bomb Drop Siren)
  // ==========================================
  public playAirstrike(): Promise<void> {
    return new Promise(resolve => {
      if (!this.enabled) {
        resolve();
        return;
      }
      this.initContext();
      if (!this.ctx) {
        resolve();
        return;
      }

      const t = this.ctx.currentTime;
      const duration = 1.1;

      // Realistic Full-Stereo Doppler Panning from Left (-1.0) to Right (+1.0)
      const panner = this.ctx.createStereoPanner
        ? this.ctx.createStereoPanner()
        : null;
      if (panner) {
        panner.pan.setValueAtTime(-0.95, t);
        panner.pan.linearRampToValueAtTime(0.95, t + duration);
      }

      // Layer 1: Twin Jet Turbine Roar with Doppler Pitch Shift
      const jetOsc1 = this.ctx.createOscillator();
      const jetOsc2 = this.ctx.createOscillator();
      const jetGain = this.ctx.createGain();

      jetOsc1.type = 'sawtooth';
      jetOsc2.type = 'triangle';

      // Doppler curve: High -> Peak -> Low
      jetOsc1.frequency.setValueAtTime(260, t);
      jetOsc1.frequency.linearRampToValueAtTime(540, t + duration * 0.42);
      jetOsc1.frequency.exponentialRampToValueAtTime(140, t + duration);

      jetOsc2.frequency.setValueAtTime(266, t);
      jetOsc2.frequency.linearRampToValueAtTime(548, t + duration * 0.42);
      jetOsc2.frequency.exponentialRampToValueAtTime(144, t + duration);

      jetGain.gain.setValueAtTime(0.04, t);
      jetGain.gain.linearRampToValueAtTime(0.48, t + duration * 0.42);
      jetGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      const jetFilter = this.ctx.createBiquadFilter();
      jetFilter.type = 'lowpass';
      jetFilter.frequency.setValueAtTime(1800, t);
      jetFilter.frequency.linearRampToValueAtTime(3800, t + duration * 0.42);
      jetFilter.frequency.exponentialRampToValueAtTime(800, t + duration);

      jetOsc1.connect(jetGain);
      jetOsc2.connect(jetGain);
      jetGain.connect(jetFilter);

      if (panner) {
        jetFilter.connect(panner);
      } else {
        this.connectWithSpatialReverb(jetFilter, 0.4);
      }

      jetOsc1.start(t);
      jetOsc2.start(t);
      jetOsc1.stop(t + duration);
      jetOsc2.stop(t + duration);

      // Layer 2: Supersonic Wind Shear (Stereo Pink Noise)
      const bufferSize = this.ctx.sampleRate * duration;
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
      const lData = noiseBuffer.getChannelData(0);
      const rData = noiseBuffer.getChannelData(1);

      for (let i = 0; i < bufferSize; i++) {
        const env = Math.sin((i / bufferSize) * Math.PI);
        lData[i] = (Math.random() * 2 - 1) * env;
        rData[i] = (Math.random() * 2 - 1) * env;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(650, t);
      noiseFilter.frequency.linearRampToValueAtTime(2200, t + duration * 0.42);
      noiseFilter.frequency.exponentialRampToValueAtTime(450, t + duration);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.05, t);
      noiseGain.gain.linearRampToValueAtTime(0.5, t + duration * 0.42);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);

      if (panner) {
        noiseGain.connect(panner);
        this.connectWithSpatialReverb(panner, 0.4);
      } else {
        this.connectWithSpatialReverb(noiseGain, 0.4);
      }

      noiseSource.start(t);

      // Layer 3: Falling Bomb Whistle Siren
      const bombOsc = this.ctx.createOscillator();
      const bombGain = this.ctx.createGain();
      bombOsc.type = 'sine';
      bombOsc.frequency.setValueAtTime(1450, t + 0.3);
      bombOsc.frequency.exponentialRampToValueAtTime(220, t + duration);

      bombGain.gain.setValueAtTime(0.01, t + 0.3);
      bombGain.gain.linearRampToValueAtTime(0.3, t + 0.65);
      bombGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      bombOsc.connect(bombGain);
      this.connectWithSpatialReverb(bombGain, 0.5);

      bombOsc.start(t + 0.3);
      bombOsc.stop(t + duration);

      setTimeout(() => {
        resolve();
      }, duration * 1000 * 0.88);
    });
  }

  // ==========================================
  // 6. AUTHENTIC NAVAL SUBMARINE SONAR PING (Eerie Deep Oceanic Reverb)
  // ==========================================
  public playSonarPing(delay = 0) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime + delay;

    // Dual-tone naval sonar ping (1020Hz + 1024Hz binaural beat)
    const ping1 = this.ctx.createOscillator();
    const ping2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    ping1.type = 'sine';
    ping1.frequency.setValueAtTime(1020, t);
    ping1.frequency.exponentialRampToValueAtTime(990, t + 0.75);

    ping2.type = 'sine';
    ping2.frequency.setValueAtTime(1024, t);
    ping2.frequency.exponentialRampToValueAtTime(994, t + 0.75);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);

    ping1.connect(gain);
    ping2.connect(gain);

    // Deep oceanic acoustic reverberation
    this.connectWithSpatialReverb(gain, 0.75);

    ping1.start(t);
    ping2.start(t);
    ping1.stop(t + 0.8);
    ping2.stop(t + 0.8);
  }

  // ==========================================
  // 7. CATASTROPHIC SHIP SINKING (Multi-Stage Explosions & Hull Groan)
  // ==========================================
  public playShipSunk() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Staggered secondary munitions explosions
    this.playExplosion(-0.4);
    setTimeout(() => this.playExplosion(0.35), 180);
    setTimeout(() => this.playExplosion(0.0), 380);

    // Deep structural hull buckle & metal groan
    const groanOsc = this.ctx.createOscillator();
    const groanGain = this.ctx.createGain();
    groanOsc.type = 'sawtooth';
    groanOsc.frequency.setValueAtTime(90, t + 0.2);
    groanOsc.frequency.exponentialRampToValueAtTime(32, t + 1.4);

    groanGain.gain.setValueAtTime(0.01, t + 0.2);
    groanGain.gain.linearRampToValueAtTime(0.4, t + 0.55);
    groanGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

    const groanFilter = this.ctx.createBiquadFilter();
    groanFilter.type = 'lowpass';
    groanFilter.frequency.setValueAtTime(320, t + 0.2);

    groanOsc.connect(groanGain);
    groanGain.connect(groanFilter);
    this.connectWithSpatialReverb(groanFilter, 0.6);

    groanOsc.start(t + 0.2);
    groanOsc.stop(t + 1.45);
  }

  // ==========================================
  // 8. TACTICAL UI & PEN CLICKS
  // ==========================================
  public playPenClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(250, t + 0.035);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    if (this.masterCompressor) {
      gain.connect(this.masterCompressor);
    }
    osc.start(t);
    osc.stop(t + 0.04);
  }

  public playScribble() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 0.14;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI * 6);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.Q.setValueAtTime(3.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    if (this.masterCompressor) {
      gain.connect(this.masterCompressor);
    }
    noise.start(t);
  }

  // ==========================================
  // 9. CINEMATIC NAVAL VICTORY ANTHEM (Resonant Horns & Stadium Reverberation)
  // ==========================================
  public playVictory() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Cinematic Naval Brass Horn Chords: Root, Fifth, Octave, Major 10th
    const brassChords = [
      { f: 130.81, time: 0, dur: 0.35, vol: 0.35 },    // C3
      { f: 196.00, time: 0, dur: 0.35, vol: 0.3 },     // G3
      { f: 164.81, time: 0.35, dur: 0.35, vol: 0.35 }, // E3
      { f: 196.00, time: 0.35, dur: 0.35, vol: 0.3 },  // G3
      { f: 261.63, time: 0.7, dur: 0.9, vol: 0.45 },   // C4
      { f: 329.63, time: 0.7, dur: 0.9, vol: 0.4 },    // E4
      { f: 392.00, time: 0.7, dur: 0.9, vol: 0.4 },    // G4
      { f: 523.25, time: 0.7, dur: 0.9, vol: 0.35 },   // C5
    ];

    brassChords.forEach(({ f, time, dur, vol }) => {
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Brass-like rich harmonics
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(f, t + time);
      osc2.frequency.setValueAtTime(f * 1.003, t + time); // Slight chorus detune

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(f * 2.5, t + time);
      filter.frequency.exponentialRampToValueAtTime(f * 1.2, t + time + dur);

      gain.gain.setValueAtTime(0.01, t + time);
      gain.gain.linearRampToValueAtTime(vol, t + time + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + time + dur);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(filter);
      this.connectWithSpatialReverb(filter, 0.65);

      osc1.start(t + time);
      osc2.start(t + time);
      osc1.stop(t + time + dur + 0.05);
      osc2.stop(t + time + dur + 0.05);
    });

    // Deep Naval Victory Gong / Timpani
    const timpani = this.ctx.createOscillator();
    const timpaniGain = this.ctx.createGain();
    timpani.type = 'sine';
    timpani.frequency.setValueAtTime(95, t + 0.7);
    timpani.frequency.exponentialRampToValueAtTime(45, t + 1.6);

    timpaniGain.gain.setValueAtTime(0.6, t + 0.7);
    timpaniGain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

    timpani.connect(timpaniGain);
    this.connectWithSpatialReverb(timpaniGain, 0.7);
    timpani.start(t + 0.7);
    timpani.stop(t + 1.65);
  }

  // ==========================================
  // 10. HAUNTING NAVAL DEFEAT (Alarm Klaxon & Deep Sinking Abyss)
  // ==========================================
  public playDefeat() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Naval General Quarters Alarm Klaxon (2 pulses)
    [0, 0.45].forEach(timeOffset => {
      if (!this.ctx) return;
      const klaxon = this.ctx.createOscillator();
      const klaxonGain = this.ctx.createGain();
      klaxon.type = 'sawtooth';
      klaxon.frequency.setValueAtTime(480, t + timeOffset);
      klaxon.frequency.linearRampToValueAtTime(360, t + timeOffset + 0.35);

      klaxonGain.gain.setValueAtTime(0.28, t + timeOffset);
      klaxonGain.gain.exponentialRampToValueAtTime(0.001, t + timeOffset + 0.35);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, t + timeOffset);
      filter.Q.setValueAtTime(3.0, t + timeOffset);

      klaxon.connect(filter);
      filter.connect(klaxonGain);
      this.connectWithSpatialReverb(klaxonGain, 0.5);

      klaxon.start(t + timeOffset);
      klaxon.stop(t + timeOffset + 0.36);
    });

    // Haunting Minor Descent into the Cold Trench
    const minorTones = [
      { f: 164.81, time: 0.9, dur: 0.9 }, // E3
      { f: 146.83, time: 1.4, dur: 0.9 }, // D3
      { f: 123.47, time: 1.9, dur: 1.4 }, // B2
      { f: 82.41,  time: 2.5, dur: 2.0 }, // E2 (Sub-dread)
    ];

    minorTones.forEach(({ f, time, dur }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + time);

      gain.gain.setValueAtTime(0.01, t + time);
      gain.gain.linearRampToValueAtTime(0.28, t + time + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + time + dur);

      osc.connect(gain);
      this.connectWithSpatialReverb(gain, 0.7);

      osc.start(t + time);
      osc.stop(t + time + dur + 0.05);
    });
  }
}

export const soundManager = new SoundManager();
