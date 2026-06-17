const fs = require('fs');
const path = require('path');

const hinkalBase = path.join(__dirname, 'node_modules', '@hinkal', 'common');
const webworkerBase = path.join(hinkalBase, 'webworker');
const cdn = 'https://wallet-prodv12.hinkal.io/workers/0.2.37/';

// 1. Patch the tsworker&url files so bundlers don't fail on missing local assets
const workers = [
  { dir: path.join(webworkerBase, 'snarkjsWorker'), name: 'snarkjsWorkerLauncher' },
  { dir: path.join(webworkerBase, 'utxoWorker'), name: 'utxoWorkerLauncher' },
  { dir: path.join(webworkerBase, 'zkProofWorker'), name: 'zkProofWorkerLauncher' },
];

for (const w of workers) {
  if (!fs.existsSync(w.dir)) continue;
  const files = fs.readdirSync(w.dir);
  for (const file of files) {
    const filePath = path.join(w.dir, file);
    if (file.includes('url.mjs')) {
      fs.writeFileSync(filePath, `var e = "${cdn}${w.name}.js";\nexport { e as default };\n`, 'utf8');
      console.log('Patched:', file);
    }
    if (file.includes('url.cjs')) {
      fs.writeFileSync(filePath, `exports.default = "${cdn}${w.name}.js";\n`, 'utf8');
      console.log('Patched:', file);
    }
  }
}

// 2. Patch viteWorkerURL to fetch workers from CDN
const viteWorkerFiles = [
  path.join(webworkerBase, 'viteWorkerURL.constant.mjs'),
  path.join(webworkerBase, 'viteWorkerURL.constant.cjs'),
];

const mjsContent = `const domain = '${cdn}';
async function getWorkerURL(url) {
  const contentRes = await fetch(url);
  const content = await contentRes.text();
  return URL.createObjectURL(new Blob([content], { type: "application/javascript" }));
}
var e = ((r) => (r.ZKProof = "ZKProof", r.SnarkJS = "SnarkJS", r.UTXO = "UTXO", r))({});
const n = async () => ({
  [e.ZKProof]: await getWorkerURL(domain + 'zkProofWorkerLauncher.js'),
  [e.SnarkJS]: await getWorkerURL(domain + 'snarkjsWorkerLauncher.js'),
  [e.UTXO]: await getWorkerURL(domain + 'utxoWorkerLauncher.js'),
});
export { n as getWorkerViteURL };
`;

const cjsContent = `const domain = '${cdn}';
async function getWorkerURL(url) {
  const contentRes = await fetch(url);
  const content = await contentRes.text();
  return URL.createObjectURL(new Blob([content], { type: "application/javascript" }));
}
const WorkerVariant = ((r) => (r.ZKProof = "ZKProof", r.SnarkJS = "SnarkJS", r.UTXO = "UTXO", r))({});
const getWorkerViteURL = async () => ({
  [WorkerVariant.ZKProof]: await getWorkerURL(domain + 'zkProofWorkerLauncher.js'),
  [WorkerVariant.SnarkJS]: await getWorkerURL(domain + 'snarkjsWorkerLauncher.js'),
  [WorkerVariant.UTXO]: await getWorkerURL(domain + 'utxoWorkerLauncher.js'),
});
exports.getWorkerViteURL = getWorkerViteURL;
`;

for (const f of viteWorkerFiles) {
  if (!fs.existsSync(f)) continue;
  const content = f.endsWith('.mjs') ? mjsContent : cjsContent;
  fs.writeFileSync(f, content, 'utf8');
  console.log('Patched:', path.basename(f));
}

// 3. Patch workerFactory to remove Node.js-only imports (worker_threads, fs, path)
//    Turbopack tries to bundle them even though they're inside if(isNode) branch
const workerFactoryMjs = path.join(webworkerBase, 'workerFactory.mjs');
const workerFactoryCjs = path.join(webworkerBase, 'workerFactory.cjs');

const factoryMjs = `import { isNode as e } from "../constants/vite.constants.mjs";
import { WorkerWrapper as n } from "./WorkerWrapper.mjs";
var r = class r {
  constructor() {}
  static resolveWorkerURL = async (workerType) => {
    let { getWorkerViteURL } = await import("./viteWorkerURL.constant.mjs");
    return (await getWorkerViteURL())[workerType];
  };
  static async createBrowserWorker(workerType) {
    let url = await r.resolveWorkerURL(workerType);
    return new Worker(url, { type: "module" });
  }
  static async createNodeWorker(workerType) {
    throw new Error("Node.js workers not supported in this build");
  }
  static async createWorker(workerType) {
    return e ? r.createNodeWorker(workerType) : r.createBrowserWorker(workerType);
  }
  static async getWebWorker(workerType) {
    return new n(await r.createWorker(workerType));
  }
};
export { r as WorkerFactory };
`;

const factoryCjs = `const viteConstants = require("../constants/vite.constants.cjs");
const WorkerWrapperMod = require("./WorkerWrapper.cjs");
var r = class r {
  constructor() {}
  static resolveWorkerURL = async (workerType) => {
    let { getWorkerViteURL } = await Promise.resolve().then(() => require("./viteWorkerURL.constant.cjs"));
    return (await getWorkerViteURL())[workerType];
  };
  static async createBrowserWorker(workerType) {
    let url = await r.resolveWorkerURL(workerType);
    return new Worker(url, { type: "module" });
  }
  static async createNodeWorker(workerType) {
    throw new Error("Node.js workers not supported in this build");
  }
  static async createWorker(workerType) {
    return viteConstants.isNode ? r.createNodeWorker(workerType) : r.createBrowserWorker(workerType);
  }
  static async getWebWorker(workerType) {
    return new WorkerWrapperMod.WorkerWrapper(await r.createWorker(workerType));
  }
};
exports.WorkerFactory = r;
`;

if (fs.existsSync(workerFactoryMjs)) {
  fs.writeFileSync(workerFactoryMjs, factoryMjs, 'utf8');
  console.log('Patched: workerFactory.mjs');
}
if (fs.existsSync(workerFactoryCjs)) {
  fs.writeFileSync(workerFactoryCjs, factoryCjs, 'utf8');
  console.log('Patched: workerFactory.cjs');
}

console.log('Worker patching complete.');
