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

// Dust particles
function createDust() {
  const dustContainer = document.getElementById('dust');
  if(!dustContainer) return;
  for(let i=0; i<40; i++) {
    let p = document.createElement('div');
    p.className = 'dust-particle';
    let size = Math.random() * 3 + 1;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (Math.random() * 15 + 10) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    dustContainer.appendChild(p);
  }
}
document.addEventListener('DOMContentLoaded', createDust);

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
  
  // Duplicar imagens para criar o efeito de "Loop Infinito" sem deixar buracos no final
  let loopImages = [];
  while (loopImages.length < 20) { 
     loopImages = [...loopImages, ...images]; 
  }
  
  loopImages.forEach((imgUrl) => {
    const img = document.createElement('img');
    img.src = imgUrl + '&sz=w1000';
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
      <div class="album-thumb" style="background-image: url('${album.cover}&sz=w800')">
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
            thumbBg.style.backgroundImage = `url('${album.images[imgIdx]}&sz=w800')`;
            setTimeout(() => { isScrolling = false; }, 300); 
            e.stopPropagation(); 
        }
    }, { passive: false });
    
    div.addEventListener('mouseleave', () => {
        imgIdx = 0;
        thumbBg.style.backgroundImage = `url('${album.cover}&sz=w800')`;
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
    div.onclick = () => openLightbox(imgUrl, album.images, i);
    
    const img = document.createElement('img');
    img.src = imgUrl + '&sz=w800'; 
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
    if(typeof closeWedding === 'function') closeWedding();
    if(typeof closeDriveConfig === 'function') closeDriveConfig();
    closeLightbox();
  }
  const lb = document.getElementById('lightbox');
  if (lb && lb.classList.contains('open')) {
      if (e.key === 'ArrowLeft') prevLightboxImage();
      if (e.key === 'ArrowRight') nextLightboxImage();
  }
});

// Lightbox Slider Logic
let currentLightboxImages = [];
let currentLightboxIndex = 0;

function openLightbox(src, allImages = [], index = 0) {
  const lightbox = document.getElementById('lightbox');
  const thumbsContainer = document.getElementById('lightboxThumbnails');
  
  if (allImages && allImages.length > 0) {
    currentLightboxImages = allImages;
    currentLightboxIndex = index;
  } else {
    currentLightboxImages = [src];
    currentLightboxIndex = 0;
  }
  
  updateLightboxView();
  lightbox.classList.add('open');
  
  if (thumbsContainer) {
    thumbsContainer.innerHTML = '';
    currentLightboxImages.forEach((imgUrl, i) => {
      const thumb = document.createElement('img');
      thumb.src = imgUrl + '&sz=w150';
      thumb.className = i === currentLightboxIndex ? 'lb-thumb active' : 'lb-thumb';
      thumb.onclick = (e) => {
        e.stopPropagation();
        currentLightboxIndex = i;
        updateLightboxView();
      };
      thumbsContainer.appendChild(thumb);
    });
  }
}

function updateLightboxView() {
  const imgEl = document.getElementById('lightboxImg');
  if(!imgEl) return;
  const src = currentLightboxImages[currentLightboxIndex] + '&sz=w1600';
  
  imgEl.style.opacity = 0;
  setTimeout(() => { 
      imgEl.src = src; 
      imgEl.style.opacity = 1; 
  }, 150); // M.arte subtle transition
  
  const thumbs = document.querySelectorAll('.lb-thumb');
  thumbs.forEach((t, i) => {
    if(i === currentLightboxIndex) {
        t.classList.add('active');
        t.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    } else {
        t.classList.remove('active');
    }
  });
}

function prevLightboxImage(e) {
  if (e) e.stopPropagation();
  if (currentLightboxImages.length <= 1) return;
  currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
  updateLightboxView();
}

function nextLightboxImage(e) {
  if (e) e.stopPropagation();
  if (currentLightboxImages.length <= 1) return;
  currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxImages.length;
  updateLightboxView();
}

function closeLightbox(e) {
  if (e && e.target !== document.getElementById('lightbox') && !e.target.classList.contains('lightbox-close')) return;
  const lb = document.getElementById('lightbox');
  if(lb) lb.classList.remove('open');
}

// Add event listener to close when clicking outside img
const lb = document.getElementById('lightbox');
if(lb) lb.addEventListener('click', closeLightbox);
