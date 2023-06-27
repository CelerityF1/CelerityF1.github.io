const canvas = document.getElementById("mainCanvas");
const c = canvas.getContext("2d");
const celerityOrange = "#ee7010";
let clickData = [false, {}];
var navLinks = document.getElementById("navLinks");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let portrait = false;

if (canvas.height > canvas.width) {
  portrait = true;
} else {
  portrait = false;
}

function getAverage(array) {
  return array.reduce((a, b) => a + b, 0) / array.length || 0;
}

function showMenu() {
  navLinks.style.right = "0";
}

function hideMenu() {
  navLinks.style.right = "-200px";
}

function pixelX(num) {
  return Math.trunc(num * (canvas.width / 1000) + 0.5);
}

function pixelY(num) {
  return Math.trunc(num * (canvas.height / 1000) + 0.5);
}

function randomInt(min, max) {
  Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getFont(relativeSize, font) {
  return pixelX(relativeSize) + "px " + font;
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
    this.loop = 0;
    this.status = "off";
    this.reactionTimes = [];
  }
  createGrid() {
    let size = 100;
    let padding = 20;
    let y_height = pixelY(500 - size);
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
    let y_h = pixelY(50);
    for (var i = -1; i < 2; i++) {
      this.strikeMarks.push(
        new Rectangle({ x: pixelX(500 - size / 2 + i * (size + padding)), y: y_h }, { x: pixelX(size), y: pixelX(size) })
      );
    }
  }
  startGame() {
    this.reset();
    this.status = "game";
  }
  endGame() {
    this.status = "gameover";
    for (var i = 0; i < this.moles.length; i++) {
      if (this.moles[i].status != "cooldown-expired") {
        this.moles[i].deactive();
      }
    }
  }
  reset() {
    this.moles = [];
    this.activated = [];
    this.not_activated = [];
    this.strikes = 0;
    this.strikeMarks = [];
    this.start_time = 0;
    this.lastCall = Date.now() / 1000;
    this.current = Date.now() / 1000;
    this.next_activation = -1;
    this.loop = 0;
    this.status = "off";
    this.reactionTimes = [];
    this.createGrid();
    this.createStrikeMarks();
  }
  update(click) {
    switch (this.status) {
      case "menu":
        this.menuUpdate(click);
        break;
      case "game":
        this.gameUpdate(click);
        break;
      case "gameover":
        this.menuUpdate(click);
        break;
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
  drawScoreInfo() {
    drawText(
      Math.trunc(this.difficulty * 1000),
      getFont(50, "Poppins"),
      "black", { x: pixelX(130), y: pixelY(520) }
    );
  }
  menuUpdate(click) {
    this.drawScoreInfo();
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
  gameUpdate(click) {
    this.loop++;
    this.drawScoreInfo();
    if (this.start_time == 0) {
      this.start_time = Date.now() / 1000;
    }
    this.current = Date.now() / 1000;
    this.difficulty =
      Math.sqrt(this.current - this.start_time) * this.dif_scaling + 1;
    if (this.next_activation > 0) {
      this.next_activation =
        this.next_activation - (this.current - this.lastCall);
    } else if (
      this.next_activation < 0 &&
      this.activated.length < this.difficulty / 3
    ) {
      this.next_activation = 1 / (0.5 * this.difficulty);
      this.not_activated[randomInt(0, this.not_activated.length - 1)].activate(
        this.difficulty
      );
    } else if (
      this.next_activation == -1 &&
      this.activated.length < this.difficulty / 3
    ) {
      this.next_activation = 1 / (0.5 * this.difficulty);
      this.not_activated[randomInt(0, this.not_activated.length - 1)].activate(
        this.difficulty
      );
      console.log(this.activated);
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
    if (this.strikes >= 3) {
      this.endGame();
    }
    if (this.next_activation > 0) {
      this.next_activation =
        this.next_activation - (this.current - this.lastCall);
    }

    this.lastCall = this.current;
  }
}

class Mole {
  constructor(parent, position, size) {
    this.parent = parent;
    this.position = position;
    this.sprite = new Rectangle(position, size);
    this.img_on = "blue";
    this.img_off = "black";
    this.img_fail = "red";
    this.status = "off";
    this.timeLeft = -1;
    this.clicked_on = false;
    this.cool_down = 0;
    this.lastCall = Date.now() / 1000;
    this.current = Date.now() / 1000;
    this.expired = false;
    this.activationTime = 0;
    this.parent.not_activated.push(this);
  }
  activate(difficulty) {
    if (this.status != 1) {
      this.activationTime = Date.now() / 1000
      this.parent.not_activated.splice(
        this.parent.not_activated.indexOf(this),
        1
      );
      this.parent.activated.push(this);
      this.status = "on";
      this.timeLeft = difficulty ** -0.4;
    }
  }
  deactive() {
    this.status = "cooldown-expired";
    this.cool_down = 1;
    this.parent.activated.splice(this.parent.activated.indexOf(this), 1);
    this.parent.not_activated.push(this);
    this.timeLeft = -1;
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
      case "off":
        this.sprite.draw(this.img_off);
        break;
      case "on":
        if (this.clicked_on) {
          this.parent.reactionTimes.push(Date.now() / 1000 - this.activationTime)
          this.status = "cooldown-clicked";
          this.cool_down = 0.5;
          this.timeLeft = -1;
          this.clicked_on = false;
          this.sprite.draw(this.img_off);
          break;
        }
        this.sprite.draw(this.img_on);
        this.timeLeft = this.timeLeft - (this.current - this.lastCall);
        if (this.timeLeft < 0) {
          this.status = "cooldown-expired";
          this.cool_down = 1;
          this.timeLeft = -1;
          this.expired = true;
        }
        break;
      case "cooldown-expired":
        if (0.9 < this.cool_down) {
          this.sprite.draw(this.img_fail);
        } else if (0.7 < this.cool_down && this.cool_down < 0.8) {
          this.sprite.draw(this.img_fail);
        } else {
          this.sprite.draw(this.img_off);
        }
        this.cool_down = this.cool_down - (this.current - this.lastCall);
        if (this.cool_down <= 0) {
          this.status = "off";
          this.cool_down = 0;
          this.parent.activated.splice(this.parent.activated.indexOf(this), 1);
          this.parent.not_activated.push(this);
        }
        break;
      case "cooldown-clicked":
        this.sprite.draw(this.img_off);
        this.cool_down = this.cool_down - (this.current - this.lastCall);
        if (this.cool_down <= 0) {
          this.status = "off";
          this.cool_down = 0;
          this.parent.activated.splice(this.parent.activated.indexOf(this), 1);
          this.parent.not_activated.push(this);
        }
        break;
    }
    this.lastCall = this.current;
    return;
  }
}

class Button {
  constructor(
    text,
    font,
    text_colour,
    background_colour,
    position,
    size,
    offsetText,
    parent,
    action
  ) {
    this.parent = parent;
    this.position = position;
    this.size = size;
    this.background = new Rectangle(position, size);
    this.action = action;
    this.textData = [
      text,
      font,
      text_colour,
      {
        x: position.x + size.x / 2 + offsetText.x,
        y: position.y + size.y / 2 + offsetText.y,
      },
    ];
    this.background_colour = background_colour;
  }
  update(click) {
    this.background.draw(this.background_colour);
    drawText(
      this.textData[0],
      this.textData[1],
      this.textData[2],
      this.textData[3]
    );
    if (click[0]) {
      if (
        this.position.x < click[1].clientX &&
        click[1].clientX < this.position.x + this.size.x
      ) {
        if (
          this.position.y < click[1].clientY &&
          click[1].clientY < this.position.y + this.size.y
        ) {
          this.parent.buttonAction(this.action);
        }
      }
    }
  }
}

class Rectangle {
  constructor(position, size) {
    this.position = position;
    this.size = size;
  }
  draw(colour) {
    c.fillStyle = colour;
    c.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
  }
  static drawRect(position, size, colour) {
    c.fillStyle = colour;
    c.fillRect(position.x, position.y, size.x, size.y);
  }
}

class Game {
  constructor() {
    this.grid = new Grid();
    this.back_col = celerityOrange;
    this.status = "";
    this.wait = [0, Date.now()];
    this.buttons = [];
  }
  init() {
    this.grid.reset();
    this.grid.status = "menu";
    this.background = new Rectangle({ x: 0, y: 0 }, { x: pixelX(1000), y: pixelY(1000) });
  }
  reset() {
    this.buttons = [];
  }
  buttonAction(action) {
    switch (action) {
      case "startGame":
        this.reset();
        this.startGame();
        break;
      case "exit":
        this.reset();
        this.exit();
        break;
      case "menu":
        this.reset();
        this.setMenu();
    }
  }
  setMenu() {
    this.buttons = [
      new Button(
        "Start",
        getFont(30, "Poppins"),
        "black",
        "#cf5204", { x: pixelX(450), y: pixelY(400) }, { x: pixelX(100), y: pixelX(50) }, { x: pixelX(-35), y: pixelX(10) },
        this,
        "startGame"
      ),
      new Button(
        "Exit",
        getFont(30, "Poppins"),
        "black",
        "#cf5204", { x: pixelX(450), y: pixelY(530) }, { x: pixelX(100), y: pixelX(50) }, { x: pixelX(-25), y: pixelX(10) },
        this,
        "exit"
      ),
    ];
    this.status = "start_menu";
    this.grid.reset();
    this.grid.status = "menu";
  }
  startGame() {
    this.status = "game";
    this.grid.startGame();
  }
  endGame() {
    this.buttons = [
      new Button(
        "Retry",
        getFont(30, "Poppins"),
        "black",
        "#cf5204", { x: pixelX(450), y: pixelY(400) }, { x: pixelX(100), y: pixelX(50) }, { x: pixelX(-37), y: pixelX(10) },
        this,
        "startGame"
      ),
      new Button(
        "Back",
        getFont(30, "Poppins"),
        "black",
        "#cf5204", { x: pixelX(450), y: pixelY(530) }, { x: pixelX(100), y: pixelX(50) }, { x: pixelX(-35), y: pixelX(10) },
        this,
        "menu"
      ),
    ];
    this.status = "gameover";
    this.wait = [5, Date.now() / 1000];
  }
  exit() {
    this.status = "off";
    window.location.href = "../";
  }
  update(click) {
    switch (this.status) {
      case "start_menu":
        this.background.draw(this.back_col);
        if (portrait) {
          drawText(
            "Turn your device landscape",
            getFont(50, "Poppins"),
            "black", { x: pixelX(180), y: pixelY(440) }
          );
          drawText(
            "and reload the webpage.",
            getFont(50, "Poppins"),
            "black", { x: pixelX(200), y: pixelY(500) }
          );
        } else {
          for (var i = 0; i < this.buttons.length; i++) {
            this.buttons[i].update(click);
          }
          drawText(
            "Celerity Reaction Trainer",
            getFont(50, "Poppins"),
            "black", { x: pixelX(185), y: pixelY(200) }
          );
        }
        break;
      case "game":
        this.background.draw(this.back_col);
        this.grid.update(click);
        if (this.grid.status == "gameover") {
          this.endGame();
        }
        break;
      case "gameover":
        this.background.draw(this.back_col);
        if (this.wait[0] > 0) {
          this.wait = [
            this.wait[0] - (Date.now() / 1000 - this.wait[1]),
            this.wait[1],
          ];
          this.grid.update(click);
        } else {
          drawText(
            "Game over.",
            getFont(50, "Poppins"),
            "black", { x: pixelX(360), y: pixelY(200) }
          );
          drawText(
            "Your score was " + Math.trunc(this.grid.difficulty * 1000),
            getFont(30, "Poppins"),
            "black", { x: pixelX(350), y: pixelY(290) }
          );
          drawText(
            "Average reaction time: " + Math.trunc(getAverage(this.grid.reactionTimes) * 1000) + "ms",
            getFont(20, "Poppins"),
            "black", { x: pixelX(355), y: pixelY(360) }
          );
          for (var i = 0; i < this.buttons.length; i++) {
            this.buttons[i].update(click);
          }
        }
        break;
    }
  }
}

scene = new Game();

function mainLoop() {
  window.requestAnimationFrame(mainLoop);
  scene.update(clickData);
  clickData[0] = false;
}

function click(event) {
  clickData = [true, event];
}
document.addEventListener("click", click);

function init() {
  scene.init();
  scene.setMenu();
  mainLoop();
}

init();