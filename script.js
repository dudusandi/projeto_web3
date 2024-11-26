const API_KEY = "8175fA5f6098c5301022f475da32a2aa";
const API_URL = "https://ucsdiscosapi.azurewebsites.net/Discos/autenticar";
let token = null;
let offset = 0;

document.addEventListener("DOMContentLoaded", async () => {
  token = await authenticate();
  if (token) {
    await loadAlbums(12);
    setupScrollListener();
  }
});

async function authenticate() {
  try {
    const response = await fetch(`${API_URL}/autenticar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chave: API_KEY })
    });
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Erro ao autenticar:", error);
    alert("Erro ao autenticar. Tente novamente mais tarde.");
    return null;
  }
}

async function loadAlbums(count) {
  showLoading(true);
  try {
    const response = await fetch(`${API_URL}/albums?offset=${offset}&limit=${count}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const albums = await response.json();
    renderAlbums(albums);
    offset = (offset + count) % 105; // Reinicia o ciclo após 105 registros
  } catch (error) {
    console.error("Erro ao carregar álbuns:", error);
  } finally {
    showLoading(false);
  }
}

function renderAlbums(albums) {
  const gallery = document.getElementById("gallery");
  albums.forEach(album => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6";
    col.innerHTML = `<img src="${album.capaUrl}" alt="${album.nome}" data-id="${album.id}">`;
    col.querySelector("img").addEventListener("click", () => loadAlbumDetails(album.id));
    gallery.appendChild(col);
  });
}

async function loadAlbumDetails(id) {
  try {
    const response = await fetch(`${API_URL}/albums/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const album = await response.json();
    showModal(album);
  } catch (error) {
    console.error("Erro ao carregar detalhes do álbum:", error);
  }
}

function showModal(album) {
  const modal = new bootstrap.Modal(document.getElementById("albumModal"));
  document.getElementById("albumModalLabel").textContent = album.nome;
  document.querySelector(".modal-body").innerHTML = `
    <p><strong>Artista:</strong> ${album.artista}</p>
    <p><strong>Ano:</strong> ${album.ano}</p>
    <img src="${album.capaUrl}" alt="${album.nome}" class="img-fluid">
  `;
  modal.show();
}

function showLoading(show) {
  document.getElementById("loading").classList.toggle("d-none", !show);
}

function setupScrollListener() {
  window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      loadAlbums(4);
    }
  });
}
