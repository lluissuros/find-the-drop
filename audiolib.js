
/**
 * Helper for loading sound. Returns an object with play() method.
 * Allows the returned objected to be connected as any other node in the node graph.
 * @param  {[type]} fileDirectory sound file to load
 * @return {[type]}               object containing buffer and play func.
 */
const audioFileLoader = (fileDirectory) => {
    let soundBuffer
    let soundToBePlayed

    // NOTE: Remember opening a webserver e.g python -m SimpleHTTPServer>
    let getSound = new XMLHttpRequest();
    getSound.open('get', fileDirectory, true);
    getSound.responseType = 'arraybuffer'; //general container for binary data
    getSound.onload = () => {
        audioContext.decodeAudioData(getSound.response, (buffer) => {
            soundBuffer = buffer;
        });
    };
    getSound.send();

    const audioFileOutputNode = audioContext.createGain();

    /**
     *  Save the connect destinations.
     *  Allows the same connect interface to be used when dealing with the audioFileLoader.
     * @param  {[type]} connectDestinations [description]
     */
    const connect = (connectDestination) => {
        return audioFileOutputNode.connect(connectDestination);
    };

    /**
     * create buffer that can actually work on the node graph.
     * Note that we create a new buffer each time we play.
     * @param  {Number} [volumeVal = 1]
     * @param  {Number} [playbackRate = 1]
     *
     */
    const play = (playbackRate = 1) => {
        soundToBePlayed = audioContext.createBufferSource();
        soundToBePlayed.playbackRate.value = playbackRate;
        soundToBePlayed.buffer = soundBuffer;
        soundToBePlayed.connect(audioFileOutputNode);

        soundToBePlayed.start();
    };

    const stop = () => {
        soundToBePlayed.stop();
    };

    return {
        play,
        stop,
        connect
    }
}

/**
 * Helper for loading IIR response and creating a convolver to play reverb.
 *  Returns convolver to be connected on the node graph.
 * @param  {String} fileDirectory IIR file to load
 * @return {Object}               convolver node graph object.
 */
const convolverFromImpulse = (fileDirectory) => {
    let impulseBuffer;
    let convolver = audioContext.createConvolver();;

    let getImpulse = new XMLHttpRequest();
    getImpulse.open('get', fileDirectory, true);
    getImpulse.responseType = 'arraybuffer'; //general container for binary data
    getImpulse.onload = () => {
        audioContext.decodeAudioData(getImpulse.response, (bufferImpls) => {
            impulseBuffer = bufferImpls;
            convolver.buffer = impulseBuffer;
        });
    };

    getImpulse.send();

    return convolver;
}
