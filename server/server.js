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



// 4. ROTA DE CADASTRO
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(`
      INSERT INTO users (name, email, password)
      VALUES (?, ?, ?)
    `, [name, email, hashedPassword], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email já cadastrado' });
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      
      res.status(201).json({ 
        message: 'Usuário cadastrado com sucesso!',
        userId: this.lastID
      });
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ROTA PARA SIMULAR ENVIO DE EMAIL 2FA
app.post('/api/send-2fa-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    // Simular envio bem-sucedido
    console.log(`📧 Email 2FA enviado para: ${email}`);
    console.log(`🔐 Código: ${code}`);
    
    res.json({ success: true, message: 'Email enviado com sucesso!' });
    
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: 'Falha no envio do email' });
  }
});

// 5. ROTA DE LOGIN
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  });
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
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Banco de dados: SQLite`);
    console.log(`🔐 Autenticação: JWT + bcrypt`);
    console.log(`Acesse: http://localhost:${PORT}`);
});