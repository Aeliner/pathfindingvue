<template>
  <div id="app">
    <!--   <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    -->
    <div v-bind:class="[animating ? 'disabled' : '']" class="actionsbar">
      <div class="sliders">
        <div class="range-slider">
          <input
            @change="createTable"
            v-model="height"
            class="range-slider__range"
            type="range"
            min="1"
            max="30"
            value="50"
          />
          <span class="range-slider__value">Height: {{ this.height }}</span>
        </div>
        <div class="range-slider">
          <input
            class="range-slider__range"
            @change="createTable"
            type="range"
            v-model="width"
            min="1"
            max="60"
            value="50"
          />
          <span class="range-slider__value">Width: {{ this.width }}</span>
        </div>
      </div>
      <div class="draggableCells">
        <span>Drag and Drop into the grid</span>
        <div class="content">
          <div class="dragcell">
            <p>Start</p>
            <div class="start">
              <span id="start"></span>
            </div>
          </div>

          <div class="dragcell">
            <p>End</p>
            <div class="end">
              <span id="end"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="actionButtons">
        <button v-on:click="generate">Create Maze</button>
        <button v-on:click="AStar">Visualize Algorithm</button>
      </div>
    </div>
    <table id="tableGrid" cellspacing="0">
      <tr v-for="(row, i) in cellsArr" :key="i">
        <td
          v-for="(column, j) in row"
          :key="j"
          v-bind:id="j.toString() + ' ' + i.toString()"
          v-bind:style="{ width: computedSize, height: computedSize }"
          v-bind:row="i"
          v-bind:column="j"
        ></td>
      </tr>
    </table>
  </div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'
import AStar from "./algorithms/AStar";

export default {
  name: "App",
  data() {
    return {
      height: 30,
      width: 60,
      cellsArr: [],
      lastCell: null,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      cellSize: 32,
      dropCell: null,
      selectedCell: null,
      isDraggingCell: false,
      mouseDown: false,
      startCell: null,
      endCell: null,
      animating: false,
      arrayMaze: [],
    };
  },
  created() {
    this.createTable();
  },
  mounted() {
    let table = document.getElementById("tableGrid");
    table.addEventListener("mousedown", this.mouseDownHandler);
    table.addEventListener("click", this.cellClick);
    window.addEventListener("mouseup", this.mouseUpHandler);
    table.addEventListener("mousemove", this.cellClick);
    this.dragElement(document.getElementById("start"));
    this.dragElement(document.getElementById("end"));
    // this.generate();
  },
  computed: {
    computedSize: function() {
      return this.cellSize;
    },
  },
  methods: {
    createTable() {
      this.cellsArr = [];
      for (let i = 0; i < this.height; i++) {
        let rowsArr = [];
        for (let j = 0; j < this.width; j++) {
          rowsArr.push({
            pos: { x: j, y: i },
            f: 0,
            g: 0,
            h: 0,
            parent: null,
            isWall: false,
            isVisited: false,
          });
        }
        this.cellsArr.push(rowsArr);
      }
      this.calculateCellSize();
    },
    calculateCellSize() {
      let finalSize;
      let widthSize = this.windowWidth / this.width;
      if (this.height * widthSize > this.windowHeight / 1.5) {
        finalSize = this.windowHeight / 1.5 / this.height;
      } else finalSize = widthSize;
      this.cellSize = finalSize + "px";
    },
    cellClick(e) {
      if (
        (this.mouseDown && !this.isDraggingCell) ||
        (e.type == "click" && e.target.localName == "td")
      ) {
        let elem = e.target;
        if (this.lastCell !== elem) {
          let y = elem.attributes[1].value;
          let x = elem.attributes[2].value;
          elem.classList.toggle("wall");
          this.cellsArr[y][x].isWall = !this.cellsArr[y][x].isWall;
          this.lastCell = elem;
        }
      } else if (this.isDraggingCell) {
        let elem = e.target;
        this.dropCell = elem;
      }
    },
    mouseDownHandler(e) {
      if (e.buttons === 1) {
        this.mouseDown = true;
      }
    },
    mouseUpHandler(e) {
      if (e.button === 0) {
        this.mouseDown = false;
      }
    },
    AStar() {
      let vm = this;
      vm.animating = true;
      let pathArr = AStar.AStarFind(
        this.cellsArr,
        this.startCell,
        this.endCell
      );

      for (let i = 0; i < pathArr.closed.length; i++) {
        (function() {
          setTimeout(function() {
            let node = pathArr.closed[i];
            let string = node.pos.x + " " + node.pos.y;
            let element = document.getElementById(string);
            element.classList.add("visited");
            if (i == pathArr.closed.length - 1)
              element.addEventListener("animationend", paintPath);
          }, i * 15);
        })(i);
      }

      function paintPath(e) {
        e.target.removeEventListener("animationend", paintPath);
        for (let i = 0; i < pathArr.path.length; i++) {
          (function() {
            setTimeout(function() {
              let node = pathArr.path[i];
              let string = node.pos.x + " " + node.pos.y;
              let element = document.getElementById(string);
              element.classList.remove("visited");
              element.classList.add("path");
              if (i == pathArr.path.length - 1)
                element.addEventListener("animationend", activate);
            }, i * 30);
          })(i);
        }
      }
      function activate(e) {
        e.target.removeEventListener("animationend", activate);
        vm.animating = false;
      }
    },

    generate() {
      let tdArr = document.getElementsByTagName("td");
      tdArr.forEach((td) => {
        td.classList.remove("startCell", "endCell", "wall", "visited", "path");
      });
      this.cellsArr.forEach((column) => {
        column.forEach((row) => {
          row.isWall = false;
        });
      });
      this.startCell = null;
      this.endCell = null;
      this.arrayMaze = [];
      this.dropCell = null;

      this.addOuterWalls();
      this.addInnerWalls(
        this.getDirection(),
        0,
        this.width - 2,
        0,
        this.height - 2
      );
      this.show();
    },

    show() {
      let maze = this.arrayMaze;
      let vm = this;
      console.log(vm);
      vm.animating = true;
      for (let i = 0; i < maze.length; i++) {
        (function() {
          setTimeout(function() {
            let obj = maze[i];
            let string = obj.x + " " + obj.y;
            let element = document.getElementById(string);
            if (obj.wall) {
              element.classList.add("wall");
            } else {
              element.classList.remove("wall");
            }
            if (i == maze.length - 1)
              element.addEventListener("animationend", activate);
          }, i * 5);
        })(i);
      }
      function activate(e) {
        e.target.removeEventListener("animationend", activate);
        vm.animating = false;
      }
    },

    getDirection() {
      if (this.width > this.height) {
        return false;
      }
      if (this.width < this.height) {
        return true;
      } else {
        return Math.random() < 0.5;
      }
    },

    addOuterWalls() {
      for (let i = 0; i < this.width; i++) {
        if (i == 0 || i == this.width - 1) {
          for (let j = 0; j < this.cellsArr.length; j++) {
            this.cellsArr[j][i].isWall = true;
            this.arrayMaze.push({ x: i, y: j, wall: true });
          }
        } else {
          this.cellsArr[0][i].isWall = true;
          this.cellsArr[this.cellsArr.length - 1][i].isWall = true;
          this.arrayMaze.push(
            { x: i, y: 0, wall: true },
            { x: i, y: this.cellsArr.length - 1, wall: true }
          );
        }
      }
    },
    addInnerWalls(h, minX, maxX, minY, maxY) {
      if (h) {
        if (maxX - minX < 2) {
          return;
        }

        let y = Math.floor(this.randomNumber(minY, maxY) / 2) * 2;
        this.addHWall(minX, maxX, y);
        this.addInnerWalls(!h, minX, maxX, minY, y - 1);
        this.addInnerWalls(!h, minX, maxX, y + 1, maxY);
      } else {
        if (maxY - minY < 2) {
          return;
        }

        let x = Math.floor(this.randomNumber(minX, maxX) / 2) * 2;
        this.addVWall(minY, maxY, x);
        this.addInnerWalls(!h, minX, x - 1, minY, maxY);
        this.addInnerWalls(!h, x + 1, maxX, minY, maxY);
      }
    },
    addHWall(minX, maxX, y) {
      let hole = Math.floor(this.randomNumber(minX, maxX) / 2) * 2 + 1;
      for (let i = minX; i <= maxX; i++) {
        if (i == hole) {
          this.cellsArr[y][i].isWall = false;
          this.arrayMaze.push({ x: i, y: y, wall: false });
        } else {
          this.cellsArr[y][i].isWall = true;
          this.arrayMaze.push({ x: i, y: y, wall: true });
        }
      }
    },
    addVWall(minY, maxY, x) {
      let hole = Math.floor(this.randomNumber(minY, maxY) / 2) * 2 + 1;
      for (let i = minY; i <= maxY; i++) {
        if (i == hole) {
          this.cellsArr[i][x].isWall = false;
          this.arrayMaze.push({ x: x, y: i, wall: false });
        } else {
          this.cellsArr[i][x].isWall = true;
          this.arrayMaze.push({ x: x, y: i, wall: true });
        }
      }
    },

    randomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    },

    dragElement(elmnt) {
      let y = this;
      var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
      if (document.getElementById(elmnt.id)) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id).onmousedown = dragMouseDown;
      } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
      }

      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        y.isDraggingCell = true;
        pos3 = e.clientX;
        pos4 = e.clientY;
        y.selectedCell = e.target.id;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      }

      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = elmnt.offsetTop - pos2 + "px";
        elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
      }

      function closeDragElement() {
        // stop moving when mouse button is released:
        y.isDraggingCell = false;
        y.paintStartEndCell(y.selectedCell);
        document.onmouseup = null;
        document.onmousemove = null;
      }
    },
    paintStartEndCell(id) {
      if (this.dropCell) {
        let pointsArr = document.getElementsByClassName(id + "Cell");
        if (pointsArr.length > 0) {
          for (let i = 0; i < pointsArr.length; i++) {
            let elem = pointsArr[i];
            elem.classList.remove(id + "Cell");
          }
        }
        this.dropCell.classList.add(id + "Cell");
        document.getElementById(id).removeAttribute("style");
        let y = this.dropCell.attributes[1].value;
        let x = this.dropCell.attributes[2].value;
        if (id == "start") this.startCell = this.cellsArr[y][x];
        else this.endCell = this.cellsArr[y][x];
      } else {
        document.getElementById(id).removeAttribute("style");
      }
    },
  },

  components: {
    // HelloWorld
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  align-content: center;
  flex-direction: column;
  background-color: #2c3e50;
  height: 100%;
}

html,
body,
p {
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  overflow: hidden;
}

table {
  margin: 0 auto;
  user-select: none;
}

table td {
  height: 30px;
  width: 30px;
  border: 1px solid #4e6f90;
  position: relative;
}

table td::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.sliders {
  display: flex;
  width: 50%;
  justify-content: center;
  align-items: center;
}

.range-slider {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.range-slider__range {
  -webkit-appearance: none;
  width: 80%;
  height: 10px;
  border-radius: 5px;
  background: #d7dcdf;
  outline: none;
  padding: 0;
  margin: 0;
}
.range-slider__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2c3e50;
  cursor: pointer;
  -webkit-transition: background 0.15s ease-in-out;
  transition: background 0.15s ease-in-out;
}
.range-slider__range::-webkit-slider-thumb:hover {
  background: #1abc9c;
}
.range-slider__range:active::-webkit-slider-thumb {
  background: #1abc9c;
}
.range-slider__range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 50%;
  background: #2c3e50;
  cursor: pointer;
  -moz-transition: background 0.15s ease-in-out;
  transition: background 0.15s ease-in-out;
}
.range-slider__range::-moz-range-thumb:hover {
  background: #1abc9c;
}
.range-slider__range:active::-moz-range-thumb {
  background: #1abc9c;
}
.range-slider__range:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px #fff, 0 0 0 6px #1abc9c;
}

.range-slider__value {
  display: inline-block;
  position: relative;
  width: 10%;
  color: #fff;
  line-height: 20px;
  text-align: center;
  border-radius: 3px;
  background: #2c3e50;
  padding: 5px 10px;
  margin-left: 8px;
}
.range-slider__value:after {
  position: absolute;
  top: 16px;
  left: -7px;
  width: 0;
  height: 0;
  border-top: 7px solid transparent;
  border-right: 7px solid #2c3e50;
  border-bottom: 7px solid transparent;
  content: "";
}

::-moz-range-track {
  background: #d7dcdf;
  border: 0;
}

input::-moz-focus-inner,
input::-moz-focus-outer {
  border: 0;
}

.buttons {
  display: flex;
}
table td:hover {
  cursor: pointer;
  background-color: #d0d0d0;
}

.startCell,
.startCell::before {
  background-image: url("../images/placeholder.svg");
  background-size: contain;
  background-repeat: no-repeat;
}

.endCell,
.endCell::before {
  background-image: url("../images/arrival.svg");
  background-size: contain;
  background-repeat: no-repeat;
}

.actionsbar {
  display: flex;
  width: 100%;
  justify-content: space-around;
}

.draggableCells {
  color: white;
  display: flex;
  flex-direction: column;
  align-self: center;
}

.content {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.content > div > div {
  width: 32px;
  height: 32px;
  margin-left: 5px;

  border-radius: 50%;
  position: relative;
}

.content > div span {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.content > div #start {
  background-image: url("../images/placeholder.svg");
  background-size: contain;
  background-repeat: no-repeat;
}

.content > div #end {
  background-image: url("../images/arrival.svg");
  background-size: contain;
  background-repeat: no-repeat;
}

.content > div:hover {
  cursor: pointer;
}

.content .start:hover {
  background-color: darkgreen;
}

.content .end:hover {
  background-color: darkred;
}

.content .start {
  background-image: url("../images/placeholder.svg");
  background-size: contain;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  border: 1px solid lightgreen;
}

.content .end {
  background-image: url("../images/arrival.svg");
  background-size: contain;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  border: 1px solid lightcoral;
}
p {
  margin: 5px;
}

button {
  background-color: #2c3e50;
  padding: 15px;
  border-radius: 1000px;
  border: none;
  color: white;
  margin-left: 5px;
  margin-right: 5px;
  -moz-transition: background-color 0.15s ease-in-out;
  transition: background-color 0.15s ease-in-out;
}

button:hover {
  background-color: #1abc9c;
  cursor: pointer;
}

.actionsbar {
  border-bottom-left-radius: 25%;
  border-bottom-right-radius: 25%;
  background-color: #4e6f90;
  margin-bottom: 50px;
  padding: 25px;
  height: 50px;
}

.path {
  position: relative;
}

.path::before {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: #ff7ac3;
  animation-name: paint-path;
  animation-duration: 1.5s;
}

.wall::before {
  background-color: #4e6f90;
  animation-name: paint-wall;
  animation-duration: 0.3s;
}

.wall:hover::before {
  background-color: #4e6f90;
}

.visited::before {
  background-color: #d1fe84;
  animation-name: paint-cells;
  animation-duration: 1s;
}

.disabled > * {
  pointer-events: none;
}

@keyframes paint-wall {
  0% {
    background-color: #fff;
  }
  25% {
    background-color: #2c3e50;
    transform: scale(1);
  }
  50% {
    transform: scale(1.25);
  }
  75% {
    transform: scale(1.5);
  }
  90% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes paint-cells {
  0% {
    background-color: #fff;
  }
  25% {
    background-color: #00fff5;
    transform: scale(0.5);
  }
  50% {
    background-color: #4fffd9;
    transform: scale(0.75);
  }
  75% {
    background-color: #7effbb;
    transform: scale(1);
  }
  90% {
    background-color: #a9ff9e;
    transform: scale(1.25);
  }
  100% {
    background-color: #d1fe84;
    transform: scale(1);
  }
}

@keyframes paint-path {
  0% {
    background-color: #ff7ac3;
  }
  25% {
    transform: scale(0.5);
  }
  50% {
    transform: scale(0.75);
  }
  75% {
    transform: scale(1);
  }
  90% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}
</style>
