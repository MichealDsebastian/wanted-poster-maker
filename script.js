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

downloadButton.addEventListener("click", async () => {
  if (!window.html2canvas) {
    alert("Download needs the html2canvas library. Please connect to the internet and try again.");
    return;
  }

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = await html2canvas(poster, {
    backgroundColor: null,
    scale: 3,
    useCORS: true,
    onclone: (clonedDocument) => {
      clonedDocument.getElementById("poster")?.classList.add("download-capture");
    }
  });

  const link = document.createElement("a");
  link.download = "wanted-poster.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

syncPoster();
