// Main JavaScript for Blog Index Page

// Global variables
let blogPosts = [];
let currentPage = 1;
const postsPerPage = 9;

// DOM Elements
const blogGrid = document.getElementById('blog-grid');
const loadMoreBtn = document.getElementById('load-more-posts');

// Ensure blog page detection happens immediately
function setupBlogPage() {
  console.log('Setting up blog page...');
  
  // Add the blog-page class to the body
  document.body.classList.add('blog-page');
  document.body.setAttribute('data-page-path', window.location.pathname);
  
  // Direct DOM manipulation for immediate effect
  document.querySelectorAll('a[href="/blog"]').forEach(link => {
    link.style.display = 'none';
    link.style.visibility = 'hidden';
  });
  
  document.querySelectorAll('.relative, .search-container').forEach(container => {
    container.style.display = 'none';
    container.style.visibility = 'hidden';
  });
  
  console.log('Blog page setup complete - elements hidden');
}

// Call this immediately
setupBlogPage();

// Fetch blog posts from JSON file
async function fetchBlogPosts() {
  try {
    const response = await fetch('/data/blog-posts.json');
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }
    
    const data = await response.json();
    
    // Sort posts by date (newest first)
    blogPosts = data.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    renderBlogPosts();
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    blogGrid.innerHTML = `
      <div class="col-span-full text-center py-8">
        <p class="text-red-500">Failed to load blog posts. Please try again later.</p>
        <p class="text-gray-500 mt-2">${error.message}</p>
      </div>
    `;
  }
}

// Render blog posts to the grid
function renderBlogPosts() {
  const paginatedPosts = blogPosts.slice(0, currentPage * postsPerPage);
  
  blogGrid.innerHTML = '';
  
  if (blogPosts.length === 0) {
    blogGrid.innerHTML = `
      <div class="col-span-full text-center py-8">
        <p class="text-gray-500">No blog posts found.</p>
      </div>
    `;
    loadMoreBtn.classList.add('hidden');
    return;
  }
  
  paginatedPosts.forEach(post => {
    // Create slug from title
    const slug = createSlug(post.title);
    const readMoreLink = document.createElement('a');
    readMoreLink.href = `/blog/${slug}`;
    readMoreLink.className = 'text-indigo-600 font-medium hover:text-indigo-800';
    readMoreLink.textContent = 'Read more →';
    // Format date
    const formattedDate = formatDate(post.date);
    
    // Get category badges
    const categoryBadges = post.categories.map(category => {
      const colors = {
        beginner: 'bg-blue-100 text-blue-800',
        intermediate: 'bg-green-100 text-green-800',
        advanced: 'bg-purple-100 text-purple-800',
        prompting: 'bg-yellow-100 text-yellow-800',
        debugging: 'bg-red-100 text-red-800',
        refactoring: 'bg-indigo-100 text-indigo-800',
        workflow: 'bg-pink-100 text-pink-800',
        news: 'bg-orange-100 text-orange-800',
        tutorial: 'bg-teal-100 text-teal-800',
        default: 'bg-gray-100 text-gray-800'
      };
      
      const categoryClass = colors[category.toLowerCase()] || colors.default;
      
      return `<span class="inline-block ${categoryClass} rounded-full px-2 py-1 text-xs font-semibold mr-1">${category}</span>`;
    }).join('');
    
    // Create card
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1';
    
    card.innerHTML = `
      ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${post.title}" class="w-full h-48 object-cover">` : ''}
      <div class="p-5">
        <div class="flex flex-wrap mb-2">
          ${categoryBadges}
        </div>
        
        <h2 class="text-xl font-bold mb-2 hover:text-indigo-600">
          <a href="/blog/${slug}">${post.title}</a>
        </h2>
        
        <div class="flex items-center text-gray-500 text-sm mb-3">
          <span class="flex items-center">
            <i class="far fa-calendar-alt mr-1"></i>
            ${formattedDate}
          </span>
          <span class="mx-2">•</span>
          <span>${post.readTime || '5 min read'}</span>
        </div>
        
        <p class="text-gray-600 mb-4">${post.excerpt}</p>
        
        <a href="/blog/${slug}" class="text-indigo-600 font-medium hover:text-indigo-800">
          Read more →
        </a>
      </div>
    `;
    
    blogGrid.appendChild(card);
  });
  
  // Update "Load More" button visibility
  if (paginatedPosts.length < blogPosts.length) {
    loadMoreBtn.classList.remove('hidden');
  } else {
    loadMoreBtn.classList.add('hidden');
  }
}

// Format date to readable format
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Create URL-friendly slug from title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim(); // Trim leading/trailing spaces
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Make sure elements are hidden
  setupBlogPage();
  
  // Fetch blog posts
  fetchBlogPosts();
  
  // Load more posts
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      currentPage++;
      renderBlogPosts();
    });
  }
});