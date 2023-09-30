document.addEventListener('DOMContentLoaded', async function () {
    const cameraFeed = document.getElementById('camera-feed');
    const detectionCanvas = document.getElementById('detection-canvas');
    const objectList = document.getElementById('object-list');

    // Get access to the user's webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            cameraFeed.srcObject = stream;
            const mediaStreamTrack = stream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(mediaStreamTrack);
            const ctx = detectionCanvas.getContext('2d');
            const socket = io(); // If you're using WebSockets for server communication

            // Capture and send frames to the server
            setInterval(async () => {
                try {
                    const frame = await imageCapture.grabFrame();
                    detectionCanvas.width = frame.width;
                    detectionCanvas.height = frame.height;
                    ctx.drawImage(frame, 0, 0, frame.width, frame.height);

                    // Convert the frame to base64 for sending to the server
                    const frameDataUrl = detectionCanvas.toDataURL('image/jpeg');

                    // Send the frame to the server for detection (you need to implement this)
                    socket.emit('detect', { frameDataUrl });
                } catch (error) {
                    console.error('Error capturing frame:', error);
                }
            }, 1000); // Adjust the capture rate as needed

            // Receive and display detection results from the server
            socket.on('detectionResults', function (results) {
                // Display detected objects in the objectList element
                objectList.innerHTML = '<h2>Detected Objects:</h2>';
                results.forEach((result, index) => {
                    objectList.innerHTML += `<p>${index + 1}. Class: ${result.class}, Confidence: ${result.confidence}</p>`;
                });
            });
        })
        .catch(function (error) {
            console.error('Error accessing the camera:', error);
        });
});
