const tileSize = 16;
let x = 10, y = 10;
let arr = Array(x * y).fill(1);

const zoomingLevels = [5.0, 4.0, 3.0, 2.0, 1.0, 0.5];
const data = { x: -(x * tileSize) / 2 + (window.innerWidth - 300) / 2, y: -(y * tileSize) / 2 + window.innerHeight / 2, zoom: 3.0, mouseX: 0, mouseY: 0, width: x * tileSize, height: y * tileSize, transformOrigin: { x: 0, y: 0 }, isMouseDown: false, isMouseDownRight: false };

document.addEventListener("DOMContentLoaded", function(){
  let map = document.getElementById('map');
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  map.onmousedown = (event) => {event.button === 0 ? data.isMouseDown = true : data.isMouseDownRight = true; if (currentMapTileIndex !== undefined && event.button === 0) changeMapTile(currentMapTileIndex)};
  document.addEventListener("mousemove", onMouseMove, false);
  document.addEventListener("mouseup", (event) => (event.button === 0 ? data.isMouseDown = false : data.isMouseDownRight = false));
  document.addEventListener("onwheel" in document ? "wheel" : "mousewheel", onMouseWheel);
  document.getElementById('sidebar').addEventListener("onwheel" in document ? "wheel" : "mousewheel", (event) => event.stopPropagation());
  window.addEventListener('resize', () => {cropMapPosition(); setPosition();});
  localLoad();
  window.addEventListener("beforeunload", function(e){
    localSave();
 }, false);
  
  run();
});

function localSave() {
  localStorage.setItem('data', packData());
}

function localLoad() {
  const data = localStorage.getItem('data');

  if(data && data.length) unpackData(data);
}

function resize() {
  let newX = Number(document.getElementById('x').value);
  let newY = Number(document.getElementById('y').value);
  let newArr = Array(newX * newY).fill(1);

  for(let yy = 0; yy < Math.min(y, newY); yy++) {
    for(let xx = 0; xx < Math.min(x, newX); xx++) {
      newArr[yy * newX + xx] = arr[yy * x + xx];
    }
  }

  x = newX;
  y = newY;
  arr = newArr;
  loadMapHTML();

  data.width = x * tileSize;
  data.height = y * tileSize;

  cropMapPosition();
  setPosition();
}

function onMouseMove(event) {
  if (data.isMouseDownRight) {
    data.x = data.x + ((event.clientX - data.mouseX) / data.zoom);
    data.y = data.y + ((event.clientY - data.mouseY) / data.zoom);
    cropMapPosition();
    setPosition();
  }

  data.mouseX = event.clientX;
  data.mouseY = event.clientY;
}

function cropMapPosition() {
  if(data.x < -(x * tileSize) / 2 + (window.innerWidth - 300) / 2 - data.width / 2) data.x = -(x * tileSize) / 2 + (window.innerWidth - 300) / 2 - data.width / 2;
  if(data.x > -(x * tileSize) / 2 + (window.innerWidth - 300) / 2 + data.width / 2) data.x = -(x * tileSize) / 2 + (window.innerWidth - 300) / 2 + data.width / 2;
  if(data.y < -(y * tileSize) / 2 + window.innerHeight / 2 - data.height / 2) data.y = -(y * tileSize) / 2 + window.innerHeight / 2 - data.height / 2;
  if(data.y > -(y * tileSize) / 2 + window.innerHeight / 2 + data.height / 2) data.y = -(y * tileSize) / 2 + window.innerHeight / 2  + data.height / 2;
}

function setPosition() {
  const map = document.getElementById("map");
  map.style.transform = `translate(${Math.floor(data.x)}px, ${Math.floor(data.y)}px)`;
}

function setZoom() {
  const mapZoom = document.getElementById("map-zoom");
  mapZoom.style.transform = data.zoom === 1 ? `unset` : `scale(${data.zoom})`;
}

function onMouseWheel(e) {
  e.wheel = e.deltaY ? -e.deltaY : e.wheelDelta / 40;
  e.wheel = e.wheel > 0 ? 1 : -1;

  const currentZoom = data.zoom;
  const nextZoom = zoomingLevels[Math.max(Math.min(zoomingLevels.indexOf(data.zoom) - e.wheel, zoomingLevels.length - 1), 0)];

  data.transformOrigin.x = data.transformOrigin.x + (data.mouseX - data.transformOrigin.x) * (1.0 / currentZoom);
  data.transformOrigin.y = data.mouseY;
  data.zoom = nextZoom;

  setZoom();
}

function run() {
  init();
  setPosition();
  setZoom();
}

function init() {
  document.getElementById('x').value = x;
  document.getElementById('y').value = y;

  data.x = -(x * tileSize) / 2 + (window.innerWidth - 300) / 2;
  data.y = -(y * tileSize) / 2 + window.innerHeight / 2;

  let palette = document.getElementById('palette');

  let tilesHTML = '';
  Object.keys(tiles).forEach(tileIndex => tilesHTML += getPaletteTileHTML(tileIndex, tiles[tileIndex]));
  palette.innerHTML = tilesHTML;

  loadMapHTML();
}

function getPaletteTileHTML(id, name) {
  return `<div class="palette-tile" id="palette-${id}" onclick="selectPalette(${id})" style="background-image: url(tiles/${name})">${id}</div>`
}

let selectedPalette = undefined;

function selectPalette(id) {
  document.getElementById('palette-' + id).toggleAttribute('selected');
  if(selectedPalette !== undefined && id !== selectedPalette) document.getElementById('palette-' + selectedPalette).removeAttribute('selected');
  selectedPalette === id ? selectedPalette = undefined : selectedPalette = id;
}

function loadMapHTML() {
  let map = document.getElementById('map');
  map.style = `grid-template-columns: repeat(${x}, ${tileSize}px); grid-template-rows: repeat(${y}, ${tileSize}px);`

  let mapHTML = '';
  arr.forEach((tileID, index) => mapHTML += getMapTileHTML(tileID, index));
  map.innerHTML = mapHTML;

  arr.forEach((_, index) => {
    document.getElementById('map-tile-' + index).addEventListener('mouseenter', e => handleMouseEnter(e, index));
    // document.getElementById('map-tile-' + index).addEventListener('mouseleave', e => handleMouseLeave(e, index));
  })
}

function getMapTileHTML(id, index) {
  return `<div id="map-tile-${index}" class="map-tile" style="background-image: url(tiles/${tiles[id]}); width: ${tileSize}px; height: ${tileSize}px"></div>`
}

let currentMapTileIndex = undefined;

function handleMouseEnter(e, index) {
  if (data.isMouseDown) changeMapTile(index);
  currentMapTileIndex = index;
}

// function handleMouseLeave(e, index) {
//   currentMapTileIndex = undefined;
// }

function changeMapTile(index) {
  if (selectedPalette === undefined) return;
  arr[index] = selectedPalette;
  document.getElementById('map-tile-' + index).style = `background-image: url(tiles/${tiles[selectedPalette]})`
}

function save() {
  download(packData(), 'world', 'txt');
}

function packData() {
  let data = '';
  for(let row = 0; row < y; row++) {
    data += arr.slice(row * x, (row + 1) * x).join(' ');
    if (row + 1 < y) data += '\n';
  }

  return data;
}

function loadClick() {
  document.getElementById('load').click();
}

function load() {
  let file = document.getElementById('load').files[0];

  if (file) {
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) { unpackData(evt.target.result) }
    reader.onerror = function (evt) { alert("error reading file, chjoto ti ahujel"); }
  }
}

function unpackData(data) {
    let rows = data.split('\n');
    y = rows.length;
    x = rows[0].split(' ').length;

    document.getElementById('x').value = x;
    document.getElementById('y').value = y;

    arr = data.replace(/\n/g, ' ').split(' ').map(c => Number(c));
    resize();
}


function download(data, filename, type) {
  var file = new Blob([data], {type: type});
  if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
      var a = document.createElement("a"),
              url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);  
      }, 0); 
  }
}