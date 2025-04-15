let demon = {
    x: 50,
    y: 150,
    width: 40,
    height: 40,
    dy: 0,
    gravity: 1.5,
    jumpPower: -20,
    grounded: true,
    ducking: false,
    currentAnimation: "walk",
    isAlive: true,
  };
  
  let demonAnimations = {
    walk: [],
    jump: [],
    death: [],
    duck: [],
  };
  
  let frameTick = 0;
  let currentFrame = 0;
  let frameRate = 5;
  
  function preloadDemonAnimations() {
    demonAnimations.walk = loadAnimationFrame("assets/demonNOIR/Walking",23);
    demonAnimations.jump = loadAnimationFrames("assets/jump/jump", 9);
    demonAnimations.duck = loadAnimationFrames("assets/duck/duck", 9);
    demonAnimations.death = loadAnimationFrames("assets/death/death", 10);
    
  }
  
  function loadAnimationFrames(basePath, count) {
    const frames = [];
    for (let i = 0; i <= count; i++) {
      const img = new Image();
      img.src = `${basePath}_${i.toString().padStart(3, '0')}.png`;
      frames.push(img);
    }
    return frames;
  }
  
  function drawDemon(ctx) {
    let anim = demonAnimations[demon.currentAnimation] || [];
    if (!anim.length) return;
  
    let img = anim[currentFrame % anim.length];
    ctx.drawImage(img, demon.x, demon.y, demon.width, demon.height);
  
    frameTick++;
    if (frameTick >= frameRate) {
      currentFrame++;
      frameTick = 0;
    }
  }
  