"""Build the editable storefront with its packed original material atlas."""
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
sys.path[:0]=[str(HERE.parent/'gyeongbu-front-entrance'),str(HERE)]
from authoring import create
from finish import make_image,PALETTE
from storefront import facade

with TemporaryDirectory(prefix='gb-shop-fronts-') as tmp:
    image=Path(tmp)/'surface.png'
    make_image(image)
    create('cafes','경부선 정문 옆 · 이디야와 달리나인',facade,image,HERE,PALETTE,(-.64,-24,1.65),(1,0,5.60),32)
