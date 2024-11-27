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

    if (!token) {
        console.error('Token não foi obtido. Verifique a autenticação.');
        return;
    }

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

async function authenticate() {
    try {
        const response = await fetch('https://ucsdiscosapi.azurewebsites.net/Discos/autenticar', {
            method: 'POST',
            headers: {
                'accept': '*/*',                
                'ChaveApi': apiKey,
            }
        });

        if (!response.ok) {
            throw new Error('Falha na autenticação');
        }

        token = (await response.text()).trim();
        console.log('Token recebido:', token);
    } catch (error) {
        console.error('Erro na autenticação:', error);
    }
}

async function loadImages() {
    isLoading = true;
    toggleLoading(true);

    // Construir a URL com os parâmetros
    const url = `https://ucsdiscosapi.azurewebsites.net/Discos/records?numeroInicio=${(currentPage - 1) * pageSize + 1}&quantidade=${pageSize}`;
    console.log('Tentando carregar imagens da URL:', url);
    console.log('Token usado:', token);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'TokenApiUCS': token,
            }
        });

        // Log detalhado do erro
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Status:', response.status);
            console.log('Status Text:', response.statusText);
            console.log('Resposta do erro:', errorText);
            console.log('Headers enviados:', {
                'accept': '*/*',
                'TokenApiUCS': token
            });
            throw new Error(`Erro ao carregar as imagens: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);

        if (!data || data.length === 0) {
            isEndOfData = true;
            console.log('Nenhuma imagem encontrada.');
            return;
        }

        renderImages(data);
    } catch (error) {
        console.error('Erro ao carregar imagens:', error);
    } finally {
        isLoading = false;
        toggleLoading(false);
    }
}
function toggleLoading(isVisible) {
    loadingElement.style.display = isVisible ? 'block' : 'none';
}

function renderImages(images) {
    images.forEach(image => {
        const col = document.createElement('div');
        col.classList.add('col-6', 'col-md-4', 'mb-4');
        
        const card = document.createElement('div');
        card.classList.add('card', 'image-card');
        card.onclick = () => showModal(image);

        const img = document.createElement('img');
        img.classList.add('card-img-top');
        img.src = `data:image/jpeg;base64,${image.imagemEmBase64}`; // Corrigido: adiciona o prefixo para base64
        img.alt = image.descricaoPrimaria; // Corrigido: usa a descrição primária como alt

        card.appendChild(img);
        col.appendChild(card);
        imageGallery.appendChild(col);
    });
}

// Também precisamos atualizar a função showModal
function showModal(image) {
    const modalTitle = document.getElementById('albumModalLabel');
    const modalImage = document.getElementById('modal-image');
    const modalDescription = document.getElementById('modal-description');

    modalTitle.innerText = image.descricaoPrimaria;
    modalImage.src = `data:image/jpeg;base64,${image.imagemEmBase64}`;
    modalDescription.innerText = image.descricaoSecundaria;

    const modal = new bootstrap.Modal(document.getElementById('albumModal'));
    modal.show();
}
