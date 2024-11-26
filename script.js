const API_KEY = "8175fA5f6098c5301022f475da32a2aa";
const API_BASE_URL = "https://ucsdiscosapi.azurewebsites.net";
let token = null;
let offset = 0;
let isLoading = false;

// Inicialização
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await initializeApp();
    } catch (error) {
        console.error("Erro na inicialização:", error);
    }
});

async function initializeApp() {
    try {
        token = await authenticate();
        if (token) {
            await loadAlbums(12);
            setupScrollListener();
        }
    } catch (error) {
        console.error("Erro na inicialização:", error);
    }
}

async function authenticate() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/Discos/autenticar`, {
            method: "POST",
            headers: {
                "ChaveApi": API_KEY,
                "Content-Type": "text/plain"
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro na resposta:", errorText);
            throw new Error(`Erro de autenticação: ${response.status}`);
        }

        const tokenText = await response.text();
        console.log("Token recebido com sucesso");
        return tokenText;

    } catch (error) {
        console.error("Erro na autenticação:", error);
        throw error;
    } finally {
        showLoading(false);
    }
}

async function loadAlbums(count) {
    if (isLoading || !token) return;
    isLoading = true;
    showLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/Discos?offset=${offset}&limit=${count}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "text/plain"
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro na resposta dos álbuns:", errorText);
            throw new Error(`Erro ao carregar álbuns: ${response.status}`);
        }

        const albums = await response.json();
        renderAlbums(albums);
        offset = (offset + count) % 105;

    } catch (error) {
        console.error("Erro ao carregar álbuns:", error);
        if (error.message.includes("401")) {
            // Se receber 401 (Unauthorized), tenta renovar o token
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

async function loadAlbumDetails(id) {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/Discos/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "text/plain"
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro na resposta dos detalhes:", errorText);
            throw new Error(`Erro ao carregar detalhes: ${response.status}`);
        }

        const album = await response.json();
        showModal(album);

    } catch (error) {
        console.error("Erro ao carregar detalhes do álbum:", error);
        if (error.message.includes("401")) {
            token = await authenticate();
            if (token) {
                await loadAlbumDetails(id);
            }
        }
    } finally {
        showLoading(false);
    }
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
        const threshold = 100;
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - threshold && !isLoading) {
            loadAlbums(4);
        }
    });
}
