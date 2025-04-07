// JavaScript for individual blog post pages

// Global variables
let allPosts = [];
let currentPost = null;

// DOM Elements
const postTitle = document.getElementById('post-title');
const postTitleBreadcrumb = document.getElementById('post-title-breadcrumb');
const postDate = document.getElementById('post-date');
const postAuthor = document.getElementById('post-author');
const authorName = document.getElementById('author-name');
const authorBio = document.getElementById('author-bio');
const authorAvatar = document.getElementById('author-avatar');
const postCategories = document.getElementById('post-categories');
const postContent = document.getElementById('post-content');
const featuredImage = document.getElementById('post-featured-image');
const readTime = document.getElementById('read-time');
const relatedPosts = document.getElementById('related-posts');
const shareTwitter = document.getElementById('share-twitter');
const shareFacebook = document.getElementById('share-facebook');
const shareWhatsapp = document.getElementById('share-whatsapp');
const shareLinkedin = document.getElementById('share-linkedin');
const copyLink = document.getElementById('copy-link');

// Get post slug from URL
function getPostSlug() {
  const path = window.location.pathname;
  const pathParts = path.split('/');
  return pathParts[pathParts.length - 1];
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

// Load blog post data
async function loadPostData() {
  try {
    const response = await fetch('/data/blog-posts.json');
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }
    
    allPosts = await response.json();
    
    // Get current post based on slug in URL
    const slug = getPostSlug();
    currentPost = allPosts.find(post => createSlug(post.title) === slug);
    
    if (!currentPost) {
      showError('Blog post not found');
      return;
    }
    
    // Update page with post data
    updatePostPage();
    
  } catch (error) {
    console.error('Error loading post:', error);
    showError('Failed to load blog post. Please try again later.');
  }
}

// Update page with post data
function updatePostPage() {
  // Set page title
  document.title = `${currentPost.title} - CursorTips Blog`;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', currentPost.excerpt);
  }
  
  // Update post elements
  postTitle.textContent = currentPost.title;
  postTitleBreadcrumb.textContent = currentPost.title;
  
  // Format and set date
  const formattedDate = formatDate(currentPost.date);
  postDate.textContent = formattedDate;
  postDate.setAttribute('datetime', currentPost.date);
  
  // Set author info
  postAuthor.textContent = currentPost.author.name;
  authorName.textContent = currentPost.author.name;
  authorBio.textContent = currentPost.author.bio || 'Cursor AI enthusiast and contributor at CursorTips.';
  
  if (currentPost.author.avatar) {
    authorAvatar.src = currentPost.author.avatar;
    authorAvatar.alt = currentPost.author.name;
  }
  
  // Set read time
  readTime.textContent = currentPost.readTime || calculateReadTime(currentPost.content) + ' min read';
  
  // Set featured image if available
  if (currentPost.featuredImage) {
    featuredImage.src = currentPost.featuredImage;
    featuredImage.alt = currentPost.title;
    featuredImage.classList.remove('hidden');
  } else {
    featuredImage.classList.add('hidden');
  }
  
  // Add categories
  postCategories.innerHTML = '';
  currentPost.categories.forEach(category => {
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
    
    const badge = document.createElement('span');
    badge.className = `${categoryClass} rounded-full px-3 py-1 text-sm font-medium`;
    badge.textContent = category;
    
    postCategories.appendChild(badge);
  });
  
  // Set post content
  postContent.innerHTML = currentPost.content;
  
  // Highlight code blocks if any
  if (window.Prism) {
    Prism.highlightAll();
  }
  
  // Setup sharing links
  setupSharingLinks();
  
  // Show related posts
  showRelatedPosts();
}

// Calculate estimated reading time
function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return readTime < 1 ? 1 : readTime;
}

// Format date to readable format
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Setup social sharing links
function setupSharingLinks() {
  const postUrl = window.location.href;
  const postTitle = encodeURIComponent(currentPost.title);
  
  // Twitter
  shareTwitter.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${postTitle}`;
  
  // Facebook
  shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
  
  // WhatsApp
  shareWhatsapp.href = `https://api.whatsapp.com/send?text=${postTitle}%20${encodeURIComponent(postUrl)}`;
  
  // LinkedIn
  shareLinkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
  
  // Copy link button
  copyLink.addEventListener('click', () => {
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        showNotification('Link copied to clipboard!', 'success');
      })
      .catch(err => {
        console.error('Could not copy link: ', err);
        showNotification('Failed to copy link', 'error');
      });
  });
}

// Show related posts
function showRelatedPosts() {
  // Find posts with matching categories
  const postCategories = currentPost.categories;
  
  const related = allPosts
    .filter(post => {
      // Exclude current post
      if (createSlug(post.title) === createSlug(currentPost.title)) return false;
      
      // Check for category overlap
      return post.categories.some(category => postCategories.includes(category));
    })
    .sort((a, b) => {
      // Sort by number of matching categories
      const aMatches = a.categories.filter(category => postCategories.includes(category)).length;
      const bMatches = b.categories.filter(category => postCategories.includes(category)).length;
      return bMatches - aMatches;
    })
    .slice(0, 3); // Limit to 3 related posts
  
  relatedPosts.innerHTML = '';
  
  if (related.length === 0) {
    relatedPosts.innerHTML = `
      <div class="col-span-full text-center py-8">
        <p class="text-gray-500">No related posts found.</p>
      </div>
    `;
    return;
  }
  
  related.forEach(post => {
    const slug = createSlug(post.title);
    const formattedDate = formatDate(post.date);
    
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden';
    
    card.innerHTML = `
      ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${post.title}" class="w-full h-40 object-cover">` : ''}
      <div class="p-4">
        <h3 class="text-lg font-bold mb-2">
          <a href="/blog/${slug}" class="hover:text-indigo-600">${post.title}</a>
        </h3>
        <div class="flex items-center text-gray-500 text-sm mb-2">
          <span class="flex items-center">
            <i class="far fa-calendar-alt mr-1"></i>
            ${formattedDate}
          </span>
        </div>
        <p class="text-gray-600 text-sm">${post.excerpt.substring(0, 100)}...</p>
      </div>
    `;
    
    relatedPosts.appendChild(card);
  });
}

// Show error message
function showError(message) {
  document.querySelector('article').innerHTML = `
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
        <p class="text-xl text-gray-600 mb-8">${message}</p>
        <a href="/blog" class="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition duration-300">
          Back to Blog
        </a>
      </div>
    </div>
  `;
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  
  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };
  
  notification.className = `fixed top-4 right-4 ${bgColors[type]} text-white px-4 py-2 rounded-md shadow-lg z-50 transform transition-transform duration-300 translate-x-full`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 10);
  
  // Animate out and remove
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  loadPostData();
});