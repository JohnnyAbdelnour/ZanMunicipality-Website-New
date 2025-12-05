
const supabaseUrl = 'https://efhjbxtivxzunhpjwidh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaGpieHRpdnh6dW5ocGp3aWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzgzNjQsImV4cCI6MjA4MDExNDM2NH0.KFP5GweIn--86EfFsTnd7gQ1eM_Ddpikr5V7xZRNwdU';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async function () {
    
    // --- 1. Global Setup (Settings, Modals) ---
    await loadSettings();
    setupModal();
    setupContactForm();
    loadSlider(); // Load slider if present

    // --- 2. Page Specific Data Loading ---
    
    // Homepage
    if (document.getElementById('latest-news-container')) {
        await loadHomepageData();
    }

    // News Page
    if (document.getElementById('news-container')) {
        await loadNewsPage();
    }

    // Projects Page
    if (document.getElementById('projects-container')) {
        await loadProjectsPage();
    }

    // Announcements Page
    if (document.getElementById('announcements-container')) {
        await loadAnnouncementsPage();
    }

    // Gallery Page
    if (document.getElementById('gallery-section')) {
        await loadGalleryPage();
    }

    // Services Page
    if (document.getElementById('forms-list')) {
        await loadServicesPage();
    }
});

// --- Settings Logic ---
async function loadSettings() {
    try {
        const { data } = await supabase.from('settings').select('data').eq('id', 1).single();
        if (data && data.data) {
            const s = data.data;
            
            // Update Logo
            const logo = document.getElementById('logo');
            if (logo && s.logo) logo.src = s.logo;
            
            // Update Top Bar
            const topPhone = document.getElementById('top-phone');
            if (topPhone && s.phone) topPhone.innerHTML = `اتصل بنا: <span dir="ltr">${s.phone}</span>`;
            
            const topEmail = document.getElementById('top-email');
            if (topEmail && s.email) topEmail.innerText = `البريد الإلكتروني: ${s.email}`;

            // Update Footer Socials
            const footerFb = document.getElementById('footer-fb');
            if (footerFb && s.facebook) footerFb.href = s.facebook;

            const footerInsta = document.getElementById('footer-insta');
            if (footerInsta && s.instagram) footerInsta.href = s.instagram;

            // Update Contact Page Details
            const contactPhone = document.getElementById('contact-phone');
            if (contactPhone && s.phone) contactPhone.innerHTML = `<strong>الهاتف:</strong> <span dir="ltr">${s.phone}</span>`;

            const contactEmail = document.getElementById('contact-email');
            if (contactEmail && s.email) contactEmail.innerHTML = `<strong>البريد الإلكتروني:</strong> ${s.email}`;

            const contactAddress = document.getElementById('contact-address');
            if (contactAddress && s.address) contactAddress.innerHTML = `<strong>العنوان:</strong> ${s.address}`;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// --- Modal Logic ---
function setupModal() {
    const modalHTML = `
        <div id="details-modal" class="modal">
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <img id="modal-img" class="modal-header-image" src="" alt="">
                <div class="modal-body">
                    <p id="modal-date" style="color:#00796B; margin-bottom:10px; font-size:0.9rem; font-weight:bold;"></p>
                    <h2 id="modal-title"></h2>
                    <p id="modal-text"></p>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('details-modal');
    const closeBtn = modal.querySelector('.close-button');
    
    if(closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => {
        if (e.target == modal) modal.style.display = "none";
    }

    // Mobile Menu
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            if (nav.classList.contains('active')) {
                nav.style.display = 'block';
            } else {
                if (window.innerWidth <= 768) nav.style.display = 'none';
            }
        });
    }
}

// --- Slider Logic ---
async function loadSlider() {
    const sliderContainer = document.querySelector('.slider-container');
    if (!sliderContainer) return;

    try {
        const { data: slidesData } = await supabase
            .from('sliders')
            .select('*')
            .eq('active', true)
            .order('sort_order', { ascending: true })
            .limit(10);

        const slidesWrapper = sliderContainer.querySelector('.slides');
        const dotsWrapper = sliderContainer.querySelector('.slider-dots');
        
        if (slidesData && slidesData.length > 0 && slidesWrapper) {
            slidesWrapper.innerHTML = '';
            if(dotsWrapper) dotsWrapper.innerHTML = '';

            slidesData.forEach((slide, index) => {
                // Create Slide
                const slideDiv = document.createElement('div');
                slideDiv.className = `slide ${index === 0 ? 'active' : ''}`;
                
                let contentHTML = `
                    <img src="${slide.image_url}" alt="${slide.title}">
                    <div class="slide-caption">
                        <h2>${slide.title}</h2>
                        <p>${slide.subtitle}</p>
                    </div>
                `;

                if (slide.link) {
                    contentHTML = `<a href="${slide.link}" style="display:block; width:100%; height:100%; color:inherit; text-decoration:none;">${contentHTML}</a>`;
                }
                
                slideDiv.innerHTML = contentHTML;
                slidesWrapper.appendChild(slideDiv);

                // Create Dot
                if(dotsWrapper) {
                    const dot = document.createElement('span');
                    dot.className = `dot ${index === 0 ? 'active' : ''}`;
                    dot.setAttribute('data-slide', index);
                    dotsWrapper.appendChild(dot);
                }
            });

            // Initialize Animation
            const slidesEls = document.querySelectorAll('.slide');
            const dotsEls = document.querySelectorAll('.dot');
            const nextSlideBtn = document.querySelector('.next-slide');
            const prevSlideBtn = document.querySelector('.prev-slide');
            let currentSlide = 0;

            function showSlide(n) {
                slidesEls.forEach(slide => slide.classList.remove('active'));
                dotsEls.forEach(dot => dot.classList.remove('active'));
                
                if (n >= slidesEls.length) currentSlide = 0;
                else if (n < 0) currentSlide = slidesEls.length - 1;
                else currentSlide = n;

                slidesEls[currentSlide].classList.add('active');
                if(dotsEls[currentSlide]) dotsEls[currentSlide].classList.add('active');
            }

            if (nextSlideBtn) nextSlideBtn.addEventListener('click', () => showSlide(currentSlide + 1));
            if (prevSlideBtn) prevSlideBtn.addEventListener('click', () => showSlide(currentSlide - 1));
            
            dotsEls.forEach((dot, idx) => {
                dot.addEventListener('click', () => showSlide(idx));
            });

            setInterval(() => {
                showSlide(currentSlide + 1);
            }, 5000);

        } else {
            if(slidesWrapper) slidesWrapper.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%; color:#aaa;">لا توجد شرائح عرض حالياً</div>';
        }
    } catch (err) {
        console.error('Error fetching sliders:', err);
    }
}

// --- Data Loading Functions ---

async function loadHomepageData() {
    const latestNewsContainer = document.getElementById('latest-news-container');
    const latestAnnouncementsContainer = document.getElementById('latest-announcements-container');
    const latestProjectsContainer = document.getElementById('latest-projects-container');

    try {
        // Fetch specific small chunks for homepage
        const { data: news } = await supabase.from('news')
            .select('*')
            .eq('status', 'published')
            .order('date', { ascending: false })
            .limit(10); // Get slightly more to filter locally

        const { data: announcements } = await supabase.from('announcements')
            .select('*')
            .order('date', { ascending: false })
            .limit(3);

        if (latestAnnouncementsContainer && announcements) {
            renderCards(latestAnnouncementsContainer, announcements, 'announcements');
        }

        if (news) {
            if (latestNewsContainer) {
                const n = news.filter(x => x.category !== 'projects').slice(0, 3);
                renderCards(latestNewsContainer, n, 'news');
            }
            if (latestProjectsContainer) {
                const p = news.filter(x => x.category === 'projects').slice(0, 3);
                renderCards(latestProjectsContainer, p, 'projects');
            }
        }
    } catch (e) {
        console.error("Error loading homepage data", e);
    }
}

async function loadNewsPage() {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '<p style="text-align:center">جاري تحميل الأخبار...</p>';
    
    try {
        const { data } = await supabase.from('news')
            .select('*')
            .eq('status', 'published')
            .neq('category', 'projects')
            .order('date', { ascending: false })
            .limit(50);
        
        renderCards(newsContainer, data, 'news');
        setupSearch('news-search-input', data, newsContainer, 'news');
    } catch (e) {
        console.error(e);
        newsContainer.innerHTML = '<p style="text-align:center">حدث خطأ أثناء تحميل البيانات</p>';
    }
}

async function loadProjectsPage() {
    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = '<p style="text-align:center">جاري تحميل المشاريع...</p>';
    
    try {
        const { data } = await supabase.from('news')
            .select('*')
            .eq('status', 'published')
            .eq('category', 'projects')
            .order('date', { ascending: false })
            .limit(50);
        
        renderCards(projectsContainer, data, 'projects');
        setupSearch('projects-search-input', data, projectsContainer, 'projects');
    } catch (e) {
        console.error(e);
        projectsContainer.innerHTML = '<p style="text-align:center">حدث خطأ أثناء تحميل البيانات</p>';
    }
}

async function loadAnnouncementsPage() {
    const announcementsContainer = document.getElementById('announcements-container');
    announcementsContainer.innerHTML = '<p style="text-align:center">جاري تحميل الاعلانات...</p>';
    
    try {
        const { data } = await supabase.from('announcements')
            .select('*')
            .order('date', { ascending: false })
            .limit(50);
        
        renderCards(announcementsContainer, data, 'announcements');
        setupSearch('announcements-search-input', data, announcementsContainer, 'announcements');
    } catch (e) {
        console.error(e);
        announcementsContainer.innerHTML = '<p style="text-align:center">حدث خطأ أثناء تحميل البيانات</p>';
    }
}

async function loadGalleryPage() {
    const gallerySection = document.getElementById('gallery-section');
    if (!gallerySection) return;
    
    gallerySection.innerHTML = '<p style="text-align:center">جاري التحميل...</p>';
    
    const urlParams = new URLSearchParams(window.location.search);
    const albumId = urlParams.get('id');

    try {
        if (albumId) {
            // LOAD SINGLE ALBUM WITH ITEMS (Heavier query, but only for one album)
            const { data: album, error } = await supabase
                .from('albums')
                .select('*, items:media_items(*)')
                .eq('id', albumId)
                .single();

            if (error || !album) {
                gallerySection.innerHTML = '<p style="text-align:center">الألبوم غير موجود</p>';
            } else {
                renderAlbumDetail(gallerySection, album);
            }
        } else {
            // LOAD ALBUM LIST (Light query - no items)
            // Critical optimization: removed items:media_items(*)
            const { data: albums } = await supabase
                .from('albums')
                .select('*') 
                .order('date', { ascending: false })
                .limit(50);
            
            renderAlbumList(gallerySection, albums);
        }
    } catch (e) {
        console.error(e);
        gallerySection.innerHTML = '<p style="text-align:center">حدث خطأ أثناء تحميل المعرض</p>';
    }
}

async function loadServicesPage() {
    const formsList = document.getElementById('forms-list');
    if (!formsList) return;

    try {
        const { data: services } = await supabase.from('services').select('*').order('id', { ascending: false });
        
        function renderServices(items) {
            if (!items || items.length === 0) {
                formsList.innerHTML = '<li style="text-align: center; padding: 20px; color: #666;">لا توجد نماذج متاحة حالياً.</li>';
                return;
            }
            formsList.innerHTML = '';
            items.forEach(item => {
                const li = document.createElement('li');
                li.className = 'form-item';
                li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #eee;';
                li.innerHTML = `
                    <span class="form-name" style="font-size: 18px;">${item.title}</span>
                    <a href="${item.file_url}" class="download-button" target="_blank" download style="background: #009688; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none; transition: background 0.3s;">تحميل</a>
                `;
                formsList.appendChild(li);
            });
        }
        renderServices(services);
        
        const formSearchInput = document.getElementById('form-search');
        if (formSearchInput) {
            formSearchInput.addEventListener('input', function() {
                const searchTerm = formSearchInput.value.toLowerCase();
                const filtered = services.filter(s => s.title.toLowerCase().includes(searchTerm));
                renderServices(filtered);
            });
        }
    } catch (e) {
        console.error('Error loading services', e);
    }
}

function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'جاري الإرسال...';
            submitBtn.disabled = true;

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            try {
                const { error } = await supabase.from('messages').insert([{
                    name, email, subject, message,
                    date: new Date().toISOString().split('T')[0],
                    read: false
                }]);

                if (error) throw error;

                alert('تم إرسال رسالتك بنجاح. شكراً لتواصلك معنا.');
                contactForm.reset();
            } catch (error) {
                console.error('Error sending message:', error);
                alert('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقاً.');
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// --- Helpers ---

function renderCards(container, data, type) {
    if (!container) return;
    container.innerHTML = '';
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; color:#666;">لا يوجد محتوى حالياً.</p>';
        return;
    }

    data.forEach(item => {
        const image = item.image_url || item.cover_url || 'https://via.placeholder.com/300x200';
        const title = item.title;
        const date = item.date;
        const desc = item.description || '';
        const shortDesc = desc.length > 100 ? desc.substring(0, 100) + '...' : desc;
        
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <img src="${image}" alt="${title}">
            <div class="card-content">
                <h3>${title}</h3>
                <p class="card-date">${date}</p>
                <p style="font-size:14px; color:#555; margin-bottom:15px;">${shortDesc}</p>
                <button class="card-button">إقرأ المزيد</button>
            </div>
        `;
        
        // Modal Event
        const modal = document.getElementById('details-modal');
        const modalImg = document.getElementById('modal-img');
        const modalDate = document.getElementById('modal-date');
        const modalTitle = document.getElementById('modal-title');
        const modalText = document.getElementById('modal-text');

        const btn = card.querySelector('.card-button');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modalImg.src = image;
            modalTitle.textContent = title;
            modalDate.textContent = date;
            modalText.textContent = desc;
            modal.style.display = "block";
        });

        container.appendChild(card);
    });
}

function setupSearch(inputId, data, container, type) {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = data.filter(item => 
                item.title.toLowerCase().includes(term) || 
                (item.description && item.description.toLowerCase().includes(term))
            );
            renderCards(container, filtered, type);
        });
    }
}

function renderAlbumList(container, albums) {
    container.innerHTML = '';
    if (!albums || albums.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666;">لا يوجد ألبومات صور حالياً.</p>';
        return;
    }
    
    const albumsGrid = document.createElement('div');
    albumsGrid.className = 'albums-grid';
    
    albums.forEach(album => {
        const cover = album.cover_url || 'https://via.placeholder.com/400x300?text=No+Cover';
        
        const albumCard = document.createElement('a');
        albumCard.href = `gallery.html?id=${album.id}`;
        albumCard.className = 'album-card';
        albumCard.innerHTML = `
            <img src="${cover}" alt="${album.title}" class="album-cover">
            <div class="album-info">
                <h3>${album.title}</h3>
                <p>${album.date}</p>
            </div>
        `;
        albumsGrid.appendChild(albumCard);
    });
    container.appendChild(albumsGrid);
}

function renderAlbumDetail(container, album) {
    container.innerHTML = `
        <a href="gallery.html" class="gallery-back-btn">
            <i class="fas fa-arrow-right"></i> عودة للألبومات
        </a>
        <div class="album-header" style="text-align:center; margin-bottom:30px;">
            <h2 style="color:#00796B;">${album.title}</h2>
            <p style="color:#666;">${album.date}</p>
        </div>
    `;

    if (!album.items || album.items.length === 0) {
        container.insertAdjacentHTML('beforeend', '<p style="text-align:center">لا يوجد صور في هذا الألبوم</p>');
        return;
    }

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'gallery-items-container';
    itemsContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;';

    album.items.forEach(item => {
        const galleryItem = document.createElement('a');
        galleryItem.href = item.url;
        galleryItem.className = 'gallery-item';
        galleryItem.style.cssText = 'position: relative; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); display: block; height: 220px;';
        
        galleryItem.setAttribute('data-lightbox', `album-${album.id}`);
        galleryItem.setAttribute('data-title', item.description || album.title);

        if (item.type === 'video') {
            galleryItem.innerHTML = `
                <video src="${item.url}" style="width:100%; height:100%; object-fit:cover;"></video>
                <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-size:40px; text-shadow:0 0 5px black;">
                    <i class="fas fa-play-circle"></i>
                </div>
            `;
            galleryItem.removeAttribute('data-lightbox');
            galleryItem.target = "_blank";
        } else {
            galleryItem.innerHTML = `
                <img src="${item.url}" alt="${item.description || ''}" style="width:100%; height:100%; object-fit:cover;">
            `;
        }
        itemsContainer.appendChild(galleryItem);
    });
    container.appendChild(itemsContainer);
}
