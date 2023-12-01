let handpose;
let detections;
let isFreehandMode = false; // Flag to track freehand drawing mode
let trace = []; // Array to store the traced points
let isRegionSelectionMode = false;
let bboxSize = 0; // Variable to store the size of the bounding box
let bboxPosition = []; // Array to store the position of the bounding box [x, y]
let capturedImage; // Variable to store the captured image region
let imgPasteBboxSize, imgPasteBboxPosition;
let previousIndexCopy;
let pasteImageSize = null;
let video;

function setup() {
  createCanvas(2000, 1000);
  img = loadImage('car.jpg');
  video = createCapture(VIDEO);
  video.hide();
  handpose = ml5.handpose(video, modelReady);
  // Add event listener for 'f', 's', 'c', and 'v' key press
  window.addEventListener('keydown', handleKeyPress);
}

function draw() {
  background(220);
  image(img, 0, 0, video.width, video.height);
  image(video, 700, 0, video.width, video.height);


  if (capturedImage && isRegionSelectionMode && previousIndexCopy && pasteImageSize) {
    pasteSelectedImage();
  }

  if (detections && detections.length > 0) {
    if (isFreehandMode) {
      // Code for freehand drawing mode
      const detection = detections[0]; // Assuming only one hand is detected
      const indexFinger = detection.landmarks[8];
      trace.push(indexFinger); // Store index fingertip position in the trace array
      drawTrace(); // Tracing the pointer 
    } else if (isRegionSelectionMode) {
      // Code for region selection and copying mode
      const detection = detections[0]; // Assuming only one hand is detected
      const indexFinger = detection.landmarks[8];
      const thumb = detection.landmarks[4];

      drawBoundingBox();

    }

    else {
      // Code for regular pointer mode
      drawKeypoints(); // Just the pointer
    }
  }
}

function modelReady() {
  console.log('Model ready!');
  handpose.on('hand', gotResults);
}

function gotResults(results) {
  detections = results;
}

function drawKeypoints() {
  noStroke();
  fill(255, 0, 0);

  for (let i = 0; i < detections.length; i++) {
    const detection = detections[i];

    for (let j = 0; j < detection.landmarks.length; j++) {
      const keypoint = detection.landmarks[j];

      if (j === 8) {
        ellipse(keypoint[0], keypoint[1], 10, 10); // Draw index finger
        ellipse(keypoint[0]+700, keypoint[1], 10, 10);
      }

      if (j === 4) {
        ellipse(keypoint[0], keypoint[1], 10, 10); // Draw thumb
        ellipse(keypoint[0]+ 700, keypoint[1], 10, 10); // Draw thumb
      }
    }
  }
}

function drawTrace() {
  stroke(0, 255, 0); // Set trace color to green
  strokeWeight(3);
  noFill();
  beginShape();

  for (let i = 0; i < trace.length; i++) {
    const point = trace[i];
    vertex(point[0], point[1]);
  }

  endShape();
}

function drawBoundingBox(position, size) {
  noFill();
  stroke(255, 0, 0);
  const detection = detections[0]; // Assuming only one hand is detected
  const indexFinger = detection.landmarks[8];
  const thumb = detection.landmarks[4];
  rect(min(thumb[0], indexFinger[0]), min(thumb[1], indexFinger[1]), abs(indexFinger[0] - thumb[0]), abs(indexFinger[1] - thumb[1]));
  rect(min(thumb[0], indexFinger[0]) + 700, min(thumb[1], indexFinger[1]), abs(indexFinger[0] - thumb[0]), abs(indexFinger[1] - thumb[1]));
}

function mapCoordinates(position, srcSize, destSize) {
  const x = map(position[0], 0, srcSize.width, 0, destSize.width);
  const y = map(position[1], 0, srcSize.height, 0, destSize.height);
  return [x, y];
}

function handleKeyPress(event) {
  if (event.key === 'f') {
    isFreehandMode = !isFreehandMode; // Toggle freehand drawing mode
    trace = []; // Reset trace array
  }

  if (event.key === 's') {
    isRegionSelectionMode = !isRegionSelectionMode; // Toggle region selection and copying mode

    if (!isRegionSelectionMode) {
      //Reset bbox size and position when exiting region selection mode
      bboxSize = 0;
      bboxPosition = [];
    }
  }

  if (event.key === 'c') {
    console.log("detected c");
    if (isRegionSelectionMode) {
      console.log("entered eventkey c before function copySelectedIamge");
      copySelectedImage();
    }
  }

  if (event.key === 'v') {
    if (isRegionSelectionMode && capturedImage) {
      const detection = detections[0];
      const indexFinger = detection.landmarks[8];
      const thumb = detection.landmarks[4];
      const x = min(indexFinger[0], thumb[0]);
      const y = min(indexFinger[1], thumb[1]);
      const h = abs(thumb[0] - indexFinger[0]);
      const w = abs(thumb[1] - indexFinger[1]);
      previousIndexCopy = [x, y];
      pasteImageSize = [h, w];
      pasteSelectedImage();
    }
  }
  if (event.key === "e") {
    previousIndexCopy = null;
    pasteImageSize = null;
    isRegionSelectionMode = false;
    image(img, 0, 0, video.width, video.height);
    console.log("e end reached");
  }
}


function copySelectedImage() {
  const detection = detections[0];
  const indexFinger = detection.landmarks[8];
  const thumb = detection.landmarks[4];
  const x = min(indexFinger[0], thumb[0]);
  const y = min(indexFinger[1], thumb[1]);
  const h = abs(thumb[0] - indexFinger[0]);
  const w = abs(thumb[1] - indexFinger[1]);
  capturedImage = get(x, y, h, w);
  console.log("Image captured successfully");
}

function pasteSelectedImage() {
  if (capturedImage) {
    image(capturedImage, previousIndexCopy[0], previousIndexCopy[1], pasteImageSize[0], pasteImageSize[1]);
  }
  console.log("Image paste successful");
}