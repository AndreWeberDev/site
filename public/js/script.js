// Dados dos projetos (simulando o arquivo JSON)
const projetos = [
    {
        "id": "01",
        "nome": "Dino Google",
        "descricao": "Jogo do dinossauro feito em JS.",
        "link": "https://scratch.mit.edu/projects/711633476",
        "imagem": "./assets/img/img-sei-la.png"
    },
    {
        "id": "02",
        "nome": "Gerador de Cards Aleatórios RPG",
        "descricao": "Um gerador de cards com informações de um personagem de MMORPG feito em JS, HTML e CSS.",
        "link": "https://github.com/Juninm0/rpgcard",
        "imagem": "./assets/img/img-sei-la.png"
    },
    {
        "id": "03",
        "nome": "Piskel Art",
        "descricao": "Uma pequena arte de pixels criativa.",
        "link": "https://github.com/Juninm0",
        "imagem": "./assets/img/img-sei-la.png"
    },
    {
        "id": "04",
        "nome": "Fruit Ninja",
        "descricao": "Um clássico jogo de celular recriado para web.",
        "link": "https://juninm0.github.io/fruitninja/",
        "imagem": "./assets/img/img-sei-la.png"
    },
    {
        "id": "05",
        "nome": "Mario Game",
        "descricao": "Um dos meus primeiros jogos feito quase inteiramente em JavaScript.",
        "link": "https://github.com/Juninm0",
        "imagem": "./assets/img/img-sei-la.png"
    },
    {
        "id": "06",
        "nome": "Próximo Projeto",
        "descricao": "Novo projeto em desenvolvimento.",
        "link": "https://github.com/Juninm0",
        "imagem": "./assets/img/img-sei-la.png"
    }
];

// Função para carregar projetos na tabela
function carregarProjetos() {
    const tabelaProjetos = document.getElementById('tabela-projetos');
    if (!tabelaProjetos) return;
    
    const tbody = tabelaProjetos.getElementsByTagName('tbody')[0];
    tbody.innerHTML = ''; // Limpa a tabela
    
    projetos.forEach(projeto => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${projeto.id}</td>
            <td><img src="${projeto.imagem}" alt="${projeto.nome}" style="width: 50px; height: 50px; object-fit: cover;"></td>
            <td>${projeto.nome}</td>
            <td>${projeto.descricao}</td>
            <td><a href="${projeto.link}" target="_blank">${projeto.link}</a></td>
        `;
        tbody.appendChild(linha);
    });
}

// Função para adicionar novo projeto
function adicionarProjeto(event) {
    event.preventDefault();
    
    const form = event.target;
    const novoProjeto = {
        id: String(projetos.length + 1).padStart(2, '0'),
        nome: form.nome.value,
        descricao: form.descricao.value,
        link: form.link.value,
        imagem: form.imagem.value
    };
    
    projetos.push(novoProjeto);
    carregarProjetos();
    form.reset();
    
    alert('Projeto adicionado com sucesso!');
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    carregarProjetos();
    
    const formProjeto = document.getElementById('form-projeto');
    if (formProjeto) {
        formProjeto.addEventListener('submit', adicionarProjeto);
    }
});
