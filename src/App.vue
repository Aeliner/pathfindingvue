<template>
  <div id="app">
    <!--   <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    -->
     <div class="actionsbar">
    <div class="slidecontainer">
      <label for="myRangeHeight">{{this.height}}</label>
      <input
        @change="createTable"
        type="range"
        v-model="height"
        min="1"
        max="30"
        value="50"
        class="slider"
        id="myRangeHeight"
      />
    </div>
    <div class="slidecontainer">
      <label for="myRangeWidth">{{this.width}}</label>
      <input
        @change="createTable"
        type="range"
        v-model="width"
        min="1"
        max="60"
        value="50"
        class="slider"
        id="myRangeWidth"
      />
    </div>
    <button v-on:click="generate">Create Maze</button>
    <button v-on:click="AStar">Visualize Algorithm</button>
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
      mouseDown: false,
      arrayMaze: [],
    };
  },
  created() {
    this.createTable();
  },
  mounted() {
    let table = document.getElementById("tableGrid");
    table.addEventListener("mousedown", this.mouseDownHandler);
    window.addEventListener("mouseup", this.mouseUpHandler);
    table.addEventListener("mousemove", this.cellClick);
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
      if (this.mouseDown) {
        let elem = e.target;
        if (this.lastCell !== elem) {
          let y = elem.attributes[1].value;
          let x = elem.attributes[2].value;
          elem.classList.toggle("wall");
          this.cellsArr[y][x].isWall = !this.cellsArr[y][x].isWall;
          this.lastCell = elem;
        }
      }
    },
    mouseDownHandler(e) {
      if (e.buttons === 1) {
        this.mouseDown = true;
      }
    },
    mouseUpHandler(e) {
      console.log(e);
      if (e.button === 0) {
        this.mouseDown = false;
      }
    },
    AStar() {
      let pathArr = AStar.AStarFind(
        this.cellsArr,
        this.cellsArr[3][5],
        this.cellsArr[this.height - 1][this.width - 1]
      );

      for (let i = 0; i < pathArr.closed.length; i++) {
        (function() {
          setTimeout(function() {
            let node = pathArr.closed[i];
            let string = node.pos.x + " " + node.pos.y;
            console.log(string);
            let element = document.getElementById(string);
            element.classList.toggle("visited");
          }, i * 15);
        })(i);
      }
    },

    generate() {
      this.addOuterWalls();
      this.addInnerWalls(
        this.getDirection(),
        1,
        this.width - 2,
        1,
        this.height - 2
      );
      this.show();
    },

    show() {
      let maze = this.arrayMaze;
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
          }, i * 8);
        })(i);
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
  margin-top: 60px;
  display: flex;
  align-content: center;
  flex-direction: column;
}

table {
  margin: 0 auto;
  user-select: none;
}

table td {
  height: 30px;
  width: 30px;
  border: 1px solid black;
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
table td:hover {
  cursor: pointer;
  background: #d0d0d0;
}

.slidecontainer {
  width: 100%;
}

.slider {
  -webkit-appearance: none;
  width: 50%;
  height: 25px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: 0.2s;
  transition: opacity 0.2s;
}

.slider:hover {
  opacity: 1;
}

.actionsbar{
  display:flex;
  width:100%;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  background: #4caf50;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  background: #4caf50;
  cursor: pointer;
}

.wall::before {
  background-color: #2c3e50;
  animation-name: paint-wall;
  animation-duration: 0.5s;
}

.visited::before {
  background-color: #d1fe84;
  animation-name: paint-cells;
  animation-duration: 1s;
}

@keyframes paint-wall {
  0% {
    background-color: #fff;
  }
  25% {
    background-color: #2c3e50;
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
</style>
