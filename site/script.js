const supabaseUrl = 'https://efhjbxtivxzunhpjwidh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaGpieHRpdnh6dW5ocGp3aWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzgzNjQsImV4cCI6MjA4MDExNDM2NH0.KFP5GweIn--86EfFsTnd7gQ1eM_Ddpikr5V7xZRNwdU';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async function () {
    // --- Render Logic ---
    function renderCards(container, data, type) {
        if (!container) return;
        container.innerHTML = '';
        
        if (data.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%; color:#666;">لا يوجد محتوى حالياً.</p>';
            return;
        }

        data.forEach(item => {
            const image = item.image_url || item.cover_url || 'https://via.placeholder.com/300x200';
            const title = item.title;
            const date = item.date;
            
            const card = document.createElement('div');
            card.className = 'card';
            
            card.innerHTML = `
                <img src="${image}" alt="${title}">
                <div class="card-content">
                    <h3>${title}</h3>
                    <p class="card-date">${date}</p>
                    <a href="#" class="card-button" onclick="alert('تفاصيل: ${title}')">إقرأ المزيد</a>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // --- Fetch Data ---
    try {
        // Get News
        const { data: newsData } = await supabase.from('news')
            .select('*')
            .eq('status', 'published')
            .order('date', { ascending: false });

        // Get Announcements
        const { data: announcementsData } = await supabase.from('announcements')
            .select('*')
            .order('date', { ascending: false });

        // Populate Sections
        const latestAnnouncementsContainer = document.getElementById('latest-announcements-container');
        if (latestAnnouncementsContainer && announcementsData) {
            renderCards(latestAnnouncementsContainer, announcementsData.slice(0, 3), 'announcements');
        }

        const latestNewsContainer = document.getElementById('latest-news-container');
        if (latestNewsContainer && newsData) {
            const news = newsData.filter(n => n.category === 'news');
            renderCards(latestNewsContainer, news.slice(0, 3), 'news');
        }

        const latestProjectsContainer = document.getElementById('latest-projects-container');
        if (latestProjectsContainer && newsData) {
            const projects = newsData.filter(n => n.category === 'projects');
            renderCards(latestProjectsContainer, projects.slice(0, 3), 'projects');
        }

    } catch (error) {
        console.error("Error fetching data:", error);
    }
    
    // Slider Logic
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        const nextSlide = document.querySelector('.next-slide');
        const prevSlide = document.querySelector('.prev-slide');
        let currentSlide = 0;

        function showSlide(n) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            slides[n].classList.add('active');
            dots[n].classList.add('active');
        }

        function changeSlide(n) {
            currentSlide = (n + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        if (nextSlide && prevSlide) {
            nextSlide.addEventListener('click', () => changeSlide(currentSlide + 1));
            prevSlide.addEventListener('click', () => changeSlide(currentSlide - 1));
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => changeSlide(index));
        });

        // Initialize slider
        if(slides.length > 0) showSlide(currentSlide);
    }
    
    // Mobile Menu
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            // Add basic style for active class if not in CSS
            if (nav.classList.contains('active')) {
                nav.style.display = 'block';
            } else {
                if (window.innerWidth <= 768) nav.style.display = 'none';
            }
        });
    }
});