const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5487;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rota para servir os projetos
app.get('/projetos', (req, res) => {
    try {
        const dadosPath = path.join(__dirname, 'dados.json');
        const dados = fs.readFileSync(dadosPath, 'utf8');
        const projetos = JSON.parse(dados);
        res.json(projetos);
    } catch (error) {
        console.error('Erro ao ler dados:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para adicionar novo projeto
app.post('/projetos', (req, res) => {
    try {
        const dadosPath = path.join(__dirname, 'dados.json');
        const dados = fs.readFileSync(dadosPath, 'utf8');
        const projetos = JSON.parse(dados);
        
        const novoProjeto = {
            id: String(projetos.length + 1).padStart(2, '0'),
            ...req.body
        };
        
        projetos.push(novoProjeto);
        
        fs.writeFileSync(dadosPath, JSON.stringify(projetos, null, 2));
        res.status(201).json(novoProjeto);
    } catch (error) {
        console.error('Erro ao adicionar projeto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para servir a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});