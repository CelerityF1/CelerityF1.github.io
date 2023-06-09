const canvas = document.getElementById("mainCanvas");
const c = canvas.getContext("2d");
c.font = "30px Arial";
const celerityOrange = "#ee7010"
const sf = 0.5;
let clickData = [false, {}];


function pixelX(num) {
  return Math.round(num * (canvas.width / 1000));
}

function pixelY(num) {
  return Math.round(num * (canvas.height / 1000));
}

function randomInt(min, max) {
  Math.floor(Math.random() * (max - min + 1)) + min;
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
    this.not_activated = [];
    this.difficulty = 0;
    this.dif_scaling = 0.8;
    this.strikes = 0;
    this.strikeMarks = [];
    this.start_time = 0;
    this.lastCall = Date.now() / 1000;
    this.current = Date.now() / 1000;
    this.next_activation = -1;
    this.base_chance = 0.0005;
    this.bool = false;
    this.loop = 0;
  }
  createGrid() {
    let size = 75;
    let padding = 30;
    let y_height = pixelY(500 - size / 2);
    for (var x = -1; x < 2; x++) {
      for (var y = -1; y < 2; y++) {
        this.moles.push(
          new Mole(
            this, {
              x: pixelX(500 - size / 2 + x * (size + padding)),
              y: y_height + pixelX(y * (size + padding)),
            }, { x: pixelX(size), y: pixelX(size) }
          )
        );
      }
    }
  }
  createStrikeMarks() {
    let size = 25;
    let padding = 10;
    let y_h = pixelY(75);
    for (var i = -1; i < 2; i++) {
      this.strikeMarks.push(
        new Sprite({ x: pixelX(500 - size / 2 + i * (size + padding)), y: y_h }, { x: pixelX(size), y: pixelX(size) })
      );
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
          return;
        }
      }
    }
  }
  draw(click) {
    for (var i = 0; i < 3; i++) {
      if (i < this.strikes) {
        this.strikeMarks[i].draw("red");
      } else {
        this.strikeMarks[i].draw("black");
      }
    }
    for (var i = 0, l = this.moles.length; i < l; i++) {
      this.moles[i].update();
    }
  }
  update(click) {
    this.loop++;
    if (this.start_time == 0) {
      this.start_time = Date.now() / 1000;
    }
    this.current = Date.now() / 1000;
    this.difficulty = Math.sqrt(this.current - this.start_time) * this.dif_scaling + 1;
    if (this.next_activation > 0) {
      this.next_activation =
        this.next_activation - (this.current - this.lastCall);
    } else if (
      this.next_activation < 0 &&
      this.activated.length < this.difficulty - 1
    ) {
      this.next_activation = 1 / (0.5 * this.difficulty);
      this.not_activated[
        randomInt(0, this.not_activated.length - 1)
      ].activate(this.difficulty);
      console.log(this.activated)
    } else if (
      this.next_activation == -1 &&
      this.activated.length < this.difficulty - 1
    ) {
      this.next_activation = 1 / (0.5 * this.difficulty);
      this.not_activated[
        randomInt(0, this.not_activated.length - 1)
      ].activate(this.difficulty);
      console.log(this.activated)
    } else {
      this.next_activation = -1;
    }
    if (click[0]) {
      this.gameClick({ x: click[1].clientX, y: click[1].clientY });
    }
    for (var i = 0; i < 3; i++) {
      if (i < this.strikes) {
        this.strikeMarks[i].draw("red");
      } else {
        this.strikeMarks[i].draw("black");
      }
    }
    for (var i = 0, l = this.moles.length; i < l; i++) {
      this.moles[i].update(this.difficulty);
      if (this.moles[i].expired) {
        this.moles[i].expired = false;
        this.strikes++;
      }
    }
    if (this.next_activation > 0) {
      this.next_activation =
        this.next_activation - (this.current - this.lastCall);
    }

    this.lastCall = this.current;
  }
}

const grid = new Grid();

class Mole {
  constructor(parent, position, size) {
    this.parent = parent;
    this.position = position
    this.sprite = new Sprite(position, size);
    this.img_on = "blue";
    this.img_off = "black";
    this.img_fail = "red";
    this.status = 0;
    this.timeLeft = -1;
    this.base_time = 3;
    this.clicked_on = false;
    this.cool_down = 0;
    this.lastCall = Date.now() / 1000;
    this.current = Date.now() / 1000;
    this.expired = false;
    this.parent.not_activated.push(this);
  }
  activate(difficulty) {
    if (this.status != 1) {
      this.parent.not_activated.splice(
        this.parent.not_activated.indexOf(this),
        1
      );
      this.parent.activated.push(this);
      this.status = 1;
      this.timeLeft = this.base_time / difficulty;
    }
  }
  onClick() {
    this.clicked_on = true;
  }
  draw() {
    this.sprite.draw(this.img_off);
  }
  update() {
    this.current = Date.now() / 1000;
    switch (this.status) {
      case 0:
        this.sprite.draw(this.img_off);
        break;
      case 1:
        if (this.clicked_on) {
          this.status = 3;
          this.cool_down = 0.5;
          this.timeLeft = -1;
          this.clicked_on = false;
          this.sprite.draw(this.img_off);
          break;
        }
        this.sprite.draw(this.img_on);
        this.timeLeft = this.timeLeft - (this.current - this.lastCall);
        if (this.timeLeft < 0) {
          this.status = 2;
          this.cool_down = 1;
          this.timeLeft = -1;
          this.expired = true;
        }
        break;
      case 2:
        if (0.9 < this.cool_down) {
          this.sprite.draw(this.img_fail);
        } else if (0.7 < this.cool_down && this.cool_down < 0.8) {
          this.sprite.draw(this.img_fail);
        } else {
          this.sprite.draw(this.img_off);
        }
        this.cool_down = this.cool_down - (this.current - this.lastCall);
        if (this.cool_down <= 0) {
          this.status = 0;
          this.cool_down = 0
          this.parent.activated.splice(this.parent.activated.indexOf(this), 1);
          this.parent.not_activated.push(this);
        }
        break;
      case 3:
        this.sprite.draw(this.img_off);
        this.cool_down = this.cool_down - (this.current - this.lastCall);
        if (this.cool_down <= 0) {
          this.status = 0;
          this.cool_down = 0
          this.parent.activated.splice(this.parent.activated.indexOf(this), 1);
          this.parent.not_activated.push(this);
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
  }
}

function loop() {
  window.requestAnimationFrame(loop);
  c.fillStyle = celerityOrange;
  c.fillRect(0, 0, canvas.width, canvas.height);
  drawText(Math.trunc(grid.difficulty * 1000), "60px Arial", "black", {
    x: pixelX(100),
    y: 60,
  });
  if (grid.strikes > 2) {
    grid.draw(clickData);
  } else {
    grid.update(clickData);
  }
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
  grid.createStrikeMarks();
  loop();
}