/************************************************************
 *  EEG Cognitive State TESTER (Auto-detect Version)
 *  --------------------------------------------------------
 *  ✓ Loads model + scaler
 *  ✓ Extracts REAL features (same as training!)
 *  ✓ Auto-detects array vs object outputs
 *  ✓ Prints accuracy, confusion matrix, confidence stats
 ************************************************************/

const fs = require("fs");
const brain = require("brain.js");
const FFT = require("fft.js");

// ================== FILES TO LOAD ======================
const MODEL_FILE = "cognitive_state_model_final.json";
const SCALER_FILE = "scaler_final.json";
const DATA_FILE = "eeg_cognitive_states_balanced.json";
// =======================================================

const CLASS_LIST = ["attentive", "calm", "drowsy"];
const SR = 128;
const BANDS = { delta: [0.5, 4], theta: [4, 8], alpha: [8, 13], beta: [13, 22] };

// ---------- Utility ----------
function mean(a) { return a.reduce((x, y) => x + y, 0) / a.length; }
function variance(a) { const m = mean(a); return a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1 || 1); }
function stdev(a) { return Math.sqrt(variance(a)) || 1; }
function argmax(a) { let m = 0; for (let i = 1; i < a.length; i++) if (a[i] > a[m]) m = i; return m; }

// ---------- FFT Helpers ----------
function computeFFT(sig) {
    const N = sig.length;
    const f = new FFT(N);
    const out = f.createComplexArray();
    const inp = f.createComplexArray();
    for (let i = 0; i < N; i++) { inp[2 * i] = sig[i]; inp[2 * i + 1] = 0; }
    f.transform(out, inp);
    const half = Math.floor(N / 2);
    const psd = new Array(half);
    for (let k = 0; k < half; k++) {
        const re = out[2 * k], im = out[2 * k + 1];
        psd[k] = re * re + im * im;
    }
    return { psd, N };
}
function freqToBin(f, N) { return Math.floor(f * N / SR); }
function bandpower(psd, N, lo, hi) {
    const loB = freqToBin(lo, N), hiB = freqToBin(hi, N);
    let s = 0; for (let i = loB; i <= hiB && i < psd.length; i++) s += psd[i];
    return s;
}
function spectralEntropy(psd) {
    const total = psd.reduce((x, y) => x + y, 0) + 1e-9;
    const P = psd.map(v => v / total);
    return -P.reduce((s, v) => v > 0 ? s + v * Math.log2(v) : s, 0);
}

// ---------- Hjorth ----------
function hjorth(sig) {
    const var0 = variance(sig);
    const diff = sig.slice(1).map((v, i) => v - sig[i]);
    const var1 = variance(diff);
    const diff2 = diff.slice(1).map((v, i) => v - diff[i]);
    const var2 = variance(diff2);
    const mob = Math.sqrt(var1 / (var0 || 1));
    const comp = Math.sqrt(var2 / (var1 || 1)) / (mob || 1);
    return { activity: var0, mobility: mob, complexity: comp };
}

// ---------- FEATURE EXTRACTOR (matches training 100%) ----------
function extractFeatures(channels) {
    const feats = [];

    for (let ch = 0; ch < channels.length; ch++) {
        const sig = channels[ch];
        const { psd, N } = computeFFT(sig);

        const bp = {
            delta: bandpower(psd, N, BANDS.delta[0], BANDS.delta[1]),
            theta: bandpower(psd, N, BANDS.theta[0], BANDS.theta[1]),
            alpha: bandpower(psd, N, BANDS.alpha[0], BANDS.alpha[1]),
            beta: bandpower(psd, N, BANDS.beta[0], BANDS.beta[1]),
        };

        feats.push(bp.delta, bp.theta, bp.alpha, bp.beta);
        feats.push(bp.theta / (bp.alpha || 1), bp.beta / (bp.alpha || 1), bp.beta / (bp.theta || 1));
        feats.push(spectralEntropy(psd));

        const h = hjorth(sig);
        feats.push(h.activity, h.mobility, h.complexity);

        feats.push(mean(sig), stdev(sig));
    }

    for (let a = 0; a < channels.length; a++) {
        for (let b = a + 1; b < channels.length; b++) {
            const x = channels[a], y = channels[b];
            const mx = mean(x), my = mean(y);
            let num = 0, dx2 = 0, dy2 = 0;
            for (let i = 0; i < x.length; i++) {
                const dx = x[i] - mx, dy = y[i] - my;
                num += dx * dy; dx2 += dx * dx; dy2 += dy * dy;
            }
            feats.push(num / Math.sqrt((dx2 || 1) * (dy2 || 1)));
        }
    }
    return feats;
}

// ---------- LOAD EVERYTHING ----------
console.log("Loading model...");
const netJSON = JSON.parse(fs.readFileSync(MODEL_FILE, "utf8"));
const net = new brain.NeuralNetwork().fromJSON(netJSON);

console.log("Loading scaler...");
const scaler = JSON.parse(fs.readFileSync(SCALER_FILE, "utf8"));

console.log("Loading data...");
const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
console.log("Loaded windows:", raw.length);

// ---------- APPLY SCALER ----------
function applyScaler(v) {
    return v.map((x, i) => (x - scaler.means[i]) / (scaler.stds[i] || 1));
}

// ---------- STATS ----------
let correct = 0;
let total = 0;

const denom = { attentive: 0, calm: 0, drowsy: 0 };
const numer = { attentive: 0, calm: 0, drowsy: 0 };
const confStats = { attentive: [], calm: [], drowsy: [] };

console.log("Testing...\n");

for (const row of raw) {
    const feat = applyScaler(extractFeatures(row.input));
    const out = net.run(feat);

    // AUTO-DETECT FORMAT
    let pred, conf;

    if (Array.isArray(out)) {  // ARRAY MODEL
        const i = argmax(out);
        pred = CLASS_LIST[i];
        conf = out[i];
    } else {                   // OBJECT MODEL
        pred = Object.keys(out).reduce((a, b) => out[a] > out[b] ? a : b);
        conf = out[pred];
    }

    total++;
    denom[row.label]++;

    if (pred === row.label) {
        correct++;
        numer[pred]++;
    }

    confStats[row.label].push(conf);
}

// ---------- RESULTS ----------
console.log("============== ACCURACY ==============");
console.log(`Correct: ${correct}/${total}`);
console.log(`Accuracy: ${(correct / total * 100).toFixed(2)} %\n`);

console.log("\n============ CONFUSION MATRIX ============");
const table = {};

for (const real of CLASS_LIST) {
    table[real] = {};
    for (const pred of CLASS_LIST) {
        table[real][pred] = 0;
    }
}

for (let i = 0; i < raw.length; i++) {
    const trueLabel = raw[i].label;
    const feat = applyScaler(extractFeatures(raw[i].input));
    const out = net.run(feat);

    let predicted;
    if (Array.isArray(out)) {
        predicted = CLASS_LIST[argmax(out)];
    } else {
        predicted = Object.keys(out).reduce((a, b) => out[a] > out[b] ? a : b);
    }

    table[trueLabel][predicted]++;
}

console.table(table);


// ---------- CONFIDENCE METRICS ----------
console.log("\n============ CONFIDENCE REPORT =============");
for (const c of CLASS_LIST) {
    const arr = confStats[c];
    if (arr.length === 0) continue;
    console.log(`\n${c.toUpperCase()} (N=${arr.length})`);
    console.log(` mean conf : ${(mean(arr) * 100).toFixed(1)}%`);
    console.log(` std conf  : ${(stdev(arr) * 100).toFixed(1)}%`);
    console.log(` >0.90     : ${(arr.filter(v => v > 0.9).length / arr.length * 100).toFixed(1)}%`);
    console.log(` <0.50     : ${(arr.filter(v => v < 0.5).length / arr.length * 100).toFixed(1)}%`);
}

console.log("\nDone.\n");
