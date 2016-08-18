const MyMath = require('./my_math.js');
const Matrix = require('./matrix.js');

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
  inputs = new Matrix(inputs).transpose();

  let hiddenInputs = this.wih.dot(inputs);
  let hiddenOutputs = hiddenInputs.map( x =>
    MyMath.sigmoid(x)
  );

  let finalInputs = this.who.dot(hiddenOutputs);
  let finalOutputs = finalInputs.map( x =>
    MyMath.sigmoid(x)
  );

  return finalOutputs;
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

  // let i = 0;
  // while (i < 5) {
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
  //   i++;
  // }
};

NeuralNetwork.prototype.interpret = function(data, idx) {
  let testDigits = data.split(/\r?\n/);
  let digit = testDigits[idx];

  let allValues = digit.split(',').map( x => parseFloat(x));
  let inputs = allValues.slice(1, allValues.length).map( x => x / 255.0 * 0.99 + 0.01);

  let outputs = this.query(inputs).toArray();
  let chosenDigit = outputs.indexOf(Math.max(...outputs));
  return chosenDigit;
};

module.exports = NeuralNetwork;
