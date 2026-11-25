let bg = null;
let photos = [];
let smallPhotos = [];
let bigPhotos = [];
let stripes = [];
let pendingAssets = 0;
let artworkReady = false;


let photoPaths = [
  "imgsk/building.jpg",
  "imgsk/falling.jpg",
  "imgsk/fishdeath.jpg",
  "imgsk/ngap1.jpg",
  "imgsk/ngap2.jpg",
  "imgsk/ngap3.jpg",
  "imgsk/rung.jpg",
  "imgsk/sky.jpg",
  "imgsk/traffic.jpg",
  "imgsk/vehicles.jpg",
  "imgsk/xay.jpg"
];


let labels = [
  "CONCRETE JUNGLE",
  "UPROOTED TREE",
  "MASS FISH DEATH",
  "EXTREME RAINFALL",
  "FLASH FLOOD",
  "RISING WATER",
  "FOREST DIEBACK",
  "ATMOSPHERIC INSTABILITY",
  "URBAN POLLUTION",
  "TRAFFIC EMISSIONS",
  "URBANISATION"
];

let neonColors = [
  [0, 0, 120],
  [0, 40, 255],
  [0, 220, 255],
  [255, 255, 0],
  [255, 100, 0],
  [255, 0, 0]
];

 let colors = [
    [0, 0, 120],      
    [0, 40, 255],     
    [0, 220, 255],    
    [0, 255, 60],     
    [255, 255, 0],    
    [255, 100, 0],    
    [255, 0, 0]       
  ];

// Constants for artwork generation
const PHOTO_COUNT = 35;
const BIG_COUNT = 5;
const STRIPE_START = 0.56;

// Use embedded assets from art-assets.js if available
// This allows the artwork to work without internet access
const embeddedAssets = typeof ART_ASSETS !== "undefined" ? ART_ASSETS : null;
const imageSources = embeddedAssets ? embeddedAssets.photos : photoPaths;
const backgroundSource = embeddedAssets ? embeddedAssets.background : "imgsk/citypollution.jpg";
const imageLabels = embeddedAssets ? embeddedAssets.labels : labels;


// SETUP
function setup() {
  createCanvas(1920, 1080);
  loadArtworkAssets();
}

// Load all artwork assets
function loadArtworkAssets() {
  pendingAssets = imageSources.length + 1;
  photos = new Array(imageSources.length);

  loadImage(
    backgroundSource,
    (image) => {
      bg = image;
      assetFinished();
    },
    assetFailed
  );

  imageSources.forEach((source, index) => {
    loadImage(
      source,
      (image) => {
        photos[index] = image;
        assetFinished();
      },
      assetFailed
    );
  });
}

// This code was developed with AI assistance to count and check the images, prepare the necessary assets, and allow the artwork to be displayed only when everything is ready. This helps prevent missing images and ensures that the artwork functions correctly.
function assetFinished() {
  // Decrease counter of pending assets
  pendingAssets -= 1;
  // If still loading, wait for more assets
  if (pendingAssets > 0) return;

  // Check if we have enough images to create artwork (at least 6: 5 yellow + 1 heatmap)
  if (bg && photos.filter(Boolean).length >= BIG_COUNT + 1) {
    // Remove any failed/empty image loads
    photos = photos.filter(Boolean);
    // Load pixel data from background for stripe extraction
    bg.loadPixels();
    // Generate stripe color data from background
    makeStripes();
    // Create photo objects with random positions
    makePhotos();
    // Mark artwork as ready to draw
    artworkReady = true;
  }
  // Trigger redraw to display artwork
  redraw();
}

// Handle asset loading errors
function assetFailed(error) {
  console.warn("An artwork image could not be loaded:", error);
  assetFinished();
}

// DRAW
function draw() {
  // Show black screen while loading
  if (!artworkReady) {
    background(0);
    return;
  }

  // Draw complete artwork
  image(bg, 0, 0, width, height);
  drawStripes();
  drawShapes();
  drawSmallPhotos();
  drawLines();
  drawBigPhotos();
  drawHeatmap();
}

// BACKGROUND STRIPES
function makeStripes() {
  // Calculate Y position where stripes start 
  let y = floor(bg.height * STRIPE_START);

  // Loop through canvas width, sampling every 4 pixels
  for (let x = 0; x < width; x += 4) {
    let sx = floor(map(x, 0, width, 0, bg.width - 1));
    let i = 4 * (y * bg.width + sx);

    stripes.push([
      x,              // position
      bg.pixels[i],   // Red 
      bg.pixels[i + 1], // Green 
      bg.pixels[i + 2]  // Blue 
    ]);
  }
}

function drawStripes() {
  noStroke(); 

  for (let s of stripes) {
    fill(s[1], s[2], s[3]);
    rect(s[0], height * STRIPE_START, 4, height * (1 - STRIPE_START));
  }
}

// RANDOM SHAPES
function drawShapes() {
  noStroke();

  let count = floor(random(3, 6));

  for (let i = 0; i < count; i++) {
    let c = random(neonColors);

    fill(c[0], c[1], c[2], random(30, 65));

    rect(
      random(-200, width - 300),
      random(-100, height - 200),
      random(500, 800),
      random(250, 550)
    );
  }
  noLoop();
}

// PHOTO MANAGEMENT
// Shuffle array randomly using Fisher-Yates algorithm
function shufflePhotos(list) {
  // Start from last element and move backwards
  for (let i = list.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i (inclusive)
    let j = floor(random(i + 1));
    // Swap elements at positions i and j
    // This is array destructuring assignment in JS
    [list[i], list[j]] = [list[j], list[i]];
  }
}

function makePhoto(selected, isHeat = false, isSmall = false) {
  let w = isHeat ? random(400, 550) :// isHeat: for heatmap effect
          isSmall ? random(85, 200) : random(150, 350);// isSmall: for background photos

  let h = isHeat ? random(250, 350) :
          isSmall ? random(50, 155) : random(100, 205);

  return {
    img: selected.img,
    label: selected.label,
    x: random(width - w),
    y: random(height - h),
    w: w,
    h: h,
    heat: isHeat
  };
}

// Create all photo objects for the collage
function makePhotos() {
  let goodPhotos = [];

  // Filter out failed image loads
  for (let i = 0; i < photos.length; i++) {
    if (photos[i].width > 0) {
      goodPhotos.push({
        img: photos[i],
        label: imageLabels[i]
      });
    }
  }

  if (goodPhotos.length < BIG_COUNT + 1) {
    print("Not enough images loaded!");
    return;
  }

  shufflePhotos(goodPhotos);

  let selectedPhotos = goodPhotos.slice(0, BIG_COUNT + 1);

  // Create yellow-framed photos
  for (let i = 0; i < BIG_COUNT; i++) {
    bigPhotos.push(makePhoto(selectedPhotos[i]));
  }

  // Create heatmap photo
  let heatSource = selectedPhotos[BIG_COUNT];
  let heatImage = makeHeatmap(heatSource.img);

  bigPhotos.push(makePhoto({
    img: heatImage,
    label: heatSource.label
  }, true));

  // Create small photos
  for (let i = 0; i < PHOTO_COUNT - BIG_COUNT - 1; i++) {
    smallPhotos.push(
      makePhoto(random(goodPhotos), false, true)
    );
  }
}


// DRAW PHOTOS
function drawSmallPhotos() {
  tint(255, 155); 
  for (let p of smallPhotos) {
    imageCover(p.img, p.x, p.y, p.w, p.h);
  }

  noTint(); 
}

// Draw yellow connecting lines between big photos
function drawLines() {
  stroke(255, 210, 0);  
  strokeWeight(2);    

  for (let i = 0; i < min(BIG_COUNT - 1, 7); i++) {
    let a = bigPhotos[i];     // Current photo
    let b = bigPhotos[i + 1]; // Next photo

    // Draw line from center of photo A to center of photo B
    line(
      a.x + a.w / 2,  
      a.y + a.h / 2,  
      b.x + b.w / 2,  
      b.y + b.h / 2  
    );
  }

  noStroke(); 
}

// Draw big photos with yellow frames 
function drawBigPhotos() {
  for (let p of bigPhotos) {
    // Skip heatmap photos
    if (p.heat) continue;

    imageCover(p.img, p.x, p.y, p.w, p.h);

    // Draw yellow frame around photo
    noFill();              
    stroke(255, 210, 0);    
    strokeWeight(3);        
    rect(p.x, p.y, p.w, p.h); 

    // Draw label text
    noStroke();             
    fill(255, 210, 0);      
    textSize(14);           
    textStyle(BOLD);         

    // Position label above photo if there's space, otherwise below
    // p.y > 25 checks if photo is far enough from top edge
    text(p.label, p.x, p.y > 25 ? p.y - 8 : p.y + p.h + 18);
  }
}

// HEATMAP EFFECT
// Dark areas become blue, bright areas become red
function makeHeatmap(source) {
  let img = source.get();
  img.resize(450, 0);
  img.loadPixels();

  // Apply heatmap effect to each pixel
  for (let i = 0; i < img.pixels.length; i += 4) {
    let bright = (
      0.299 * img.pixels[i] +     // Red channel
      0.587 * img.pixels[i + 1] + // Green 
      0.114 * img.pixels[i + 2]   // Blue 
    ) / 255;

  
    let n = floor(bright * 6);      
    let t = bright * 6 - n;        
    n = min(n, 5);                 

    img.pixels[i] = lerp(colors[n][0], colors[n + 1][0], t);     // Red
    img.pixels[i + 1] = lerp(colors[n][1], colors[n + 1][1], t); // Green
    img.pixels[i + 2] = lerp(colors[n][2], colors[n + 1][2], t); // Blue
  }

  img.updatePixels();
  return img;
}

// red frame
function drawHeatmap() {
  for (let p of bigPhotos) {
    if (!p.heat) continue;

    imageCover(p.img, p.x, p.y, p.w, p.h);

    noFill();
    stroke(255, 0, 80);
    strokeWeight(4);
    rect(p.x, p.y, p.w, p.h);

    noStroke();
    fill(255, 0, 100);
    textSize(15);
    textStyle(BOLD);

    text(p.label, p.x, p.y > 25 ? p.y - 8 : p.y + p.h + 18);
  }
}

// IMAGE CROPPING
// Crop image to cover the specified area (like CSS object-fit: cover)
function imageCover(img, x, y, w, h) {
  // Calculate aspect ratios
  let ratio = img.width / img.height;  // Original image aspect ratio
  let target = w / h;                  // Target frame aspect ratio

  let sx = 0;      
  let sy = 0;      
  let sw = img.width;  
  let sh = img.height; 

  if (ratio > target) {
    sw = img.height * target;
    sx = (img.width - sw) / 2;
  } 

  else {
    sh = img.width / target;
    sy = (img.height - sh) / 2;
  }
  image(img, x, y, w, h, sx, sy, sw, sh);
}
