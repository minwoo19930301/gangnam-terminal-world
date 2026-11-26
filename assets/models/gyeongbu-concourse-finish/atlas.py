"""Author the eight stone, coating and metal swatches. All pixels are original."""
import struct
import zlib

import numpy as np


SWATCHES = [
    (201, 192, 175), (196, 187, 169), (204, 195, 179), (198, 191, 176),
    (105, 102, 96), (198, 192, 179), (236, 233, 223), (132, 129, 119),
]


def chunk(name, data):
    return struct.pack('>I', len(data)) + name + data + struct.pack('>I', zlib.crc32(name + data))


def atlas(file):
    size = 256
    yy, xx = np.mgrid[0:size, 0:size] / size
    swatches = []
    for i, tint in enumerate(SWATCHES):
        rand = np.random.default_rng(26052023 + i)
        def noise(n):
            grid = rand.normal(0, 1, (n+2, n+2))
            x = xx*n
            y = yy*n
            a = x.astype(int)
            b = y.astype(int)
            x, y = x-a, y-b
            x, y = x*x*(3-2*x), y*y*(3-2*y)
            return (1-y)*((1-x)*grid[b, a]+x*grid[b, a+1]) + y*((1-x)*grid[b+1, a]+x*grid[b+1, a+1])

        if i <= 4:
            # Fine calcite crystal aggregate over quiet, discontinuous sediment
            # seams. Keep the veining underneath the photographed tile joints.
            cloud = noise(3)*1.9 + noise(10) + noise(36)*1.3
            phase = yy*(4+i*.32) - xx*(2.2+i*.24) + noise(3)*.16 + noise(12)*.044
            veins = np.exp(-np.abs(np.sin(phase*np.pi))*28) * np.clip(noise(5)+.36, 0, 1)
            flecks = rand.random((size, size))
            crystal = (flecks>.981) * rand.uniform(5, 17, (size,size)) - (flecks<.035)*rand.uniform(4,13,(size,size))
            variation = cloud + veins*8 + crystal + rand.normal(0,1.5,(size,size))
        elif i == 7:
            variation = rand.normal(0,2.2,(size,1)) + noise(5)*1.3 + rand.normal(0,1,(size,size))
        else:
            variation = noise(4)*.9 + noise(26)*.45 + rand.normal(0,.7,(size,size))
        swatches.append(np.clip(np.array(tint) + variation[:,:,None], 0, 255).astype(np.uint8))

    # A small isolated lamp swatch inside the ceiling patch: light apertures
    # and diffuser strips can reach paper-white while using the same texture.
    swatches[6][:5,-5:,:] = (255,253,249)
    pixels = np.vstack((np.hstack(swatches[4:]),np.hstack(swatches[:4])))
    raw = b''.join(b'\x00'+row.tobytes() for row in pixels)
    file.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR',struct.pack('>2I5B',4*size,2*size,8,2,0,0,0)) +
                     chunk(b'IDAT',zlib.compress(raw,9)) + chunk(b'IEND', b''))
