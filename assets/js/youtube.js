const apiKey = "AIzaSyBnIQh71gnfOOgoVdBhjpbay3o6ebZk-Gg";
const playlistId = "PLTflkR6DW1cMdVm6OeKr9bnqNOCVvxl7i";
const maxResults = 12; 

async function fetchPlaylistVideos() {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`);
  const data = await res.json();
  const container = document.getElementById("video-cards");
  if (!container) return;

  container.innerHTML = ""; 

  data.items.forEach(item => {
    const videoId = item.snippet.resourceId.videoId;
    const title = item.snippet.title;
    const thumbnail = item.snippet.thumbnails.medium.url;

    const cardCol = document.createElement("div");
    cardCol.className = "col-12 col-md-6 col-lg-4 mb-4";

    cardCol.innerHTML = `
      <div class="card h-100 shadow-sm video-card" style="cursor:pointer;" data-bs-toggle="modal" data-bs-target="#videoModal" data-video-id="${videoId}">
        <div class="video-thumbnail-wrapper" style="position:relative; width:100%; padding-top:56.25%;">
          <img src="${thumbnail}" class="card-img-top position-absolute top-0 start-0 w-100 h-100" alt="${title}" style="object-fit:cover;">
        </div>
        <div class="card-body d-flex justify-content-center">
          <p class="card-text text-center fw-bold mb-0 text-truncate">${title}</p>
        </div>
      </div>
    `;

    container.appendChild(cardCol);
  });

  const videoCards = document.querySelectorAll('[data-video-id]');
  const modalVideo = document.getElementById('modalVideo');

  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      const vid = card.getAttribute('data-video-id');
      modalVideo.src = `https://www.youtube.com/embed/${vid}?autoplay=1`;
    });
  });

  const videoModalEl = document.getElementById('videoModal');
  videoModalEl.addEventListener('hidden.bs.modal', () => {
    modalVideo.src = '';
  });
}

fetchPlaylistVideos();