window.addEventListener('load', function() {
  var canvas = document.getElementById('petalCanvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '9999';
  canvas.style.mixBlendMode = 'screen';
  canvas.style.pointerEvents = 'none';
  canvas.style.opacity = '1';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var ctx = canvas.getContext('2d');
  var dots = [];
  for (var i = 0; i < 300; i++) {
    dots.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1 + Math.random() * 2.5,
      vy: 0.5 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.5,
      c: ['#f7dfe1','#fff5ea','#e8cfb6','#d79aa4'][i % 4]
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach(function(d) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.c;
      ctx.globalAlpha = 0.55;
      ctx.fill();
      d.y += d.vy;
      d.x += d.vx;
      if (d.y > canvas.height + 10) {
        d.y = -10;
        d.x = Math.random() * canvas.width;
      }
    });
    requestAnimationFrame(loop);
  }
  loop();
});
