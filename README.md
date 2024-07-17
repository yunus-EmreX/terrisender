This guide provides detailed instructions on how to use the WebSocket Bit Manipulator Tampermonkey script. This script allows you to listen to all bits in WebSocket messages and, if necessary, modify these bits before sending them.
Installation

    Install the Tampermonkey Extension:
        If you are using Google Chrome or Mozilla Firefox, install the Tampermonkey extension from Tampermonkey's Website.

    Add the Script:
        After installing the Tampermonkey extension, click on the Tampermonkey icon and select "Create a new script".
        Copy and paste the provided script into the editor and save it.

Usage
Tracking WebSocket Instances

Once the script is running, it will listen to all WebSocket connections and store them in the window.wsInstances array. You can use this array to access the active WebSocket connections.

    Viewing WebSocket Instances:

    javascript

    console.log(window.wsInstances); // Displays the active WebSocket instances

Logging Data in the Console

The script logs all received ArrayBuffer data to the console every 8 seconds. Each ArrayBuffer is read in chunks of 2 to 128 bits and logged in the console.
Manipulating and Sending Data

To manipulate and send back data received over WebSocket, follow these steps:

    Select a WebSocket Instance:
    Identify which WebSocket instance you want to use from the wsInstances array. For example:

    javascript

const wsIndex = 0; // First WebSocket instance

Send Data:
Select one of the logged data entries, modify it, and send it back:

javascript

    const wsIndex = 0; // Index of the WebSocket instance to use
    const bitOffset = 0; // Starting bit position
    const numBits = 8; // Number of bits to change
    const newValue = 255; // New bit value

    if (logBuffer.length > 0) {
        const originalBuffer = logBuffer[0].arrayBuffer; // Use the first logged data entry
        sendManipulatedData(wsIndex, originalBuffer, bitOffset, numBits, newValue);
    } else {
        console.error('No logged data available to manipulate.');
    }

