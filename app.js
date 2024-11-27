const apiKey = '8175fA5f6098c5301022f475da32a2aa';
let token = '';
let currentPage = 1;
const pageSize = 12;
let isLoading = false;
let isEndOfData = false;

const loadingElement = document.getElementById('loading');
const imageGallery = document.getElementById('image-gallery');

document.addEventListener('DOMContentLoaded', async () => {
    await authenticate();

    if (!token) {
        console.error('Token não foi obtido. Verifique a autenticação.');
        return;
    }
    loadImages();
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
    const url = `https://ucsdiscosapi.azurewebsites.net/Discos/records?numeroInicio=${(currentPage - 1) * pageSize + 1}&quantidade=${pageSize}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'TokenApiUCS': token,
            }
        });
        const data = await response.json();
        console.log('Dados recebidos:', data);
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
        img.src = `data:image/jpeg;base64,${image.imagemEmBase64}`; 
        img.alt = image.descricaoPrimaria; 

        card.appendChild(img);
        col.appendChild(card);
        imageGallery.appendChild(col);
    });
}


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
