import cv2
import subprocess


# Input RTSP camera URL
input_rtsp = "rtsp://192.168.10.13:554/user=admin_password=tlJwpbo6_channel=1_stream=1.sdp?real_stream"


# Output RTSP server URL
output_rtsp = "rtsp://192.168.10.57:8554/stream2"


cap = cv2.VideoCapture(input_rtsp)

if not cap.isOpened():
    print("Failed to open input RTSP stream")
    exit(1)

fps = cap.get(cv2.CAP_PROP_FPS) or 25
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

ffmpeg_cmd = [
    "ffmpeg",
    "-y",
    "-f", "rawvideo",
    "-pix_fmt", "bgr24",
    "-s", f"{width}x{height}",
    "-r", str(int(fps)),
    "-i", "-",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",   # force YUV420 (more compatible than yuv444p)
    "-preset", "veryfast",
    "-tune", "zerolatency",
    "-f", "rtsp",
    output_rtsp
]

process = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

while True:
    ret, frame = cap.read()
    if not ret:
        print("Lost connection to camera")
        break
    process.stdin.write(frame.tobytes())

cap.release()
process.stdin.close()
process.wait()