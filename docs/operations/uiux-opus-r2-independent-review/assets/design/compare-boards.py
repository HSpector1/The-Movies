from PIL import Image, ImageDraw, ImageFont
import sys
R2='r2zip/previews/'; P='design-out/'; OUT='design-out/'
try: F=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 18); F2=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 13)
except Exception: F=F2=ImageFont.load_default()
def row(files, labels, out, scale=0.5, title=None):
    ims=[Image.open(f).convert('RGB') for f in files]
    ims=[im.resize((int(im.width*scale), int(im.height*scale)), Image.LANCZOS) for im in ims]
    w=sum(i.width for i in ims)+16*(len(ims)+1); h=max(i.height for i in ims)+70
    g=Image.new('RGB',(w,h),(24,20,16)); d=ImageDraw.Draw(g); x=16
    if title: d.text((16,8),title,fill=(242,232,210),font=F)
    for im,l in zip(ims,labels):
        g.paste(im,(x,44)); d.text((x,26),l,fill=(217,169,59),font=F2); x+=im.width+16
    d.text((16,h-20),"Identical fixture data (Codex R2 living-studio.js @ e564d236); identical 1440×900 canvas; rendered in the same isolated Chromium. Left = Codex R2 (unchanged).",fill=(160,150,130),font=F2)
    g.save(out); print(out, g.size)
row([R2+'V01-overview.png', P+'CMP-rec-on-r2-world.png', P+'K1-overview.png'],
    ['R2 · V01 Studio overview (Codex, as published)', 'Proposed · same layout, same data, same R2 lot (UI change only)', 'Proposed · with the target-lot proof (world change added)'],
    OUT+'CMP-01-overview-3up.png', 0.5, 'Studio overview — R2 versus proposed, at matching scale and content')
row([R2+'V03-person.png', P+'CMP-rec-person-on-r2-world.png', P+'K2-person.png'],
    ['R2 · V03 Person (Codex)', 'Proposed · person on the R2 lot', 'Proposed · person on the target lot'],
    OUT+'CMP-02-person-3up.png', 0.5, 'Compact person inspection — R2 versus proposed')
row([R2+'V04-compare.png', P+'K4-compare.png'], ['R2 · V04 Casting comparison (Codex)', 'Proposed · casting comparison'], OUT+'CMP-03-compare-2up.png', 0.5, 'Casting comparison — R2 versus proposed')
row([R2+'V02-production.png', P+'K3-production.png'], ['R2 · V02 Production (Codex)', 'Proposed · production'], OUT+'CMP-04-production-2up.png', 0.5, 'Production inspection — R2 versus proposed')
# detail crops at 100%
def crops(pairs, out, title):
    # pairs: list of (label, (file, box), (file, box))
    blocks=[]
    for label,(fa,ba),(fb,bb) in pairs:
        a=Image.open(fa).convert('RGB').crop(ba); b=Image.open(fb).convert('RGB').crop(bb)
        h=max(a.height,b.height)+34; w=a.width+b.width+48
        blk=Image.new('RGB',(w,h),(24,20,16)); d=ImageDraw.Draw(blk)
        d.text((16,4),label+' — R2 (left) vs proposed (right), 100 %',fill=(217,169,59),font=F2)
        blk.paste(a,(16,26)); blk.paste(b,(a.width+32,26)); blocks.append(blk)
    W=max(b.width for b in blocks); H=sum(b.height for b in blocks)+50
    g=Image.new('RGB',(W,H),(24,20,16)); d=ImageDraw.Draw(g); d.text((16,10),title,fill=(242,232,210),font=F); y=44
    for b in blocks: g.paste(b,(0,y)); y+=b.height
    g.save(out); print(out,g.size)
crops([
    ('People rows ×3', (R2+'V01-overview.png',(16,250,222,490)), (P+'K1-overview.png',(12,196,270,436))),
    ('Picture rows', (R2+'V01-overview.png',(1180,214,1424,540)), (P+'K1-overview.png',(1172,160,1428,486))),
    ('HUD left', (R2+'V01-overview.png',(0,32,420,98)), (P+'K1-overview.png',(0,32,420,84))),
    ('HUD right', (R2+'V01-overview.png',(1020,32,1440,98)), (P+'K1-overview.png',(1020,32,1440,84))),
    ('Corner tools', (R2+'V01-overview.png',(0,812,240,900)), (P+'K1-overview.png',(260,812,420,900))),
    ('Compact person card', (R2+'V03-person.png',(420,462,980,868)), (P+'K2-person.png',(408,596,1032,884))),
], OUT+'CMP-05-detail-crops.png', 'Detail crops at 100 % — same data')
