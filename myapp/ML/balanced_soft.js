// balanced_soft.js — Research-grade synthetic EEG with soft labels
// Outputs windows: {
//   input: [4][128],
//   label: "attentive" | "calm" | "drowsy",   // hard label (argmax)
//   soft: { attentive: p, calm: p, drowsy: p }, // soft label distribution
//   subject: <int>
// }
//
// 20 subjects (0-9 Control, 10-19 ADHD), 60 s each @ 128 Hz.

const fs = require("fs");

const SAMPLE_RATE = 128;
const CHANNEL_COUNT = 4;
const TRIAL_LENGTH_SEC = 60;
const SAMPLES_PER_TRIAL = SAMPLE_RATE * TRIAL_LENGTH_SEC;
const WINDOW_SAMPLES = SAMPLE_RATE; // 1 s
const STATES = ["attentive", "calm", "drowsy"];
const SUBJECTS = 20;
const OUTPUT_FILE = "eeg_cognitive_states_balanced.json";

const rand = (a, b) => Math.random() * (b - a) + a;
const randint = (a, b) => Math.floor(rand(a, b));
const choice = arr => arr[Math.floor(Math.random() * arr.length)];

function gaussian(mu = 0, sigma = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// simple pink-ish noise using IIR
function pinkNoise(n, alpha = 0.98) {
    const out = new Float32Array(n);
    let prev = 0;
    for (let i = 0; i < n; i++) {
        const w = (Math.random() * 2 - 1) * 0.5;
        prev = alpha * prev + (1 - alpha) * w;
        out[i] = prev;
    }
    return out;
}

function ar1(n, coeff = 0.93, scale = 0.08) {
    const out = new Float32Array(n);
    let p = 0;
    for (let i = 0; i < n; i++) {
        const w = (Math.random() * 2 - 1) * scale;
        p = coeff * p + w;
        out[i] = p;
    }
    return out;
}

function addBlink(arr, idx, amp = 1.0, width = 18) {
    for (let i = 0; i < width && idx + i < arr.length; i++) {
        const w = 1 - Math.abs(i - width / 2) / (width / 2);
        arr[idx + i] += amp * w;
    }
}

function addEyeRoll(arr, idx, amp = 0.8, length = 160) {
    for (let i = 0; i < length && idx + i < arr.length; i++) {
        const phase = (i / length) * Math.PI * 2;
        arr[idx + i] += amp * Math.sin(phase) * (1 - (i / length) * 0.6);
    }
}

function addSpike(arr, idx, amp = 1.2) {
    if (idx >= 0 && idx < arr.length) arr[idx] += amp * (Math.random() * 0.6 + 0.6);
}

function powerlineSignal(t) {
    const baseHz = 50;
    return 0.08 * Math.sin(2 * Math.PI * baseHz * t) +
        0.02 * Math.sin(2 * Math.PI * 2 * baseHz * t);
}

// channel modulation
const CHANNEL_MOD = [
    { theta: 1.02, alpha: 1.0, beta: 0.98 },
    { theta: 0.96, alpha: 1.04, beta: 1.02 },
    { theta: 1.0, alpha: 0.96, beta: 1.06 },
    { theta: 1.03, alpha: 1.01, beta: 0.97 }
];

// PER-STATE BASE AMPLITUDES (more overlap, calmer not perfectly separable)
const STATE_BASE = {
    attentive: { theta: 0.50, alpha: 1.00, beta: 0.95 },
    calm: { theta: 0.80, alpha: 1.10, beta: 0.60 },
    drowsy: { theta: 1.20, alpha: 0.90, beta: 0.55 }
};

// HMM transitions (global)
const TRANSITION = {
    attentive: { attentive: 0.86, calm: 0.11, drowsy: 0.03 },
    calm: { attentive: 0.09, calm: 0.80, drowsy: 0.11 },
    drowsy: { attentive: 0.03, calm: 0.22, drowsy: 0.75 }
};

function nextState(current) {
    const probs = { ...TRANSITION[current] };
    const r = Math.random();
    let acc = 0;
    for (const s of STATES) {
        acc += probs[s];
        if (r < acc) return s;
    }
    return STATES[STATES.length - 1];
}

// subject fingerprint
function makeSubject(id) {
    const isADHD = id >= 10;
    const alphaPeak = isADHD ? rand(8.0, 10.0) : rand(8.8, 11.5);
    const spectralSlope = isADHD ? rand(0.9, 1.5) : rand(0.7, 1.2);
    const baseNoise = isADHD ? rand(1.1, 2.0) : rand(0.6, 1.4);
    const emgLevel = isADHD ? rand(1.1, 1.9) : rand(0.6, 1.3);
    const blinkRate = isADHD ? rand(0.7, 1.3) : rand(0.9, 1.5);
    const alphaSync = isADHD ? rand(0.55, 0.9) : rand(0.95, 1.25);
    const thetaBias = isADHD ? rand(1.2, 1.7) : rand(0.9, 1.2);
    const wander = rand(0.25, 0.8);
    const fatigue = isADHD ? rand(0.7, 1.2) : rand(0.2, 0.7); // drowsy drift

    return {
        id, isADHD, alphaPeak, spectralSlope,
        baseNoise, emgLevel, blinkRate, alphaSync, thetaBias,
        wander, fatigue
    };
}

// main per-subject generator
function generateSubjectTrial(subject) {
    const N = SAMPLES_PER_TRIAL;

    const pink = pinkNoise(N, 0.985);
    const ar = ar1(N, 0.94, 0.06);

    const blinkArr = new Float32Array(N);
    let nextBlink = Math.floor(rand(60, 200) / subject.blinkRate);
    while (nextBlink < N) {
        addBlink(blinkArr, nextBlink, rand(0.6, 1.6), randint(12, 26));
        nextBlink += Math.floor(rand(60, 200) / subject.blinkRate);
    }

    const eyeRollArr = new Float32Array(N);
    if (Math.random() < 0.9) {
        const rolls = randint(1, 4);
        for (let r = 0; r < rolls; r++) {
            const pos = randint(0, N - 220);
            addEyeRoll(eyeRollArr, pos, rand(0.6, 1.4), randint(120, 260));
        }
    }

    const spikeArr = new Float32Array(N);
    for (let i = 0; i < randint(6, 18); i++) {
        addSpike(spikeArr, randint(0, N - 1), rand(0.8, 1.6));
    }

    const emgArr = new Float32Array(N);
    let nextEmg = randint(80, 320);
    while (nextEmg < N) {
        const w = randint(10, 50);
        for (let k = 0; k < w && nextEmg + k < N; k++) {
            emgArr[nextEmg + k] += (Math.random() * 2 - 1) * 0.02 * subject.emgLevel;
        }
        nextEmg += randint(80, 320);
    }

    // phases & envelopes
    const phase = [];
    const alphaEnvPhase = [];
    const alphaEnvFreq = [];
    for (let ch = 0; ch < CHANNEL_COUNT; ch++) {
        phase.push({
            theta: Math.random() * 2 * Math.PI,
            alpha: Math.random() * 2 * Math.PI,
            beta: Math.random() * 2 * Math.PI
        });
        alphaEnvPhase.push(Math.random() * 2 * Math.PI);
        alphaEnvFreq.push(rand(0.12, 0.4));
    }

    // HMM dynamics
    let curState = choice(STATES);
    let samplesUntilTransition = randint(SAMPLE_RATE * 5, SAMPLE_RATE * 12);

    const labels = new Array(N);

    const spontaneous = new Float32Array(N);
    let sPrev = 0;
    for (let t = 0; t < N; t++) {
        sPrev = 0.97 * sPrev + (Math.random() * 2 - 1) * 0.02 * subject.wander;
        spontaneous[t] = sPrev;
    }

    const channels = [];
    for (let ch = 0; ch < CHANNEL_COUNT; ch++) {
        channels.push(new Float32Array(N));
    }

    for (let t = 0; t < N; t++) {
        // fatigue-driven increase of drowsy probability over time
        const timeFrac = t / N;
        const fatigueBoost = 1 + subject.fatigue * timeFrac;

        if (samplesUntilTransition <= 0) {
            curState = nextState(curState);
            samplesUntilTransition = randint(SAMPLE_RATE * 4, SAMPLE_RATE * 12);
        }
        samplesUntilTransition--;

        let micro = curState;
        if (Math.random() < 0.03) {
            micro = choice(STATES.filter(s => s !== curState));
        }

        // small chance to flip into drowsy with fatigue
        if (Math.random() < 0.01 * fatigueBoost && micro !== "drowsy") {
            micro = "drowsy";
        }

        labels[t] = micro;

        // base amplitudes
        const baseTheta = STATE_BASE[micro].theta * subject.thetaBias;
        const baseAlpha = STATE_BASE[micro].alpha;
        const baseBeta = STATE_BASE[micro].beta;

        let thetaAmp = Math.max(0, gaussian(baseTheta, baseTheta * 0.35));
        let alphaAmp = Math.max(0, gaussian(baseAlpha, baseAlpha * 0.30));
        let betaAmp = Math.max(0, gaussian(baseBeta, baseBeta * 0.45));

        // extra structure:
        // calm: sometimes strong alpha and some theta bursts
        if (micro === "calm" && Math.random() < 0.05) {
            alphaAmp *= rand(1.7, 2.5);
        }
        if (micro === "calm" && Math.random() < 0.04) {
            thetaAmp *= rand(1.2, 1.8);
        }
        // attentive: beta / alpha bursts
        if (micro === "attentive" && Math.random() < 0.04) {
            betaAmp *= rand(1.5, 2.2);
        }
        // drowsy: strong theta, but alpha still sometimes present
        if (micro === "drowsy" && Math.random() < 0.15) {
            alphaAmp *= rand(1.1, 1.5);
        }

        thetaAmp *= (1 + (subject.thetaBias - 1) * 0.5);
        alphaAmp *= subject.alphaSync;
        betaAmp *= (1 + (subject.emgLevel - 1) * 0.18);

        const thetaCF = rand(4.5, 7.5);
        const alphaCF = subject.alphaPeak + rand(-1.2, 1.2);
        const betaCF = rand(13.0, 21.0);

        for (let ch = 0; ch < CHANNEL_COUNT; ch++) {
            const env = 1 + 0.65 * Math.sin(
                2 * Math.PI * alphaEnvFreq[ch] * (t / SAMPLE_RATE) + alphaEnvPhase[ch]
            );
            const alphaEnv = env * (subject.isADHD ? 0.8 : 1.0);

            phase[ch].theta += 2 * Math.PI * thetaCF / SAMPLE_RATE;
            phase[ch].alpha += 2 * Math.PI * alphaCF / SAMPLE_RATE;
            phase[ch].beta += 2 * Math.PI * betaCF / SAMPLE_RATE;
            phase[ch].theta %= 2 * Math.PI;
            phase[ch].alpha %= 2 * Math.PI;
            phase[ch].beta %= 2 * Math.PI;

            const mod = CHANNEL_MOD[ch];

            const thetaSig = thetaAmp * mod.theta *
                Math.sin(phase[ch].theta + spontaneous[t] * 0.2);
            const alphaSig = alphaAmp * mod.alpha * alphaEnv *
                Math.sin(phase[ch].alpha + spontaneous[t] * 0.15);
            const betaSig = betaAmp * mod.beta *
                Math.sin(phase[ch].beta + spontaneous[t] * 0.12);

            const noiseBase = pink[t] * subject.baseNoise * 0.9 + ar[t] * 0.6;
            const pl = powerlineSignal(t / SAMPLE_RATE);

            const emg = emgArr[t] * (1 + subject.emgLevel * 0.6);
            const spike = spikeArr[t] * (ch < 2 ? 1.0 : 0.5);

            const blinkTerm = blinkArr[t] * (ch < 2 ? 1.0 : 0.45);
            const eyeTerm = eyeRollArr[t] * (ch < 2 ? 1.0 : 0.5);

            const chOffset = (ch - 1.5) * 0.02 * (1 + subject.spectralSlope * 0.1);

            let slowWander = 0;
            if (Math.random() < 0.0008) {
                slowWander = (Math.random() * 2 - 1) * rand(0.2, 0.8);
            }
            const wanderFactor = micro === "calm" ? 0.5 : 1.0;

            let sample = thetaSig + alphaSig + betaSig;
            sample += noiseBase + pl + emg + spike +
                blinkTerm + eyeTerm + chOffset + slowWander * wanderFactor;
            sample *= 1 + (ch - 1.5) * 0.01;

            channels[ch][t] = sample;
        }
    }

    // guarantee minimal coverage per class (hard labels)
    const minWindowsPerClass = 6;
    const counts = { attentive: 0, calm: 0, drowsy: 0 };
    for (let w = 0; w < N; w += WINDOW_SAMPLES) {
        const segLabels = labels.slice(w, Math.min(w + WINDOW_SAMPLES, N));
        const cnt = { attentive: 0, calm: 0, drowsy: 0 };
        segLabels.forEach(l => cnt[l]++);
        let pick = "attentive", maxc = -1;
        for (const s of STATES) {
            if (cnt[s] > maxc) { maxc = cnt[s]; pick = s; }
        }
        counts[pick]++;
    }
    for (const s of STATES) {
        if (counts[s] < minWindowsPerClass) {
            let need = minWindowsPerClass - counts[s];
            for (let k = 0; k < 300 && need > 0; k++) {
                const pos = randint(0, N - WINDOW_SAMPLES);
                for (let t = pos; t < pos + WINDOW_SAMPLES && t < N; t++) {
                    labels[t] = s;
                }
                need--;
            }
        }
    }

    // windowing + soft labels
    const windows = [];
    for (let w = 0; w < N; w += WINDOW_SAMPLES) {
        const end = Math.min(w + WINDOW_SAMPLES, N);
        const segLabels = labels.slice(w, end);
        const cnt = { attentive: 0, calm: 0, drowsy: 0 };
        segLabels.forEach(l => cnt[l]++);
        const total = segLabels.length || 1;

        // raw proportions
        let soft = {
            attentive: cnt.attentive / total,
            calm: cnt.calm / total,
            drowsy: cnt.drowsy / total
        };

        // smooth + label noise (very important!)
        let sum = 0;
        for (const s of STATES) {
            const noise = gaussian(0, 0.10);  // stronger fuzz
            soft[s] = Math.max(0.0005, 0.85 * soft[s] + 0.15 / 3 + noise);
            sum += soft[s];
        }
        for (const s of STATES) soft[s] /= sum;

        // occasionally mislabel like a human
        if (Math.random() < 0.12) {
            const other = STATES.filter(s => s !== argmaxSoft(soft));
            const flip = choice(other);
            // push some mass toward flip
            soft[flip] += 0.25;
            let ssum = 0;
            for (const s of STATES) ssum += soft[s];
            for (const s of STATES) soft[s] /= ssum;
        }

        const hardLabel = argmaxSoft(soft);

        const seg = [];
        for (let ch = 0; ch < CHANNEL_COUNT; ch++) {
            seg.push(Array.from(channels[ch].slice(w, end)));
        }

        windows.push({
            input: seg,
            label: hardLabel,
            soft,
            subject: subject.id
        });
    }

    return windows;
}

function argmaxSoft(soft) {
    let best = STATES[0];
    for (const s of STATES) {
        if (soft[s] > soft[best]) best = s;
    }
    return best;
}

// Generate dataset
const allWindows = [];
for (let s = 0; s < SUBJECTS; s++) {
    const subj = makeSubject(s);
    console.log(
        `Generating subject ${s} (${s < 10 ? "Control" : "ADHD"}) ` +
        `alphaPeak=${subj.alphaPeak.toFixed(2)} slope=${subj.spectralSlope.toFixed(2)}`
    );
    const win = generateSubjectTrial(subj);
    allWindows.push(...win);
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allWindows));
console.log(`Wrote ${allWindows.length} windows to ${OUTPUT_FILE}`);
