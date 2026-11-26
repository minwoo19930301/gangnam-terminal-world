export function registerHotelWalnut(K){
  for (const [key, base] of [['jwWalnut', '#6a4630'], ['jwWalnutLight', '#7a4b30']]) K.texture(key, 256, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); const r = K.rand(1313);
    for (let i = 0; i < 250; i++) {
      const x = r() * w; g.strokeStyle = i % 3 ? 'rgba(16,10,7,.08)' : 'rgba(160,110,70,.2)';
      g.lineWidth = .5 + r(); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 4, h / 3, x - 3, 2 * h / 3, x + 2, h); g.stroke();
    }
  }, [.65, 3.2]);
}
