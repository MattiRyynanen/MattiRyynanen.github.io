"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getElement(id) {
    const element = document.getElementById(id);
    if (element) {
        return element;
    }
    else {
        throw new Error(`No element ${id}`);
    }
}
class Helpers {
    static estimateProjection(from, to) {
        if (from.length !== 4 || to.length !== 4) {
            throw Error("Expecting 4 points for transform");
        }
        let a = [];
        let b = [];
        for (let i = 0; i < 4; ++i) {
            const pp = from[i];
            const p = to[i];
            a.push([p.x, p.y, 1, 0, 0, 0, -p.x * pp.x, -p.y * pp.x]);
            a.push([0, 0, 0, p.x, p.y, 1, -p.x * pp.y, -p.y * pp.y]);
            b.push([pp.x]);
            b.push([pp.y]);
        }
        const A = math.matrix(a);
        const At = math.transpose(A);
        const H = math.multiply(math.multiply(math.inv(math.multiply(At, A)), At), math.matrix(b));
        const h = math.transpose(H).valueOf()[0];
        return { a: h[0], b: h[1], c: h[2], d: h[3], e: h[4], f: h[5], g: h[6], h: h[7] };
    }
    static sameValues(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
    static getBoundingBox(connectedComponent) {
        let xMin = connectedComponent[0].x;
        let xMax = xMin;
        let yMin = connectedComponent[0].y;
        let yMax = yMin;
        for (const p of connectedComponent) {
            xMin = Math.min(xMin, p.x);
            yMin = Math.min(yMin, p.y);
            xMax = Math.max(xMax, p.x);
            yMax = Math.max(yMax, p.y);
        }
        return { min: { x: xMin, y: yMin }, max: { x: xMax, y: yMax } };
    }
    static areaOf(bb) {
        const w = bb.max.x - bb.min.x;
        const h = bb.max.y - bb.min.y;
        return w * h;
    }
    static aspectRatioOf(bb) {
        const w = bb.max.x - bb.min.x;
        const h = Math.max(bb.max.y - bb.min.y, 1);
        return w / h;
    }
    static euclideanDistance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    static triangleArea(p1, p2, p3) {
        const a = Helpers.euclideanDistance(p1, p2);
        const b = Helpers.euclideanDistance(p2, p3);
        const c = Helpers.euclideanDistance(p3, p1);
        const s = 0.5 * (a + b + c);
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    }
    static cornerPoints(cc, bb) {
        const cornerDistances = [
            (p) => p.x - bb.min.x + p.y - bb.min.y,
            (p) => bb.max.x - p.x + p.y - bb.min.y,
            (p) => bb.max.x - p.x + bb.max.y - p.y,
            (p) => p.x - bb.min.x + bb.max.y - p.y
        ];
        return cornerDistances.map(d => Helpers.minimumOf(cc, d));
    }
    static minimumOf(items, getValue) {
        let minimumItem = items[0];
        let minValue = getValue(minimumItem);
        for (const item of items) {
            const v = getValue(item);
            if (v < minValue) {
                minValue = v;
                minimumItem = item;
            }
        }
        return minimumItem;
    }
    static maxValueAndIndex(values) {
        let maxIndex = 0;
        let maxValue = values[maxIndex];
        for (let i = 1; i < values.length; ++i) {
            if (values[i] > maxValue) {
                maxIndex = i;
                maxValue = values[i];
            }
        }
        return [maxValue, maxIndex];
    }
    static cumulative2d(src, dst, width, height) {
        const totalSize = width * height;
        if (src.length !== dst.length || (totalSize) !== src.length) {
            throw Error("Invalid dimensions.");
        }
        dst[0] = src[0];
        for (let col = 1; col < width; ++col) {
            dst[col] = src[col] + dst[col - 1];
        }
        const offset = width;
        let ind = offset;
        for (let row = 1; row < height; ++row) {
            dst[ind] = src[ind] + dst[ind - offset];
            ind += offset;
        }
        let rowOffset = width;
        const w1 = width + 1;
        while (rowOffset < totalSize) {
            const dstEnd = rowOffset + width;
            for (let dstIndex = rowOffset + 1; dstIndex < dstEnd; ++dstIndex) {
                dst[dstIndex] = src[dstIndex]
                    + dst[dstIndex - 1]
                    + dst[dstIndex - width]
                    - dst[dstIndex - w1];
            }
            rowOffset = dstEnd;
        }
    }
}
class CanvasOperations {
    static drawLine(ctx, points) {
        if (points.length < 2) {
            return;
        }
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (const p of points.slice(1)) {
            ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.stroke();
    }
}
class ImageOperations {
    static copyGrayFromRgba(rgba, dst) {
        if (rgba.length !== 4 * dst.length) {
            throw new Error("Invalid input size.");
        }
        let dstIndex = 0;
        let srcIndex = 1;
        while (dstIndex < dst.length) {
            dst[dstIndex] = rgba[srcIndex];
            dstIndex += 1;
            srcIndex += 4;
        }
    }
    static copyGrayToRgba(src, rgba) {
        if (rgba.length !== 4 * src.length) {
            throw new Error("Invalid destination size.");
        }
        let outIndex = 0;
        for (const gray of src) {
            rgba[outIndex++] = gray;
            rgba[outIndex++] = gray;
            rgba[outIndex++] = gray;
            rgba[outIndex++] = 255;
        }
    }
    static setRgbaAlpha(data, alpha) {
        for (let i = 3; i < data.length; i += 4) {
            data[i] = alpha;
        }
    }
    static clear(data) {
        for (let i = 0; i < data.length; ++i) {
            data[i] = 0;
        }
    }
    static drawConnectedComponent(cc, dst, width) {
        for (const p of cc) {
            dst[p.y * width + p.x] = 255;
        }
    }
    static warpProjective(pt, src, srcSize, dst, dstSize) {
        let sxPre1 = pt.c;
        let sxPre2 = 1;
        let syPre1 = pt.f;
        let syPre2 = 1;
        for (let y = 0; y < dstSize.y; ++y) {
            let gx = 0;
            const dstOffset = y * dstSize.x;
            for (let x = 0; x < dstSize.x; ++x) {
                const sx = (pt.a * x + sxPre1) / (gx + sxPre2);
                const sy = (pt.d * x + syPre1) / (gx + syPre2);
                gx += pt.g;
                const sxf = Math.floor(sx);
                const syf = Math.floor(sy);
                const xd = sx - sxf;
                const yd = sy - syf;
                const sum = (1 - xd) * (1 - yd) * src[syf * srcSize.x + sxf]
                    + xd * (1 - yd) * src[syf * srcSize.x + (sxf + 1)]
                    + (1 - xd) * yd * src[(syf + 1) * srcSize.x + sxf]
                    + xd * yd * src[(syf + 1) * srcSize.x + (sxf + 1)];
                dst[dstOffset + x] = sum;
            }
            sxPre1 += pt.b;
            sxPre2 += pt.h;
            syPre1 += pt.e;
            syPre2 += pt.h;
        }
    }
}
class DigitRecognizer {
    constructor(model) {
        this.model = model;
        console.log("Recognizer model");
        this.model.summary();
    }
    static loadFrom(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return tf.loadLayersModel(path).then((m) => new DigitRecognizer(m));
        });
    }
    recognize(digitTiles) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.predictTiles(digitTiles).then(DigitRecognizer.getDigits);
        });
    }
    predictTiles(digitTiles) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.predict(tf.tensor4d(digitTiles)).array();
        });
    }
    static getDigits(probabilities) {
        const digits = new Array(81);
        for (let i = 0; i < probabilities.length; ++i) {
            const [maxVal, maxIndex] = Helpers.maxValueAndIndex(probabilities[i]);
            digits[i] = maxVal < 0.9 ? 0 : maxIndex;
        }
        return digits;
    }
}
class ImageProcessing {
    constructor(width, height) {
        this.sudokuDigitDim = 28;
        this.sudokuImageSize = this.sudokuDigitDim * 9;
        this.width = width;
        this.height = height;
        this.cumulative2d = new Array(width * height);
        this.grayScale = new Uint8ClampedArray(width * height);
        this.boxBlurred = new Uint8ClampedArray(width * height);
        this.binarized = new Uint8ClampedArray(width * height);
        this.cornerPoints = Array();
        this.sudokuImage = new Uint8ClampedArray(this.sudokuImageSize * this.sudokuImageSize);
    }
    readSudokuTiles() {
        let digits = [];
        const dim = this.sudokuDigitDim;
        const digitRowPixels = this.sudokuImageSize * dim;
        for (let dr = 0; dr < 9; ++dr) {
            const dRowOff = dr * digitRowPixels;
            for (let dc = 0; dc < 9; ++dc) {
                const rows = new Array(dim);
                const dColOff = dc * dim;
                let readIndex = dRowOff + dColOff;
                for (let r = 0; r < dim; ++r) {
                    const row = new Array(dim);
                    for (let c = 0; c < dim; ++c) {
                        row[c] = [this.sudokuImage[readIndex] / 255];
                        ++readIndex;
                    }
                    rows[r] = row;
                    readIndex += (8 * dim);
                }
                digits.push(rows);
            }
        }
        return digits;
    }
    processRgba(rgba) {
        ImageOperations.copyGrayFromRgba(rgba, this.grayScale);
        Helpers.cumulative2d(this.grayScale, this.cumulative2d, this.width, this.height);
        this.boxBlur(5);
        this.toBinary(10);
    }
    updateSudokuImage(cc) {
        const bb = Helpers.getBoundingBox(cc);
        this.cornerPoints = Helpers.cornerPoints(cc, bb);
        const s = this.sudokuImageSize - 1;
        const targetCorners = [{ x: 0, y: 0 }, { x: s, y: 0 }, { x: s, y: s }, { x: 0, y: s }];
        const transform = Helpers.estimateProjection(this.cornerPoints, targetCorners);
        ImageOperations.warpProjective(transform, this.grayScale, { x: this.width, y: this.height }, this.sudokuImage, { x: this.sudokuImageSize, y: this.sudokuImageSize });
    }
    detectConnectedComponent() {
        return this.getConnectedComponent(this.width * this.height / 10, 1.5);
    }
    boxBlur(k) {
        const normalizer = 1.0 / ((k * 2 + 1) * (k * 2 + 1));
        const k1 = k + 1;
        const offset = (rowOffset, colOffset) => rowOffset * this.width + colOffset;
        const startIndex = offset(k1, k1);
        const endIndex = (this.height * this.width) - offset(k, k);
        let aInd = offset(k, k) + startIndex;
        let bInd = offset(-k1, -k1) + startIndex;
        let cInd = offset(-k1, k) + startIndex;
        let dInd = offset(k, -k1) + startIndex;
        for (let i = startIndex; i < endIndex; ++i) {
            const sum = this.cumulative2d[aInd++]
                + this.cumulative2d[bInd++]
                - this.cumulative2d[cInd++]
                - this.cumulative2d[dInd++];
            this.boxBlurred[i] = sum * normalizer;
        }
    }
    toBinary(threshold) {
        for (let i = 0; i < this.boxBlurred.length; ++i) {
            this.binarized[i] = this.boxBlurred[i] - threshold > this.grayScale[i] ? 255 : 0;
        }
    }
    getConnectedComponent(areaMin, aspectRatioThr) {
        const checked = new Array(this.binarized.length);
        for (let i = 0; i < this.binarized.length; ++i) {
            checked[i] = this.binarized[i] < 255;
        }
        for (let row = 0; row < this.height; ++row) {
            const rowOffset = row * this.width;
            for (let col = 0; col < this.width; ++col) {
                if (checked[rowOffset + col]) {
                    continue;
                }
                const positions = new Array();
                checked[rowOffset + col] = true;
                const queue = new Array({ x: col, y: row });
                while (queue.length > 0) {
                    const exam = queue.pop();
                    positions.push(exam);
                    const neighbours = [
                        { x: exam.x + 1, y: exam.y },
                        { x: exam.x - 1, y: exam.y },
                        { x: exam.x, y: exam.y + 1 },
                        { x: exam.x, y: exam.y - 1 },
                    ];
                    for (const n of neighbours) {
                        if (n.x < 0 || n.y < 0) {
                            continue;
                        }
                        if (n.x >= this.width || n.y >= this.height) {
                            continue;
                        }
                        const index = n.y * this.width + n.x;
                        if (checked[index]) {
                            continue;
                        }
                        checked[index] = true;
                        queue.push(n);
                    }
                }
                const bb = Helpers.getBoundingBox(positions);
                const aspectRatio = Helpers.aspectRatioOf(bb);
                if (Helpers.areaOf(bb) < areaMin ||
                    aspectRatio > aspectRatioThr ||
                    aspectRatio < (1 / aspectRatioThr)) {
                    continue;
                }
                const edgeThr = 10;
                if (bb.min.x < edgeThr || bb.min.y < edgeThr
                    || bb.max.x > (this.width - edgeThr)
                    || bb.max.y > (this.height - edgeThr)) {
                    continue;
                }
                const cornerPoints = Helpers.cornerPoints(positions, bb);
                const cornerDistances = [0, 1, 2, 3]
                    .map(i => Helpers.euclideanDistance(cornerPoints[i], cornerPoints[(i + 1) % 4]));
                const average = cornerDistances.reduce((a, b) => a + b, 0) / 4.0;
                const thr = 1.2;
                if (cornerDistances.map(d => d / average).some(d => d > thr || d < (1 / thr))) {
                    continue;
                }
                return positions;
            }
        }
        return Array();
    }
}
class App {
    constructor(video, hud, overlay, sudokuCanvas) {
        this.recognizer = null;
        this.recording = false;
        this.videoStream = null;
        this.imageProcessor = null;
        this.detectedDigits = Array();
        this.solutionDigits = Array();
        this.video = video;
        this.hud = hud;
        this.overlay = overlay;
        this.sudokuCanvas = sudokuCanvas;
        this.overlayCtx = this.overlay.getContext("2d");
        this.sudokuCtx = this.sudokuCanvas.getContext("2d");
    }
    setup() {
        this.handleWindowSize();
        window.addEventListener("resize", _ => this.handleWindowSize());
        this.showHudText("Starting...");
        this.hud.solutionButton.addEventListener("click", () => this.openStepsLink());
        DigitRecognizer.loadFrom("tfjs-model/model.json")
            .then(r => {
            this.recognizer = r;
            this.hud.recButton.addEventListener("click", () => this.recButtonClick());
            this.hud.recButton.style.display = "";
            this.showHudText("");
        })
            .catch(reason => alert(`Could not load recognizer, reason: ${reason}`));
    }
    handleWindowSize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const portrait = w < h;
        if (portrait) {
            const size = (w * 4) / 6;
            const sudokuCanvasDisplaySize = Math.min(700, Math.min(size, h * 2 / 5));
            this.sudokuCanvas.style.width = App.toPx(sudokuCanvasDisplaySize);
            this.sudokuCanvas.style.top = App.toPx(h - sudokuCanvasDisplaySize);
            this.sudokuCanvas.style.left = App.toPx((w - sudokuCanvasDisplaySize) / 2);
            const videoWidth = Math.min(1000, w);
            this.video.style.width = App.toPx(videoWidth);
            this.video.style.height = "";
            this.video.style.top = App.toPx(0);
            this.video.style.left = App.toPx((w - videoWidth) / 2);
        }
        else {
            const size = (h * 4) / 6;
            const sudokuCanvasDisplaySize = Math.min(700, Math.min(size, w * 2 / 5));
            this.sudokuCanvas.style.width = App.toPx(sudokuCanvasDisplaySize);
            this.sudokuCanvas.style.top = App.toPx((h - sudokuCanvasDisplaySize) / 2);
            this.sudokuCanvas.style.left = App.toPx(w - sudokuCanvasDisplaySize);
            const videoHeight = Math.min(600, h);
            this.video.style.height = App.toPx(videoHeight);
            this.video.style.width = "";
            this.video.style.top = App.toPx((h - videoHeight) / 2);
            this.video.style.left = App.toPx(0);
        }
    }
    showHudText(text) {
        this.hud.infoText.innerHTML = text;
    }
    setRecButtonText(text) {
        this.hud.recButton.innerText = text;
    }
    startRecording() {
        const constraints = {
            video: {
                width: { ideal: 640 },
                facingMode: "environment"
            }
        };
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
            this.videoStream = stream;
            this.video.srcObject = stream;
            this.video.addEventListener("loadeddata", () => this.videoRecordingStarted());
        })
            .catch(reason => alert(`Could not start recording, reason: ${reason}`));
    }
    videoRecordingStarted() {
        console.log("Video recording started");
        const w = this.video.videoWidth;
        const h = this.video.videoHeight;
        if (!this.imageProcessor && w > 0 && h > 0) {
            console.log("Creating a processor", w, h);
            this.imageProcessor = new ImageProcessing(w, h);
            this.overlay.width = w;
            this.overlay.height = h;
            this.overlay.style.width = this.video.style.width;
            this.overlay.style.height = this.video.style.height;
            this.overlay.style.top = this.video.style.top;
            this.overlay.style.left = this.video.style.left;
            this.showHudText(`Video size ${w}x${h}`);
            App.show(this.hud.recButton, true);
            this.processVideoFrame();
        }
    }
    stopRecording() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
            this.imageProcessor = null;
            this.recording = false;
            this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        }
    }
    processVideoFrame() {
        if (!this.recording || !this.imageProcessor) {
            return;
        }
        this.overlayCtx.drawImage(this.video, 0, 0);
        const rgbaData = this.overlayCtx.getImageData(0, 0, this.video.videoWidth, this.video.videoHeight);
        this.imageProcessor.processRgba(rgbaData.data);
        ImageOperations.setRgbaAlpha(rgbaData.data, 0);
        this.overlayCtx.putImageData(rgbaData, 0, 0);
        if (this.imageProcessor.cornerPoints.length > 0) {
            this.overlayCtx.strokeStyle = 'red';
            CanvasOperations.drawLine(this.overlayCtx, this.imageProcessor.cornerPoints);
        }
        const connectedComponent = () => {
            if (!this.imageProcessor)
                return;
            const cc = this.imageProcessor.detectConnectedComponent();
            if (cc.length > 0) {
                setTimeout(() => extractSudokuImage(cc), 20);
            }
            else {
                setTimeout(() => this.processVideoFrame(), 200);
            }
        };
        const extractSudokuImage = (cc) => {
            if (!this.imageProcessor)
                return;
            this.imageProcessor.updateSudokuImage(cc);
            setTimeout(detectDigits, 10);
        };
        const detectDigits = () => {
            if (!this.imageProcessor || !this.recognizer)
                return;
            const cellImages = this.imageProcessor.readSudokuTiles();
            tf.tidy(() => {
                var _a;
                (_a = this.recognizer) === null || _a === void 0 ? void 0 : _a.recognize(cellImages).then(digits => setTimeout(() => solve(digits), 20));
            });
        };
        const solve = (digits) => {
            if (digits.length !== 81 || digits.filter(d => d > 0).length < 10) {
                setTimeout(() => this.processVideoFrame(), 200);
                return;
            }
            const puzzle = Puzzle.CreateFrom(digits);
            const solution = puzzle.getSolution();
            if (solution) {
                this.detectedDigits = digits;
                this.solutionDigits = solution.cells.map(c => c.candidates[0]);
                App.show(this.hud.solutionButton, true);
                setTimeout(drawResults, 10);
            }
            else {
                setTimeout(() => this.processVideoFrame(), 200);
            }
        };
        const drawResults = () => {
            if (!this.imageProcessor)
                return;
            const sudokuRgba = this.sudokuCtx.getImageData(0, 0, 252, 252);
            ImageOperations.copyGrayToRgba(this.imageProcessor.sudokuImage, sudokuRgba.data);
            this.sudokuCtx.putImageData(sudokuRgba, 0, 0);
            this.sudokuCtx.textBaseline = "middle";
            this.sudokuCtx.textAlign = "center";
            this.sudokuCtx.font = "10px verdana";
            this.sudokuCtx.fillStyle = 'red';
            this.drawSudokuDigits(this.detectedDigits, { x: 0.15, y: 0.3 });
            this.sudokuCtx.font = "14px verdana";
            this.sudokuCtx.fillStyle = 'green';
            const solvedDigits = this.detectedDigits.map((d, i) => d > 0 ? 0 : this.solutionDigits[i]);
            this.drawSudokuDigits(solvedDigits, { x: 0.5, y: 0.5 });
            App.show(this.hud.solutionButton, true);
            setTimeout(() => this.processVideoFrame(), 200);
        };
        setTimeout(connectedComponent, 100);
    }
    drawSudokuDigits(digits, offset) {
        for (let i = 0; i < digits.length; ++i) {
            if (digits[i] <= 0)
                continue;
            const r = Math.floor(i / 9);
            const c = i % 9;
            this.sudokuCtx.fillText(digits[i].toString(), (c + offset.x) * 28, (r + offset.y) * 28);
        }
    }
    openStepsLink() {
        if (this.detectedDigits.length !== 81)
            return;
        const digitsStr = this.detectedDigits.map(v => v > 0 ? v.toString() : '.').join('');
        const url = `https://mattiryynanen.github.io/scala-sudoku/index.html?puzzle=${digitsStr}`;
        console.log("Opening up", url);
        window.open(url, "_blank");
    }
    resetResults() {
        this.detectedDigits = Array();
        this.solutionDigits = Array();
        App.show(this.hud.solutionButton, false);
    }
    recButtonClick() {
        if (this.recording) {
            console.log("Already recording, stop");
            this.stopRecording();
            this.setRecButtonText("Start camera");
        }
        else {
            this.resetResults();
            this.recording = true;
            App.show(this.hud.recButton, false);
            this.setRecButtonText("Stop camera");
            this.showHudText("Starting camera...");
            this.startRecording();
        }
    }
}
App.toPx = (pixels) => `${pixels}px`;
App.show = (element, show) => element.style.display = show ? "" : "none";
const hud = {
    infoText: getElement("hudText"),
    recButton: getElement("recButton"),
    solutionButton: getElement("solutionButton")
};
const app = new App(getElement("webcam"), hud, getElement("debugCanvas"), getElement("sudokuCanvas")).setup();
class Cell {
    constructor(index, row, col, block, candidates, broadcasted) {
        this.index = index;
        this.row = row;
        this.col = col;
        this.block = block;
        this.candidates = candidates;
        this.broadcasted = broadcasted;
        this.solved = this.candidates.length === 1;
    }
    static Create(index, candidates, broadcasted) {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const block = 3 * Math.floor(row / 3) + Math.floor(col / 3);
        return new Cell(index, row, col, block, candidates, broadcasted);
    }
    asBroadcasted() {
        return this.broadcasted
            ? this
            : new Cell(this.index, this.row, this.col, this.block, this.candidates, true);
    }
    hasCandidate(cand) {
        return this.candidates.filter(c => c === cand).length == 1;
    }
    removeCandidate(cand) {
        return this.hasCandidate(cand)
            ? new Cell(this.index, this.row, this.col, this.block, this.candidates.filter(c => c !== cand), this.broadcasted)
            : this;
    }
    setCandidateTo(cand) {
        return new Cell(this.index, this.row, this.col, this.block, [cand], this.broadcasted);
    }
    intersects(c) {
        return this.row == c.row || this.col == c.col || this.block == c.block;
    }
    intersectsEx(c) {
        return this.index != c.index && this.intersects(c);
    }
    toString() {
        return `${this.row}${this.col}: ${this.candidates.join()}`;
    }
}
class Puzzle {
    constructor(cells) {
        this.cells = cells;
    }
    static CreateOf(str) {
        const digits = Array();
        for (const digit of str) {
            if (digit === '.') {
                digits.push(0);
            }
            else if (!isNaN(parseInt(digit))) {
                digits.push(parseInt(digit));
            }
        }
        return Puzzle.CreateFrom(digits);
    }
    static CreateFrom(initials) {
        if (initials.length !== 81) {
            return null;
        }
        const cells = initials.map((n, index) => {
            return Cell.Create(index, n > 0 ? [n] : [1, 2, 3, 4, 5, 6, 7, 8, 9], false);
        });
        return new Puzzle(cells);
    }
    broadcast(cell) {
        if (!cell.solved) {
            throw Error(`Cell {cell.toString()} needs to be solved before broadcasting.`);
        }
        if (cell.broadcasted) {
            return this;
        }
        const finalCand = cell.candidates[0];
        const cells = this.cells.map(c => {
            if (c.intersectsEx(cell)) {
                return c.removeCandidate(finalCand);
            }
            else if (c.index === cell.index) {
                return c.asBroadcasted();
            }
            else {
                return c;
            }
        });
        return new Puzzle(cells);
    }
    broadcastCell() {
        return this.cells.find(c => !c.broadcasted && c.solved);
    }
    asBroadcasted() {
        let returnPuzzle = this;
        let cellToBroadcast = returnPuzzle.broadcastCell();
        while (cellToBroadcast !== undefined) {
            returnPuzzle = returnPuzzle.broadcast(cellToBroadcast);
            cellToBroadcast = returnPuzzle.broadcastCell();
        }
        return returnPuzzle;
    }
    withNewCell(cell) {
        const cells = this.cells.map(c => c.index === cell.index ? cell : c);
        return new Puzzle(cells);
    }
    solved() {
        return this.cells.every(c => c.solved && c.broadcasted);
    }
    invalid() {
        return this.cells.some(c => c.candidates.length == 0);
    }
    findNextCell() {
        let next = null;
        for (const cell of this.cells.filter(c => !c.solved)) {
            if (next === null || cell.candidates.length < next.candidates.length) {
                next = cell;
            }
        }
        return next;
    }
    getSolution() {
        let solution = this.asBroadcasted();
        if (solution.invalid()) {
            return null;
        }
        if (solution.solved()) {
            return solution;
        }
        const nextCell = solution.findNextCell();
        if (nextCell === null) {
            throw Error("No suitable new cell.");
        }
        for (const testCand of nextCell.candidates) {
            const guessPuzzle = solution.withNewCell(nextCell.setCandidateTo(testCand));
            const testSolution = guessPuzzle.getSolution();
            if (testSolution !== null) {
                return testSolution;
            }
        }
        return null;
    }
}
//# sourceMappingURL=script.js.map