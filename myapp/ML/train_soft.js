/*********************************************************
 * train_soft.js — Soft-label EEG trainer (research mode)
 * -------------------------------------------------------
 * - Uses soft targets from generator ("soft" field)
 * - Evaluates against hard label ("label")
 * - Subject-wise K-fold CV for realism
 *********************************************************/

const fs = require("fs");
const FFT = require("fft.js");
const brain = require("brain.js");

const SR = 128;
const FILE = "eeg_cognitive_states_balanced.json";
const CLASS_LIST = ["attentive", "calm", "drowsy"];
const K_FOLDS = 5;

// ---------- basic stats ----------
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const variance = a => {
    const m = mean(a);
    return a.reduce((s, v) => s + (v - m) ** 2, 0) / Math.max(1, a.length - 1);
};
const stdev = a => Math.sqrt(variance(a)) || 1;

// ---------- FFT / features ----------
function computeFFT(sig) {
    const f = new FFT(sig.length);
    const out = f.createComplexArray();
    const inp = f.createComplexArray();

    for (let i = 0; i < sig.length; i++) {
        inp[2 * i] = sig[i];
        inp[2 * i + 1] = 0;
    }
    f.transform(out, inp);

    const half = sig.length / 2;
    const psd = new Array(half);
    for (let k = 0; k < half; k++) {
        const re = out[2 * k], im = out[2 * k + 1];
        psd[k] = re * re + im * im;
    }
    return psd;
}
function band(psd, lo, hi) {
    const N = psd.length * 2;
    const loB = Math.floor(lo * N / SR);
    const hiB = Math.min(Math.floor(hi * N / SR), psd.length - 1);
    let s = 0;
    for (let i = loB; i <= hiB; i++) s += psd[i];
    return s;
}
function entropy(psd) {
    const total = psd.reduce((a, b) => a + b, 0) + 1e-9;
    let H = 0;
    for (const v of psd) {
        const p = v / total;
        if (p > 0) H -= p * Math.log2(p);
    }
    return H;
}
function hjorth(sig) {
    const diff = sig.slice(1).map((v, i) => v - sig[i]);
    const diff2 = diff.slice(1).map((v, i) => v - diff[i]);
    const var0 = variance(sig);
    const var1 = variance(diff);
    const var2 = variance(diff2);
    const mob = Math.sqrt(var1 / (var0 || 1));
    const comp = Math.sqrt(var2 / (var1 || 1)) / (mob || 1);
    return { activity: var0, mobility: mob, complexity: comp };
}

function extractFeatures(channels) {
    const bands = { delta: [0.5, 4], theta: [4, 8], alpha: [8, 13], beta: [13, 22] };
    const feats = [];

    for (let c = 0; c < channels.length; c++) {
        const sig = channels[c];
        const psd = computeFFT(sig);
        const d = band(psd, ...bands.delta);
        const t = band(psd, ...bands.theta);
        const a = band(psd, ...bands.alpha);
        const b = band(psd, ...bands.beta);

        feats.push(d, t, a, b);
        feats.push(t / (a + 1e-9), b / (a + 1e-9), b / (t + 1e-9));
        feats.push(entropy(psd));

        const h = hjorth(sig);
        feats.push(h.activity, h.mobility, h.complexity);

        feats.push(mean(sig), stdev(sig));
    }

    for (let i = 0; i < channels.length; i++) {
        for (let j = i + 1; j < channels.length; j++) {
            const x = channels[i], y = channels[j];
            const mx = mean(x), my = mean(y);
            let num = 0, dx2 = 0, dy2 = 0;
            for (let k = 0; k < x.length; k++) {
                const dx = x[k] - mx, dy = y[k] - my;
                num += dx * dy;
                dx2 += dx * dx;
                dy2 += dy * dy;
            }
            feats.push(num / (Math.sqrt(dx2 * dy2) + 1e-9));
        }
    }
    return feats;
}

// ---------- load ----------
const raw = JSON.parse(fs.readFileSync(FILE));
console.log("Loaded windows:", raw.length);

const X = [];
const yHard = [];
const ySoft = [];
const subj = [];

for (const r of raw) {
    X.push(extractFeatures(r.input));
    yHard.push(r.label);
    ySoft.push(r.soft || {
        attentive: r.label === "attentive" ? 1 : 0,
        calm: r.label === "calm" ? 1 : 0,
        drowsy: r.label === "drowsy" ? 1 : 0
    });
    subj.push(r.subject);
}

const subjects = [...new Set(subj)];
console.log("Subjects:", subjects.length);

// ---------- scaler ----------
function computeScaler(features) {
    const dims = features[0].length;
    const means = Array(dims).fill(0);
    const stds = Array(dims).fill(0);
    for (let d = 0; d < dims; d++) {
        const col = features.map(r => r[d]);
        means[d] = mean(col);
        stds[d] = stdev(col);
    }
    return { means, stds };
}
function scaleVec(v, s) {
    return v.map((x, i) => (x - s.means[i]) / (s.stds[i] || 1));
}

// ---------- K-fold subject split ----------
function splitKFolds(list, k) {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    const folds = [];
    const size = Math.ceil(shuffled.length / k);
    for (let i = 0; i < k; i++) {
        folds.push(shuffled.slice(i * size, (i + 1) * size));
    }
    return folds;
}
const folds = splitKFolds(subjects, K_FOLDS);

// ---------- helpers ----------
function argmaxCls(obj) {
    let best = CLASS_LIST[0];
    for (const c of CLASS_LIST) {
        if (obj[c] > obj[best]) best = c;
    }
    return best;
}

const foldAcc = [];

for (let f = 0; f < folds.length; f++) {
    const testSubs = new Set(folds[f]);
    const trainSubs = new Set(subjects.filter(s => !testSubs.has(s)));

    let Xtrain = [], Strain = [], Ltrain = [];
    let Xtest = [], Stest = [], Ltest = [];

    for (let i = 0; i < X.length; i++) {
        if (trainSubs.has(subj[i])) {
            Xtrain.push(X[i]);
            Strain.push(ySoft[i]);
            Ltrain.push(yHard[i]);
        } else if (testSubs.has(subj[i])) {
            Xtest.push(X[i]);
            Stest.push(ySoft[i]);
            Ltest.push(yHard[i]);
        }
    }

    console.log(`\n=== Fold ${f + 1}/${folds.length} ===`);
    console.log("Train windows:", Xtrain.length, "Test windows:", Xtest.length);

    const scaler = computeScaler(Xtrain);
    Xtrain = Xtrain.map(v => scaleVec(v, scaler));
    Xtest = Xtest.map(v => scaleVec(v, scaler));

    const trainData = Xtrain.map((v, i) => ({
        input: v,
        output: Strain[i]   // soft target
    }));

    const net = new brain.NeuralNetwork({
        hiddenLayers: [64, 48, 24],
        learningRate: 0.0008,
        activation: "relu"
    });

    let bestNet = null;
    let bestLoss = Infinity;
    let patience = 0;

    for (let cycle = 0; cycle < 40; cycle++) {
        const res = net.train(trainData, {
            iterations: 120,
            errorThresh: 0.004,
            log: false
        });
        const loss = res.error;
        if (loss < bestLoss - 0.0003) {
            bestLoss = loss;
            bestNet = JSON.parse(JSON.stringify(net.toJSON()));
            patience = 0;
        } else {
            patience++;
            if (patience >= 6) {
                console.log("Early stop at cycle", cycle);
                break;
            }
        }
    }
    if (bestNet) net.fromJSON(bestNet);

    let correct = 0;
    for (let i = 0; i < Xtest.length; i++) {
        const out = net.run(Xtest[i]);
        const pred = argmaxCls(out);
        if (pred === Ltest[i]) correct++;
    }
    const acc = correct / Xtest.length;
    foldAcc.push(acc);
    console.log(`Fold accuracy: ${(acc * 100).toFixed(2)}%`);
}

// summary
const meanAcc = mean(foldAcc);
const stdAcc = stdev(foldAcc);
console.log("\n=============================");
console.log("Subject-wise Soft-label CV");
console.log("=============================");
foldAcc.forEach((a, i) => console.log(`Fold ${i + 1}: ${(a * 100).toFixed(2)}%`));
console.log("-----------------------------");
console.log("Mean Accuracy:", (meanAcc * 100).toFixed(2) + "%");
console.log("Std Dev:", (stdAcc * 100).toFixed(2) + "%");

// final model on all data (optional)
console.log("\nTraining final model on all windows with soft labels...");

const scalerFinal = computeScaler(X);
const Xscaled = X.map(v => scaleVec(v, scalerFinal));
const finalTrain = Xscaled.map((v, i) => ({
    input: v,
    output: ySoft[i]
}));

const netFinal = new brain.NeuralNetwork({
    hiddenLayers: [64, 48, 24],
    learningRate: 0.0008,
    activation: "relu"
});
netFinal.train(finalTrain, {
    iterations: 400,
    errorThresh: 0.003,
    log: true,
    logPeriod: 20
});

fs.writeFileSync("cognitive_state_model_final.json",
    JSON.stringify(netFinal.toJSON(), null, 2));
fs.writeFileSync("scaler_final.json",
    JSON.stringify(scalerFinal, null, 2));
console.log("Saved final model and scaler.");
