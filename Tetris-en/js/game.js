var columns = 10, rows = 20; //Classic glass sizes
var board = []; //Glass
var lose; //End game
var lines = 0; //Removed lines
var count = 0; //Account
var maxCount = 0; //Record
var interval; //Game speed in MS
var current; //The current figure
var currentX, currentY; //Position of the current figure
var shapes = [ //Array of shapes
 [1,1,1,1], //I
 [1,1,1,0, //L
  1],
 [1,1,1,0, //J
  0,0,1],
 [1,1,0,0, //O
  1,1],
 [1,1,0,0, //Z
  0,1,1],
 [0,1,1,0, //S
  1,1],
 [0,1,0,0, //T
  1,1,1 ]
];
var colors = [ //Array of colors
 'cyan', 'orange', 'blue', 'yellow', 'red', 'lime', 'purple'
];
var shaped = 0; //Is there a next figure
var savedShape; //The following figure

function drawNewShape (current) { //Draw the next shape on a separate canvas
 var canvas = document.getElementById ('figurecanvas');
 var ctx = canvas.getContext ('2d');
 var width = canvas.width, height = canvas.height;
 var blockWidth = width / 4, blockHeight = height / 4;
 ctx.fillStyle = 'red';
 ctx.strokeStyle = 'black';
 ctx.clearRect (0,0,width,height);
 for (var y=0; y<4; y++) {
  for (var x=0; x<4; x++) {
   if (current[y][x]) {
    ctx.fillStyle = colors[current[y][x]-1];
    ctx.fillRect (blockWidth*x, blockHeight*y, blockWidth-1, blockHeight-1);
    ctx.strokeRect (blockWidth*x, blockHeight*y, blockWidth-1, blockHeight-1);
   }
  }
 }
}

function generateShape () { //Generate the following shape
 var id = Math.floor (Math.random()*shapes.length);
 var shape = shapes[id];
 var current = [];
 for (var y=0; y<4; y++) {
  current[y] = [];
  for (var x=0; x<4; x++) {
   var i = 4*y+x;
   if (typeof(shape[i])!='undefined' && shape[i]) current[y][x] = id+1;
   else current[y][x]=0;
  }
 }
 if (shaped) drawNewShape(current);
 return current;
}

function newShape() { //Create a new 4x4 figure in the array current
 if (shaped) { //There is a saved one
  for (var i=0; i<savedShape.length; i++) current[i] = savedShape[i]; 
 }
 else { //No saved information
  current = generateShape();
  shaped = 1;
 }
 savedShape = generateShape();
 currentX = Math.floor((columns-4)/2); currentY = 0; //Starting position of the new figure
}

function init() { //Clear the glass
 for (var y=0; y<rows; ++y) {
  board[y] = [];
  for (var x=0; x<columns; x++) board[y][x] = 0;
 }
}

function countPlus (lines0) { //Counting of points
 lines += lines0; 
 var bonus = [0, 100, 300, 700, 1500];
 count += bonus[lines0];
 if (count > maxCount) maxCount = count;
 document.getElementById('tetriscount').innerHTML = 
  "Lines: "+lines+"<br>Removed lines: "+count+"<br>Record: "+maxCount;
}

function freeze() { //Stop the figure and record its position in board
 for (var y=0; y<4; y++) {
  for (var x=0; x<4; x++) {
   if (current[y][x]) board[y+currentY][x+currentX] = current[y][x];
  }
 }
}

function rotate( current ) { //Rotation of the current figure current counterclockwise
 var newCurrent = [];
 for (var y=0; y<4; y++) {
  newCurrent[y] = [];
  for (var x=0; x<4; x++) newCurrent[y][x]=current[3-x][y];
 }
 return newCurrent;
}

function clearLines() { //To check if there are any filled lines and clear them
 var cleared = 0;
 for (var y=rows-1; y>-1; y--) {
  var rowFilled = true;
  for (var x=0; x<columns; x++) {
   if (board[y][x]==0) {
    rowFilled = false;
    break;
   }
  }
  if (rowFilled) { //To clear the line
   cleared++;
   document.getElementById ('clearsound').play();
   for (var yy=y; yy>0; yy--) {
    for (var x=0; x<columns; x++) {
     board[yy][x]=board[yy-1][x];
    }
   }
   y++;
  }
 }
 return cleared;
}

function keyPress( key ) { //Handler for keystrokes
 switch ( key ) {
  case 'escape':    
   window.alert ('paused'); //JS already has a modal window :)
  break;
  case 'left':
   if (valid(-1)) --currentX;
  break;
  case 'right':
   if (valid(1)) ++currentX;
  break;
  case 'down':
   if (valid(0,1)) ++currentY;
  break;
  case 'rotate':
   var rotated = rotate(current);
   if (valid(0,0,rotated)) current = rotated;
  break;
 }
}

function valid (offsetX,offsetY,newCurrent) { //Checking whether the final position of the shape is valid current
 offsetX = offsetX || 0;
 offsetY = offsetY || 0;
 offsetX = currentX + offsetX;
 offsetY = currentY + offsetY;
 newCurrent = newCurrent || current;
 for (var y=0; y<4; y++) {
  for (var x=0; x<4; x++) {
   if (newCurrent[y][x]) {
    if (typeof(board[y+offsetY])=='undefined' || typeof(board[y+offsetY][x+offsetX])=='undefined'
     || board[y+offsetY][x+offsetX]
     || x+offsetX<0 || y+offsetY>=rows || x+offsetX>=columns) {
     if (offsetY==1) //End of the game if the current piece is on the top line
	 {
                        lose = true; // lose if the current shape is settled at the top most row
                        document.getElementById('playbutton').disabled = false;
                    } 
     return false;
    }
   }
  }
 }
 return true;
}

function playButtonClicked() {
    newGame();
    document.getElementById("playbutton").disabled = true;
}


function playGame() { //Control the drop of the figure, create a new line and clear it
 if (valid(0,1)) currentY++;
 else {
  freeze();
  var cleared = clearLines();
  if (cleared) countPlus(cleared);
  if (lose) {
   document.getElementById('playbutton').disabled = false;
   return false;
  }
  newShape();
 }
}


function newGame() { //New game
 clearInterval (interval);
 init ();
 shaped = 0; newShape ();
 lose = false; lines = 0; count = 0; countPlus (0); 
 interval = setInterval (playGame,300); //the speed of the game, MS
}

