//websocket
/*var connect = new WebSocket("ws://" + "192.168.43.188:5679");
connect.onopen = function() {
  alert('connection established');
}
connect.onerror = function(err){
  alert('websocket error: ', err);
}
connect.onmessage = function(e){
  alert('server data: ', e.data);
}
connect.onclose = function(e) {
  if(e.wasClean)
    alert('connection is closed');
  else
    alert('connection was interrupted');
}
function sendData(x, y){
  var data = {'x':x, 'y':y};
  data = JSON.stringify(data);
  connect.send(data);
}*/
var isConnected = false;

function stopCar() {
  //console.log('stop');
  if(isConnected)
    sendData(0,0);
}

var connect;
function connectToWebSocket() {
  connect = new WebSocket("ws://" + "192.168.43.188:5679");
  connect.onopen = function() {
    alert('connection established');
    isConnected = true;
  }
  connect.onerror = function(err){
    alert('websocket error ', err);
  }
  connect.onmessage = function(e){
    alert('server data: ', e.data);
  }
  /*connect.onclose = function(e) {
    if(e.wasClean)
      alert('connection is closed');
    else
      alert('connection was interrupted');
  }*/
}

function disconnectFromWebSocket() {
  connect.close();
  connect.onclose = function(e) {
    if(e.wasClean)
      alert('connection is closed');
    else
      alert('connection was interrupted');
  }
}

function sendData(x, y){
  //console.log('x: ' + x + ' y: ' + y);
  var data = {'x':x, 'y':y};
  data = JSON.stringify(data);
  connect.send(data);
}

//joystick
var canvas, ctx;

canvas = document.getElementById('canvas');
ctx = canvas.getContext('2d');
document.addEventListener('mouseup', stopDrawing);
document.addEventListener('mousedown', startDrawing);
document.addEventListener('mousemove', Draw);
document.getElementById("x_coords").innerText = 0;
document.getElementById("y_coords").innerText = 0;

var width, height, radius, x_center, y_center;
width = window.innerWidth;
radius = 100;
height = 900;
ctx.canvas.width = width;
ctx.canvas.height = height;
background();
joystick(width / 2, height / 3);

function background() {
    x_center = width / 2;
    y_center = height / 3;

    ctx.beginPath();
    ctx.arc(x_center, y_center, radius + 20, 0, Math.PI * 2);
    ctx.fillStyle = 'gray';
    ctx.fill();
}

function joystick(width, height) {
    ctx.beginPath();
    ctx.arc(width, height, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#503d3f';
    ctx.fill();
}

var coord = { x: 0, y: 0 };
var start_drawing = false;

function getPosition(event) {
    coord.x = event.clientX - canvas.offsetLeft;
    coord.y = event.clientY - canvas.offsetTop;
}

function startDrawing(event) {
  start_drawing = true;
  getPosition(event);
  if (Math.pow(radius, 2) >= Math.pow(coord.x - x_center, 2) + Math.pow(coord.y - y_center, 2)) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      background();
      joystick(coord.x, coord.y);
      Draw(event);
  }
}

function stopDrawing() {
    start_drawing = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background();
    joystick(width / 2, height / 3);
    document.getElementById("x_coords").innerText = 0;
    document.getElementById("y_coords").innerText = 0;
}

function Draw(event) {
    if (start_drawing){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background();
        var x, y;

        if ((Math.abs(coord.x - x_center) + Math.abs(coord.y - y_center)) <= radius) {
            x = coord.x;
            y = coord.y;
        }
        else
        {
            var xAxis = coord.x-x_center;
            var yAxis = coord.y-y_center;

            var x1, x2, y1, y2;
            if(xAxis >= 0 && yAxis >= 0) {
              x1 = 0;
              y1 = 100;
              x2 = 100;
              y2 = 0;
            }
            if(xAxis >= 0 && yAxis <= 0) {
              x1 = 0;
              y1 = -100;
              x2 = 100;
              y2 = 0;
            }
            if(xAxis <= 0 && yAxis >= 0) {
              x1 = -100;
              y1 = 0;
              x2 = 0;
              y2 = 100;
            }
            if(xAxis <= 0 && yAxis <= 0) {
              x1 = -100;
              y1 = 0;
              x2 = 0;
              y2 = -100;
            }

            var k1 = (yAxis / xAxis);
            var k2 = (y2 - y1) / (x2 - x1);
            x = Math.round((y1 - k2*x1) / (k1 - k2)) + x_center;
            y = Math.round(k1 * ((y1 - k2*x1) / (k1 - k2))) + y_center;
            if (isNaN(y)) y = (coord.y-y_center < 0) ? 200 : 400;
        }
        joystick(x, y);
        getPosition(event);
        document.getElementById("x_coords").innerText = Math.round(x - x_center);
        document.getElementById("y_coords").innerText = -Math.round(y - y_center);

        if(isConnected)
            sendData(Math.round(x - x_center), -Math.round(y - y_center));
      }
}
