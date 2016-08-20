/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const NeuralNetwork = __webpack_require__(1);
	const Visualizer = __webpack_require__(4);

	document.addEventListener("DOMContentLoaded",
	  () => {
	    let trainingData = document.getElementById('training-data').innerHTML;
	    let testData = document.getElementById('test-data').innerHTML;
	    let netty = new NeuralNetwork(784, 100, 10, 0.1);
	    // netty.learn(trainingData);

	    let canvasEl = document.getElementById('canvas');
	    let headerEl = document.getElementById('canvas-header');
	    let visualizationEl = document.getElementById('visualization');

	    let vizy = new Visualizer(canvasEl, headerEl, visualizationEl, netty, testData);
	  }
	);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const MyMath = __webpack_require__(2);
	const Matrix = __webpack_require__(3);

	let NeuralNetwork = function(numInputNodes, numHiddenNodes, numOutputNodes, learningRate) {
	  this.numInputNodes = numInputNodes;
	  this.numHiddenNodes = numHiddenNodes;
	  this.numOutputNodes = numOutputNodes;
	  this.learningRate = learningRate;
	  this.count = 0;

	  let stdDev = Math.pow(this.numHiddenNodes, -0.5);
	  this.wih = new Matrix(this.numHiddenNodes, this.numInputNodes);
	  this.wih = this.wih.map( () =>
	    MyMath.randAroundZero(stdDev)
	  );

	  stdDev = Math.pow(this.numOutputNodes, -0.5);
	  this.who = new Matrix(this.numOutputNodes, this.numHiddenNodes);
	  this.who = this.who.map( () =>
	    MyMath.randAroundZero(stdDev)
	  );
	};

	NeuralNetwork.prototype.query = function(inputs) {
	  this.inputs = new Matrix(inputs).transpose();

	  this.hiddenInputs = this.wih.dot(this.inputs);
	  this.hiddenOutputs = this.hiddenInputs.map( x =>
	    MyMath.sigmoid(x)
	  );

	  this.finalInputs = this.who.dot(this.hiddenOutputs);
	  this.finalOutputs = this.finalInputs.map( x =>
	    MyMath.sigmoid(x)
	  );

	  return this.finalOutputs;
	};

	NeuralNetwork.prototype.train = function(inputs, targets) {
	  inputs = new Matrix(inputs).transpose();
	  targets = new Matrix(targets).transpose();

	  let hiddenInputs = this.wih.dot(inputs);
	  let hiddenOutputs = hiddenInputs.map( x =>
	    MyMath.sigmoid(x)
	  );

	  let finalInputs = this.who.dot(hiddenOutputs);
	  let finalOutputs = finalInputs.map( x =>
	    MyMath.sigmoid(x)
	  );

	  let outputErrors = targets.map( (x, i, j) => x - finalOutputs.get(i, j));
	  let hiddenErrors = this.who.transpose().dot(outputErrors);

	  let invFinalOut = finalOutputs.map( x => 1 - x );
	  let whoCorrections = outputErrors.times(finalOutputs).times(invFinalOut);
	  whoCorrections = whoCorrections.dot(hiddenOutputs.transpose()).map( x => x * this.learningRate );
	  this.who = this.who.map( (x, i, j) => x + whoCorrections.get(i, j));

	  let invHiddenOut = hiddenOutputs.map( x => 1 - x );
	  let wihCorrections = hiddenErrors.times(hiddenOutputs).times(invHiddenOut);
	  wihCorrections = wihCorrections.dot(inputs.transpose()).map( x => x * this.learningRate );
	  this.wih = this.wih.map( (x, i, j) => x + wihCorrections.get(i, j));
	  this.count++;
	  console.log(this.count);
	};

	NeuralNetwork.prototype.learn = function(data) {
	  let trainingDigits = data.split(/\r?\n/);

	  let i = 0;
	  while (i < 5) {
	    trainingDigits.forEach( digit => {
	      let allValues = digit.split(',').map( x => parseFloat(x));
	      let inputs = allValues.slice(1, allValues.length).map( x => x / 255.0 * 0.99 + 0.01);

	      let targets = [];
	      let j = 0;
	      while(j < 10) { targets.push(0.01); j++; }
	      let idx = parseInt(allValues[0]);
	      targets[idx] = 0.99;
	      this.train(inputs, targets);
	    });
	    i++;
	  }
	};

	NeuralNetwork.prototype.interpret = function(digitCSV) {
	  let allValues = digitCSV.split(',').map( x => parseFloat(x));
	  let inputs = allValues.slice(1, allValues.length).map( x => x / 255.0 * 0.99 + 0.01);

	  let outputs = this.query(inputs).toArray();
	  let chosenDigit = outputs.indexOf(Math.max(...outputs));
	  return chosenDigit;
	};

	NeuralNetwork.prototype.prepSample = function(numSampleInputs, numSampleHiddenInputs) {
	    this.sampleInputs = [];
	    this.sampleHiddenInputs = [];
	    this.sampleHiddenOutputs = [];
	    this.sampleWIH = new Matrix(numSampleHiddenInputs, numSampleInputs);

	    let sampleInputIdxs = NeuralNetwork.randomIdxs(this.numInputNodes, numSampleInputs);
	    let sampleHiddenIdxs = NeuralNetwork.randomIdxs(this.numHiddenNodes, numSampleHiddenInputs);

	    let inputs = this.inputs.toArray();
	    let hiddenInputs = this.hiddenInputs.toArray();
	    let hiddenOutputs = this.hiddenOutputs.toArray();

	    sampleInputIdxs.forEach( (inputIdx, i) => {
	      this.sampleInputs.push(inputs[inputIdx]);

	      sampleHiddenIdxs.forEach( (hiddenIdx, j) => {
	        this.sampleWIH.set(j, i, this.wih.get(hiddenIdx, inputIdx));
	      });
	    });

	    sampleHiddenIdxs.forEach( hiddenIdx => {
	      this.sampleHiddenInputs.push(hiddenInputs[hiddenIdx]);
	      this.sampleHiddenOutputs.push(hiddenOutputs[hiddenIdx]);
	    });
	};

	NeuralNetwork.randomIdxs = function(arrayLength, numIdxs) {
	  let idxs = [];

	  for(let i = 0; i < numIdxs; i++) {
	    idxs.push(Math.floor(Math.random()*arrayLength));
	  }

	  return idxs;
	};

	module.exports = NeuralNetwork;


/***/ },
/* 2 */
/***/ function(module, exports) {

	const MyMath = {
	  randAroundZero(stdDev) {
	    let theta = 2 * Math.PI * Math.random();
	    let rho = Math.sqrt(-2 * Math.log(1 - Math.random()));
	    let scale = stdDev * rho;
	    return scale * Math.cos(theta);
	  },
	  sigmoid(x) {
	    let pow = Math.pow(Math.E, -x);
	    return (1.0 / (1.0 + pow));
	  }
	};

	module.exports = MyMath;


/***/ },
/* 3 */
/***/ function(module, exports) {

	const Matrix = function() {
	  this.matrix = [];

	  if (arguments[0] instanceof Array) {
	    this.width = arguments[0].length;
	    this.height = 0;

	    let i = 0;
	    while(i < arguments.length) {
	      this.matrix.push(arguments[i]);
	      this.height++;
	      i++;
	    }
	  } else if (typeof(arguments[0]) === 'number' ) {
	    this.height = arguments[0];
	    this.width = arguments[1];

	    let i = 0;
	    while (i < this.height) {
	      this.matrix.push([]);
	      i++;
	    }
	  }
	};

	Matrix.prototype.set = function(i, j, val) {
	  this.matrix[i][j] = val;
	};

	Matrix.prototype.get = function(i, j) {
	  return this.matrix[i][j];
	};

	Matrix.prototype.each = function(callback) {
	  let i = 0; let j = 0;

	  while (i < this.height) {
	    while (j < this.width) {
	      callback(this.matrix[i][j], i, j);
	      j++;
	    }
	    j = 0; i++;
	  }

	  return this.matrix;
	};

	Matrix.prototype.map = function(callback) {
	  let result = new Matrix(this.height, this.width);

	  let i = 0; let j = 0;
	  while (i < this.height) {
	    while (j < this.width) {
	      result.set(i, j, callback(this.matrix[i][j], i, j));
	      j++;
	    }
	    j = 0; i++;
	  }

	  return result;
	};

	Matrix.prototype.row = function(idx) {
	  return this.matrix[idx];
	};

	Matrix.prototype.col = function(idx) {
	  let column = [];

	  let i = 0;
	  while (i < this.height) {
	    column.push(this.matrix[i][idx]);
	    i++;
	  }

	  return column;
	};

	Matrix.prototype.dot = function(other) {
	  if (this.width !== other.height) {
	    throw "Incompatible matrices.";
	  }

	  let resultHeight = this.height;
	  let resultWidth = other.width;
	  let result = new Matrix(resultHeight, resultWidth);

	  let i = 0; let j = 0;
	  while (i < resultHeight) {
	    while (j < resultWidth) {
	      let row = this.row(i);
	      let col = other.col(j);
	      result.set(i, j, Matrix.sumProduct(row, col));
	      j++;
	    }
	    j = 0; i++;
	  }

	  return result;
	};

	Matrix.sumProduct = function(arr1, arr2) {
	  let sum = 0;

	  arr1.forEach( (val, idx) =>
	    sum += (arr1[idx] * arr2[idx])
	  );

	  return sum;
	};

	Matrix.prototype.transpose = function() {
	  let result = new Matrix(this.width, this.height);

	  let i = 0; let j = 0;
	  while (i < this.height) {
	    while (j < this.width) {
	      result.set(j, i, this.get(i, j));
	      j++;
	    }
	    j = 0; i++;
	  }

	  return result;
	};

	Matrix.prototype.times = function(other) {
	  let result = new Matrix(this.height, this.width);

	  let i = 0; let j = 0;
	  while (i < this.height) {
	    while (j < this.width) {
	      result.set(i, j, this.get(i, j) * other.get(i, j));
	      j++;
	    }
	    j = 0; i++;
	  }

	  return result;
	};

	Matrix.prototype.toArray = function() {
	  let arr = [];

	  this.each( x => arr.push(x) );

	  return arr;
	};

	module.exports = Matrix;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	const Matrix = __webpack_require__(3);

	const Visualizer = function(canvasEl, headerEl, visualizationEl, neuralNetwork, testData) {
	  this.canvasEl = canvasEl;
	  this.headerEl = headerEl;
	  this.visualizationEl = visualizationEl;
	  this.neuralNetwork = neuralNetwork;
	  this.testDigits = testData.split(/\r?\n/);

	  this.displayNumberPicker();
	};

	Visualizer.prototype.displayNumberPicker = function() {
	  this.headerEl.innerHTML = "pick a number";
	  let digitsBox = document.createElement("div");
	  digitsBox.id = "digits-box";
	  digitsBox.className = "visual-box center";

	  for (let i = 0; i < 10; i++) {
	    let digit = document.createElement("div");
	    digit.className = "digit hoverable";
	    digit.id = i; digit.innerHTML = i;
	    $(digit).on("click", this.pick.bind(this));
	    digitsBox.appendChild(digit);
	  }

	  this.visualizationEl.appendChild(digitsBox);
	};

	Visualizer.prototype.pick = function(event) {
	  let digit = parseInt(event.target.id);
	  let digitCSV = this.testDigits[digit];
	  this.neuralNetwork.interpret(digitCSV);
	  this.neuralNetwork.prepSample(20, 15);
	  this.displayCSV(digit, digitCSV);
	};

	Visualizer.prototype.displayCSV = function(digit, digitCSV) {
	  let CSVBox = document.createElement("div");
	  CSVBox.className = "visual-box hidden";
	  CSVBox.id = "csv-box";

	  let digitEl = document.createElement("div");
	  digitEl.id = "digit";
	  digitEl.innerHTML = digit;

	  let equalsEl = document.createElement("div");
	  equalsEl.id = "equals";

	  let csvEl = document.createElement("div");
	  csvEl.id = "digit-csv";
	  csvEl.innerHTML = digitCSV.slice(2, digitCSV.length);

	  let coolEl = this.makeNextButton("Cool", this.showScaledCSV);

	  Visualizer.appendChildren(CSVBox, digitEl, equalsEl, csvEl, coolEl);

	  this.visualizationEl.appendChild(CSVBox);

	  this.headerEl.innerHTML = "each pixel's greyscale value, presented in a CSV format";
	  document.getElementById("digits-box").className = "visual-box top";
	  setTimeout(() => CSVBox.className = "visual-box center", 0);

	  $(".digit").each( (idx, digit) => {
	    $(digit).off();
	    digit.className = "digit";
	  });
	};

	Visualizer.prototype.showScaledCSV = function() {
	  let scaledCSVBox = document.createElement("div");
	  scaledCSVBox.id = "scaled-csv-box";
	  scaledCSVBox.className = "visual-box hidden";

	  let scaledCSV = this.neuralNetwork.inputs.toArray().map( x => Math.floor(x * 100) / 100 ).join(",");
	  let scaledCSVEl = document.createElement("div");
	  scaledCSVEl.id = "scaled-csv";
	  scaledCSVEl.innerHTML = scaledCSV;

	  let groovyEl = this.makeNextButton("Groovy", this.displayInputNodes);

	  Visualizer.appendChildren(scaledCSVBox, scaledCSVEl, groovyEl);

	  this.headerEl.innerHTML = "each value is scaled between 0 and 1";
	  this.visualizationEl.appendChild(scaledCSVBox);
	  this.slideAndHide(document.getElementById("digits-box"));
	  this.slideAndHide(document.getElementById("csv-box"));
	  setTimeout(() => scaledCSVBox.className = "visual-box center", 0);
	};

	Visualizer.prototype.displayInputNodes = function() {
	  let inputNodesBox = document.createElement("div");
	  inputNodesBox.id = "input-nodes-box";
	  inputNodesBox.className = "visual-box hidden";

	  let inputNodesList = document.createElement("div");
	  inputNodesList.className = "node-list";
	  let sampleNodeVals = this.neuralNetwork.sampleInputs;

	  for(let i = 0; i < 20; i++) {
	    let nodeEl = document.createElement("div");
	    nodeEl.className = "input-node";
	    nodeEl.id = `i${i}`;
	    let inputValue = document.createElement("p");
	    inputValue.innerHTML = (Math.floor(sampleNodeVals[i] * 100) / 100);
	    nodeEl.appendChild(inputValue);
	    inputNodesList.appendChild(nodeEl);
	  }

	  let radEl = this.makeNextButton("Rad", this.displayHiddenNodes);

	  Visualizer.appendChildren(inputNodesBox, inputNodesList, radEl);
	  this.visualizationEl.appendChild(inputNodesBox);

	  this.headerEl.innerHTML = "the scaled values are supplied as the input to the first node layer (here's a small sample)";
	  this.slideAndHide(document.getElementById("scaled-csv-box"));
	  setTimeout(() => inputNodesBox.className = "visual-box center", 0);
	};

	Visualizer.prototype.displayHiddenNodes = function() {
	  let hiddenNodesBox = document.createElement("div");
	  hiddenNodesBox.id = "hidden-nodes-box";
	  hiddenNodesBox.className = "visual-box hidden";

	  let hiddenNodesList = document.createElement("div");
	  hiddenNodesList.className = "node-list";

	  for(let i = 0; i < 15; i ++) {
	    let nodeEl = document.createElement("div");
	    nodeEl.className = "hidden-node";
	    nodeEl.id = `h${i}`;
	    hiddenNodesList.appendChild(nodeEl);
	  }

	  let dopeEl = this.makeNextButton("Dope", this.fireInputNodes);

	  Visualizer.appendChildren(hiddenNodesBox, hiddenNodesList, dopeEl);
	  this.visualizationEl.appendChild(hiddenNodesBox);

	  this.connectInputToHidden();

	  this.headerEl.innerHTML = "the input layer is connected to a second layer of nodes, and each connection is weighted differently";
	  document.getElementById("rad").remove();
	  document.getElementById("input-nodes-box").className = "visual-box top";
	  setTimeout(() => hiddenNodesBox.className = "visual-box center", 0);
	};


	Visualizer.prototype.fireInputNodes = function() {
	  let hiddenInputs = this.neuralNetwork.sampleHiddenInputs;

	  $(".hidden-node").each( (hIdx, hNode) => {
	    let value = document.createElement("p");
	    value.innerHTML = (Math.floor(hiddenInputs[hIdx] * 100) / 100);
	    hNode.appendChild(value);
	  });
	};

	Visualizer.prototype.connectInputToHidden = function() {
	  let sampleWIH = this.neuralNetwork.sampleWIH;
	  let wihEl = d3.select('body').append("svg");
	  wihEl.attr("id", "wih");

	  $('.input-node').each( (iIdx, iNode) => {
	    // $(iNode).on("hover", this.drawPaths, this.hidePaths);
	    iNode.addEventListener("mouseenter", this.drawPaths);
	    iNode.addEventListener("mouseout", this.hidePaths);
	    $('.hidden-node').each( (hIdx, hNode) => {
	      // $(hNode).on("hover", this.drawPaths, this.hidePaths);
	      hNode.addEventListener("mouseenter", this.drawPaths);
	      hNode.addEventListener("mouseout", this.hidePaths);

	      let color = Math.floor(sampleWIH.get(hIdx, iIdx) * 360) + 160;

	      let path = wihEl.append("line")
	        .attr("stroke-width", 4)
	        .attr("stroke", `rgb(240,${color},75)`)
	        .data([`i${iIdx} h${hIdx}`]).enter();
	    });
	  });

	};

	Visualizer.prototype.drawPaths = function(event) {
	  let source = event.target;
	  if (source.id === "" ) { source = source.parentElement; }
	  let x1 = source.getBoundingClientRect().left + ($(source).width() / 2);
	  let y1 = source.getBoundingClientRect().bottom - ($(source).height() / 2);

	  let paths = d3.selectAll('line').filter( d => d.includes(source.id) );
	  paths.each( (d, i, paths) => {
	    let targetId = d.split(" ").filter( el => el !== source.id)[0];
	    let target = $(`#${targetId}`)[0];

	    let x2 = target.getBoundingClientRect().left + ($(target).width() / 2);
	    let y2 = target.getBoundingClientRect().top + ($(target).height() / 2);
	    d3.select(paths[i]).attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2).attr("stroke-width", 4);
	  });
	};

	Visualizer.prototype.hidePaths = function(event) {
	  let source = event.target;
	  if (source.id === "" ) { source = source.parentElement; }

	  let paths = d3.selectAll('line').filter( d => d.includes(source.id) );
	  paths.each( (d, i, paths) => {
	    d3.select(paths[i]).attr("stroke-width", 0);
	  });
	};

	Visualizer.prototype.removeConnectionsToHiddenNodes = function(event) {
	  document.getElementById('wih').remove();
	};

	Visualizer.prototype.slideAndHide = function(el) {
	  el.className = "visual-box off-screen";
	  setTimeout(() => el.remove(), 1000);
	};

	Visualizer.prototype.makeNextButton = function(buttonText, callback) {
	  let button = document.createElement("div");
	  button.className = "next-button hoverable";
	  button.id = `${buttonText.toLowerCase()}`;
	  button.innerHTML = buttonText;
	  $(button).on("click", callback.bind(this));
	  return button;
	};

	Visualizer.appendChildren = function(parent, ...children) {
	  children.forEach(child => parent.appendChild(child));
	};

	module.exports = Visualizer;


/***/ }
/******/ ]);