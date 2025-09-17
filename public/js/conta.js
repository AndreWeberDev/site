// Verificar autenticação e carregar dados da conta
document.addEventListener('DOMContentLoaded', function() {
  if (!checkAuth()) return;
  
  loadUserInfo();
  
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', handleChangePassword);
  }
});

function loadUserInfo() {
  const userInfo = document.getElementById('userInfo');
  if (!userInfo || !auth.currentUser) return;
  
  userInfo.innerHTML = `
    <h2>Informações da Conta</h2>
    <p><strong>Nome:</strong> ${auth.currentUser.name}</p>
    <p><strong>Email:</strong> ${auth.currentUser.email}</p>
    <p><strong>Tipo:</strong> ${auth.currentUser.isAdmin ? 'Administrador' : 'Usuário'}</p>
    <p><strong>Status:</strong> ${auth.currentUser.verified ? 'Verificado' : 'Não verificado'}</p>
  `;
}

function handleChangePassword(e) {
  e.preventDefault();
  
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;
  
  if (auth.currentUser.password !== currentPassword) {
    showError('Senha atual incorreta');
    return;
  }
  
  if (newPassword !== confirmNewPassword) {
    showError('Novas senhas não coincidem');
    return;
  }
  
  try {
    auth.validatePassword(newPassword);
    
    // Atualizar senha
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === auth.currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      auth.currentUser.password = newPassword;
      
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(auth.currentUser));
      
      showSuccess('Senha alterada com sucesso!');
      e.target.reset();
    }
  } catch (error) {
    showError(error.message);
  }
}