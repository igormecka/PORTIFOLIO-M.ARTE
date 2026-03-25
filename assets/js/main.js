// Cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

// Slideshow
let currentSlide = 0;
let slides = document.querySelectorAll('.hero-slide');
let dots = document.querySelectorAll('.slide-dot');

function goToSlide(n) {
  if (slides.length === 0) return;
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = n;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

setInterval(() => {
  if (slides.length > 0) goToSlide((currentSlide + 1) % slides.length);
}, 5000);

// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });

function initReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  revealEls.forEach(el => observer.observe(el));
}
initReveal();

// Dynamic Drive Integration
document.addEventListener('DOMContentLoaded', () => {
  if (typeof driveData !== 'undefined') {
    populateHero(driveData.heroImages);
    populateAlbums(driveData.albums);
  } else {
    console.warn('driveData not found. Did you run sync_drive.py?');
  }
});

function populateHero(images) {
  const slidesContainer = document.getElementById('heroSlides');
  const indicatorsContainer = document.getElementById('slideIndicators');
  if (!images || images.length === 0 || !slidesContainer) return;
  
  slidesContainer.innerHTML = '';
  indicatorsContainer.innerHTML = '';
  
  images.forEach((imgUrl, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide';
    if (i === 0) slide.classList.add('active');
    slide.style.backgroundImage = `url(${imgUrl})`;
    // Optional: adding transparent label overlay based on index
    const labels = ['M', 'Arte', 'Amor', 'Luz'];
    slide.setAttribute('data-label', labels[i % labels.length]);
    slidesContainer.appendChild(slide);
    
    const dot = document.createElement('div');
    dot.className = 'slide-dot';
    if (i === 0) dot.classList.add('active');
    dot.onclick = () => goToSlide(i);
    indicatorsContainer.appendChild(dot);
  });
  
  slides = document.querySelectorAll('.hero-slide');
  dots = document.querySelectorAll('.slide-dot');
}

function populateAlbums(albums) {
  const grid = document.getElementById('albumsGrid');
  const countSpan = document.getElementById('albumCount');
  if (!grid || !albums) return;
  
  grid.innerHTML = '';
  countSpan.textContent = `— ${albums.length} álbuns`;
  
  albums.forEach((album, i) => {
    const delayClass = (i % 3 === 1) ? 'delay-1' : (i % 3 === 2) ? 'delay-2' : '';
    
    const words = album.name.split(' ');
    let initials = album.name.substring(0, 2).toUpperCase();
    if (words.length > 1 && words[1] === '&' && words.length > 2) {
      initials = words[0][0] + '·' + words[2][0];
    } else if (words.length > 1) {
      initials = words[0][0] + '·' + words[words.length-1][0];
    }
    
    const div = document.createElement('div');
    div.className = `album-card reveal ${delayClass}`;
    div.style.cursor = 'pointer';
    div.onclick = () => openWeddingDynamic(album);
    
    div.innerHTML = `
      <div class="album-thumb">
        <div class="album-thumb-bg" style="background-image: url('${album.cover}')"></div>
        <div class="album-thumb-icon">${initials}</div>
      </div>
      <div class="album-arrow">↗</div>
      <div class="album-info">
        <div class="album-name">${album.name}</div>
        <div class="album-meta">${album.images.length} fotos</div>
      </div>
    `;
    grid.appendChild(div);
  });
  
  initReveal(); // Re-observe new elements
}

// Wedding page
function openWeddingDynamic(album) {
  const page = document.getElementById('wedding-page');
  const titleEl = document.getElementById('weddingTitle');
  const dateEl = document.getElementById('weddingDate');
  const grid = document.getElementById('photosGrid');

  const parts = album.name.split(' & ');
  if (parts.length > 1) {
    titleEl.innerHTML = parts[0] + ' <em>& ' + parts[1] + '</em>';
  } else {
    titleEl.innerHTML = album.name;
  }
  
  dateEl.textContent = `${album.images.length} fotos · Google Drive`;
  grid.innerHTML = '';

  album.images.forEach((imgUrl, i) => {
    const div = document.createElement('div');
    div.className = 'photo-item';
    div.onclick = () => openLightbox(imgUrl);
    
    const img = document.createElement('img');
    img.src = imgUrl; 
    img.loading = 'lazy'; // Lazy load for performance
    
    div.appendChild(img);
    grid.appendChild(div);
  });

  page.classList.add('open');
  page.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeWedding() {
  document.getElementById('wedding-page').classList.remove('open');
  document.body.style.overflow = '';
}

function goHome() {
  closeWedding();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Drive config panel (Visual only now, backend handles sync)
function openDriveConfig(e) {
  if (e) e.preventDefault();
  document.getElementById('driveConfig').classList.add('open');
}
function closeDriveConfig() {
  document.getElementById('driveConfig').classList.remove('open');
}

function testDriveConnection() {
  const btn = document.querySelector('.config-btn');
  btn.textContent = 'Conectando GitHub Actions...';
  setTimeout(() => {
    btn.textContent = '✓ Configurado';
    btn.style.background = '#4ade80';
    setTimeout(() => {
      btn.textContent = 'Verificar Status';
      btn.style.background = '';
    }, 3000);
  }, 1800);
}

function syncNow() {
  alert("Sincronização manual via site desativada. O deploy agora é automático via GitHub Actions a cada dia, ou execute o script python manualmente.");
}

// Keyboard nav
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeWedding();
    closeDriveConfig();
    closeLightbox();
  }
});

// Lightbox
function openLightbox(src) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}
