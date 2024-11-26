const apiKey = '8175fA5f6098c5301022f475da32a2aa';
let token = '';
let currentPage = 1;
const pageSize = 12;
let isLoading = false;
let isEndOfData = false;

const loadingElement = document.getElementById('loading');
const imageGallery = document.getElementById('image-gallery');

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Autenticar e obter o token
    await authenticate();

    // 2. Carregar as primeiras imagens
    loadImages();

    // 3. Configurar rolagem infinita
    window.onscroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading && !isEndOfData) {
            currentPage++;
            loadImages();
        }
    };
});

// Função para autenticar e obter o token
async function authenticate() {
    try {
        const response = await fetch('https://ucsdiscosapi.azurewebsites.net/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('Falha na autenticação');
        }

        const data = await response.json();
        token = data.token;
    } catch (error) {
        console.error('Erro na autenticação:', error);
    }
}

// Função para carregar as imagens
async function loadImages() {
    isLoading = true;
    toggleLoading(true);

    try {
        const response = await fetch(`https://ucsdiscosapi.azurewebsites.net/api/discos?page=${currentPage}&size=${pageSize}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar as imagens');
        }

        const data = await response.json();

        // Caso não haja mais dados
        if (data.length === 0) {
            isEndOfData = true;
        }

        renderImages(data);
    } catch (error) {
        console.error('Erro ao carregar imagens:', error);
    } finally {
        isLoading = false;
        toggleLoading(false);
    }
}

// Função para exibir o loading
function toggleLoading(isVisible) {
    loadingElement.style.display = isVisible ? 'block' : 'none';
}

// Função para renderizar as imagens
function renderImages(images) {
    images.forEach(image => {
        const col = document.createElement('div');
        col.classList.add('col-6', 'col-md-4', 'mb-4');
        
        const card = document.createElement('div');
        card.classList.add('card', 'image-card');
        card.onclick = () => showModal(image);

        const img = document.createElement('img');
        img.classList.add('card-img-top');
        img.src = image.capa;
        img.alt = image.titulo;

        card.appendChild(img);
        col.appendChild(card);
        imageGallery.appendChild(col);
    });
}

// Função para exibir a modal com detalhes
function showModal(image) {
    const modalTitle = document.getElementById('albumModalLabel');
    const modalImage = document.getElementById('modal-image');
    const modalDescription = document.getElementById('modal-description');

    modalTitle.innerText = image.titulo;
    modalImage.src = image.capa;
    modalDescription.innerText = image.descricao;

    const modal = new bootstrap.Modal(document.getElementById('albumModal'));
    modal.show();
}
