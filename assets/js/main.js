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
  const container = document.getElementById('muralBg');
  if(!container || !images || images.length === 0) return;
  
  container.innerHTML = '';
  
  const track = document.createElement('div');
  track.className = 'mural-track';
  container.appendChild(track);
  
  // Duplicar imagens pra preencher a tela caso tenham poucas
  let allImages = [];
  while(allImages.length < 15) {
     allImages = [...allImages, ...images];
  }
  
  allImages.forEach((imgUrl) => {
    const img = document.createElement('img');
    img.src = imgUrl;
    img.className = 'mural-img';
    track.appendChild(img);
  });
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
    
    let imgIdx = 0;
    let isScrolling = false;

    div.innerHTML = `
      <div class="album-thumb" style="background-image: url('${album.cover}')">
        <div class="album-thumb-icon" style="position:absolute;font-family:var(--serif);font-size:3rem;font-style:italic;color:rgba(201,169,110,0.3);top:50%;left:50%;transform:translate(-50%,-50%);">${initials}</div>
      </div>
      <div class="album-arrow" style="position:absolute;top:1rem;right:1rem;color:var(--gold-dim);opacity:0.8;">↗</div>
      <div class="album-info" style="position:absolute;bottom:0;width:100%;padding:1.5rem;background:linear-gradient(to top,rgba(10,10,10,0.9),transparent);">
        <div class="album-name" style="font-family:var(--serif);font-size:1.2rem;">${album.name}</div>
        <div class="album-meta" style="font-family:var(--mono);font-size:0.6rem;letter-spacing:0.1em;color:var(--gold-dim);margin-top:0.2rem;">${album.images.length} FOTOS ↓ SCROLL</div>
      </div>
    `;

    const thumbBg = div.querySelector('.album-thumb');
    
    div.addEventListener('wheel', (e) => {
        if(album.images && album.images.length > 1) {
            e.preventDefault();
            if(isScrolling) return;
            isScrolling = true;
            if(e.deltaY > 0) {
                imgIdx = (imgIdx + 1) % album.images.length;
            } else {
                imgIdx = (imgIdx - 1 + album.images.length) % album.images.length;
            }
            thumbBg.style.backgroundImage = `url('${album.images[imgIdx]}')`;
            setTimeout(() => { isScrolling = false; }, 300); 
            e.stopPropagation(); 
        }
    }, { passive: false });
    
    div.addEventListener('mouseleave', () => {
        imgIdx = 0;
        thumbBg.style.backgroundImage = `url('${album.cover}')`;
    });

    // Manter o clique pra abrir a janela original
    div.onclick = () => openWeddingDynamic(album);
    
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
