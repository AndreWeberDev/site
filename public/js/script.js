// Dados dos projetos (simulando o arquivo JSON)
const projetos = [
    {
        "id": "01",
        "nome": "Dino Google",
        "descricao": "Jogo do dinossauro feito em JS.",
        "link": "https://scratch.mit.edu/projects/711633476",
        "imagem": "./assets/img/IconeJogos/controlador.png"
    },
    {
        "id": "02",
        "nome": "Gerador de Cards Aleatórios RPG",
        "descricao": "Um gerador de cards com informações de um personagem de MMORPG feito em JS, HTML e CSS.",
        "link": "https://github.com/Juninm0/rpgcard",
        "imagem": "./assets/img/IconeJogos/controle-de-jogo.png"
    },
    {
        "id": "03",
        "nome": "Mario V2",
        "descricao": "Uma pequena arte de pixels criativa.",
        "link": "https://juninnn.github.io/portifolio/public/index.html",
        "imagem": "./assets/img/IconeJogos/controle-de-video-game (1).png"
    },
    {
        "id": "04",
        "nome": "Fruit Ninja",
        "descricao": "Um clássico jogo de celular recriado para web.",
        "link": "https://juninm0.github.io/fruitninja/",
        "imagem": "./assets/img/IconeJogos/controlador.png"
    },
    {
        "id": "05",
        "nome": "Mario Game",
        "descricao": "Um dos meus primeiros jogos feito quase inteiramente em JavaScript.",
        "link": "https://github.com/Juninm0",
        "imagem": "./assets/img/IconeJogos/controle-de-jogo.png"
    },
    {
        "id": "06",
        "nome": "Próximo Projeto",
        "descricao": "Novo projeto em desenvolvimento.",
        "link": "https://github.com/Juninm0",
        "imagem": "./assets/img/IconeJogos/controle-de-video-game (1).png"
    }
];

// Função para carregar projetos no grid
function carregarProjetos() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = ''; // Limpa o grid
    
    projetos.forEach(projeto => {
        const card = document.createElement('div');
        card.className = 'project-card';
        
        // Define tecnologias baseado no projeto
        const tecnologias = getTecnologias(projeto.nome);
        
        card.innerHTML = `
            <div class="card-image">
                <img src="${projeto.imagem}" alt="${projeto.nome}">
                <div class="card-overlay">
                    <span class="project-id">#${projeto.id}</span>
                </div>
            </div>
            <div class="card-content">
                <h3 class="project-title">${projeto.nome}</h3>
                <p class="project-description">${projeto.descricao}</p>
                <div class="project-tags">
                    ${tecnologias.map(tech => `<span class="tag">${tech}</span>`).join('')}
                </div>
                <div class="card-actions">
                    <a href="${projeto.link}" target="_blank" class="btn-primary">
                        <i class="icon-external"></i> Ver Projeto
                    </a>
                    <button class="btn-secondary" onclick="editarProjeto('${projeto.id}')">
                        <i class="icon-edit"></i> Editar
                    </button>
                </div>
            </div>
        `;
        
        projectsGrid.appendChild(card);
    });
}

// Função para definir tecnologias baseado no nome do projeto
function getTecnologias(nome) {
    const tech = {
        'Dino Google': ['JavaScript', 'HTML5'],
        'Gerador de Cards Aleatórios RPG': ['JavaScript', 'HTML5', 'CSS3'],
        'Piskel Art': ['Pixel Art', 'Design'],
        'Fruit Ninja': ['JavaScript', 'Canvas'],
        'Mario Game': ['JavaScript', 'Game Dev'],
        'Próximo Projeto': ['Em breve']
    };
    return tech[nome] || ['Web'];
}

// Função para editar projeto (placeholder)
function editarProjeto(id) {
    alert(`Editar projeto ${id} - Funcionalidade em desenvolvimento`);
}

// Função para adicionar novo projeto
function adicionarProjeto(event) {
    event.preventDefault();
    
    const form = event.target;
    const icones = [
        "./assets/img/IconeJogos/controlador.png",
        "./assets/img/IconeJogos/controle-de-jogo.png",
        "./assets/img/IconeJogos/controle-de-video-game (1).png"
    ];
    
    const novoProjeto = {
        id: String(projetos.length + 1).padStart(2, '0'),
        nome: form.nome.value,
        descricao: form.descricao.value,
        link: form.link.value,
        imagem: form.imagem.value || icones[projetos.length % 3]
    };
    
    projetos.push(novoProjeto);
    carregarProjetos();
    form.reset();
    
    // Animação de sucesso
    mostrarNotificacao('Projeto adicionado com sucesso!', 'success');
}

// Função para mostrar notificações
function mostrarNotificacao(mensagem, tipo) {
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.textContent = mensagem;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    carregarProjetos();
    
    const formProjeto = document.getElementById('form-projeto');
    if (formProjeto) {
        formProjeto.addEventListener('submit', adicionarProjeto);
    }
});
