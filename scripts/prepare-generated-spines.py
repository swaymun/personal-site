"""Crop approved ImageGen atlases; contain/pad to case proportions, never stretch.
Usage: python3 scripts/prepare-generated-spines.py albums1.png albums2.png games.png
"""
import json, subprocess, sys
from pathlib import Path

def run(*args): subprocess.run(['magick',*map(str,args)],check=True)
albums=json.loads(Path('src/data/albums.json').read_text())
games=json.loads(subprocess.check_output(['node','--experimental-strip-types','--input-type=module','-e',"import {favoriteGames} from './src/data/collection.ts'; console.log(JSON.stringify(favoriteGames))"]))
# Crop bounds measured from the approved atlases, in native image pixels.
batches=[('music',albums[:8],sys.argv[1],13,1748,[(14,101),(133,99),(250,100),(368,100),(486,93),(596,70),(685,84),(788,85)]),('music',albums[8:],sys.argv[2],34,1915,[(27,77),(125,83),(228,79),(326,80),(425,76),(519,71),(609,66),(695,72)]),('games',games,sys.argv[3],15,1496,[(16,117),(147,104),(264,109),(385,98),(494,147),(654,97),(764,97),(873,124)])]
for folder,items,atlas,x,w,bounds in batches:
 for item,(y,h) in zip(items,bounds):
  target_width=96
  target_height=round(target_width*item['height']/item['spine']) if folder=='games' else 1600
  bg=subprocess.check_output(['magick',atlas,'-crop',f'8x8+{x+4}+{y+4}','+repage','-resize','1x1!','-format','%[pixel:p{0,0}]','info:']).decode()
  run(atlas,'-crop',f'{w}x{h}+{x}+{y}','+repage','-rotate','90','-resize',f'{target_width}x{target_height}','-background',bg,'-gravity','center','-extent',f'{target_width}x{target_height}','-quality','90',f'public/{folder}/spines/{item["id"]}.webp')
