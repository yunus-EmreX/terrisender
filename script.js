// ==UserScript==
// @name         terrisender
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Listen to and manipulate WebSocket messages
// @author       ShellBee
// @match        https://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    const OriginalWebSocket = window.WebSocket;
    const logBuffer = [];
    let lastLogTime = 0;
    window.wsInstances = [];

    window.WebSocket = function(url, protocols) {
        const ws = new OriginalWebSocket(url, protocols);
        window.wsInstances.push(ws);

        ws.addEventListener('message', function(event) {
            if (event.data instanceof ArrayBuffer) {
                const arrayBuffer = event.data;
                const array = new Uint8Array(arrayBuffer);
                logBuffer.push(parseArrayBuffer(array));
            }
        });

        ws.sendArrayBuffer = function(arrayBuffer) {
            ws.send(arrayBuffer);
        };

        return ws;
    };

    function readBits(array, bitOffset, numBits) {
        let value = 0;
        for (let i = 0; i < numBits; i++) {
            const byteIndex = Math.floor((bitOffset + i) / 8);
            const bitIndex = 7 - ((bitOffset + i) % 8);
            const bit = (array[byteIndex] >> bitIndex) & 1;
            value = (value << 1) | bit;
        }
        return value;
    }

    function writeBits(array, bitOffset, numBits, value) {
        for (let i = 0; i < numBits; i++) {
            const byteIndex = Math.floor((bitOffset + i) / 8);
            const bitIndex = 7 - ((bitOffset + i) % 8);
            const bit = (value >> (numBits - i - 1)) & 1;
            array[byteIndex] = (array[byteIndex] & ~(1 << bitIndex)) | (bit << bitIndex);
        }
    }

    function parseArrayBuffer(array) {
        const values = [];
        for (let numBits = 2; numBits <= 128; numBits++) {
            const value = readBits(array, 0, numBits);
            values.push({ numBits, value });
        }
        return {
            values,
            arrayBuffer: array.buffer // Store original buffer for manipulation
        };
    }

    function logBufferedData() {
        const currentTime = Date.now();
        if (currentTime - lastLogTime >= 8000 && logBuffer.length > 0) {
            console.log('Buffered Data:', logBuffer);
            logBuffer.length = 0; // Clear the buffer
            lastLogTime = currentTime;
        }
    }

    function sendManipulatedData(wsIndex, originalBuffer, bitOffset, numBits, newValue) {
        if (window.wsInstances[wsIndex]) {
            const array = new Uint8Array(originalBuffer.slice(0));
            writeBits(array, bitOffset, numBits, newValue);
            window.wsInstances[wsIndex].sendArrayBuffer(array.buffer);
        } else {
            console.error('Invalid WebSocket instance index');
        }
    }

    setInterval(logBufferedData, 1000);

    // Expose functions for manual manipulation
    window.sendManipulatedData = sendManipulatedData;
})();
