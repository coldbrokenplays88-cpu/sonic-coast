"""Optional authoring tool; never modifies PNG pixels. Requires Pillow, NumPy, SciPy."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
from scipy import ndimage
root=Path(__file__).resolve().parents[1]
frames={};sources=[]
for key,file,cols,rows in [('supplemental','sonic-supplemental.png',8,4),('peeloutCycle','sonic-peelout-cycle.png',4,2)]:
 path=root/'assets'/file;im=Image.open(path).convert('RGBA');pixels=np.asarray(im);labels,n=ndimage.label(pixels[:,:,3]>64);areas=np.bincount(labels.ravel());components=[]
 for k,sl in enumerate(ndimage.find_objects(labels),1):
  if sl is None or areas[k]<1000:continue
  y,x=sl;components.append({'row':min(rows-1,int((y.start+y.stop)/2/im.height*rows)),'bounds':[x.start,y.start,x.stop,y.stop]})
 components.sort(key=lambda d:(d['row'],d['bounds'][0]))
 assert len(components)==cols*rows,(file,len(components))
 assert all(sum(d['row']==r for d in components)==cols for r in range(rows))
 scale=(1448/8)/(im.width/cols)/3;out=[]
 for d in components:
  x1,y1,x2,y2=d['bounds'];x1=max(0,x1-2);y1=max(0,y1-2);x2=min(im.width,x2+2);y2=min(im.height,y2+2)
  eye=pixels[y1:y2,x1:x2];green=(eye[:,:,1]>eye[:,:,0]*1.5)&(eye[:,:,1]>eye[:,:,2]*1.2)&(eye[:,:,1]>45)&(eye[:,:,3]>128)
  gy,gx=np.where(green);eye_x=float(gx.mean())+x1 if len(gx) else x1+(x2-x1)*.8
  center=eye_x-37/(3*scale)
  baseline=max(c['bounds'][3] for c in components if c['row']==d['row'])
  out.append({'bounds':[x1,y1,x2,y2],'anchor':[round(center-x1),baseline-y1],'scale':scale})
 frames[key]=out;sources.append({'file':'assets/'+file,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'size':[im.width,im.height],'frames':cols*rows,'source':'Generated supplement from supplied Sonic expression reference and October 7 atlas; source sheets unchanged.'})
(root/'supplemental-frames.js').write_text("'use strict';\n// Authored poses supplement, never replace, the recovered source atlases.\nconst supplementalSpriteFrames="+json.dumps(frames,separators=(',',':'))+';\n')
(root/'assets'/'supplemental-art-metadata.json').write_text(json.dumps({'assets':sources,'normalFast':'8 distinct open-handed circular-shoe poses','boost':'8 closed-fist poses','grind':'8 planted-foot quill-flow poses','transitions':'2 entry, 2 exit, 2 landing, 2 charge','normalization':'Uniform per-sheet scale based on source-cell width; eye-relative body anchors and common row foot baseline.'},indent=2)+'\n')
print('Mapped',sum(len(v)for v in frames.values()),'additional poses; PNGs unchanged.')
