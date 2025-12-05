
const supabaseUrl = 'https://efhjbxtivxzunhpjwidh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaGpieHRpdnh6dW5ocGp3aWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzgzNjQsImV4cCI6MjA4MDExNDM2NH0.KFP5GweIn--86EfFsTnd7gQ1eM_Ddpikr5V7xZRNwdU';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async function () {
    
    // --- Helper: Render Cards ---
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
            // Basic truncate for description
            const shortDesc = desc.length > 100 ? desc.substring(0, 100) + '...' : desc;
            
            const card = document.createElement('div');
            card.className = 'card';
            
            // Create a simple modal trigger or link for "Read More"
            // For simplicity in this static version, we just alert or show full text in a simple way
            // In a full app, this would go to a details page (e.g., news-details.html?id=...)
            
            card.innerHTML = `
                <img src="${image}" alt="${title}">
                <div class="card-content">
                    <h3>${title}</h3>
                    <p class="card-date">${date}</p>
                    <p style="font-size:14px; color:#555; margin-bottom:15px;">${shortDesc}</p>
                    <button class="card-button" onclick="alert('${title}\\n\\n${desc}')">إقرأ المزيد</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // --- Helper: Setup Search ---
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

    // --- PAGE: Services ---
    const formsList = document.getElementById('forms-list');
    if (formsList) {
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

    // --- PAGE: Contact ---
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

    // --- DATA FETCHING for Content Pages ---
    try {
        // Fetch News (includes Projects and Events)
        const { data: allNews } = await supabase.from('news')
            .select('*')
            .eq('status', 'published')
            .order('date', { ascending: false });
        
        // Fetch Announcements
        const { data: allAnnouncements } = await supabase.from('announcements')
            .select('*')
            .order('date', { ascending: false });

        // Fetch Gallery
        const { data: galleryAlbums } = await supabase.from('albums')
            .select('*, items:media_items(*)')
            .order('date', { ascending: false });


        // --- Render: Home Page (Latest Items) ---
        const latestAnnouncementsContainer = document.getElementById('latest-announcements-container');
        if (latestAnnouncementsContainer && allAnnouncements) {
            renderCards(latestAnnouncementsContainer, allAnnouncements.slice(0, 3), 'announcements');
        }

        const latestNewsContainer = document.getElementById('latest-news-container');
        if (latestNewsContainer && allNews) {
            const news = allNews.filter(n => n.category === 'news');
            renderCards(latestNewsContainer, news.slice(0, 3), 'news');
        }

        const latestProjectsContainer = document.getElementById('latest-projects-container');
        if (latestProjectsContainer && allNews) {
            const projects = allNews.filter(n => n.category === 'projects');
            renderCards(latestProjectsContainer, projects.slice(0, 3), 'projects');
        }

        // --- Render: News Page ---
        const newsContainer = document.getElementById('news-container');
        if (newsContainer && allNews) {
            // Show all items that are NOT projects (so news + events)
            const newsItems = allNews.filter(n => n.category !== 'projects');
            renderCards(newsContainer, newsItems, 'news');
            setupSearch('news-search-input', newsItems, newsContainer, 'news');
        }

        // --- Render: Projects Page ---
        const projectsContainer = document.getElementById('projects-container');
        if (projectsContainer && allNews) {
            const projectItems = allNews.filter(n => n.category === 'projects');
            renderCards(projectsContainer, projectItems, 'projects');
            // Assuming projects might reuse news-search-input or have their own
            const projectSearch = document.getElementById('projects-search-input'); 
            if(projectSearch) setupSearch('projects-search-input', projectItems, projectsContainer, 'projects');
        }

        // --- Render: Announcements Page ---
        const announcementsContainer = document.getElementById('announcements-container');
        if (announcementsContainer && allAnnouncements) {
            renderCards(announcementsContainer, allAnnouncements, 'announcements');
            setupSearch('announcements-search-input', allAnnouncements, announcementsContainer, 'announcements');
        }

        // --- Render: Gallery Page ---
        const gallerySection = document.getElementById('gallery-section');
        if (gallerySection && galleryAlbums) {
            gallerySection.innerHTML = '';
            if (galleryAlbums.length === 0) {
                 gallerySection.innerHTML = '<p style="text-align:center; color:#666;">لا يوجد ألبومات صور حالياً.</p>';
            }
            
            galleryAlbums.forEach((album, index) => {
                if(!album.items || album.items.length === 0) return;

                const albumContainer = document.createElement('div');
                albumContainer.className = 'album-container';
                albumContainer.style.marginBottom = '50px';

                const albumTitle = document.createElement('h2');
                albumTitle.className = 'album-title';
                albumTitle.style.cssText = 'font-size: 28px; color: #00796B; border-bottom: 2px solid #009688; padding-bottom: 10px; margin-bottom: 30px;';
                albumTitle.textContent = album.title;
                albumContainer.appendChild(albumTitle);

                const itemsContainer = document.createElement('div');
                itemsContainer.className = 'gallery-items-container';
                itemsContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;';

                album.items.forEach(item => {
                    const galleryItem = document.createElement('a');
                    galleryItem.href = item.url;
                    galleryItem.className = 'gallery-item';
                    galleryItem.style.cssText = 'position: relative; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); display: block; height: 220px;';
                    
                    // Lightbox attributes
                    galleryItem.setAttribute('data-lightbox', `album-${album.id}`);
                    galleryItem.setAttribute('data-title', item.description || album.title);

                    if (item.type === 'video') {
                        // For video, usually lightbox libraries need specific handling or just link to file
                        // Simple fallback: render a video tag or a placeholder image with play icon
                         galleryItem.innerHTML = `
                            <video src="${item.url}" style="width:100%; height:100%; object-fit:cover;"></video>
                            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-size:40px; text-shadow:0 0 5px black;">
                                <i class="fas fa-play-circle"></i>
                            </div>
                        `;
                        // Remove lightbox attr for video if library doesn't support it easily, 
                        // or let it open raw. Here we keep it simple.
                        galleryItem.removeAttribute('data-lightbox');
                        galleryItem.target = "_blank"; // Open videos in new tab
                    } else {
                        galleryItem.innerHTML = `
                            <img src="${item.url}" alt="${item.description || ''}" style="width:100%; height:100%; object-fit:cover;">
                        `;
                    }
                    itemsContainer.appendChild(galleryItem);
                });

                albumContainer.appendChild(itemsContainer);
                gallerySection.appendChild(albumContainer);
            });
        }

    } catch (error) {
        console.error("Error fetching data:", error);
    }
    
    // --- Mobile Menu Toggle ---
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

    // --- Slider Logic (Home Page) ---
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
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
                    
                    // Determine image content using Picture tag for responsiveness if mobile image exists
                    let imageHTML;
                    if (slide.mobile_image_url) {
                        imageHTML = `
                            <picture>
                                <source media="(max-width: 768px)" srcset="${slide.mobile_image_url}">
                                <img src="${slide.image_url}" alt="${slide.title}">
                            </picture>
                        `;
                    } else {
                        imageHTML = `<img src="${slide.image_url}" alt="${slide.title}">`;
                    }

                    let contentHTML = `
                        ${imageHTML}
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
});