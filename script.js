// Константы и переменные
const API_URLS = {
    users: 'https://jsonplaceholder.typicode.com/users',
    posts: 'https://jsonplaceholder.typicode.com/posts'
};

let users = [];
let posts = [];
let currentView = 'posts';

// DOM элементы
const toggleViewBtn = document.getElementById('toggleView');
const postsView = document.getElementById('postsView');
const usersView = document.getElementById('usersView');
const postsContainer = document.getElementById('postsContainer');
const usersContainer = document.getElementById('usersContainer');

// Инициализация приложения
document.addEventListener('DOMContentLoaded', initApp);

// Основные функции
async function initApp() {
    try {
        await loadData();
        renderPosts();
        renderUsers();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
    }
}

async function loadData() {
    try {
        const [usersResponse, postsResponse] = await Promise.all([
            fetch(API_URLS.users),
            fetch(API_URLS.posts)
        ]);
        
        if (!usersResponse.ok || !postsResponse.ok) {
            throw new Error('Network response was not ok');
        }
        
        users = await usersResponse.json();
        posts = await postsResponse.json();
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

function renderPosts() {
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>Посты не найдены</p>';
        return;
    }
    
    posts.forEach(post => {
        const user = users.find(u => u.id === post.userId);
        const userName = user ? user.name : 'Неизвестный автор';
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">${userName}</div>
            <div class="card-title">${post.title}</div>
            <div class="card-body">${post.body}</div>
        `;
        
        postsContainer.appendChild(card);
    });
}

function renderUsers() {
    usersContainer.innerHTML = '';
    
    if (users.length === 0) {
        usersContainer.innerHTML = '<p>Пользователи не найдены</p>';
        return;
    }
    
    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.textContent = user.name;
        userCard.dataset.userId = user.id;
        
        userCard.addEventListener('click', () => showUserPosts(user.id));
        usersContainer.appendChild(userCard);
    });
}

function showUserPosts(userId) {
    // Сбрасываем активное состояние у всех пользователей
    document.querySelectorAll('.user-card').forEach(card => {
        card.classList.remove('active');
        
        // Удаляем старые посты
        const postsContainer = card.nextElementSibling;
        if (postsContainer && postsContainer.classList.contains('user-posts')) {
            postsContainer.remove();
        }
    });
    
    // Устанавливаем активное состояние для выбранного пользователя
    const selectedUserCard = document.querySelector(`.user-card[data-user-id="${userId}"]`);
    if (selectedUserCard) {
        selectedUserCard.classList.add('active');
        
        // Получаем посты пользователя
        const userPosts = posts.filter(post => post.userId == userId);
        
        if (userPosts.length > 0) {
            const postsContainer = document.createElement('div');
            postsContainer.className = 'user-posts';
            
            userPosts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'card';
                postElement.innerHTML = `
                    <div class="card-title">${post.title}</div>
                    <div class="card-body">${post.body}</div>
                `;
                postsContainer.appendChild(postElement);
            });
            
            selectedUserCard.insertAdjacentElement('afterend', postsContainer);
        }
    }
}

function setupEventListeners() {
    toggleViewBtn.addEventListener('click', toggleView);
}

function toggleView() {
    if (currentView === 'posts') {
        postsView.classList.remove('active');
        usersView.classList.add('active');
        toggleViewBtn.textContent = 'Показать все посты';
        currentView = 'users';
    } else {
        usersView.classList.remove('active');
        postsView.classList.add('active');
        toggleViewBtn.textContent = 'Показать список пользователей';
        currentView = 'posts';
    }
}

function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    document.body.prepend(errorElement);
    
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}