const canvas = document.getElementById("mainCanvas");
const c = canvas.getContext("2d");
const sf = 0.5;
let objects = [];

function pixel(num) {
  return num * (canvas.width / 1000);
}

class Grid {
  constructor() {
    this.moles = [];
  }
  createGrid() {
    let size = 100;
    let padding = 50;
    let y_height = 200;
    for (var x = -1; x < 2; x++) {
      for (var y = -1; y < 2; y++) {
        this.moles.push(
          new Mole({
            x: pixel(450 + x * (size + padding)),
            y: pixel(y_height + y * (size + padding)),
          }, { x: pixel(size), y: pixel(size) })
        );
      }
    }
  }
  onClick(position) {
    for (var i = 0, l = this.moles.length; i < l; i++) {
      if (
        this.moles[i].sprite.position.x < position.x &&
        position.x <
        this.moles[i].sprite.position.x + this.moles[i].sprite.size.x
      ) {
        if (
          this.moles[i].sprite.position.y < position.y &&
          position.y <
          this.moles[i].sprite.position.y + this.moles[i].sprite.size.y
        ) {
          this.moles[i].onClick();
        }
      }
    }
  }
  update() {
    for (var i = 0, l = this.moles.length; i < l; i++) {
      // console.log(this.mole[i].position)
      this.moles[i].update();
    }
  }
}

const grid = new Grid();

class Mole {
  constructor(position, size) {
    this.sprite = new Sprite(position, size);
    this.active = 0;
    this.timeLeft = -1;
    this.clicked_on = false;
    this.lastCall = Date.now() / 1000;
    this.current = Date.now() / 1000;
  }
  activate(duration) {
    this.active = 1;
    this.timeLeft = duration;
  }
  onClick() {
    this.clicked_on = true;
  }
  update() {
    this.current = Date.now() / 1000;
    switch (this.active) {
      case 0:
        this.sprite.draw("black");
        if (this.clicked_on) {
          this.active = 2;
          this.timeLeft = 1;
          this.clicked_on = false;
        }
        break;
      case 1:
        if (this.clicked_on) {
          this.active = 0;
          this.timeLeft = -1;
          this.clicked_on = false;
          this.sprite.draw("black");
          break;
        }
        this.sprite.draw("red");
        this.timeLeft = this.timeLeft - (this.current - this.lastCall);
        if (this.timeLeft <= 0) {
          this.active = 0;
          this.timeLeft = -1;
        }
        break;

      case 2:
        this.sprite.draw("black");
        this.timeLeft = this.timeLeft - (this.current - this.lastCall);
        console.log(this.current - this.lastCall);
        if (this.timeLeft <= 0) {
          this.active = 1;
          this.timeLeft = 3;
        }
        break;
    }
    this.lastCall = this.current
  }
}

class Sprite {
  constructor(position, size) {
    this.position = position;
    this.size = size;
    this.sf = sf;
    return this;
  }
  draw(colour) {
    c.fillStyle = colour;
    c.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
    c.fillStyle = "blue";
  }
}

function loop() {
  window.requestAnimationFrame(loop);
  c.fillStyle = "grey";
  c.fillRect(0, 0, canvas.width, canvas.height);
  grid.update();
}

function click(event) {
  //console.log("stuff")
  grid.onClick({ x: event.clientX, y: event.clientY });
}

document.addEventListener("click", click);

function init() {
  let button = document.getElementById("startButton");
  button.hidden = true;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  c.fillRect(0, 0, canvas.width, canvas.height);
  grid.createGrid();
  loop();
}