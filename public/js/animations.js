// Sistema de animações interativas estilo Apple

// Intersection Observer para animações on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      entry.target.classList.add('animate-in');
    }
  });
}, observerOptions);

// Observar elementos para animação
document.addEventListener('DOMContentLoaded', function() {
  // Elementos para animar
  const elementsToAnimate = document.querySelectorAll(
    '.project-card, .cards, .intro-card, .interests-card, .journey-card, .goals-card, .social-card'
  );
  
  elementsToAnimate.forEach(el => {
    observer.observe(el);
  });

  // Animação de digitação para títulos
  animateTyping();
  
  // Parallax suave para elementos
  setupParallax();
  
  // Animações de hover aprimoradas
  setupHoverEffects();
});

// Animação de digitação
function animateTyping() {
  const titles = document.querySelectorAll('h1, h2');
  titles.forEach((title, index) => {
    const text = title.textContent;
    title.textContent = '';
    title.style.borderRight = '2px solid #8ab4f8';
    
    let i = 0;
    const timer = setTimeout(() => {
      const typeInterval = setInterval(() => {
        title.textContent += text[i];
        i++;
        if (i >= text.length) {
          clearInterval(typeInterval);
          setTimeout(() => {
            title.style.borderRight = 'none';
          }, 500);
        }
      }, 50);
    }, index * 200);
  });
}

// Parallax suave (desabilitado para ícones de projetos)
function setupParallax() {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.profile-image');
    
    parallaxElements.forEach(el => {
      const speed = 0.2;
      el.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });
}

// Efeitos de hover aprimorados
function setupHoverEffects() {
  // Efeito ripple nos botões
  const buttons = document.querySelectorAll('.btncard, .btn-primary, .btn-secondary');
  buttons.forEach(button => {
    button.addEventListener('click', createRipple);
  });
  
  // Efeito magnetic nos cards
  const cards = document.querySelectorAll('.project-card, .cards');
  cards.forEach(card => {
    card.addEventListener('mousemove', magneticEffect);
    card.addEventListener('mouseleave', resetMagnetic);
  });
}

// Criar efeito ripple
function createRipple(e) {
  const button = e.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
  `;
  
  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
}

// Efeito magnético
function magneticEffect(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  
  card.style.transform = `
    translateY(-12px) 
    scale(1.03) 
    rotateX(${y * 0.1}deg) 
    rotateY(${x * 0.1}deg)
  `;
}

// Reset efeito magnético
function resetMagnetic(e) {
  const card = e.currentTarget;
  card.style.transform = 'translateY(0) scale(1) rotateX(0) rotateY(0)';
}

// Adicionar CSS para ripple
const rippleCSS = `
  @keyframes ripple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
`;

const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Smooth scroll para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Animação de loading para formulários
function showLoading(element) {
  element.classList.add('loading');
  element.disabled = true;
}

function hideLoading(element) {
  element.classList.remove('loading');
  element.disabled = false;
}

// Exportar funções para uso global
window.showLoading = showLoading;
window.hideLoading = hideLoading;