const canvas = document.getElementById("mainCanvas");
const c = canvas.getContext("2d");
c.font = "30px Arial";
const sf = 0.5;
let clickData = [false, {}];

function pixel(num) {
  return num * (canvas.width / 1000);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(percent) {
  return Math.random() < percent;
}

function drawText(text, font, colour, position) {
  c.font = font;
  c.fillStyle = colour;
  c.fillText(text, position.x, position.y);
}

class Grid {
  constructor() {
    this.moles = [];
    this.activated = [];
    this.difficulty = 0;
    this.dif_scaling = 0.125;
    this.strikes = 0;
    this.start_time = Date.now() / 1000;
    this.lastCall = Date.now() / 1000;
    this.current = Date.now() / 1000;
    this.base_chance = 0.0005;
    this.bool = false
  }
  createGrid() {
    let size = 100;
    let padding = 50;
    let y_height = 200;
    for (var x = -1; x < 2; x++) {
      for (var y = -1; y < 2; y++) {
        this.moles.push(
          new Mole(
            this, {
              x: pixel(450 + x * (size + padding)),
              y: pixel(y_height + y * (size + padding)),
            }, { x: pixel(size), y: pixel(size) }
          )
        );
      }
    }
  }
  gameClick(position) {
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
  draw(click) {
    for (var i = 0, l = this.moles.length; i < l; i++) {
      // console.log(this.mole[i].position)
      this.moles[i].update();
    }
  }
  update(click) {
    this.current = Date.now() / 1000;
    this.difficulty = this.dif_scaling * (this.current - this.start_time) + 1;
    if (
      chance(
        (this.base_chance * (this.difficulty / 10)) /
        (this.current - this.lastCall)
      )
    ) {
      this.bool = true
      do {
        i = randomInt(0, 8);
        if (this.moles[i].active == 1) {
          this.moles[i].activate();
          this.bool = false
        }
      } while (this.bool);
    }
    if (click[0]) {
      this.gameClick({ x: click[1].clientX, y: click[1].clientY });
    }
    for (var i = 0, l = this.moles.length; i < l; i++) {
      // console.log(this.mole[i].position)
      this.moles[i].update(this.difficulty);
      if (this.moles[i].expired) {
        this.moles[i].expired = false;
        this.strikes++;
      }
    }
    this.lastCall = this.current;
  }
}

const grid = new Grid();

class Mole {
  constructor(parent, position, size) {
    this.parent = parent;
    this.sprite = new Sprite(position, size);
    this.img_on = "red";
    this.img_off = "black";
    this.active = 0;
    this.timeLeft = -1;
    this.base_time = 3;
    this.clicked_on = false;
    this.lastCall = Date.now() / 1000;
    this.current = Date.now() / 1000;
    this.expired = false;
  }
  activate(difficulty) {
    this.parent.activated.push(this);
    this.active = 1;
    this.timeLeft = this.base_time / difficulty;
  }
  onClick() {
    this.clicked_on = true;
  }
  draw() {
    this.sprite.draw(this.img_off);
  }
  update(difficulty) {
    this.current = Date.now() / 1000;
    switch (this.active) {
      case 0:
        this.sprite.draw(this.img_off);
        if (this.clicked_on) {
          this.active = 2;
          this.timeLeft = this.base_time / 3 / difficulty;
          this.clicked_on = false;
        }
        break;
      case 1:
        if (this.clicked_on) {
          this.active = 0;
          this.timeLeft = -1;
          this.clicked_on = false;
          this.sprite.draw(this.img_off);
          break;
        }
        this.sprite.draw(this.img_on);
        this.timeLeft = this.timeLeft - (this.current - this.lastCall);
        if (this.timeLeft <= 0) {
          this.active = 0;
          this.timeLeft = -1;
          this.expired = true;
        }
        break;

      case 2:
        this.sprite.draw(this.img_off);
        this.timeLeft = this.timeLeft - (this.current - this.lastCall);
        if (this.timeLeft <= 0) {
          this.parent.activated.push(this);
          this.active = 1;
          this.timeLeft = this.base_time / difficulty;
        }
        break;
    }
    this.lastCall = this.current;
    return;
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
  c.fillStyle = "orange";
  c.fillRect(0, 0, canvas.width, canvas.height);
  drawText(grid.strikes, "60px Arial", "black", { x: pixel(490), y: 60 });
  grid.update(clickData);
  clickData[0] = false;
}

function click(event) {
  clickData = [true, event];
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