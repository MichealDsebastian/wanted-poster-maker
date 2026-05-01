const poster = document.getElementById("poster");
const previewImage = document.getElementById("previewImage");
const photoEmpty = document.getElementById("photoEmpty");
const imageInput = document.getElementById("imageInput");
const nameInput = document.getElementById("nameInput");
const bountyInput = document.getElementById("bountyInput");
const nameSizeInput = document.getElementById("nameSizeInput");
const nameXInput = document.getElementById("nameXInput");
const nameYInput = document.getElementById("nameYInput");
const bountySizeInput = document.getElementById("bountySizeInput");
const zoomInput = document.getElementById("zoomInput");
const photoXInput = document.getElementById("photoXInput");
const photoYInput = document.getElementById("photoYInput");
const nameText = document.getElementById("nameText");
const bountyText = document.getElementById("bountyText");
const randomButton = document.getElementById("randomButton");
const downloadButton = document.getElementById("downloadButton");

const POSTER_WIDTH = 1200;
const POSTER_HEIGHT = 1708;
const TEMPLATE_SRC = "assets/wanted-template.webp";
const TEXTURE_SRC = "assets/paper-texture-overlay.webp";

const formatBounty = (value) => {
  const cleaned = value.replace(/[^\d]/g, "");
  if (!cleaned) return "0";
  return Number(cleaned).toLocaleString("en-US");
};

const syncPoster = () => {
  const posterName = nameInput.value.trim() || "Unknown Pirate";
  const posterBounty = formatBounty(bountyInput.value);

  nameText.textContent = posterName;
  nameText.dataset.text = posterName;
  bountyText.textContent = posterBounty;
  bountyText.dataset.text = posterBounty;

  poster.style.setProperty("--name-size", Number(nameSizeInput.value) / 100);
  poster.style.setProperty("--name-x", `${nameXInput.value}%`);
  poster.style.setProperty("--name-y", `${nameYInput.value}%`);
  poster.style.setProperty("--bounty-size", Number(bountySizeInput.value) / 100);
  poster.style.setProperty("--zoom", Number(zoomInput.value) / 100);
  poster.style.setProperty("--photo-x", `${photoXInput.value}%`);
  poster.style.setProperty("--photo-y", `${photoYInput.value}%`);
};

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    previewImage.src = reader.result;
    previewImage.style.display = "block";
    photoEmpty.style.display = "none";
  });
  reader.readAsDataURL(file);
});

[nameInput, bountyInput, nameSizeInput, nameXInput, nameYInput, bountySizeInput, zoomInput, photoXInput, photoYInput].forEach((control) => {
  control.addEventListener("input", syncPoster);
});

randomButton.addEventListener("click", () => {
  const bounty = Math.floor(Math.random() * 900 + 100) * 1000000;
  bountyInput.value = bounty.toLocaleString("en-US");
  syncPoster();
});

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.addEventListener("load", () => resolve(image), { once: true });
  image.addEventListener("error", reject, { once: true });
  image.src = src;
});

const drawCoverImage = (ctx, image, x, y, width, height) => {
  const zoom = Number(zoomInput.value) / 100;
  const xPercent = Number(photoXInput.value) / 100;
  const yPercent = Number(photoYInput.value) / 100;
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
  const cropWidth = width / scale;
  const cropHeight = height / scale;
  const cropX = (image.naturalWidth - cropWidth) * xPercent;
  const cropY = (image.naturalHeight - cropHeight) * yPercent;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, x, y, width, height);
  ctx.restore();
};

const drawPosterText = (ctx, text, options) => {
  ctx.save();
  ctx.font = `${options.size}px SundayRegular, Georgia, serif`;
  ctx.textAlign = options.align;
  ctx.textBaseline = "top";
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = "#635135";
  ctx.shadowColor = "rgba(42, 31, 21, 0.28)";
  ctx.shadowBlur = 1.8;
  ctx.shadowOffsetX = 1;
  ctx.fillText(text.toUpperCase(), options.x, options.y);
  ctx.restore();

  if (options.texture) {
    const pattern = ctx.createPattern(options.texture, "repeat");
    ctx.save();
    ctx.font = `${options.size}px SundayRegular, Georgia, serif`;
    ctx.textAlign = options.align;
    ctx.textBaseline = "top";
    ctx.globalAlpha = 0.22;
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = pattern;
    ctx.fillText(text.toUpperCase(), options.x, options.y);
    ctx.restore();
  }
};

downloadButton.addEventListener("click", async () => {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = document.createElement("canvas");
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;

  const ctx = canvas.getContext("2d");
  const [template, textTexture] = await Promise.all([
    loadImage(TEMPLATE_SRC),
    loadImage(TEXTURE_SRC)
  ]);
  ctx.drawImage(template, 0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  if (previewImage.src && previewImage.style.display !== "none") {
    const portrait = await loadImage(previewImage.src);
    drawCoverImage(ctx, portrait, POSTER_WIDTH * 0.091, POSTER_HEIGHT * 0.209, POSTER_WIDTH * 0.82, POSTER_HEIGHT * 0.423);
  }

  const posterRect = poster.getBoundingClientRect();
  const scale = POSTER_WIDTH / posterRect.width;
  const nameStyle = getComputedStyle(nameText);
  const bountyStyle = getComputedStyle(bountyText);
  const nameSize = parseFloat(nameStyle.fontSize) * scale;
  const bountySize = parseFloat(bountyStyle.fontSize) * scale;
  const nameY = POSTER_HEIGHT * (Number(nameYInput.value) / 100);
  const bountyY = POSTER_HEIGHT * 0.848;

  drawPosterText(ctx, nameText.textContent, {
    x: POSTER_WIDTH / 2,
    y: nameY,
    size: nameSize,
    align: "center",
    texture: textTexture
  });

  drawPosterText(ctx, bountyText.textContent, {
    x: POSTER_WIDTH * 0.2,
    y: bountyY,
    size: bountySize,
    align: "left",
    texture: textTexture
  });

  const link = document.createElement("a");
  link.download = "wanted-poster.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

syncPoster();
