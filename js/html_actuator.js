subjectName=prompt("Please enter your name",""); 
//temp subject- will need to get this from user input at the beginning of game
  
  var xmlhttp0;
  xmlhttp0=new XMLHttpRequest();
  xmlhttp0.open('GET', "https://dl.dropboxusercontent.com/s/m81yy3hjyjcjntw/randomNames.txt?dl=1&token_hash=AAGMkr4jMfCdyyRsQrEJNH1VHcHeuvMdqaz6PRFid669hA&expiry=1401136918", false);
  xmlhttp0.send();
  var randomNameList=xmlhttp0.responseText.split("\n"); //stores a random list of people 
  var indexOfSubjectInRandomNameList=randomNameList.indexOf(subjectName);
  if (indexOfSubjectInRandomNameList>-1)
  {
    randomNameList.splice(indexOfSubjectInRandomNameList,1); //removes your own name 
  }
  var xmlhttp1;
  xmlhttp1=new XMLHttpRequest();
  xmlhttp1.open('GET', "https://dl.dropboxusercontent.com/s/lz1udt9fwmi6fru/subjectNameList.txt?dl=1&token_hash=AAH_FJzXm3LhzigT2WuXrGjmtqxFl6BVWSTFCmuVKAzwxA&expiry=1401142866", false);
  xmlhttp1.send();
  var subjectNameList=xmlhttp1.responseText.split("\n"); //a list of subjects involved in test
  var indexOfSubject=subjectNameList.indexOf(subjectName); //get index of subject 
  
  var xmlhttp2;
  xmlhttp2=new XMLHttpRequest();
  xmlhttp2.open('GET', "https://dl.dropboxusercontent.com/s/lnw78htd9dacchn/firstDegreeArray.txt?dl=1&token_hash=AAGUgvM5gz8qgdSchSw6b7zpiLNomqlBLLQbQlDmi9qjMA&expiry=1401143028", false);
  xmlhttp2.send();
  var firstDegreeArray=xmlhttp2.responseText.split("\n"); //big 2D array of every subject's firstDegree connections
  var subjectFirstDegreeArray=firstDegreeArray[indexOfSubject].split("~"); 
  
  var xmlhttp3;
  xmlhttp3=new XMLHttpRequest();
  xmlhttp3.open('GET', "https://dl.dropboxusercontent.com/s/hyfqi58mabbxocq/secondDegreeArray.txt?dl=1&token_hash=AAEAQHz0XLvhH_j3aCe2CzxHydRvIW8ISsYztwklc15Sng&expiry=1401143263", false);
  xmlhttp3.send();
  var secondDegreeArray=xmlhttp3.responseText.split("\n"); 
  var subjectSecondDegreeArray=secondDegreeArray[indexOfSubject].split("~");

  var firstDegreeCount=0; //stores how many first degree connections are displayed 
  var secondDegreeCount=0; //stores how many second degree connections are displayed 
  


function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  
  
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
  this.clearMessage();
var index1=0;
    if(firstDegreeCount==0)
  {
    index1=1;
  }
  else if(firstDegreeCount==1)
  {
    index1=7;
  }
  else if(firstDegreeCount==2)
  {
    index1=12;
  }
  else if(firstDegreeCount==3)
  {
    index1=16;
  }
  else if(firstDegreeCount==4)
  {
    index1=19;
  }
  else if(firstDegreeCount==5)
  {
    index1=21;
  }
  
  index1=index1+secondDegreeCount+1;
 indexOfSubject+=2;
  
   var xmlhttp4;
  xmlhttp4=new XMLHttpRequest();
  xmlhttp4.open('POST', "http://128.54.186.34:1337/?row="+indexOfSubject+"&col="+index1, true);
  xmlhttp4.send();
  firstDegreeCount=0;
  secondDegreeCount=0;
};

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

  if (tile.value > 2048) classes.push("tile-super");

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
  var gameOverMessage= "Game Over"+String.fromCharCode(13)+String.fromCharCode(13)+"Recent Scores"+String.fromCharCode(13);
  
 
  
  var randomNameListLength=randomNameList.length; 
  var random1=Math.random(); // <0.5 first degree has lower scores, otherwise lower scores
  var random2=Math.random(); // same goes for second degree scores
  var random3=Math.random(); // same goes for stranger scores 
  var firstDegreeHigherScore;
  var secondDegreeHigherScore;
  var strangerHigherScore; 
  if(random1<0.1)
  {
      firstDegreeHigherScore=false; //record in final data recording 
  }
  else
  {
      firstDegreeHigherScore=true; //record in final data recording
  }
  
  if(random2<0.1)
  {
    secondDegreeHigherScore=false; //Record in final data recording
  }
  else
  {
    secondDegreeHigherScore=true; //Record in final data recording
  }
  
  if(random3<0.1)
  {
    strangerHigherScore=false; //Record in final data recording
  }
  else
  {
    strangerHigherScore=true; //Record in final data recording
  }
  
  

  var strangerCount=0;
  
 for (var i = 0; i <5; i++) 
{ 
  var randomNameIndex=~~(Math.random()*randomNameListLength);
  var selectedRandomName=randomNameList[randomNameIndex];
  var nameAndScore=(String.fromCharCode(13)+selectedRandomName);
  if(subjectFirstDegreeArray.indexOf(selectedRandomName)>-1) //check if the selected name is first degree
  {
    if(firstDegreeHigherScore==true)
    {
      nameAndScore+=(" "+(this.score+(~~(Math.random()*(this.score)))));
    }
    else
    {
      nameAndScore+=(" "+(this.score-(~~(Math.random()*(this.score)*0.8))));
    }
    firstDegreeCount++;
  }
  else if(subjectSecondDegreeArray.indexOf(selectedRandomName)>-1)  //check if selected name is second degree
  {
    if(secondDegreeHigherScore==true)
    {
      nameAndScore+=(" "+(this.score+(~~(Math.random()*(this.score)))));
    }
    else
    {
      nameAndScore+=(" "+(this.score-(~~(Math.random()*(this.score)*0.8))));
    }
    secondDegreeCount++;
  }
  else                                                          //stranger 
  {
   if(strangerHigherScore==true)
    {
      nameAndScore+=(" "+(this.score+(~~(Math.random()*(this.score)))));
    }
    else
    {
      nameAndScore+=(" "+(this.score-(~~(Math.random()*(this.score)*0.8))));
    } 
    strangerCount++;
  }
  gameOverMessage+=nameAndScore;
}


  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : gameOverMessage;
  

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].innerText = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
  var index1;

};

