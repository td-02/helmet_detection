document.addEventListener('DOMContentLoaded', async function () {
    const cameraFeed = document.getElementById('camera-feed');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraFeed.srcObject = stream;
    } catch (error) {
        console.error('Error accessing the camera:', error);
    }
});