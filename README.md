# TileMapEditor
Tool to quickly create and edit simple 2D maps

Live demo available at - [mapuut.net/file/public/TileMapEditor/](https://mapuut.net/file/public/TileMapEditor/)

## Guide
Download project. You dont need any special tools, having browser is sufficent.

### Running Editor
Double click **index.html** file or right click **index.html**
file -> **Open with...** and choose your browser of choice.

### Adding Tiles
Place your tiles in **tiles** folder. Open **tiles.js** and add tiles in 
**("ID": "filePath/fileName.fileExtension")** format e.g. **("12": "trees/oak.png")**.

### Saving Progress
Make changes in editor then click **export** after which text file will be downloaded automatically. Next
time **import** saved text file to continue editing.

### Controls
Select tile from sidebar on the right. Left click on map location to put selected tile
down. Left click and drag to fill big areas. To move map click and hold right 
or middle mouse button and drag around.

### Tile Size
Tile size can be adjusted in **index.js** file. Change the value of **tileSize** variable on **line 1**.