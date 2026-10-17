"""Locate visible, printed frog-game plaques using screenshot pixels only.

Their lily-pad touch target is 180 Godot pixels above the plaque's centre.
Cleared tracks can retain labels; the rightmost visible track is the current one.
No application state or answers are inspected. Requires Pillow.
"""
import json
import sys
from PIL import Image

image = Image.open(sys.argv[1]).convert('RGB')
scale = min(image.width / 2560, image.height / 1800)
game_left = (image.width - 2560 * scale) / 2
game_top = (image.height - 1800 * scale) / 2
step = max(1, round(3 * image.width / 1280))
small = image.resize((image.width // step, image.height // step))
pixels = small.load()
mask = set()
for y in range(small.height):
    for x in range(small.width):
        red, green, blue = pixels[x, y]
        if red > 235 and green > 225 and 175 < blue < 235:
            mask.add((x, y))
plaques = []
while mask:
    start = mask.pop()
    todo = [start]
    group = [start]
    while todo:
        x, y = todo.pop()
        for neighbor in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if neighbor in mask:
                mask.remove(neighbor)
                todo.append(neighbor)
                group.append(neighbor)
    xs, ys = zip(*group)
    left, top, right, bottom = min(xs) * step, min(ys) * step, max(xs) * step, max(ys) * step
    if not (170 * scale < right - left < 400 * scale and 45 * scale < bottom - top < 180 * scale):
        continue
    center_x, center_y = (left + right) / 2, (top + bottom) / 2
    hit_y = center_y - 180 * scale
    if not (game_left + 520 * scale < center_x < game_left + 2180 * scale
            and game_top + 320 * scale < hit_y < game_top + 1640 * scale):
        continue
    margin = max(2, round(12 * scale))
    crop = image.crop((left + margin, top + margin, right - margin, bottom - margin))
    crop_pixels = crop.load()
    ink = sum(1 for y in range(crop.height) for x in range(crop.width)
              if max(crop_pixels[x, y]) < 100)
    if ink >= max(3, 15 * scale):
        plaques.append({'x': center_x, 'y': hit_y, 'plaque_y': center_y, 'ink': ink,
                        'box': [left, top, right, bottom]})

if plaques:
    rightmost = max(item['x'] for item in plaques)
    plaques = [item for item in plaques if abs(item['x'] - rightmost) < 75 * scale]
    # Keep inputs away from the UI and screen edges; avoid a disappearing old pad.
    plaques.sort(key=lambda item: abs(item['y'] - (game_top + 950 * scale)))
print(json.dumps(plaques))
