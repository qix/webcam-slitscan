"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/***
 * Setup a webcam and fetch data from it
 **/
function delay(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}
var Webcam = /** @class */ (function () {
    function Webcam() {
    }
    Webcam.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stream, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.snapshot = document.getElementById("snapshot");
                        this.video = document.getElementById("video");
                        this.context = this.snapshot.getContext("2d");
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia({ video: true })];
                    case 1:
                        stream = _a.sent();
                        this.video.srcObject = stream;
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < 5000)) return [3 /*break*/, 5];
                        if (this.video.videoWidth > 0) {
                            return [2 /*return*/, this.video];
                        }
                        return [4 /*yield*/, delay(100)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i += 100;
                        return [3 /*break*/, 2];
                    case 5: throw new Error("Unable to fetch video width from webcam");
                }
            });
        });
    };
    Webcam.prototype.fetch = function () {
        this.context.drawImage(this.video, 0, 0);
        return this.context.getImageData(0, 0, this.video.videoWidth, this.video.videoHeight).data;
    };
    return Webcam;
}());
var App = /** @class */ (function () {
    function App() {
    }
    App.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, videoWidth, videoHeight, _i, _b, canvas, i;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.drawCanvas = document.getElementById("draw");
                        this.video = document.getElementById("video");
                        this.outputCanvas = document.getElementById("output");
                        this.snapshotCanvas = document.getElementById("snapshot");
                        this.videoStream = null;
                        this.width = this.drawCanvas.width;
                        this.height = this.drawCanvas.height;
                        this.drawContext = this.drawCanvas.getContext("2d");
                        this.outputContext = this.outputCanvas.getContext("2d");
                        this.outputImage = null;
                        this.outputData = null;
                        this.frames = [];
                        this.times = [];
                        this.frameNumber = 0;
                        // Write an initial message to the outputCanvas
                        this.outputContext.fillStyle = "red";
                        this.outputContext.font = "bold 16px Arial";
                        this.outputContext.fillText("Waiting for webcam feed...", 20, 28);
                        this.webcam = new Webcam();
                        return [4 /*yield*/, this.webcam.init()];
                    case 1:
                        _a = _c.sent(), videoWidth = _a.videoWidth, videoHeight = _a.videoHeight;
                        for (_i = 0, _b = [this.snapshotCanvas, this.outputCanvas]; _i < _b.length; _i++) {
                            canvas = _b[_i];
                            canvas.width = videoWidth;
                            canvas.height = videoHeight;
                        }
                        if (this.drawCanvas.width != videoWidth ||
                            this.drawCanvas.height != videoHeight) {
                            this.drawCanvas.width = videoWidth;
                            this.drawCanvas.height = videoHeight;
                            $("#defaults").change();
                        }
                        // Create output image and fill alpha channel
                        this.outputImage = this.outputContext.getImageData(0, 0, videoWidth, videoHeight);
                        this.outputData = this.outputImage.data;
                        for (i = 0; i < this.outputData.length; i += 4) {
                            this.outputData[i + 3] = 255;
                        }
                        this.frame();
                        return [2 /*return*/];
                }
            });
        });
    };
    App.prototype.frame = function () {
        var _this = this;
        var data = this.webcam.fetch();
        var count = $("#frames").val();
        var now = new Date().getTime() / 1000.0;
        this.times.push(now);
        this.frames.push(data);
        while (this.frames.length > count) {
            this.times.shift();
            this.frames.shift();
        }
        // quickly iterate over all pixels
        var drawData = this.drawContext.getImageData(0, 0, this.width, this.height).data;
        var dataLength = drawData.length;
        var lineLength = dataLength / this.height;
        var delay, outputPos, inputPos;
        var drawScale = (this.frames.length - 1) / 255.0;
        // Render the entire image line by line
        for (var linePosition = 0; linePosition < dataLength; linePosition += lineLength) {
            for (var i = 0; i < lineLength; i += 4) {
                // Flip the output for a mirror-like effect
                outputPos = linePosition + lineLength - i - 4;
                inputPos = linePosition + i;
                delay = Math.floor(drawData[outputPos] * drawScale);
                // Draw out all of the frames
                this.outputData[outputPos] = this.frames[delay][inputPos];
                this.outputData[outputPos + 1] = this.frames[delay][inputPos + 1];
                this.outputData[outputPos + 2] = this.frames[delay][inputPos + 2];
            }
        }
        this.outputContext.putImageData(this.outputImage, 0, 0);
        // Update the status bar
        this.frameNumber += 1;
        $("#status-content").text("Frame: " +
            this.frameNumber +
            "\n" +
            "Frames loaded: " +
            this.frames.length +
            "\n" +
            "Total delay: " +
            (now - this.times[0]).toFixed(1));
        setTimeout(function () { return _this.frame(); }, 0);
    };
    return App;
}());
var app = new App();
$(function () {
    app
        .start()
        .then(function () {
        addOptions();
        $("#fullscreen").click(function () {
            $("#output")[0].requestFullscreen();
        });
        $("#defaults")
            .change(function () {
            $(this)
                .find("option:selected")
                .data("callback")();
        })
            .keyup(function () {
            $(this).change();
        })
            .change();
        console.log("Running");
    })["catch"](function (err) {
        alert("Unable to start webcam: " + err.toString());
    });
});
(function () {
    var brush = new Image();
    brush.src = "brush.png";
    var erase = new Image();
    erase.src = "erase.png";
    var image = null;
    var $draw = $("#draw");
    $draw.mousedown(function (ev) {
        if ((ev.which || 1) == 1) {
            image = brush;
        }
        else {
            image = erase;
        }
    });
    $draw.mouseup(function () {
        image = null;
    });
    $draw.mousemove(function (ev) {
        if (image) {
            var off = $draw.offset();
            app.drawContext.drawImage(image, ev.pageX - off.left - image.width / 2, ev.pageY - off.top - image.height / 2);
        }
    });
    $draw.bind("contextmenu", function () {
        return false;
    });
})();
function addOptions() {
    var ctx = app.drawContext;
    var addDefault = function (caption, cb) {
        $("#defaults").append($("<option>")
            .prop("value", caption)
            .text(caption)
            .data("callback", cb));
    };
    var background = function (color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, app.width, app.height);
    };
    var linearGradient = function (x, y, x2, y2, start, stop) {
        var gradient = ctx.createLinearGradient(x, y, x2, y2);
        gradient.addColorStop(0, start);
        gradient.addColorStop(1, stop);
        background(gradient);
    };
    var radialGradient = function (x, y, r, x2, y2, r2, start, stop) {
        var gradient = ctx.createRadialGradient(x, y, r, x2, y2, r2);
        gradient.addColorStop(0, start);
        gradient.addColorStop(1, stop);
        background(gradient);
    };
    var gradientWaves = function (x, y, x2, y2, stops) {
        var gradient = ctx.createLinearGradient(x, y, x2, y2);
        for (var k = 0; k <= stops; k++) {
            gradient.addColorStop(k / stops, k % 2 == 0 ? "#fff" : "#000");
            console.log(k);
        }
        background(gradient);
    };
    addDefault("top-bottom", function () {
        linearGradient(0, 0, 0, app.height, "#fff", "#000");
    });
    addDefault("bottom-top", function () {
        linearGradient(0, 0, 0, app.height, "#000", "#fff");
    });
    addDefault("diagonal", function () {
        linearGradient(0, 0, app.width, app.height, "#fff", "#000");
    });
    addDefault("tunnel", function () {
        linearGradient(0, 0, app.width, app.height, "#fff", "#000");
        radialGradient(0, 0, 0, app.width, app.height, Math.max(app.width, app.height) / 2, "#fff", "#000");
    });
    addDefault("radial-in", function () {
        background("#fff");
        radialGradient(app.width / 2, app.height / 2, 0, app.width / 2, app.height / 2, Math.max(app.width, app.height), "#000", "#fff");
    });
    addDefault("radial-out", function () {
        radialGradient(app.width / 2, app.height / 2, 0, app.width / 2, app.height / 2, Math.max(app.width, app.height), "#fff", "#000");
    });
    addDefault("horizontal-waves", function () {
        gradientWaves(0, 0, app.width, 0, 5);
    });
    addDefault("vertical-waves", function () {
        gradientWaves(0, 0, 0, app.height, 5);
    });
    addDefault("diagonal-waves", function () {
        gradientWaves(0, 0, app.width, app.height, 5);
    });
    addDefault("blank", function () {
        background("#fff");
    });
}
