"""Local-only cube repair experiment: tracked clean plate plus small-mask fill.

Requires numpy/opencv. No network, generation, or external APIs.
Uses an existing edited endpoint; never changes source footage.
"""
import json
import subprocess
from pathlib import Path
import cv2
import numpy as np

APP = Path(__file__).resolve().parents[1]
SOURCE = APP / 'assets/landing-planet-to-city-flight-v1-exact.mkv'
PLATE = APP / 'public/landing-desert-city-flight-final-no-cube-v1.png'
STEM = 'landing-planet-to-city-flight-v1-local-repair-v6'
MASTER = APP / f'assets/{STEM}.mkv'
PREVIEW = APP / f'public/{STEM}.mp4'
REPORT = APP / f'assets/{STEM}.json'
for p in [MASTER, PREVIEW, REPORT]:
    if p.exists():
        raise RuntimeError(f'Refusing overwrite: {p}')
cv2.setNumThreads(4)
cap = cv2.VideoCapture(str(SOURCE))
frames = []
while True:
    ok, frame = cap.read()
    if not ok:
        break
    frames.append(frame)
cap.release()
h, w = frames[0].shape[:2]
plate = cv2.imread(str(PLATE))
assert plate.shape == frames[0].shape

def cube_mask(frame, index):
    mask = np.zeros((h, w), np.uint8)
    if index < 39:
        return mask
    if index <= 59:
        keys = [39,40,42,45,50,55,59]
        boxes = [[747,316,758,325],[745,317,761,327],[741,317,763,330],
                 [734,319,764,335],[725,321,767,345],[713,321,771,363],
                 [704,321,778,383]]
        box = [int(round(np.interp(index,keys,[v[c] for v in boxes]))) for c in range(4)]
        mask[box[1]:box[3],box[0]:box[2]] = 255
        return mask
    b, g, r = cv2.split(frame)
    dark = ((r < 85) & (g < 90) & (b < 115)).astype(np.uint8) * 255
    roi = np.zeros_like(mask)
    roi[160:475, 535:905] = 255
    dark &= roi
    count, labels, stats, centers = cv2.connectedComponentsWithStats(dark)
    candidates = [i for i in range(1, count)
                  if stats[i, cv2.CC_STAT_AREA] >= 3 and abs(centers[i, 0] - 730) < 85]
    if not candidates:
        return mask
    i = max(candidates, key=lambda j: stats[j, cv2.CC_STAT_AREA])
    points = np.column_stack(np.where(labels == i)[::-1]).astype(np.int32)
    if len(points) >= 3:
        cv2.fillConvexPoly(mask, cv2.convexHull(points), 255)
    else:
        mask[labels == i] = 255
    return cv2.dilate(mask, np.ones((25, 25), np.uint8))

masks = [cube_mask(f, i) for i, f in enumerate(frames)]
orb = cv2.ORB_create(nfeatures=6000, fastThreshold=8)
reference = frames[-1]
feature_mask = np.zeros((h, w), np.uint8)
feature_mask[100:525, 50:w-50] = 255
feature_mask[150:480, 525:925] = 0
rk, rd = orb.detectAndCompute(reference, feature_mask)
matcher = cv2.BFMatcher(cv2.NORM_HAMMING)
transforms = {}
tracking = []
for i, frame in enumerate(frames):
    if i < 55:
        continue
    fm = feature_mask.copy()
    fm[cv2.dilate(masks[i], np.ones((21, 21), np.uint8)) > 0] = 0
    fk, fd = orb.detectAndCompute(frame, fm)
    if fd is None:
        continue
    pairs = matcher.knnMatch(rd, fd, k=2)
    good = [a for a, b in pairs if a.distance < .72 * b.distance]
    if len(good) < 8:
        continue
    src = np.float32([rk[a.queryIdx].pt for a in good])
    dst = np.float32([fk[a.trainIdx].pt for a in good])
    mat, inliers = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC,
                                            ransacReprojThreshold=3, maxIters=5000)
    if mat is None:
        continue
    n = int(inliers.sum())
    scale = float(np.hypot(mat[0, 0], mat[1, 0]))
    if n >= 8 and .4 < scale < 1.3 and abs(mat[0, 1]) < .2:
        transforms[i] = mat
        tracking.append({'frame': i, 'inliers': n, 'scale': scale})
transforms[len(frames)-1] = np.array([[1., 0., 0.], [0., 1., 0.]])
anchors = sorted(transforms)
print(json.dumps({'frames': len(frames), 'masked': sum(bool(m.any()) for m in masks),
                  'tracking_anchors': tracking}), flush=True)
smooth = np.array([[[np.interp(i, anchors, [transforms[k][r,c] for k in anchors])
                     for c in range(3)] for r in range(2)] for i in range(len(frames))])
# Short symmetric smoothing avoids single-frame estimation jitters.
for r in range(2):
    for c in range(3):
        smooth[:,r,c] = np.convolve(np.pad(smooth[:,r,c], (2,2), mode='edge'),
                                    np.array([1,2,3,2,1])/9, mode='valid')
smooth[-1] = transforms[len(frames)-1]
encoder = subprocess.Popen(['ffmpeg', '-v', 'error', '-nostdin', '-n', '-f', 'rawvideo',
    '-pix_fmt', 'bgr24', '-s', f'{w}x{h}', '-r', '24', '-i', 'pipe:0', '-an',
    '-c:v', 'ffv1', '-level', '3', '-pix_fmt', 'bgr0', str(MASTER)], stdin=subprocess.PIPE)
records = []
samples = []
for i, (frame, mask) in enumerate(zip(frames, masks)):
    result = frame.copy()
    if mask.any():
        ys, xs = np.where(mask > 0)
        x0, x1 = max(0, xs.min()-25), min(w, xs.max()+26)
        y0, y1 = max(0, ys.min()-25), min(h, ys.max()+26)
        method = 'local_fill'
        filled = cv2.inpaint(frame[y0:y1,x0:x1], mask[y0:y1,x0:x1], 5, cv2.INPAINT_TELEA)
        if i < 60:
            # Tiny cloud-edge repairs: interpolate contemporaneous left/right
            # pixels along each scanline, avoiding synthetic triangular blobs.
            filled = frame[y0:y1,x0:x1].copy()
            for y in range(y0,y1):
                row = np.flatnonzero(mask[y])
                if not len(row):
                    continue
                left,right = int(row[0]),int(row[-1])
                lc = np.median(frame[y,max(0,left-5):left].astype(float),axis=0)
                rc = np.median(frame[y,right+1:min(w,right+6)].astype(float),axis=0)
                t = np.linspace(0,1,right-left+1)[:,None]
                filled[y-y0,left-x0:right-x0+1] = np.clip(lc*(1-t)+rc*t,0,255).astype(np.uint8)
            method = 'scanline_cloud_fill'
        if i >= 60 and i >= anchors[0]:
            warped = cv2.warpAffine(plate, smooth[i], (w,h), flags=cv2.INTER_LINEAR,
                                    borderMode=cv2.BORDER_REFLECT101)
            # Blend the tracked plate into the original color/illumination at its perimeter.
            outer = cv2.dilate(mask, np.ones((21,21),np.uint8))
            boundary = (outer > 0) & (mask == 0)
            delta = np.median(frame[boundary].astype(float)-warped[boundary], axis=0)
            warped = np.clip(warped.astype(float)+delta,0,255).astype(np.uint8)
            # OpenCV mutates its input mask: supply a copy so the later alpha
            # composite retains the full cube mask instead of only its perimeter.
            filled = cv2.seamlessClone(warped[y0:y1,x0:x1],frame[y0:y1,x0:x1],
                mask[y0:y1,x0:x1].copy(),((x1-x0)//2,(y1-y0)//2),cv2.NORMAL_CLONE)
            method = 'tracked_clean_plate'
        alpha = cv2.GaussianBlur(mask.astype(np.float32)/255, (5,5), .8)
        region = np.s_[y0:y1,x0:x1]
        a = alpha[region][...,None]
        result[region] = np.clip(filled*a+frame[region]*(1-a),0,255).astype(np.uint8)
        records.append({'frame': i, 'box': [int(x0),int(y0),int(x1),int(y1)], 'method': method})
    encoder.stdin.write(result.tobytes())
    if i in [39,45,55,65,75,85,95,105,115,119]:
        samples.append(cv2.resize(result,(362,272)))
encoder.stdin.close()
assert encoder.wait() == 0
cv2.imwrite(str(APP / f'assets/{STEM}-contact.png'),
            np.vstack([np.hstack(samples[:5]),np.hstack(samples[5:])]))
REPORT.write_text(json.dumps({'source':str(SOURCE),'clean_plate':str(PLATE),
    'no_external_api':True,'tracking':tracking,'repairs':records},indent=2))
subprocess.run(['ffmpeg','-v','error','-nostdin','-n','-i',str(MASTER),'-an',
    '-c:v','libx264','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',str(PREVIEW)],check=True)
print(str(PREVIEW),flush=True)
