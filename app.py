from flask import Flask, render_template
import yolov8.models 
from yolov8.models import *  # Import all modules and classes from 'models'
from flask_socketio import SocketIO
import base64
from PIL import Image
import io
import numpy as np
from utils.torch_utils import select_device
from models.experimental import attempt_load
from utils.datasets import letterbox
from utils.general import non_max_suppression
from utils.plots import plot_one_box
import torch

app = Flask(__name__)
socketio = SocketIO(app)

# Load YOLOv8 model (adjust the path to your model file)
weights = r"C:\Users\TAPESH\Downloads\best.pt"
device = select_device('')
model = attempt_load(weights, map_location=device)
model.eval()

@socketio.on('detect')
def detect_frame(data):
    frame_data_url = data['frameDataUrl']

    # Convert base64 frame data to an image
    frame_data = frame_data_url.split(",")[1]
    frame_bytes = io.BytesIO(base64.b64decode(frame_data))
    frame = Image.open(frame_bytes)

    # Perform YOLOv8 object detection on the frame
    results = yolo_detection(frame, model, device)

    # Format detection results
    detection_results = []
    for det in results:
        class_id = int(det[5])
        confidence = float(det[4])
        bbox = det[:4].tolist()
        detection_results.append({'class': class_id, 'confidence': confidence, 'bbox': bbox})

    # Send detection results back to the client
    socketio.emit('detectionResults', detection_results)

def yolo_detection(frame, model, device):
    # Load the image and preprocess it
    img0 = frame.copy()  # Make a copy of the frame
    img = letterbox(img0, new_shape=640)[0]
    img = img[:, :, ::-1].transpose(2, 0, 1)  # BGR to RGB, HWC to CHW
    img = np.ascontiguousarray(img)

    # Convert to Torch tensor
    img = torch.from_numpy(img).to(device)
    img = img.float()
    img /= 255.0
    if img.ndimension() == 3:
        img = img.unsqueeze(0)

    # Perform inference
    pred = model(img)[0]

    # Apply non-maximum suppression
    pred = non_max_suppression(pred, conf_thres=0.5, iou_thres=0.5)[0]

    return pred

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
