
const Fireball = require("./fireball");
const Ball = require("./balls");
const Frog = require("./frog");
require('howler');
class Game {
  constructor(options) {
    this.frog = [];
    this.ctx = options.ctx;
    this.balls = [];
    this.fireball = [];
    this.canvasEl = options.canvasEl;
    this.setTimerStatus = "off";
  this.ballsToRemove = [];
  this.removedBalls = 0;
  this.won = false;
  this.finished = false;
  let pauseButton = document.getElementById("pauseButton");
  pauseButton.addEventListener("click", () => {
    this.pauseGameFunc();
  });
  let continueButton = document.getElementById("continueButton");
  continueButton.addEventListener("click", () => {
    this.continueGameFunc();
  });
}


// function to add balls, frog, skull emblem on the page
  add(object) {
    if (object instanceof Frog) {
      this.frog.push(object);
    } else if (object instanceof Fireball) {
      this.fireball.push(object);
    } else if (object instanceof Ball) {
      this.balls.push(object);
    } else {
      throw new Error("unknown type of object");
    }
  }

  // function to remove balls from the chain as they explode
  remove(object) {
    if (object instanceof Fireball) {
      this.fireball.splice(this.fireball.indexOf(object), 1);
    } else if (object instanceof Ball) {
      this.balls.splice(this.balls.indexOf(object), 1);
    }
  }

// Function to draw frog on canvas
  addFrog() {
    const frog = new Frog({
      x: this.canvasEl.width/2,
      y: this.canvasEl.height/2,
      radius: 40,
      color: 'black',
      ctx: this.ctx,
      canvasEl: this.canvasEl,
      game: this  
  });
  this.add(frog);
  return frog;
  }

  setTargetBall(ball){
    this.targetball = ball;
  }

// Function to add a new ball in the game when user clicks on the screen
  makenewBall(id, pos, color, percent){
    let ball = new Ball({ game: this,
                          percent: percent,
                          vel:[0,1],
                          pos:pos,
                          speed:0.1, color: color, ballname:"ball",
                        id: id });
    this.balls.forEach((ba) => {
      if(ba.id >= id)ba.id++;
    });
    let ballPosition = this.findBallById(id-1);
    this.balls.splice(ballPosition, 0, ball);
  }

  // Function to find ball for a perticulat given ID
  findBallById(id) {
    let ans;
    this.balls.forEach((ball) => {
      if(ball.id === id) ans = this.balls.indexOf(ball);
    });
    return ans;
  }

  addBalls(id) {
    const colorArray = ["yellow", "green", "blue","red"];
    const randomColor = colorArray[Math.floor(Math.random() * colorArray.length)];
    this.add(new Ball({ game: this,
                          vel:[0,1],
                          pos:[this.canvasEl.width-180,0],
                          speed:0.1, color: randomColor, ballname:"ball",
                        id: id }));
}

toggleTimerStatus(value){
  this.setTimerStatus = value;
}

// Function to keep adding balls in the game at given time interval
  myLoop (i) {
    let self = this;
   setTimeout(function () {
     if(self.setTimerStatus === "off") {
       if (self.pauseGame !== true) {
          self.addBalls(i);
          if (--i)self.myLoop(i);
          } else {
                self.myLoop(i);
              }
      }
    else {
      self.myLoop(i);
    }
  }, 450);
}

// Function to combine all the objects of the game in one variable
  allObjects() {
    const allOfEm = [].concat(this.frog, this.fireball, this.balls);
    return allOfEm;
  }

  // Function to set value of varible which keeps track of balls as they explode
  getBallsToRemove(balls) {
    this.ballsToRemove = balls;
  }

  // Get ids of all the balls
  getIdsArray(objects) {
    let result = [];
    objects.forEach((object) => result.push(object.id));
    return result;
  }

  // Remove balls on successfull hit by player
  explodeBalls() {
    const count = this.ballsToRemove.length;
    let idArray = this.getIdsArray(this.ballsToRemove);
    let max = Math.max(...idArray);
    this.ballsToRemove.forEach((ball) => {
      this.remove(ball);
      this.removedBalls++;
      if(this.balls.length === 0) this.gameOver("won");
    });
    this.ballsToRemove = [];
    this.modifyIds(count, max);
  }

  // Change ids of the balls after some balls have been removed from the chain
  modifyIds(count, max) {
    this.balls.forEach((ball) => {
      if (ball.id > max) {
        ball.percent = ball.percent - count;
        ball.id = ball.id - count;
      }
    });
  }

  // Function to finish game 
  gameOver(won) {
    if (won==="won")this.won = true;
    this.finished = true;
    var pauseButton = document.getElementById("pauseButton");
    pauseButton.classList.remove("show");
    pauseButton.classList.add("hidden");
    // if(this.balls.length === 0)this.won = true;
  }

  // Function to draw the game on canvas
  draw(ctx) {
    if (this.finished === false) {
        // ctx.clearRect(0,0,Game.DIM_X, Game.DIM_Y);
        let background = new Image();
        background.src = "https://s26.postimg.cc/5h6eipprd/spiral_for_Aakash2.png";
        ctx.drawImage(background,0,0,background.width,background.height,0,0,this.canvasEl.width, this.canvasEl.height);
        this.allObjects().forEach((object) => {
          object.draw(ctx);
        });
  } else if(this.finished === true) {
        // debugger
        this.pauseGame = undefined;
        ctx.font = "900 50px Arial";
        ctx.textAlign = "center";
        let text1;
        let text2;
        ctx.fillStyle = "#ffbf00";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 24;
        if(this.won === false) {
          text1 = `You lost by ${this.balls.length} balls`;
          text2 = `But hey, you got ${this.removedBalls} balls`;
        }
        else if(this.won === true) {
          text1 = `Yaay, You won!`;
          text2 = "";
        }
        ctx.fillText(text1, this.canvasEl.width/2,50);
        ctx.fillText(text2, this.canvasEl.width/2,150);
      }
  }

  // Function to allow objects to move with time delta
  moveObjects(delta) {
    this.allObjects().forEach((object) => {
      object.move(delta);
    });
  }

  step(delta) {
    this.moveObjects(delta);
    this.explodeBalls();
  }

  // Function to pause the game and change buttons accordingly
  pauseGameFunc() {
    this.pauseGame = true;
    var pause = document.getElementById("pauseButton");
    var conti = document.getElementById("continueButton");
    conti.classList.remove("hidden");
    conti.classList.add("show");
    pause.classList.remove("show");
    pause.classList.add("hidden");
  }

  // Functions to continue the game and change buttons accordingly
  continueGameFunc() {
    this.pauseGame = false;
    var pause = document.getElementById("pauseButton");
    var conti = document.getElementById("continueButton");
    pause.classList.remove("hidden");
    pause.classList.add("show");
    conti.classList.remove("show");
    conti.classList.add("hidden");
  }

}

// Setting constants for game
Game.BG_COLOR = "yellow";
Game.DIM_X = 1000;
Game.DIM_Y = 700;
Game.NUM_BALLS = 30;

module.exports = Game;
