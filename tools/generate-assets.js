const fs = require("fs/promises");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "assets");

const variants = [
  { file: "hero-marshmallow-flowers.png", width: 1800, height: 1050, kind: "hero" },
  { file: "box-blush.png", width: 1040, height: 940, kind: "box" },
  { file: "bouquet-sage.png", width: 1040, height: 940, kind: "bouquet" },
  { file: "mini-berry.png", width: 1040, height: 940, kind: "mini" },
  { file: "grand-gift.png", width: 1040, height: 940, kind: "grand" },
  { file: "seasonal-drop.png", width: 1040, height: 940, kind: "seasonal" },
  { file: "masterclass-set.png", width: 1040, height: 940, kind: "masterclass" },
  { file: "studio-table.png", width: 1300, height: 1100, kind: "studio" },
  { file: "lookbook-macro.png", width: 1300, height: 1100, kind: "macro" },
  { file: "lookbook-gift.png", width: 950, height: 950, kind: "gift" },
  { file: "lookbook-workshop.png", width: 950, height: 950, kind: "workshop" },
];

const palettes = {
  hero: ["#f6d8d5", "#fff1dc", "#d7cfec", "#b9c8aa", "#a84862", "#e4b58c"],
  box: ["#f6d8d5", "#fff1dc", "#d89aa1", "#f1c29c", "#fff7e8"],
  bouquet: ["#fff7e8", "#b9c8aa", "#d9deb4", "#f6d8d5", "#d7cfec"],
  mini: ["#fff0e3", "#f6d8d5", "#a84862", "#d7cfec", "#e4b58c"],
  grand: ["#fff7e8", "#f6d8d5", "#e6cfaa", "#d89aa1", "#a84862", "#d7cfec"],
  seasonal: ["#fff0e3", "#a84862", "#7f8c66", "#e4b58c", "#f6d8d5"],
  masterclass: ["#fff7e8", "#f6d8d5", "#d89aa1", "#b9c8aa", "#e6cfaa"],
  studio: ["#fff7e8", "#f6d8d5", "#d89aa1", "#b9c8aa", "#e6cfaa"],
  macro: ["#fff7e8", "#f6d8d5", "#a84862", "#d7cfec", "#e4b58c"],
  gift: ["#f6d8d5", "#fff1dc", "#d89aa1", "#e6cfaa", "#b9c8aa"],
  workshop: ["#fff7e8", "#f6d8d5", "#d89aa1", "#b9c8aa", "#e6cfaa"],
};

const layouts = {
  hero: [
    [66, 43, 230, 0],
    [51, 35, 185, 18],
    [78, 34, 172, -12],
    [58, 58, 178, 25],
    [73, 61, 154, -6],
    [44, 55, 142, 8],
    [84, 53, 128, 20],
    [64, 25, 132, -20],
    [52, 70, 116, 12],
  ],
  box: [
    [50, 42, 188, 0],
    [33, 42, 152, 18],
    [66, 40, 150, -10],
    [43, 59, 138, 30],
    [60, 60, 132, -26],
    [76, 56, 114, 12],
    [26, 56, 112, -14],
  ],
  bouquet: [
    [50, 32, 182, 10],
    [34, 39, 138, -16],
    [64, 40, 145, 16],
    [43, 54, 150, 0],
    [59, 57, 128, -24],
    [75, 53, 118, 18],
    [29, 58, 114, 8],
    [52, 70, 108, -8],
  ],
  mini: [
    [48, 46, 160, 10],
    [35, 52, 128, -18],
    [62, 52, 126, 20],
    [50, 64, 116, -10],
    [72, 42, 108, 16],
  ],
  grand: [
    [50, 35, 200, 0],
    [34, 42, 155, -12],
    [66, 41, 165, 18],
    [43, 58, 145, 24],
    [60, 60, 142, -22],
    [76, 56, 122, 14],
    [28, 58, 120, -18],
    [51, 72, 112, 8],
    [71, 72, 104, -10],
  ],
  seasonal: [
    [49, 41, 174, 10],
    [33, 47, 132, -18],
    [64, 50, 138, 22],
    [50, 63, 128, -6],
    [73, 41, 112, 16],
    [29, 64, 105, -12],
  ],
  masterclass: [
    [58, 45, 148, 8],
    [42, 54, 128, -12],
    [70, 58, 118, 18],
    [53, 67, 104, -10],
    [35, 40, 96, 14],
  ],
  studio: [
    [51, 38, 170, 8],
    [35, 43, 132, -18],
    [66, 44, 138, 18],
    [43, 58, 126, 24],
    [60, 59, 120, -20],
    [75, 55, 108, 10],
  ],
  macro: [
    [42, 38, 340, 8],
    [65, 42, 300, -16],
    [52, 63, 280, 18],
    [77, 65, 220, -8],
    [28, 60, 210, 20],
  ],
  gift: [
    [50, 39, 176, 0],
    [35, 45, 130, 18],
    [63, 47, 138, -12],
    [48, 60, 122, 24],
    [69, 59, 112, -18],
  ],
  workshop: [
    [57, 46, 156, 8],
    [42, 54, 130, -12],
    [70, 58, 118, 18],
    [53, 66, 104, -10],
  ],
};

function flower(index, left, top, size, rotate, palette) {
  const color = palette[index % palette.length];
  const center = index % 3 === 0 ? "#c48652" : "#e6cfaa";
  const petals = Array.from({ length: 10 }, (_, i) => `<span style="--i:${i};"></span>`).join("");
  return `
    <div class="flower" style="left:${left}%; top:${top}%; --size:${size}px; --rotate:${rotate}deg; --petal:${color}; --center:${center};">
      ${petals}
      <i></i>
    </div>
  `;
}

function powder(kind) {
  const count = kind === "hero" || kind === "macro" ? 30 : 18;
  return Array.from({ length: count }, (_, i) => {
    const left = (i * 19 + 7) % 96;
    const top = (i * 29 + 11) % 88;
    const size = 2 + (i % 4);
    const opacity = 0.18 + (i % 5) * 0.045;
    return `<b class="powder" style="left:${left}%; top:${top}%; width:${size}px; height:${size}px; opacity:${opacity};"></b>`;
  }).join("");
}

function sceneHtml(variant) {
  const palette = palettes[variant.kind];
  const flowers = layouts[variant.kind]
    .map((item, index) => flower(index, item[0], item[1], item[2], item[3], palette))
    .join("");
  const showBox = !["macro", "bouquet", "workshop", "masterclass"].includes(variant.kind);
  const showTools = ["studio", "workshop", "masterclass"].includes(variant.kind);
  const showWrap = variant.kind !== "macro";

  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            width: ${variant.width}px;
            height: ${variant.height}px;
            margin: 0;
            overflow: hidden;
            background: #1d1218;
            font-family: Georgia, serif;
          }

          .scene {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background:
              linear-gradient(145deg, #130d12 0%, #24141d 42%, #302018 72%, #171016 100%),
              #1a1016;
          }

          .scene::before {
            content: "";
            position: absolute;
            inset: 0;
            background:
              linear-gradient(112deg, transparent 0 20%, rgba(164, 72, 98, 0.18) 38%, transparent 58%),
              linear-gradient(252deg, transparent 0 50%, rgba(230, 207, 170, 0.14) 72%, transparent 100%),
              repeating-linear-gradient(90deg, rgba(230, 207, 170, 0.035) 0 1px, transparent 1px 58px);
          }

          .table {
            position: absolute;
            left: -4%;
            right: -4%;
            bottom: -10%;
            height: 42%;
            background:
              linear-gradient(180deg, rgba(83, 50, 38, 0.18), rgba(24, 15, 18, 0.92)),
              #2c1d18;
            border-top: 1px solid rgba(230, 207, 170, 0.16);
            transform: rotate(${variant.kind === "hero" ? "-1deg" : "0deg"});
          }

          .shadow {
            position: absolute;
            left: ${variant.kind === "hero" ? "45%" : variant.kind === "macro" ? "13%" : "17%"};
            bottom: ${variant.kind === "hero" ? "12%" : "13%"};
            width: ${variant.kind === "hero" ? "47%" : variant.kind === "macro" ? "78%" : "64%"};
            height: 15%;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.46);
            filter: blur(42px);
          }

          .box {
            display: ${showBox ? "block" : "none"};
            position: absolute;
            left: ${variant.kind === "hero" ? "54%" : "22%"};
            top: ${variant.kind === "hero" ? "48%" : "45%"};
            width: ${variant.kind === "hero" ? "520px" : "560px"};
            height: ${variant.kind === "hero" ? "230px" : "250px"};
            border-radius: 28px 28px 38px 38px;
            background:
              linear-gradient(145deg, rgba(255, 244, 224, 0.2), rgba(72, 34, 45, 0.72)),
              #33212a;
            border: 2px solid rgba(230, 207, 170, 0.34);
            box-shadow: 0 34px 90px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.11);
          }

          .box::before {
            content: "";
            position: absolute;
            inset: 20px;
            border-radius: 22px;
            border: 1px solid rgba(216, 154, 161, 0.22);
          }

          .ribbon {
            display: ${showBox ? "block" : "none"};
            position: absolute;
            left: calc(${variant.kind === "hero" ? "54%" : "22%"} + ${variant.kind === "hero" ? "238px" : "255px"});
            top: ${variant.kind === "hero" ? "48%" : "45%"};
            width: 38px;
            height: ${variant.kind === "hero" ? "230px" : "250px"};
            background: linear-gradient(180deg, rgba(168, 72, 98, 0.8), rgba(216, 154, 161, 0.36));
            opacity: 0.88;
          }

          .wrap {
            position: absolute;
            left: ${variant.kind === "hero" ? "42%" : variant.kind === "macro" ? "7%" : "12%"};
            top: ${variant.kind === "hero" ? "10%" : variant.kind === "macro" ? "2%" : "11%"};
            width: ${variant.kind === "hero" ? "930px" : variant.kind === "macro" ? "1120px" : "800px"};
            height: ${variant.kind === "hero" ? "780px" : variant.kind === "macro" ? "980px" : "730px"};
            transform: rotate(${variant.kind === "bouquet" ? "-7deg" : variant.kind === "mini" ? "5deg" : "0deg"});
          }

          .wrap::after {
            content: "";
            display: ${showWrap ? "block" : "none"};
            position: absolute;
            left: 42%;
            bottom: 3%;
            width: 16%;
            height: 26%;
            border-radius: 18px;
            background:
              linear-gradient(90deg, rgba(185, 200, 170, 0.62), rgba(255, 250, 241, 0.14)),
              #5f6e52;
            transform: rotate(${variant.kind === "bouquet" ? "5deg" : "-3deg"});
            box-shadow: 0 22px 36px rgba(0, 0, 0, 0.24);
            opacity: ${variant.kind === "box" || variant.kind === "hero" || variant.kind === "gift" ? "0" : "1"};
          }

          .flower {
            position: absolute;
            width: var(--size);
            height: var(--size);
            transform: translate(-50%, -50%) rotate(var(--rotate));
            filter: drop-shadow(0 18px 20px rgba(0, 0, 0, 0.26));
          }

          .flower span {
            position: absolute;
            left: 31%;
            top: 8%;
            width: 38%;
            height: 57%;
            border-radius: 58% 58% 48% 48%;
            background:
              radial-gradient(circle at 38% 28%, rgba(255, 255, 255, 0.78) 0 12%, transparent 34%),
              linear-gradient(180deg, rgba(255, 255, 255, 0.46), transparent 38%),
              var(--petal);
            transform: rotate(calc(var(--i) * 36deg)) translateY(-26%);
            transform-origin: 50% 82%;
            box-shadow: inset 0 -13px 20px rgba(120, 50, 71, 0.14);
          }

          .flower i {
            position: absolute;
            left: 35%;
            top: 35%;
            width: 30%;
            height: 30%;
            border-radius: 50%;
            background:
              radial-gradient(circle at 42% 36%, rgba(255, 255, 255, 0.76) 0 10%, transparent 42%),
              var(--center);
            box-shadow: inset 0 -7px 13px rgba(75, 49, 40, 0.14);
          }

          .leaf {
            position: absolute;
            width: 135px;
            height: 54px;
            border-radius: 100% 0 100% 0;
            background:
              linear-gradient(135deg, rgba(255, 255, 255, 0.24), transparent),
              #819174;
            opacity: 0.58;
            filter: drop-shadow(0 10px 12px rgba(0, 0, 0, 0.18));
          }

          .leaf.one { left: 26%; top: 52%; transform: rotate(-34deg); }
          .leaf.two { left: 66%; top: 54%; transform: scaleX(-1) rotate(-30deg); }
          .leaf.three { left: 45%; top: 72%; transform: rotate(28deg); opacity: 0.45; }

          .powder {
            position: absolute;
            z-index: 4;
            border-radius: 50%;
            background: rgba(244, 226, 198, 0.62);
            box-shadow: 0 0 14px rgba(230, 207, 170, 0.3);
          }

          .tools {
            display: ${showTools ? "block" : "none"};
            position: absolute;
            left: 9%;
            bottom: 18%;
            width: 360px;
            height: 180px;
            transform: rotate(-8deg);
            opacity: 0.9;
          }

          .tool-bag {
            position: absolute;
            left: 0;
            top: 44px;
            width: 250px;
            height: 82px;
            border-radius: 50px 90px 90px 50px;
            background: linear-gradient(90deg, rgba(255, 242, 222, 0.82), rgba(185, 122, 107, 0.62));
            box-shadow: 0 24px 46px rgba(0, 0, 0, 0.32);
          }

          .tool-tip {
            position: absolute;
            left: 238px;
            top: 62px;
            width: 74px;
            height: 44px;
            border-radius: 0 40px 40px 0;
            background: linear-gradient(90deg, #c9a36d, #f3d9a3);
          }

          .nozzle {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 72px;
            height: 96px;
            border-radius: 14px 14px 28px 28px;
            background: linear-gradient(180deg, #e6cfaa, #8f633e);
            box-shadow: 0 20px 32px rgba(0, 0, 0, 0.28);
          }

          .label {
            position: absolute;
            left: ${variant.kind === "hero" ? "64%" : variant.kind === "macro" ? "43%" : "39%"};
            bottom: ${variant.kind === "hero" ? "17%" : "16%"};
            padding: 12px 22px;
            border: 1px solid rgba(230, 207, 170, 0.36);
            border-radius: 999px;
            background: rgba(28, 17, 22, 0.62);
            color: #f8ead4;
            font-size: ${variant.kind === "hero" ? "31px" : "25px"};
            box-shadow: 0 16px 35px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          }

          .hero-space {
            position: absolute;
            left: 0;
            top: 0;
            width: 48%;
            height: 100%;
            background: linear-gradient(90deg, rgba(19, 13, 18, 0.72), transparent);
            display: ${variant.kind === "hero" ? "block" : "none"};
          }
        </style>
      </head>
      <body>
        <div class="scene">
          <div class="hero-space"></div>
          ${powder(variant.kind)}
          <div class="table"></div>
          <div class="shadow"></div>
          <div class="box"></div>
          <div class="ribbon"></div>
          <div class="tools">
            <span class="tool-bag"></span>
            <span class="tool-tip"></span>
            <span class="nozzle"></span>
          </div>
          <div class="wrap">
            <span class="leaf one"></span>
            <span class="leaf two"></span>
            <span class="leaf three"></span>
            ${flowers}
          </div>
          <div class="label">O.make</div>
        </div>
      </body>
    </html>`;
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--disable-background-networking", "--disable-component-update", "--disable-sync", "--no-first-run"],
  });

  for (const variant of variants) {
    const page = await browser.newPage({ viewport: { width: variant.width, height: variant.height }, deviceScaleFactor: 1 });
    await page.setContent(sceneHtml(variant), { waitUntil: "load" });
    await page.screenshot({ path: path.join(outDir, variant.file), type: "png" });
    await page.close();
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
