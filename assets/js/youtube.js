const apiKey = "AIzaSyBnIQh71gnfOOgoVdBhjpbay3o6ebZk-Gg";
const playlistId = "PLTflkR6DW1cMdVm6OeKr9bnqNOCVvxl7i";
const maxResults = 12;

function ensureVideoModalLifecycle() {
  const modalElement = document.getElementById("videoModal");
  const modalVideo = document.getElementById("modalVideo");

  if (!modalElement || !modalVideo || modalElement.dataset.bound === "true") {
    return;
  }

  modalElement.addEventListener("hidden.bs.modal", () => {
    modalVideo.src = "";
  });

  modalElement.dataset.bound = "true";
}

async function fetchPlaylistVideos() {
  const container = document.getElementById("video-cards");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  try {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || !data.items.length) {
      container.innerHTML = "<p class=\"page-meta\">No videos found.</p>";
      return;
    }

    data.items.forEach((item) => {
      const videoId = item.snippet.resourceId.videoId;
      const title = item.snippet.title;
      const thumbnail = item.snippet.thumbnails?.medium?.url || "";
      const summary = "Watch this BorneLabs video and explore the project story behind it.";

      const card = document.createElement("article");
      card.className = "media-card";
      card.setAttribute("data-video-id", videoId);
      card.setAttribute("data-video-title", title);
      card.setAttribute("data-video-summary", summary);
      card.setAttribute("data-bs-toggle", "modal");
      card.setAttribute("data-bs-target", "#videoModal");
      card.style.cursor = "pointer";

      card.innerHTML = `
        <div class="media-thumb-wrap">
          <img src="${thumbnail}" class="media-thumb" alt="${title}">
          <span class="media-play" aria-hidden="true"><i class="bi bi-play-fill"></i></span>
        </div>
        <div class="media-body">
          <p class="media-title">${title}</p>
          <div class="media-meta"><i class="bi bi-youtube"></i> Watch video</div>
        </div>
      `;

      container.appendChild(card);
    });

    ensureVideoModalLifecycle();

    container.onclick = (event) => {
      const card = event.target.closest("[data-video-id]");
      const modalVideo = document.getElementById("modalVideo");
      const modalTitle = document.getElementById("videoModalTitle");
      const modalSummary = document.getElementById("videoModalSummary");
      if (!card || !modalVideo) {
        return;
      }

      const videoId = card.getAttribute("data-video-id");
      const title = card.getAttribute("data-video-title") || "BorneLabs Video";
      const summary = card.getAttribute("data-video-summary") || "Watch this BorneLabs video.";

      modalVideo.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

      if (modalTitle) {
        modalTitle.textContent = title;
      }

      if (modalSummary) {
        modalSummary.textContent = summary;
      }
    };
  } catch (error) {
    console.error("Error loading videos:", error);
    container.innerHTML = "<p class=\"page-meta\">Failed to load videos.</p>";
  }
}

window.fetchPlaylistVideos = fetchPlaylistVideos;
