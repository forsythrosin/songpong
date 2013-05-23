function getAudioContext() {
    var vendors = ['', 'ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && (!window.AudioContext || !navigator.getUserMedia); ++x) {
        window.AudioContext = window[vendors[x]+'AudioContext'];
        navigator.getUserMedia = navigator[vendors[x]+'GetUserMedia'];
    }
    if (!window.AudioContext || !navigator.getUserMedia) {
        alert('UNFORTUNATELY THIS APPlICATION REQUIRES THE LATEST BUILD OF CHROME WITH "Web Audio Input" ENABLED IN chrome://flags.');
    } else {
        return new AudioContext();
    }
}


function getCurrentFrequency() {

    analyser.getByteFrequencyData(freqData);
    var n = freqData.length;
    var iterations = 5;
    var m = Math.floor(n/iterations);

    var plotData = new Array(n);
    var accumulator = new Array(m);

    
    for (var j = 0; j < m; j++) {
        accumulator[j] = 1 + j/20;
    }

    for (var i = 1; i < iterations; i++) {
        for (var j = 0; j < m; j++) {
            accumulator[j] *= freqData[j*i] / 50;
        }
    }

    var max = 0;
    var avg = 0;
    for (var j = 0; j < m; j++) {
        var v = accumulator[j];
        avg += v;
        if (accumulator[j] > accumulator[max]) {
            max = j;
        }
        plotData.push([j, accumulator[j]]);        
    }
    avg /= m;


    if (accumulator[max] - avg > 50) {
        if (max > 15) {
			game.moveUp();
			// $('#spaceship').stop();
            // $('#spaceship').animate({'margin-left': 800});
        } else {
			game.moveDown();
			// $('#spaceship').stop();
            // $('#spaceship').animate({'margin-left': 0});
        }
    } else {
        //$('#spaceship').stop();
		game.stop();
    }
    
    var options = {
        yaxis: {
            max: 300
        },
        xaxis: {
            max: freqData.length/30
        }
    }
    

    //$.plot($("#frequencySpectrum"), [plotData], options);
    return max;
}


var ac = getAudioContext();
var analyser = ac.createAnalyser();

var analyserInput = ac.createGainNode();
var lp = ac.createBiquadFilter();
var hp = ac.createBiquadFilter();


lp.type = lp.LOWPASS;
hp.type = hp.HIGHPASS;

lp.frequency.value = 2000;
hp.frequency.value = 100;

lp.connect(hp);
hp.connect(analyser);
analyserInput.connect(lp);


var fileAudio = new Audio('audio/scale.wav');
var mediaSource;

var freqData = new Uint8Array(analyser.frequencyBinCount);

function initializeAudioFile() {
    mediaSource = ac.createMediaElementSource(fileAudio);
    mediaSource.connect(analyserInput);
    fileAudio.play();
}


function initializeMicrophone(stream) {
    mediaSource = ac.createMediaStreamSource(stream);
    mediaSource.connect(analyserInput);
    requestAnimationFrame(mainLoop);
}

setTimeout(function() {
    navigator.getUserMedia( {audio: true}, initializeMicrophone, function(err) { console.log(err); });
}, 100);


function mainLoop() {
    var freq = getCurrentFrequency();
    
    
    requestAnimationFrame(mainLoop);
}

/*setTimeout(function () {
    initializeAudioFile();
}, 100);*/

//setInterval(update, 100);




