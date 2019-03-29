"use strict";
/***
 * Setup a webcam and fetch data from it
 **/

function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

class Webcam {
  snapshot: HTMLCanvasElement;
  video: HTMLVideoElement;
  context: any;

  async init() {
    this.snapshot = document.getElementById("snapshot") as HTMLCanvasElement;
    this.video = document.getElementById("video") as HTMLVideoElement;
    this.context = this.snapshot.getContext("2d");

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.video.srcObject = stream;

    for (let i = 0; i < 5000; i += 100) {
      if (this.video.videoWidth > 0) {
        return this.video;
      }
      await delay(100);
    }

    throw new Error("Unable to fetch video width from webcam");
  }

  fetch() {
    this.context.drawImage(this.video, 0, 0);
    return this.context.getImageData(
      0,
      0,
      this.video.videoWidth,
      this.video.videoHeight
    ).data;
  }
}

class App {
  drawCanvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  outputCanvas: HTMLCanvasElement;
  snapshotCanvas: HTMLCanvasElement;
  videoStream: any;
  width: any;
  height: any;
  drawContext: CanvasRenderingContext2D;
  outputContext: CanvasRenderingContext2D;
  outputImage: any;
  outputData: any;
  frames: any[];
  times: any[];
  frameNumber: number;
  webcam: Webcam;
  frameInterval: number;
  async start() {
    this.drawCanvas = document.getElementById("draw") as HTMLCanvasElement;
    this.video = document.getElementById("video") as HTMLVideoElement;
    this.outputCanvas = document.getElementById("output") as HTMLCanvasElement;
    this.snapshotCanvas = document.getElementById(
      "snapshot"
    ) as HTMLCanvasElement;

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
    const { videoWidth, videoHeight } = await this.webcam.init();

    for (const canvas of [this.snapshotCanvas, this.outputCanvas]) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    }

    if (
      this.drawCanvas.width != videoWidth ||
      this.drawCanvas.height != videoHeight
    ) {
      this.drawCanvas.width = videoWidth;
      this.drawCanvas.height = videoHeight;
      $("#defaults").change();
    }

    // Create output image and fill alpha channel
    this.outputImage = this.outputContext.getImageData(
      0,
      0,
      videoWidth,
      videoHeight
    );
    this.outputData = this.outputImage.data;
    for (var i = 0; i < this.outputData.length; i += 4) {
      this.outputData[i + 3] = 255;
    }

    this.frame();
  }

  frame() {
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
    const drawData = this.drawContext.getImageData(
      0,
      0,
      this.width,
      this.height
    ).data;

    var dataLength = drawData.length;
    var lineLength = dataLength / this.height;

    var delay, outputPos, inputPos;

    var drawScale = (this.frames.length - 1) / 255.0;

    // Render the entire image line by line
    for (
      var linePosition = 0;
      linePosition < dataLength;
      linePosition += lineLength
    ) {
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
    $("#status").text(
      "Frame: " +
        this.frameNumber +
        "\n" +
        "Frames loaded: " +
        this.frames.length +
        "\n" +
        "Total delay: " +
        (now - this.times[0]).toFixed(1)
    );
    setTimeout(() => this.frame(), 0);
  }
}

const app = new App();

$(function() {
  app
    .start()
    .then(() => {
      addOptions();

      $("#fullscreen").click(() => {
        $("#output")[0].requestFullscreen();
      });

      $("#defaults")
        .change(function() {
          $(this)
            .find("option:selected")
            .data("callback")();
        })
        .keyup(function() {
          $(this).change();
        })
        .change();
      console.log("Running");
    })
    .catch(err => {
      alert("Unable to start webcam: " + err.toString());
    });
});

(function() {
  var brush = new Image();
  brush.src = "brush.png";

  var erase = new Image();
  erase.src = "erase.png";

  var image: HTMLImageElement = null;

  var $draw = $("#draw");
  $draw.mousedown(function(ev) {
    if ((ev.which || 1) == 1) {
      image = brush;
    } else {
      image = erase;
    }
  });
  $draw.mouseup(function() {
    image = null;
  });
  $draw.mousemove(function(ev) {
    if (image) {
      var off = $draw.offset();
      app.drawContext.drawImage(
        image,
        ev.pageX - off.left - image.width / 2,
        ev.pageY - off.top - image.height / 2
      );
    }
  });

  $draw.bind("contextmenu", function() {
    return false;
  });
})();

function addOptions() {
  var ctx = app.drawContext;

  var addDefault = function(caption, cb) {
    $("#defaults").append(
      $("<option>")
        .prop("value", caption)
        .text(caption)
        .data("callback", cb)
    );
  };

  var background = function(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, app.width, app.height);
  };

  var linearGradient = function(x, y, x2, y2, start, stop) {
    var gradient = ctx.createLinearGradient(x, y, x2, y2);
    gradient.addColorStop(0, start);
    gradient.addColorStop(1, stop);
    background(gradient);
  };

  var radialGradient = function(x, y, r, x2, y2, r2, start, stop) {
    var gradient = ctx.createRadialGradient(x, y, r, x2, y2, r2);
    gradient.addColorStop(0, start);
    gradient.addColorStop(1, stop);
    background(gradient);
  };

  var gradientWaves = function(x, y, x2, y2, stops) {
    var gradient = ctx.createLinearGradient(x, y, x2, y2);
    for (var k = 0; k <= stops; k++) {
      gradient.addColorStop(k / stops, k % 2 == 0 ? "#fff" : "#000");
      console.log(k);
    }
    background(gradient);
  };

  addDefault("top-bottom", function() {
    linearGradient(0, 0, 0, app.height, "#fff", "#000");
  });

  addDefault("bottom-top", function() {
    linearGradient(0, 0, 0, app.height, "#000", "#fff");
  });

  addDefault("diagonal", function() {
    linearGradient(0, 0, app.width, app.height, "#fff", "#000");
  });

  addDefault("tunnel", function() {
    linearGradient(0, 0, app.width, app.height, "#fff", "#000");
    radialGradient(
      0,
      0,
      0,
      app.width,
      app.height,
      Math.max(app.width, app.height) / 2,
      "#fff",
      "#000"
    );
  });

  addDefault("radial-in", function() {
    background("#fff");
    radialGradient(
      app.width / 2,
      app.height / 2,
      0,
      app.width / 2,
      app.height / 2,
      Math.max(app.width, app.height),
      "#000",
      "#fff"
    );
  });

  addDefault("radial-out", function() {
    radialGradient(
      app.width / 2,
      app.height / 2,
      0,
      app.width / 2,
      app.height / 2,
      Math.max(app.width, app.height),
      "#fff",
      "#000"
    );
  });

  addDefault("horizontal-waves", function() {
    gradientWaves(0, 0, app.width, 0, 5);
  });

  addDefault("vertical-waves", function() {
    gradientWaves(0, 0, 0, app.height, 5);
  });

  addDefault("diagonal-waves", function() {
    gradientWaves(0, 0, app.width, app.height, 5);
  });

  addDefault("blank", function() {
    background("#fff");
  });
}
