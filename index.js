function Rocket_start(){

// CLASSES
// Shard：碎片
class Shard {
  constructor(x, y, hue) {
    this.x = x;
    this.y = y;
    this.hue = hue;
    this.lightness = 50; // 烟花炸开之后的 亮度
    this.size = 1 + Math.random() * 5; // 烟花炸开之后的 粗细
    const angle = Math.random() * 2 * Math.PI;
    const blastSpeed = 1 + Math.random() * 2; // 烟花炸开之后的 速度
    this.xSpeed = Math.cos(angle) * blastSpeed;
    this.ySpeed = Math.sin(angle) * blastSpeed;
    this.target = getTarget();
    this.ttl = 100;
    this.timer = 0;
  }
  draw() {
    ctx2.fillStyle = `hsl(${this.hue}, 100%, ${this.lightness}%)`; // 100% 表示 烟花炸开之后的 颜色保留100%
    ctx2.beginPath();
    // arc ： 创建一个圆形 .arc(x,y,r,sAngle,eAngle,counterclockwise); x, y, 起始角，以弧度计。结束角，以弧度计。可选。规定应该逆时针还是顺时针绘图。False = 顺时针，true = 逆时针。
    ctx2.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx2.closePath();
    ctx2.fill();
  }
  update() {
    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const a = Math.atan2(dy, dx);
      const tx = Math.cos(a) * 5;
      const ty = Math.sin(a) * 5;
      this.size = lerp(this.size, 1.5, 0.05);

      if (dist < 5) {
        this.lightness = lerp(this.lightness, 100, 0.01);
        this.xSpeed = this.ySpeed = 0;
        this.x = lerp(this.x, this.target.x + fidelity / 2, 0.05);
        this.y = lerp(this.y, this.target.y + fidelity / 2, 0.05);
        this.timer += 1;
      } else
      if (dist < 10) {
        this.lightness = lerp(this.lightness, 100, 0.01);
        this.xSpeed = lerp(this.xSpeed, tx, 0.1);
        this.ySpeed = lerp(this.ySpeed, ty, 0.1);
        this.timer += 1;
      } else
      {
        this.xSpeed = lerp(this.xSpeed, tx, 0.02);
        this.ySpeed = lerp(this.ySpeed, ty, 0.02);
      }
    } else
    {
      this.ySpeed += 0.05;
      //this.xSpeed = lerp(this.xSpeed, 0, 0.1);
      this.size = lerp(this.size, 1, 0.05);

      if (this.y > c2.height) {
        shards.forEach((shard, idx) => {
          if (shard === this) {
            shards.splice(idx, 1);
          }
        });
      }
    }
    this.x = this.x + this.xSpeed;
    this.y = this.y + this.ySpeed;
  }}

// Rocket：烟花
class Rocket {
  constructor() {
    const quarterW = c2.width / 4;
    this.x = quarterW + Math.random() * (c2.width - quarterW);
    this.y = c2.height - 15;
    this.angle = Math.random() * Math.PI / 4 - Math.PI / 6;
    this.blastSpeed = 6 + Math.random() * 7; // 烟花的移动速度以及飞行高度
    this.shardCount = 15 + Math.floor(Math.random() * 15);

    this.xSpeed = Math.sin(this.angle) * this.blastSpeed;
    this.ySpeed = -Math.cos(this.angle) * this.blastSpeed;
    this.hue = Math.floor(Math.random() * 360); 
    this.trail = [];
  }
  draw() {
    ctx2.save();
    ctx2.translate(this.x, this.y);
    ctx2.rotate(Math.atan2(this.ySpeed, this.xSpeed) + Math.PI / 2);
    ctx2.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
    ctx2.fillRect(0, 0, 5, 10);
    ctx2.restore();
  }
  update() {
    this.x = this.x + this.xSpeed;
    this.y = this.y + this.ySpeed;
    this.ySpeed += 0.1;
  }

  explode() {
    // 60 表示 烟花炸开之后的个数
    for (let i = 0; i < 60; i++) {
      shards.push(new Shard(this.x, this.y, this.hue));
    }
  }
}


// if (rocket.style.display == "block") {
  // 初始化：INITIALIZATION3
  // 获取3个 Canvas对象
  const [c1, c2, c3] = document.querySelectorAll('canvas');
  const [ctx1, ctx2, ctx3] = [c1, c2, c3].map(c => c.getContext('2d'));
  // 字的大小
  let fontSize = 200;  
  const rockets = [];
  const shards = [];
  const targets = [];
  // 字的像素精度
  const fidelity = 2; 
  let counter = 0;
  c1.width = c2.width = c3.width = window.innerWidth;
  c2.height = c3.height = window.innerHeight+100;
  ctx1.fillStyle = '#000';
  const text1 = '亲爱的老婆：';
  const text2 = '        跟你在一起五周年啦！';
  const text3 = '        爱你！么么哒！';
  const text = '                                        -SYL';
  let textWidth = 99999999;

  // 计算宽
  while (textWidth > window.innerWidth) {
    ctx1.font = `900 ${fontSize--}px STSong`;
    textWidth = ctx1.measureText(text).width;
  }

  // c1.width = textWidth;
  c1.height = fontSize * 1.5*3;
  ctx1.font = `900 ${fontSize}px STSong`;
  ctx1.fillText(" ", 0, 0);
  ctx1.fillText(text1, 0, fontSize*1);
  ctx1.fillText(text2, 0, fontSize*2);
  ctx1.fillText(text3, 0, fontSize*3);
  ctx1.fillText(text, 0, fontSize*4);

  const imgData = ctx1.getImageData(0, 0, c1.width, c1.height);
  for (let i = 0, max = imgData.data.length; i < max; i += 4) {
    const alpha = imgData.data[i + 3];
    const x = Math.floor(i / 4) % imgData.width;
    const y = Math.floor(i / 4 / imgData.width);

    if (alpha && x % fidelity === 0 && y % fidelity === 0) {
      targets.push({ x, y });
    }
  }

  // ANIMATION LOOP
  (
    function loop() {
    ctx2.fillStyle = "rgba(0, 0, 0, 0.43)";
    ctx2.fillRect(0, 0, c2.width, c2.height);
    //ctx2.clearRect(0, 0, c2.width, c2.height);
    counter += 1;

    if (counter % 20 === 0) {
      rockets.push(new Rocket()); // 添加
    }
    rockets.forEach((r, i) => {
      r.draw();
      r.update();
      if (r.ySpeed > 0) {
        r.explode();
        rockets.splice(i, 1);
      }
    });

    shards.forEach((s, i) => {
      s.draw();
      s.update();

      if (s.timer >= s.ttl || s.lightness >= 99) {
        // fillRect(x, y , width, height)
        ctx3.fillStyle = `hsl(${s.hue}, 200%, 50%)`
        ctx3.fillRect(s.target.x, s.target.y, fidelity + 1, fidelity + 1);
        shards.splice(i, 1);
      }
    });
    requestAnimationFrame(loop);
  })();

  // HELPER FUNCTIONS
  const lerp = (a, b, t) => Math.abs(b - a) > 0.1 ? a + t * (b - a) : b;

  function getTarget() {
    if (targets.length > 0) {
      const idx = Math.floor(Math.random() * targets.length);
      let { x, y } = targets[idx];
      targets.splice(idx, 1);

      // x += c2.width / 2 - textWidth / 2;
      // y += c2.height / 2 - fontSize / 2;

      x += c2.width / 2 - textWidth / 2;
      y += fontSize / 2;

      return { x, y };
    }
  }
function get_time(){
    var nowDate = new Date();
    var last_five_seconds = new Date("2021/01/01")
    var last_seconds = parseInt(((last_five_seconds - new Date()) / 1000))
    var rocket = document.getElementsByClassName('Rocket')[0];
    var time_class = document.getElementsByClassName('time_class')[0];
    if (last_seconds < -125) 
    {
      rocket.style.display = "none";
      time_class.style.display = "block"
      window.clearInterval(getTime);
      window.setInterval(timer_start, 1000);
    }
    console.log("last_seconds=", last_seconds)
}
var getTime = window.setInterval(get_time, 1000);
}
