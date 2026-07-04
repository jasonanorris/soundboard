const boards = [
  {
    name: "Starter",
    sounds: [
      { name: "Kick", type: "kick", color: "#f4c64d" },
      { name: "Snare", type: "snare", color: "#ff6b6b" },
      { name: "Hat", type: "hat", color: "#d8dee9" },
      { name: "Clap", type: "clap", color: "#f58fb0" },
      { name: "Tom", type: "tom", color: "#d08770" },
      { name: "Bass A", type: "tone", frequency: 110, wave: "sawtooth", color: "#42d392" },
      { name: "Bass C", type: "tone", frequency: 130.81, wave: "sawtooth", color: "#42d392" },
      { name: "Bass E", type: "tone", frequency: 164.81, wave: "sawtooth", color: "#42d392" },
      { name: "Bass G", type: "tone", frequency: 196, wave: "sawtooth", color: "#42d392" },
      { name: "Bass B", type: "tone", frequency: 246.94, wave: "sawtooth", color: "#42d392" },
      { name: "Bell A", type: "tone", frequency: 440, wave: "sine", color: "#8bd3ff" },
      { name: "Bell C", type: "tone", frequency: 523.25, wave: "sine", color: "#8bd3ff" },
      { name: "Bell E", type: "tone", frequency: 659.25, wave: "sine", color: "#8bd3ff" },
      { name: "Bell G", type: "tone", frequency: 783.99, wave: "sine", color: "#8bd3ff" },
      { name: "Bell B", type: "tone", frequency: 987.77, wave: "sine", color: "#8bd3ff" },
      { name: "Zap", type: "zap", color: "#b48cff" },
      { name: "Laser", type: "laser", color: "#b48cff" },
      { name: "Rise", type: "rise", color: "#f38ba8" },
      { name: "Drop", type: "drop", color: "#f38ba8" },
      { name: "Blip", type: "tone", frequency: 880, wave: "square", color: "#f38ba8" },
      { name: "Chord A", type: "chord", frequencies: [220, 277.18, 329.63], color: "#a6e3a1" },
      { name: "Chord B", type: "chord", frequencies: [246.94, 311.13, 369.99], color: "#a6e3a1" },
      { name: "Chord C", type: "chord", frequencies: [261.63, 329.63, 392], color: "#a6e3a1" },
      { name: "Chord D", type: "chord", frequencies: [293.66, 369.99, 440], color: "#a6e3a1" },
      { name: "Chord E", type: "chord", frequencies: [329.63, 415.3, 493.88], color: "#a6e3a1" },
    ],
  },
  {
    name: "FX",
    sounds: [
      { name: "Zap 1", type: "zap" },
      { name: "Zap 2", type: "laser" },
      { name: "Rise 1", type: "rise" },
      { name: "Drop 1", type: "drop" },
      { name: "Blip 1", type: "tone", frequency: 760, wave: "square" },
      { name: "Ping", type: "tone", frequency: 1046.5, wave: "sine" },
      { name: "Pong", type: "tone", frequency: 698.46, wave: "triangle" },
      { name: "Alert", type: "tone", frequency: 1318.51, wave: "square" },
      { name: "Boop", type: "tone", frequency: 329.63, wave: "sine" },
      { name: "Pulse", type: "tone", frequency: 220, wave: "sawtooth" },
      { name: "Sweep A", type: "rise" },
      { name: "Sweep B", type: "drop" },
      { name: "Click", type: "hat" },
      { name: "Snap", type: "clap" },
      { name: "Thud", type: "kick" },
      { name: "Drone A", type: "tone", frequency: 82.41, wave: "sawtooth" },
      { name: "Drone C", type: "tone", frequency: 130.81, wave: "sawtooth" },
      { name: "Drone E", type: "tone", frequency: 164.81, wave: "triangle" },
      { name: "Tone A", type: "tone", frequency: 440, wave: "triangle" },
      { name: "Tone B", type: "tone", frequency: 493.88, wave: "triangle" },
      { name: "Minor", type: "chord", frequencies: [220, 261.63, 329.63] },
      { name: "Major", type: "chord", frequencies: [261.63, 329.63, 392] },
      { name: "Wide", type: "chord", frequencies: [196, 293.66, 440] },
      { name: "Bright", type: "chord", frequencies: [329.63, 415.3, 622.25] },
      { name: "Soft", type: "chord", frequencies: [174.61, 220, 261.63] },
    ],
  },
];

const board = document.querySelector("#soundboard");
const stopAllButton = document.querySelector("#stopAll");
const boardSwitch = document.querySelector("#boardSwitch");
const boardName = document.querySelector("#boardName");
const activeSources = new Set();
const activeAudioElements = new Set();
let audioContext;
let currentBoardIndex = 0;

const padColors = [
  "#f4c64d",
  "#ff7a66",
  "#d8dee9",
  "#f58fb0",
  "#d08770",
  "#42d392",
  "#53c7a6",
  "#68d86d",
  "#93dc5c",
  "#c4d957",
  "#8bd3ff",
  "#74b7ff",
  "#8aa7ff",
  "#a996ff",
  "#c28dff",
  "#b48cff",
  "#9b95ff",
  "#f38ba8",
  "#ff8d8d",
  "#ffad72",
  "#a6e3a1",
  "#7fdcb2",
  "#69d0cf",
  "#73c3ef",
  "#98b6ff",
];

function getAudioContext() {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  audioContext ||= new AudioContextCtor();
  return audioContext;
}

function createGainEnvelope(context, startTime, attack, release, peak = 0.65) {
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peak, startTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + attack + release);
  return gain;
}

function trackSource(source, pad, stopAt) {
  activeSources.add(source);
  pad.classList.add("is-playing");

  source.addEventListener("ended", () => {
    activeSources.delete(source);
  });

  window.setTimeout(() => {
    pad.classList.remove("is-playing");
  }, Math.max(90, (stopAt - getAudioContext().currentTime) * 1000));
}

function playTone(context, pad, sound, duration = 0.35) {
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const envelope = createGainEnvelope(context, now, 0.012, duration, 0.45);

  oscillator.type = sound.wave || "sine";
  oscillator.frequency.setValueAtTime(sound.frequency || 440, now);
  oscillator.connect(envelope).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.03);
  trackSource(oscillator, pad, now + duration + 0.03);
}

function playChord(context, pad, sound) {
  sound.frequencies.forEach((frequency, index) => {
    playTone(context, pad, {
      frequency,
      wave: index === 0 ? "triangle" : "sine",
    }, 0.55);
  });
}

function playKick(context, pad) {
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const envelope = createGainEnvelope(context, now, 0.004, 0.42, 0.9);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(140, now);
  oscillator.frequency.exponentialRampToValueAtTime(42, now + 0.38);
  oscillator.connect(envelope).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.46);
  trackSource(oscillator, pad, now + 0.46);
}

function playNoise(context, pad, duration, filterFrequency, peak = 0.38) {
  const now = context.currentTime;
  const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const envelope = createGainEnvelope(context, now, 0.006, duration, peak);

  source.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.setValueAtTime(filterFrequency, now);
  source.connect(filter).connect(envelope).connect(context.destination);
  source.start(now);
  source.stop(now + duration + 0.02);
  trackSource(source, pad, now + duration + 0.02);
}

function playClap(context, pad) {
  [0, 0.04, 0.08].forEach((offset) => {
    window.setTimeout(() => playNoise(context, pad, 0.1, 900, 0.24), offset * 1000);
  });
}

function playSweep(context, pad, startFrequency, endFrequency, duration) {
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const envelope = createGainEnvelope(context, now, 0.01, duration, 0.38);

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(startFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
  oscillator.connect(envelope).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.03);
  trackSource(oscillator, pad, now + duration + 0.03);
}

function playSound(sound, pad) {
  if (sound.src) {
    playAudioFile(sound, pad);
    return;
  }

  const context = getAudioContext();

  if (context.state === "suspended") {
    context.resume();
  }

  switch (sound.type) {
    case "kick":
      playKick(context, pad);
      break;
    case "snare":
      playNoise(context, pad, 0.18, 620, 0.46);
      break;
    case "hat":
      playNoise(context, pad, 0.08, 5200, 0.24);
      break;
    case "clap":
      playClap(context, pad);
      break;
    case "tom":
      playSweep(context, pad, 190, 85, 0.32);
      break;
    case "zap":
      playSweep(context, pad, 900, 70, 0.22);
      break;
    case "laser":
      playSweep(context, pad, 120, 1300, 0.18);
      break;
    case "rise":
      playSweep(context, pad, 220, 1800, 0.52);
      break;
    case "drop":
      playSweep(context, pad, 1800, 110, 0.55);
      break;
    case "chord":
      playChord(context, pad, sound);
      break;
    default:
      playTone(context, pad, sound);
  }
}

function playAudioFile(sound, pad) {
  const audio = new Audio(sound.src);

  activeAudioElements.add(audio);
  pad.classList.add("is-playing");

  audio.addEventListener("ended", () => {
    activeAudioElements.delete(audio);
    pad.classList.remove("is-playing");
  });

  audio.play().catch(() => {
    activeAudioElements.delete(audio);
    pad.classList.remove("is-playing");
  });
}

function renderBoard(boardConfig) {
  board.replaceChildren();
  board.setAttribute("aria-label", `${boardConfig.name} soundboard pads`);

  boardConfig.sounds.forEach((sound, index) => {
    const padColor = padColors[index] || sound.color || "#8bd3ff";
    const pad = document.createElement("button");
    pad.type = "button";
    pad.className = "pad";
    pad.style.setProperty("--pad-color", padColor);
    pad.style.setProperty("--pad-bg", colorToRgba(padColor, 0.18));
    pad.style.setProperty("--pad-bg-strong", colorToRgba(padColor, 0.28));
    pad.innerHTML = `
      <span class="pad-name">${sound.name}</span>
    `;
    pad.addEventListener("click", () => playSound(sound, pad));
    board.append(pad);
  });
}

function switchBoard(boardIndex) {
  currentBoardIndex = boardIndex;
  const boardConfig = boards[currentBoardIndex];

  stopAllSounds();
  boardName.textContent = boardConfig.name;
  renderBoard(boardConfig);
}

function colorToRgba(hexColor, alpha) {
  const normalizedHex = hexColor.replace("#", "");
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function stopAllSounds() {
  activeSources.forEach((source) => {
    try {
      source.stop();
    } catch {
      activeSources.delete(source);
    }
  });
  activeAudioElements.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
  activeAudioElements.clear();
  document.querySelectorAll(".pad.is-playing").forEach((pad) => {
    pad.classList.remove("is-playing");
  });
}

boardSwitch.max = String(boards.length - 1);
boardSwitch.value = String(currentBoardIndex);

boardSwitch.addEventListener("input", () => {
  const nextBoardIndex = Number(boardSwitch.value);

  if (nextBoardIndex !== currentBoardIndex) {
    switchBoard(nextBoardIndex);
  }
});

stopAllButton.addEventListener("click", stopAllSounds);

switchBoard(currentBoardIndex);
