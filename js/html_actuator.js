function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.hsContainer      = document.querySelector(".high-scores");
  
  this.rsScores = [300, 400, 500, 200, 100];
  this.hsScores = [500, 400, 300, 200, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  this.rsNames = ["Mingyi", "Spencer", "Steven", "Xiqi", "Harrison"];
  this.hsNames = ["Steven", "Xiqi", "Mingyi", "Spencer", "Harrison", "None", "None", "None", "None", "None", "None", "None", "None", "None", "None"];
  this.submittedScore = false;

  this.loadHighScores();
}

//Load high scores
HTMLActuator.prototype.loadHighScores = function () {
  var self = this;
  var message = "";

  for (var i = 0; i < 15; i++)
  {
     message = message + "\n" + (i+1) + ") " + self.hsNames[i] + ": " + self.hsScores[i];
  }

  this.hsContainer.getElementsByTagName("p")[1].innerText = message;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  var self = this;
  self.submittedScore = false;
  this.clearMessage();
};

// Updates high scores?
HTMLActuator.prototype.updateHighScores = function (score) {
  var self = this;

  if (self.submittedScore == false)
  {
     var name = prompt("Please enter your name (max 10 characters)", "Enter name here");
     var rsMessage= "\nRecent Scores";
     var hsMessage= "";
     var doneSearching = false;

     var hsPosition = 15;

     //truncate name
     name = name.substring(0, 10);

     //Determine high score positioning
     while (hsPosition > 0 && doneSearching == false)
     {
       if (self.hsScores[hsPosition-1] < score)
	  hsPosition--;
       else
	  doneSearching = true;
     }

     //Update high scores ranking
     for (var i = 14; i > hsPosition; i--)
     {
       self.hsScores[i] = self.hsScores[i-1];
       self.hsNames[i] = self.hsNames[i-1];
     }

     if (hsPosition < 15)
     {
       self.hsNames[hsPosition] = name;
       self.hsScores[hsPosition] = score;
     } // end

     //Update recent scores
     for (var i = 4; i > 0; i--)
     {
       self.rsNames[i] = self.rsNames[i-1];
       self.rsScores[i] = self.rsScores[i-1];
     }

     self.rsNames[0] = name;
     self.rsScores[0] = score;

     //Format strings
     for (var i = 0; i < 5; i++)
     {
       rsMessage = rsMessage+"\n"+ self.rsNames[i] + ": " + self.rsScores[i];
     }

     for (var i = 0; i < 15; i++)
     {
       hsMessage = hsMessage + "\n" + (i+1) + ") " + self.hsNames[i] + ": " + self.hsScores[i];
     }

     //Update HTML elements
     this.hsContainer.getElementsByTagName("p")[1].innerText = hsMessage;

     this.messageContainer.getElementsByTagName("p")[1].innerText = rsMessage;

     self.submittedScore = true;
  }
}

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 512) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var self = this;
  var rsMessage= "\nRecent Scores";

  for (var i = 0; i < 5; i++)
  {
    rsMessage = rsMessage+"\n"+ self.rsNames[i] + ": " + self.rsScores[i];
  }

  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";
  

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].innerText = message;
  this.messageContainer.getElementsByTagName("p")[1].innerText = rsMessage;


};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

