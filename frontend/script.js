// IMPORTANT: Include this script tag in your HTML header:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const supabaseUrl = 'https://efhjbxtivxzunhpjwidh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaGpieHRpdnh6dW5ocGp3aWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzgzNjQsImV4cCI6MjA4MDExNDM2NH0.KFP5GweIn--86EfFsTnd7gQ1eM_Ddpikr5V7xZRNwdU';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async function () {
    const ITEMS_PER_PAGE = 20;

    // --- Fetch Data from Supabase ---
    async function getNews() {
        const { data } = await supabase.from('news').select('*').eq('status', 'published').order('date', { ascending: false });
        return data || [];
    }

    async function getAnnouncements() {
        const { data } = await supabase.from('announcements').select('*').order('date', { ascending: false });
        return data || [];
    }

    async function getGallery() {
        const { data } = await supabase.from('albums').select('*, items:media_items(*)').order('date', { ascending: false });
        return data || [];
    }
    
    // --- Render Logic ---
    function renderCards(container, data, type) {
        if (!container) return;
        container.innerHTML = '';
        data.forEach(item => {
            const image = item.image_url || item.cover_url; // Handle both news and album structures
            const card = document.createElement('div');
            card.className = 'card';
            
            // Handle different object structures
            const title = item.title;
            const date = item.date;
            
            card.innerHTML = `
                <img src="${image}" alt="${title}">
                <div class="card-content">
                    <h3>${title}</h3>
                    <p class="card-date">${date}</p>
                    <a href="#" class="card-button" data-id="${item.id}" data-type="${type}">إقرأ المزيد</a>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // --- Init ---
    const newsData = await getNews();
    const announcementsData = await getAnnouncements();
    const galleryData = await getGallery();

    // Map Backend Data Categories to Frontend Containers
    const latestAnnouncementsContainer = document.getElementById('latest-announcements-container');
    if (latestAnnouncementsContainer) {
        renderCards(latestAnnouncementsContainer, announcementsData.slice(0, 3), 'announcements');
    }

    const latestNewsContainer = document.getElementById('latest-news-container');
    if (latestNewsContainer) {
        // Filter only 'news' category
        const news = newsData.filter(n => n.category === 'news');
        renderCards(latestNewsContainer, news.slice(0, 3), 'news');
    }

    const latestProjectsContainer = document.getElementById('latest-projects-container');
    if (latestProjectsContainer) {
         // Filter only 'projects' category
         const projects = newsData.filter(n => n.category === 'projects');
         renderCards(latestProjectsContainer, projects.slice(0, 3), 'projects');
    }

    // --- Full Pages Logic ---
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        renderCards(newsContainer, newsData, 'news');
    }

    const announcementsContainer = document.getElementById('announcements-container');
    if (announcementsContainer) {
        renderCards(announcementsContainer, announcementsData, 'announcements');
    }

    // --- Gallery Logic ---
    const gallerySection = document.getElementById('gallery-section');
    if (gallerySection) {
        galleryData.forEach((album, index) => {
            const albumContainer = document.createElement('div');
            albumContainer.className = 'album-container';

            const albumTitle = document.createElement('h2');
            albumTitle.className = 'album-title';
            albumTitle.textContent = album.title;
            albumContainer.appendChild(albumTitle);

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'gallery-items-container';

            album.items.forEach(item => {
                const galleryItem = document.createElement('a');
                galleryItem.href = item.url;
                galleryItem.className = 'gallery-item';
                galleryItem.setAttribute('data-lightbox', `album-${index}`);
                galleryItem.setAttribute('data-title', item.description || '');

                if (item.type === 'photo') {
                    galleryItem.innerHTML = `
                        <img src="${item.url}" alt="${item.description}">
                        <div class="item-description">${item.description || ''}</div>
                    `;
                } else if (item.type === 'video') {
                     // For video, we use the url as image for now in this simplified version
                    galleryItem.innerHTML = `
                        <img src="${item.url}" alt="${item.description}">
                        <div class="item-description">${item.description || ''}</div>
                        <div class="video-play-icon"><i class="fas fa-play"></i></div>
                    `;
                }
                itemsContainer.appendChild(galleryItem);
            });

            albumContainer.appendChild(itemsContainer);
            gallerySection.appendChild(albumContainer);
        });
    }

    // --- Modals ---
    // Note: You need to keep the Modal Event Listener logic from your original script.js
    // but update the data source lookups to use the new fetched arrays (newsData, etc.)
});