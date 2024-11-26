const API_KEY = "8175fA5f6098c5301022f475da32a2aa";
const API_BASE_URL = "https://ucsdiscosapi.azurewebsites.net";
let token = null;
let offset = 0;
let isLoading = false;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Primeiro, autenticar com a chave API
        token = await authenticate();
        if (token) {
            // Se autenticação foi bem sucedida, carrega os álbuns iniciais
            await loadAlbums(12);
            setupScrollListener();
        }
    } catch (error) {
        console.error("Erro na inicialização:", error);
    }
});

// Função de autenticação - usa a chave API
async function authenticate() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/Discos/autenticar`, {
            method: "POST",
            headers: {
                "ChaveApi": API_KEY // Usa a chave API para autenticação
            }
        });

        if (!response.ok) {
            throw new Error(`Erro de autenticação: ${response.status}`);
        }

        // Retorna o token como texto
        const tokenResponse = await response.text();
        return tokenResponse;

    } catch (error) {
        console.error("Erro na autenticação:", error);
        alert("Erro ao autenticar com a API. Por favor, recarregue a página.");
        return null;
    } finally {
        showLoading(false);
    }
}

// Função para carregar álbuns - usa o token de autenticação
async function loadAlbums(count) {
    if (isLoading || !token) return;
    isLoading = true;
    showLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/Discos?offset=${offset}&limit=${count}`, {
            headers: {
                "Authorization": `Bearer ${token}` // Usa o token para autorização
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar álbuns: ${response.status}`);
        }

        const albums = await response.json();
        renderAlbums(albums);
        offset = (offset + count) % 105; // Volta ao início após 105 registros

    } catch (error) {
        console.error("Erro ao carregar álbuns:", error);
        if (error.message.includes("401")) {
            // Se o token expirou, tenta renovar
            token = await authenticate();
            if (token) {
                await loadAlbums(count);
            }
        }
    } finally {
        showLoading(false);
        isLoading = false;
    }
}

// Função para carregar detalhes de um álbum - usa o token de autenticação
async function loadAlbumDetails(id) {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/Discos/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}` // Usa o token para autorização
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar detalhes: ${response.status}`);
        }

        const album = await response.json();
        showModal(album);

    } catch (error) {
        console.error("Erro ao carregar detalhes do álbum:", error);
        if (error.message.includes("401")) {
            // Se o token expirou, tenta renovar
            token = await authenticate();
            if (token) {
                await loadAlbumDetails(id);
            }
        }
    } finally {
        showLoading(false);
    }
}

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

function showLoading(show) {
    const loading = document.getElementById("loading");
    loading.style.display = show ? "flex" : "none";
}

function setupScrollListener() {
    window.addEventListener("scroll", () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            loadAlbums(4);
        }
    });
}
