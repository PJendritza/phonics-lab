"""Find visible, nonempty cream letter plaques in a screenshot of lesson one.

This observes pixels only. It never reads game state or changes the lesson.
Requires Pillow (already installed in the development environment).
"""
import json
import sys
from PIL import Image

image = Image.open(sys.argv[1]).convert('RGB')
if '--gauge' in sys.argv:
    scale = min(image.width/2560, image.height/1800)
    left = (image.width-2560*scale)/2
    top = (image.height-1800*scale)/2
    gauge = image.crop((int(left+2290*scale),int(top+250*scale),int(left+2450*scale),int(top+1380*scale)))
    rgb = gauge.load()
    count = sum(1 for y in range(gauge.height) for x in range(gauge.width)
                if rgb[x,y][0]>230 and 130<rgb[x,y][1]<230 and rgb[x,y][2]<140)
    print(count)
    sys.exit(0)
step = 3
small = image.resize((image.width // step, image.height // step))
pixels = small.load()
mask = set()
for y in range(small.height):
    for x in range(small.width):
        red, green, blue = pixels[x, y]
        if red > 235 and green > 225 and 175 < blue < 235:
            mask.add((x, y))
result = []
while mask:
    start = mask.pop()
    todo = [start]
    group = [start]
    while todo:
        x, y = todo.pop()
        for neighbor in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
            if neighbor in mask:
                mask.remove(neighbor)
                todo.append(neighbor)
                group.append(neighbor)
    xs, ys = zip(*group)
    left, top, right, bottom = min(xs)*step, min(ys)*step, max(xs)*step, max(ys)*step
    if right-left < image.width*.06 or bottom-top < image.height*.025:
        continue
    if top < image.height*.15 or left > image.width*.87:
        continue
    crop = image.crop((left+8,top+5,right-8,bottom-5))
    rgb = crop.load()
    ink = sum(1 for y in range(crop.height) for x in range(crop.width) if max(rgb[x,y])<90)
    if ink > 15:
        result.append({'x':(left+right)/2,'y':(top+bottom)/2,'ink':ink})
print(json.dumps(sorted(result,key=lambda box:box['y'],reverse=True)))
