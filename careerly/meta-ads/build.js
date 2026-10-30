// Builds the Careerly "Video Editor" hiring creative in every Meta ad size
// and renders each to PNG. Run: node build.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const dir = __dirname;
const illus = fs.readFileSync(path.join(dir, '_illus.svg'), 'utf8');

const ico = {
  bag: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  medal: '<circle cx="12" cy="9" r="5"/><path d="M9 13.5L8 21l4-2 4 2-1-7.5"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
};
const svg = (k) => `<svg viewBox="0 0 24 24">${ico[k]}</svg>`;

const skills = ['Adobe Premiere Pro', 'CapCut Video Editing', 'Reels &amp; YouTube Shorts', 'Creative Editing &amp; Transitions'];

const parts = {
  logo: `<div class="brand"><div class="logo gtext">Careerly</div><div class="tag"><i></i>AN INITIATIVE BY WEB ROCZ<i></i></div></div>`,
  build: `<div class="build">BUILD<br>YOUR<br>TOMORROW<br>WITH US<i></i></div>`,
  headline: `<div class="headline"><div>WE’RE</div><div class="gtext">HIRING!</div></div>`,
  role: `<div class="role">VIDEO EDITOR</div><div class="pill grad">Premiere Pro &amp; CapCut</div>`,
  info: `<div class="info">
    <div class="it"><div class="ico">${svg('bag')}</div><div><b>Exp: 2 – 4 Years</b><span>Full-Time</span></div></div>
    <div class="vsep"></div>
    <div class="it"><div class="ico">${svg('pin')}</div><div><b>Hyderabad</b><span>Web Rocz</span></div></div></div>`,
  skills: `<div class="skills"><div class="k">KEY<br>SKILLS</div><div class="list">${skills
    .map((s) => `<div class="row"><span class="chk grad">${svg('check')}</span>${s}</div>`).join('')}</div></div>`,
  cards: `<div class="cards">
    <div class="card"><span class="cico grad">${svg('bag')}</span>Real Client<br>Projects</div>
    <div class="card"><span class="cico grad">${svg('medal')}</span>Competitive<br>Salary</div>
    <div class="card"><span class="cico grad">${svg('trend')}</span>Career<br>Growth</div></div>`,
  cta: `<div class="ctarow"><div class="cta grad">${svg('send')}Apply Now</div><div class="csep"></div>
    <div class="phone"><div class="ico">${svg('phone')}</div>+91 9949 444 631</div></div>`,
};

const baseCss = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,sans-serif;background:#fff;position:relative;overflow:hidden;color:#16161f}
.grad{background:linear-gradient(90deg,#7a22e0,#e5194b)}
.gtext{background:linear-gradient(90deg,#7a22e0 0%,#b51fa8 55%,#e5194b 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.circle{position:absolute;border-radius:50%;background:#fde8ee}
.logo{font-size:92px;font-weight:800;letter-spacing:-3.5px;line-height:1;padding-bottom:6px}
.tag{display:flex;align-items:center;gap:14px;font-size:11.5px;font-weight:600;letter-spacing:3.2px}
.tag i{display:block;width:58px;height:3px}.tag i:first-child{background:#7a22e0}.tag i:last-child{background:#e5194b}
.build{font-size:15px;font-weight:500;letter-spacing:3.4px;line-height:24px;color:#2a2a35}
.build i{display:block;width:44px;height:3px;background:#e5194b;margin-top:12px}
.headline{font-size:124px;font-weight:900;letter-spacing:-6px;line-height:.87}
.headline .gtext{padding-bottom:8px}
.logo,.headline>div{width:fit-content}
.role{font-size:47px;font-weight:800;letter-spacing:-1.8px;line-height:1.2}
.pill{display:inline-flex;align-items:center;height:37px;padding:0 19px;border-radius:19px;color:#fff;font-size:20px;font-weight:700;margin-top:10px}
.info{display:flex;align-items:center;gap:28px}
.it{display:flex;align-items:center;gap:18px}
.ico{width:64px;height:64px;flex:none;border-radius:50%;background:#fde8ee;display:flex;align-items:center;justify-content:center}
.ico svg{width:26px;height:26px;stroke:#e5194b;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.it b{display:block;font-size:24px;font-weight:700;letter-spacing:-.4px}
.it span{font-size:18px;color:#5a5a66}
.vsep{width:2px;height:54px;background:#ece6ea}
.skills{border-radius:18px;background:#fde8ee;display:flex;align-items:center;padding:20px 0}
.skills .k{width:150px;flex:none;padding-left:28px;font-size:18px;font-weight:600;letter-spacing:4px;line-height:28px;color:#3a3a45}
.skills .list{border-left:2px solid #ecd2da;padding-left:26px;display:flex;flex-direction:column;gap:8px}
.skills .row{display:flex;align-items:center;gap:15px;font-size:23px;font-weight:600;letter-spacing:-.3px}
.chk{width:30px;height:30px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center}
.chk svg{width:14px;height:14px;stroke:#fff;fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.cards{display:flex;gap:15px}
.card{flex:1;height:67px;border:2px solid #f3dbe2;border-radius:14px;display:flex;align-items:center;gap:13px;padding-left:15px;font-size:17px;font-weight:600;line-height:21px;background:#fff}
.cico{width:38px;height:38px;flex:none;border-radius:10px;display:flex;align-items:center;justify-content:center}
.cico svg{width:19px;height:19px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ctarow{display:flex;align-items:center;gap:28px}
.cta{width:380px;height:80px;flex:none;border-radius:40px;color:#fff;display:flex;align-items:center;justify-content:center;gap:16px;font-size:33px;font-weight:800;letter-spacing:-.6px}
.cta svg{width:34px;height:34px;stroke:#fff;fill:none;stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}
.csep{width:2px;height:76px;background:#ece6ea}
.phone{display:flex;align-items:center;gap:20px;font-size:37px;font-weight:800;letter-spacing:-.6px;white-space:nowrap}
.phone .ico{width:62px;height:62px}
.illus{position:absolute}
.col{position:absolute;display:flex;flex-direction:column}
`;

const p = parts;
const sizes = [
  {
    // 4:5 Feed portrait
    name: 'feed-portrait-1080x1350', w: 1080, h: 1350,
    css: `.circle{left:690px;top:170px;width:560px;height:560px}
      .illus{left:672px;top:250px;width:370px}
      .build{position:absolute;left:898px;top:72px}
      .col{left:60px;top:58px;right:60px;bottom:58px;justify-content:space-between}
      .headline{font-size:138px;margin-top:18px}
      .role{font-size:54px;margin-top:22px}.pill{height:42px;font-size:22px;border-radius:21px}
      .skills .row{font-size:26px}.skills .list{gap:14px}.skills{padding:28px 0}
      .card{height:76px;font-size:18px}`,
    body: `${p.build}<div class="col">
      <div>${p.logo}${p.headline}<div>${p.role}</div></div>
      ${p.info}${p.skills}${p.cards}${p.cta}</div>`,
  },
  {
    // 9:16 Stories / Reels — key content kept out of the top ~250px and bottom ~340px UI overlays
    name: 'story-reels-1080x1920', w: 1080, h: 1920,
    css: `.circle{left:640px;top:330px;width:620px;height:620px}
      .circle2{left:-220px;top:1640px;width:520px;height:520px}
      .illus{left:650px;top:440px;width:390px}
      .build{position:absolute;left:898px;top:300px}
      .col{left:60px;right:60px;top:270px;bottom:330px;justify-content:space-between}
      .headline{font-size:140px;margin-top:150px}
      .role{font-size:58px;margin-top:30px}.pill{height:44px;font-size:23px;border-radius:22px}
      .skills .row{font-size:28px}.skills .list{gap:18px}.skills{padding:34px 0}
      .card{height:86px;font-size:19px}`,
    body: `<div class="circle circle2"></div>${p.build}<div class="col">
      <div>${p.logo}${p.headline}<div>${p.role}</div></div>
      ${p.info}${p.skills}${p.cards}${p.cta}</div>`,
  },
  {
    // 1.91:1 Landscape (link ads / right column / Audience Network)
    name: 'landscape-1200x628', w: 1200, h: 628,
    css: `.circle{left:860px;top:-120px;width:460px;height:460px}
      .logo{font-size:58px;letter-spacing:-2px}.tag{font-size:8px;letter-spacing:2.4px;gap:10px}.tag i{width:36px;height:2px}
      .headline{font-size:92px;letter-spacing:-4px;margin-top:20px}
      .role{font-size:38px;margin-top:14px;letter-spacing:-1.4px}.pill{height:32px;font-size:17px}
      .info{margin-top:26px;gap:20px}.ico{width:52px;height:52px}.ico svg{width:22px;height:22px}.it{gap:13px}
      .it b{font-size:20px}.it span{font-size:15px}.vsep{height:44px}
      .left{left:50px;top:42px}
      .right{left:612px;top:42px;width:540px;bottom:42px;justify-content:flex-end;gap:16px}
      .illus{left:900px;top:30px;width:240px}
      .skills{padding:16px 0}.skills .k{width:112px;padding-left:22px;font-size:14px;letter-spacing:3px;line-height:22px}
      .skills .list{padding-left:20px;gap:6px}.skills .row{font-size:19px;gap:12px}.chk{width:25px;height:25px}
      .cta{width:240px;height:62px;font-size:25px;gap:12px}.cta svg{width:26px;height:26px}
      .ctarow{gap:18px}.csep{height:56px}.phone{font-size:25px;gap:12px}.phone .ico{width:46px;height:46px}.phone .ico svg{width:20px;height:20px}`,
    body: `<div class="col left">${p.logo}${p.headline}<div>${p.role}</div>${p.info}</div>
      <div class="col right">${p.skills}${p.cta}</div>`,
  },
];

(async () => {
  const browser = await chromium.launch();
  for (const s of sizes) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${baseCss}
body{width:${s.w}px;height:${s.h}px}${s.css}</style></head>
<body><div class="circle"></div>${illus}${s.body}</body></html>`;
    const file = path.join(dir, `${s.name}.html`);
    fs.writeFileSync(file, html);
    const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
    await page.goto('file://' + file);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(dir, `${s.name}.png`) });
    await page.close();
  }
  await browser.close();
})();
