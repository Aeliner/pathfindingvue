<template>
  <div id="app">
    <!--   <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    -->
    <div class="slidecontainer">
      <input
        @change="createTable"
        type="range"
        v-model="height"
        min="1"
        max="15"
        value="50"
        class="slider"
        id="myRange"
      />
    </div>
    <div class="slidecontainer">
      <input
        @change="createTable"
        type="range"
        v-model="width"
        min="1"
        max="60"
        value="50"
        class="slider"
        id="myRange"
      />
    </div>
    <table id="tableGrid" @mousemove="cellClick" cellspacing="0">
      <tr v-for="(row, i) in cellsArr" :key="i">
        <td
          v-for="(column, j) in row"
          :key="j"
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

export default {
  name: "App",
  data() {
    return {
      height: 15,
      width: 60,
      cellsArr: [],
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      cellSize: 32,
      mouseDown: false,
    };
  },
  created() {
    this.createTable();
  },
  mounted() {
    let table = document.getElementById("tableGrid");
    table.addEventListener("mousedown", this.mouseDownHandler);
    table.addEventListener("mouseup", this.mouseUpHandler);
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
          rowsArr.push({ x: j, y: i, isWall: false, isVisited: false });
        }
        this.cellsArr.push(rowsArr);
      }
      this.calculateCellSize();
    },
    calculateCellSize() {
      let finalSize;
      let widthSize = this.windowWidth / this.width;
      if((this.height * widthSize) > (this.windowHeight / 1.5)){
        finalSize = (this.windowHeight/1.5) / this.height;
      }
      else
      finalSize = widthSize;
      this.cellSize = finalSize + "px";
    },
    cellClick(e) {
      if (this.mouseDown) {
        let elem = e.target;
        let y = elem.attributes[0].value;
        let x = elem.attributes[1].value;
        elem.classList.toggle("wall");
        this.cellsArr[y][x].isWall = !this.cellsArr[y][x].isWall;
      }
    },
    mouseDownHandler(e) {
      if (e.buttons === 1) {
        this.mouseDown = !this.mouseDown;
      }
    },
    mouseUpHandler(e){
      if(e.button === 0){
        this.mouseDown = !this.mouseDown;
      }
    }
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
  display:flex;
  align-content:center;
  flex-direction: column;
}

table{
  margin:0 auto;
  user-select: none;
}

table td {
  height: 30px;
  width: 30px;
  border: 1px solid black;
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
  width: 100%;
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

.wall {
  background: #2c3e50;
}
</style>
