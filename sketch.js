let beat;
let analyzer;
let fft;
let particles = [];
let angle = 0;

function preload() {
  beat = loadSound('beat.mp3');
}

function setup() {
  let myCanvas = createCanvas(800, 600);
  myCanvas.parent('myContainer');
  
  analyzer = new p5.Amplitude();
  analyzer.setInput(beat);
  
  fft = new p5.FFT();
  fft.setInput(beat);
  
  colorMode(HSB, 360, 100, 100, 100);
}

function mousePressed() {
  if (beat.isPlaying()) {
    beat.stop();
  } else {
    beat.loop();
  }
}

function draw() {
  background(0, 0, 0, 20);

  let rms = analyzer.getLevel() || 0;
  let spectrum = fft.analyze();
  
  translate(width / 2, height / 2);
  rotate(angle);
  angle += 0.01;

  let bass = fft.getEnergy("bass") / 255;
  let mid = fft.getEnergy("mid") / 255;
  let treble = fft.getEnergy("treble") / 255;

  for (let i = 0; i < 6; i++) {
    let hue = map(i, 0, 6, 180, 240);
    let brightness = map(i, 0, 6, 30, 90) + bass * 50;
    let alpha = map(i, 0, 6, 80, 10) + rms * 40;
    
    stroke(hue, 80, brightness, alpha);
    strokeWeight(1 + bass * 15 + treble * 5);

    let radius = 50 + i * 30 + rms * 200 + bass * 100;
    ellipse(0, 0, radius, radius);
    
    if (treble > 0.6 && random(1) > 0.7) {
      stroke(200, 0, 100);
      strokeWeight(1.5);
      let x1 = random(-radius/2, radius/2);
      let y1 = random(-radius/2, radius/2);
      line(x1, y1, x1 + random(-20, 20), y1 + random(-20, 20));
    }
  }

  for (let i = 0; i < 60; i++) {
    let index = floor(map(i, 0, 60, 0, spectrum.length / 2));
    let amp = spectrum[index];
    let angleMap = map(i, 0, 60, 0, TWO_PI);
    let r = map(amp, 0, 255, 80, 250) + bass * 100;
    
    let x = cos(angleMap) * r;
    let y = sin(angleMap) * r;
    
    stroke(200, 100, 100, 80);
    strokeWeight(2 + treble * 5);
    line(cos(angleMap) * 50, sin(angleMap) * 50, x, y);
  }

  if (rms > 0.2) {
    for (let i = 0; i < 3; i++) {
      particles.push(new Particle(0, 0, rms));
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }

  noStroke();
  fill(200, 80, 100, 150 + rms * 100);
  ellipse(0, 0, 15 + rms * 120, 15 + rms * 120);

  rotate(-angle);
}

class Particle {
  constructor(x, y, force) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 5) * (1 + force * 5));
    this.acc = createVector(0, 0);
    this.lifespan = 255;
    this.size = random(2, 6);
    this.hue = random(180, 240);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.lifespan -= 4;
  }

  display() {
    noStroke();
    fill(this.hue, 80, 100, this.lifespan);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }

  isDead() {
    return this.lifespan < 0;
  }
}