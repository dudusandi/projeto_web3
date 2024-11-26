// Configurações da API
const API_KEY = "8175fA5f6098c5301022f475da32a2aa";
const API_BASE_URL = "https://ucsdiscosapi.azurewebsites.net";
let token = null;
let offset = 0;
let isLoading = false;

// Inicialização
document.addEventListener("DOMContentLoaded", async () => {
    await initializeApp();
});

async function initializeApp() {
    token = await authenticate();
    if (token) {
        await loadAlbums(12);
        setupScrollListener();
    }
}

// Autenticação
async function authenticate() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/Discos/autenticar`, {
            method: "POST",
            headers: {
                "Accept": "*/*",
                "ChaveApi": API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Erro de autenticação: ${response.status}`);
        }

        const token = await response.text();
        return token;
    } catch (error) {
        console.error("Erro na autenticação:", error);
        alert("Erro ao autenticar com a API. Por favor, recarregue a página.");
        return null;
    } finally {
        showLoading(false);
    }
}

// Carregamento de Álbuns
async function loadAlbums(count) {
    if (isLoading) return;
    isLoading = true;
    showLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/Discos?offset=${offset}&limit=${count}`, {
            headers: {
                "Accept": "*/*",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar álbuns: ${response.status}`);
        }

        const albums = await response.json();
        renderAlbums(albums);
        offset = (offset + count) % 105; // Reinicia após 105 registros
    } catch (error) {
        console.error("Erro ao carregar álbuns:", error);
        alert("Erro ao carregar álbuns. Tente novamente mais tarde.");
    } finally {
        showLoading(false);
        isLoading = false;
    }
}

// Renderização de Álbuns
function renderAlbums(albums) {
    const gallery = document.getElementById("gallery");
    
    albums.forEach(album => {
        const col = document.createElement("div");
        col.className = "col-12 col-md-6";
        
        const img = document.createElement("img");
        img.src = album.capaUrl;
        img.alt = album.nome;
        img.className = "album-img";
        img.dataset.id = album.id;
        
        img.addEventListener("click", () => loadAlbumDetails(album.id));
        
        col.appendChild(img);
        gallery.appendChild(col);
    });
}

// Carregamento de Detalhes do Álbum
async function loadAlbumDetails(id) {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/Discos/${id}`, {
            headers: {
                "Accept": "*/*",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar detalhes: ${response.status}`);
        }

        const album = await response.json();
        showModal(album);
    } catch (error) {
        console.error("Erro ao carregar detalhes do álbum:", error);
        alert("Erro ao carregar detalhes do álbum. Tente novamente.");
    } finally {
        showLoading(false);
    }
}

// Exibição do Modal
function showModal(album) {
    const modal = new bootstrap.Modal(document.getElementById("albumModal"));
    document.getElementById("albumModalLabel").textContent = album.nome;
    
    document.querySelector(".modal-body").innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${album.capaUrl}" alt="${album.nome}" class="img-fluid mb-3">
            </div>
            <div class="col-md-6">
                <p><strong>Artista:</strong> ${album.artista}</p>
                <p><strong>Ano:</strong> ${album.ano}</p>
                <p><strong>ID:</strong> ${album.id}</p>
            </div>
        </div>
    `;
    
    modal.show();
}

// Controle de Loading
function showLoading(show) {
    const loading = document.getElementById("loading");
    loading.style.display = show ? "flex" : "none";
}

// Configuração do Scroll Infinito
function setupScrollListener() {
    window.addEventListener("scroll", () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            loadAlbums(4);
        }
    });
}
