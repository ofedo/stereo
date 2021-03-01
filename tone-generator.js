/*
  Browser support for Web Audio API:
  http://caniuse.com/#feat=audio-api

  Fourier Series:
  http://en.wikipedia.org/wiki/Fourier_series

  Octave:
  http://en.wikipedia.org/wiki/Octave
*/

(function(window, document,undefined) {
    'use strict';
    function Tone() {

this.AudioContext;
this.audioContext;
this.oscillator;
this.gainNode;
this.analyser;
this.isPlaying = false;
this.canvas = document.getElementById("theCanvas");
this.canvasContext = this.canvas.getContext("2d");
this.dataArray;
this.analyserMethod = "getByteTimeDomainData";
this.frequencySlider = document.getElementById("frequencySlider");
// Fourier Coefficients used for the custom wave
this.first = 33;
this.second = 33;
this.third = 33;

this.canvasWidth = this.canvas.width;
this.canvasHeight = this.canvas.height;

this.initAudio = function(streamUrl) {
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  this.audioContext = new AudioContext();
  // The oscillator creates the sound waves.
  // As you can see on the canvas when drawing
  // the square wave, the wave is not perfectly
  // square. What you see is the Gibbs phenomenon
  // caused by the oscillator using Fourier series
  // to approximate the different wave types.
  this.oscillator = this.audioContext.createOscillator();
  this.oscillator.type = "square";
  // The tone A
  // http://en.wikipedia.org/wiki/A440_(pitch_standard)
  this.oscillator.frequency.value = 440;
  this.oscillator.start();
  // Controls the volume
  this.gainNode = this.audioContext.createGain();
  this.gainNode.gain.value = 0;
  this.oscillator.connect(this.gainNode);
  // Provides info about the sound playing
  this.analyser = this.audioContext.createAnalyser();
  this.gainNode.connect(this.analyser);
  this.gainNode.connect(this.audioContext.destination);

  // Oscillator -- Gain +-- Out (speaker/phones)
  //                    |
  //                    +-- Analyser
};

// this.startDrawing = function() {
//   this.analyser.fftSize = 2048;
//   var bufferLength = this.analyser.frequencyBinCount;
//   this.dataArray = new Uint8Array(bufferLength);
//   this.canvasContext.lineWidth = 1;
//   this.canvasContext.strokeStyle = 'rgba(0, 0, 0, 1)';
//
//   this.drawAgain();
// }
//
// this.drawAgain = function() {
//   this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
//   requestAnimationFrame(this.drawAgain);
//
//   this.analyser[this.analyserMethod](this.dataArray);
//   for(var i = 0; i < bufferLength; i++){
//     this.canvasContext.beginPath();
//     this.canvasContext.moveTo(i, 255);
//     this.canvasContext.lineTo(i, 255 - this.dataArray[i]);
//     this.canvasContext.closePath();
//     this.canvasContext.stroke();
//   }
// }

var speakerIcon = document.getElementById("speaker");
var toggleLabel = document.getElementById("toggleLabel");


this.toggleSound = (e => {
  if(this.isPlaying) {
    speakerIcon.classList.remove("fa-volume-off");
    speakerIcon.classList.add("fa-volume-up");
    this.gainNode.gain.value = 0;
    toggleLabel.innerHTML = "Start!";
    this.isPlaying = false;
  } else {
    speakerIcon.classList.remove("fa-volume-up");
    speakerIcon.classList.add("fa-volume-off");
    this.gainNode.gain.value = 1;
    toggleLabel.innerHTML = "Stop!"
    this.isPlaying = true;
  }
});

// Fourier series
this.customWave = function(first, second, third) {
  document.getElementById("first").value = first;
  document.getElementById("second").value = second;
  document.getElementById("third").value = third;
  // You could create several oscillator nodes with different
  // frequencies and then combine them. But here we use a
  // PeriodicWave to combine the first three sin components.
  // https://developer.mozilla.org/en-US/docs/Web/API/PeriodicWave
  var real = new Float32Array(4);
  var imag = new Float32Array(4);
  // a0 (or DC offset)
  real[0] = 0;
  imag[0] = 0;

  // First term. The frequency, f, set on the oscillator.
  // sin
  real[1] = first/100;
  // cos
  imag[1] = 0;

  // Second term, f * 2, one octave up.
  // sin
  real[2] = second/100;
  // cos
  imag[2] = 0;

  // Third term, f * 3, two octaves up.
  // sin
  real[3] = third/100;
  // cos
  imag[3] = 0;

  var wave = this.audioContext.createPeriodicWave(real, imag);
  // "the browser performs an inverse Fourier transform to
  // get a time domain buffer for the frequency of the
  // oscillator" -MDN
  this.oscillator.setPeriodicWave(wave);
}


this.applyClicked = function() {
  first = parseInt(document.getElementById("first").value);
  second = parseInt(document.getElementById("second").value);
  third = parseInt(document.getElementById("third").value);
  this.customWave(first, second, third);
}
document.getElementById("applyButton").addEventListener("click",
  this.applyClicked, false);


this.waveDropdownClicked = (event => {
  event = event || window.event;
  var target = event.target || event.srcElement;
  if(target.nodeName === "A") {
    var waveType = target.id;
    console.log(waveType);
    this.oscillator.type = waveType;
    if(waveType === "custom") {
      customWave(first, second, third);
    }
  }
});

document.getElementById("waveDropdown").addEventListener("click",
  this.waveDropdownClicked, false);

frequencySlider.min = 5;
frequencySlider.max = 10000;
frequencySlider.value = 440;
frequencySlider.step = 1;
frequencySlider.addEventListener("change", (e => {
  this.oscillator.frequency.value = e.target.value;
  document.getElementById("frequency").innerHTML = e.target.value;
}));
frequencySlider.addEventListener("mousemove", (e => {
  this.oscillator.frequency.value = e.target.value;
  document.getElementById("frequency").innerHTML = e.target.value;
}));

    };
    window.TONE = new Tone;  // <====

window.TONE.initAudio();
window.TONE.toggleSound();
// window.TONE.startDrawing();

document.getElementById("toggleSound").addEventListener("click",
  window.TONE.toggleSound, false);

})(window, document);
