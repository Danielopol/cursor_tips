// Main JavaScript for CursorTips

// Global variables
let tipsData = [];
let currentFilter = 'all';
let searchTerm = '';
let currentPage = 1;
const tipsPerPage = 9;

// DOM Elements
const tipsGrid = document.getElementById('tips-grid');
const tipModal = document.getElementById('tip-modal');
const closeModal = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalCategories = document.getElementById('modal-categories');
const modalContent = document.getElementById('modal-content');
const modalImage = document.getElementById('modal-image');
const searchInput = document.getElementById('search-input');
const categoryButtons = document.querySelectorAll('.category-badge');
const randomTipBtn = document.getElementById('random-tip-btn');
const loadMoreBtn = document.getElementById('load-more');
const visitButton = document.getElementById('visit-button');
const upvoteBtn = document.getElementById('upvote-btn');
const downvoteBtn = document.getElementById('downvote-btn');
const upvoteCount = document.getElementById('upvote-count');
const downvoteCount = document.getElementById('downvote-count');
const themeToggle = document.getElementById('theme-toggle');

// Contribution form elements
const contributeBtn = document.getElementById('contribute-btn');
const contributeModal = document.getElementById('contribute-modal');
const closeContributeModal = document.getElementById('close-contribute-modal');
const cancelContribute = document.getElementById('cancel-contribute');
const contributeForm = document.getElementById('contribute-form');

// FAQ elements
const faqToggles = document.querySelectorAll('.faq-toggle');

// Fetch tips from the CSV file
async function fetchTips() {
  try {
    console.log("Fetching tips from CSV...");
    
    // Check if loadTipsFromCSV function exists
    if (typeof loadTipsFromCSV !== 'function') {
      throw new Error('CSV loader function not found. Make sure csv-loader.js is loaded correctly.');
    }
    
    // Load tips from CSV
    tipsData = await loadTipsFromCSV();
    
    if (tipsData.length === 0) {
      throw new Error('No tips found in CSV');
    }
    
    console.log(`Loaded ${tipsData.length} tips from CSV`);
    renderTips();
  } catch (error) {
    console.error('Error fetching tips:', error);
    tipsGrid.innerHTML = `
      <div class="col-span-full text-center py-8">
        <p class="text-red-500">Failed to load tips. Please try again later.</p>
        <p class="text-gray-500 mt-2">${error.message}</p>
      </div>
    `;
  }
}

// Filter tips based on current filter and search term
function filterTips() {
  let filtered = [...tipsData];
  
  // Apply category filter
  if (currentFilter !== 'all') {
    filtered = filtered.filter(tip => 
      tip.categories.some(cat => 
        cat.toLowerCase().includes(currentFilter.toLowerCase())
      )
    );
  }
  
  // Apply search filter
  if (searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(tip => 
      tip.title.toLowerCase().includes(term) || 
      tip.description.toLowerCase().includes(term) ||
      tip.content.toLowerCase().includes(term) ||
      tip.categories.some(cat => cat.toLowerCase().includes(term))
    );
  }
  
  return filtered;
}

// Render tips to the grid
function renderTips() {
  const filteredTips = filterTips();
  const paginatedTips = filteredTips.slice(0, currentPage * tipsPerPage);
  
  tipsGrid.innerHTML = '';
  
  if (filteredTips.length === 0) {
    tipsGrid.innerHTML = `
      <div class="col-span-full text-center py-8">
        <p class="text-gray-500">No tips found matching your criteria.</p>
      </div>
    `;
    loadMoreBtn.classList.add('hidden');
    return;
  }
  
  paginatedTips.forEach(tip => {
    const card = document.createElement('div');
    card.className = 'tip-card bg-white rounded-lg shadow-md overflow-hidden transition duration-300';
    card.setAttribute('data-id', tip.id);
    
    // Get category badges
    const categoryBadges = tip.categories.map(category => {
      // Map category names to standard categories if needed
      const standardCategory = mapCategoryToStandard(category);
      
      const colors = {
        beginner: 'bg-blue-100 text-blue-800',
        intermediate: 'bg-green-100 text-green-800',
        advanced: 'bg-purple-100 text-purple-800',
        prompting: 'bg-yellow-100 text-yellow-800',
        debugging: 'bg-red-100 text-red-800',
        refactoring: 'bg-indigo-100 text-indigo-800',
        workflow: 'bg-pink-100 text-pink-800',
        default: 'bg-gray-100 text-gray-800'
      };
      
      const categoryClass = colors[standardCategory.toLowerCase()] || colors.default;
      
      return `<span class="inline-block ${categoryClass} rounded-full px-2 py-1 text-xs font-semibold mr-1">${category}</span>`;
    }).join('');
    
    // Use thumbnail if available, otherwise default image
    const thumbnailImg = tip.thumbnail ? 
      `<img src="${tip.thumbnail}" alt="${tip.title}" class="w-full h-32 object-cover">` :
      '';
    
    card.innerHTML = `
      ${thumbnailImg}
      <div class="p-5">
        <div class="flex flex-wrap mb-2">
          ${categoryBadges}
        </div>
        <h3 class="text-xl font-bold mb-2">${tip.title}</h3>
        <p class="text-gray-600 mb-4">${tip.description}</p>
        <div class="flex justify-between items-center">
          <button class="view-tip-btn text-indigo-600 hover:text-indigo-800 font-medium">Read more →</button>
          <div class="flex items-center space-x-2">
            <span class="flex items-center text-gray-500 text-sm">
              <i class="fas fa-thumbs-up mr-1"></i>
              <span>${tip.upvotes || 0}</span>
            </span>
            <span class="flex items-center text-gray-500 text-sm ml-2">
              <i class="fas fa-eye mr-1"></i>
              <span>${tip.status || 0}</span>
            </span>
          </div>
        </div>
      </div>
    `;
    
    tipsGrid.appendChild(card);
  });
  
  // Add event listeners to view buttons
  document.querySelectorAll('.view-tip-btn').forEach(btn => {
    btn.addEventListener('click', event => {
      const tipId = parseInt(event.target.closest('.tip-card').getAttribute('data-id'));
      openTipModal(tipId);
    });
  });
  
  // Update "Load More" button visibility
  if (paginatedTips.length < filteredTips.length) {
    loadMoreBtn.classList.remove('hidden');
  } else {
    loadMoreBtn.classList.add('hidden');
  }
}

// Map diverse category names to standard categories
function mapCategoryToStandard(category) {
  category = category.toLowerCase().trim();
  
  if (category.includes('begin')) return 'beginner';
  if (category.includes('inter')) return 'intermediate';
  if (category.includes('advanc')) return 'advanced';
  if (category.includes('prompt')) return 'prompting';
  if (category.includes('debug')) return 'debugging';
  if (category.includes('refactor')) return 'refactoring';
  if (category.includes('workflow')) return 'workflow';
  if (category.includes('mcp')) return 'advanced';
  
  return 'default';
}

// Open tip modal
function openTipModal(tipId) {
  const tip = tipsData.find(t => t.id === tipId);
  
  if (tip) {
    modalTitle.textContent = tip.title;
    
    // Set featured image if available
    if (tip.images) {
      modalImage.src = tip.images;
      modalImage.alt = tip.title;
      modalImage.classList.remove('hidden');
    } else {
      modalImage.classList.add('hidden');
    }
    
    // Generate category badges
    modalCategories.innerHTML = tip.categories.map(category => {
      const standardCategory = mapCategoryToStandard(category);
      
      const colors = {
        beginner: 'bg-blue-100 text-blue-800',
        intermediate: 'bg-green-100 text-green-800',
        advanced: 'bg-purple-100 text-purple-800',
        prompting: 'bg-yellow-100 text-yellow-800',
        debugging: 'bg-red-100 text-red-800',
        refactoring: 'bg-indigo-100 text-indigo-800',
        workflow: 'bg-pink-100 text-pink-800',
        default: 'bg-gray-100 text-gray-800'
      };
      
      const categoryClass = colors[standardCategory.toLowerCase()] || colors.default;
      
      return `<span class="${categoryClass} rounded-full px-3 py-1 text-sm font-medium">${category}</span>`;
    }).join('');
    
    // Set content/description
    modalContent.innerHTML = `<p>${tip.content}</p>`;
    
    // Set visit button URL
    if (tip.url && tip.url !== '#') {
      visitButton.href = tip.url;
      visitButton.classList.remove('hidden');
    } else {
      visitButton.classList.add('hidden');
    }
    
    // Set voting counts
    upvoteCount.textContent = tip.upvotes || 0;
    downvoteCount.textContent = tip.downvotes || 0;
    
    // Set current tip ID for voting
    upvoteBtn.setAttribute('data-id', tip.id);
    downvoteBtn.setAttribute('data-id', tip.id);
    
    // Set other tip info
    if (tip.status) {
      const statusInfo = document.getElementById('status-info');
      if (statusInfo) {
        statusInfo.textContent = tip.status + ' views';
        statusInfo.classList.remove('hidden');
      }
    }
    
    tipModal.classList.remove('hidden');
  }
}

// Handle tip submission
function handleTipSubmission(event) {
  event.preventDefault();
  
  // Get form data
  const formData = {
    name: document.getElementById('tip-name').value,
    email: document.getElementById('tip-email').value,
    title: document.getElementById('tip-title').value,
    url: document.getElementById('tip-url').value,
    categories: Array.from(document.querySelectorAll('input[name="categories"]:checked')).map(input => input.value),
    message: document.getElementById('tip-message').value
  };
  
  console.log('Tip submission:', formData);
  
  // In a real application, you would send this data to your server or email service
  // For now, we'll just show a success message and close the modal
  
  // Reset form
  contributeForm.reset();
  
  // Close modal
  contributeModal.classList.add('hidden');
  
  // Show success notification
  showNotification('Thank you for your submission! We will review it shortly.', 'success');
}

// Handle upvote
function handleUpvote(tipId) {
  const tipIndex = tipsData.findIndex(t => t.id === tipId);
  if (tipIndex !== -1) {
    // Increment upvotes
    tipsData[tipIndex].upvotes = (tipsData[tipIndex].upvotes || 0) + 1;
    
    // Update display
    upvoteCount.textContent = tipsData[tipIndex].upvotes;
    
    // In a real application, you would send this data to your server
    // For now, we'll just update the local data
    
    showNotification('Thanks for your vote!', 'success');
  }
}

// Handle downvote
function handleDownvote(tipId) {
  const tipIndex = tipsData.findIndex(t => t.id === tipId);
  if (tipIndex !== -1) {
    // Increment downvotes
    tipsData[tipIndex].downvotes = (tipsData[tipIndex].downvotes || 0) + 1;
    
    // Update display
    downvoteCount.textContent = tipsData[tipIndex].downvotes;
    
    // In a real application, you would send this data to your server
    // For now, we'll just update the local data
    
    showNotification('Thanks for your feedback!', 'info');
  }
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

// Toggle FAQ items
function toggleFaq(element) {
  const content = element.nextElementSibling;
  const arrow = element.querySelector('svg');
  
  // Toggle visibility
  content.classList.toggle('hidden');
  
  // Rotate arrow
  if (content.classList.contains('hidden')) {
    arrow.classList.remove('rotate-180');
  } else {
    arrow.classList.add('rotate-180');
  }
}

// Toggle dark/light mode
function toggleTheme() {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  const themeIcon = themeToggle.querySelector('i');
  
  if (isDarkMode) {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
    localStorage.setItem('darkMode', 'true');
  } else {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
    localStorage.setItem('darkMode', 'false');
  }
}

// Apply saved theme
function applySavedTheme() {
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  const themeIcon = themeToggle.querySelector('i');
  
  if (savedDarkMode) {
    document.body.classList.add('dark-mode');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, initializing application...");
  
  // Fetch tips on page load
  fetchTips();
  
  // Apply saved theme
  applySavedTheme();
  
  // Close modals
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      tipModal.classList.add('hidden');
    });
  }
  
  if (closeContributeModal) {
    closeContributeModal.addEventListener('click', () => {
      contributeModal.classList.add('hidden');
    });
  }
  
  if (cancelContribute) {
    cancelContribute.addEventListener('click', () => {
      contributeModal.classList.add('hidden');
    });
  }
  
  // Close modal when clicking outside
  if (tipModal) {
    tipModal.addEventListener('click', event => {
      if (event.target === tipModal) {
        tipModal.classList.add('hidden');
      }
    });
  }
  
  if (contributeModal) {
    contributeModal.addEventListener('click', event => {
      if (event.target === contributeModal) {
        contributeModal.classList.add('hidden');
      }
    });
  }
  
  // Filter tips by category
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');
      
      // Highlight active category
      categoryButtons.forEach(btn => btn.classList.remove('ring-2', 'ring-offset-2', 'ring-indigo-500'));
      button.classList.add('ring-2', 'ring-offset-2', 'ring-indigo-500');
      
      currentFilter = category;
      currentPage = 1;
      renderTips();
    });
  });
  
  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value.toLowerCase();
      currentPage = 1;
      renderTips();
    });
  }
  
  // Random tip button
  if (randomTipBtn) {
    randomTipBtn.addEventListener('click', () => {
      if (tipsData.length > 0) {
        const randomIndex = Math.floor(Math.random() * tipsData.length);
        openTipModal(tipsData[randomIndex].id);
      }
    });
  }
  
  // Load more button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      currentPage++;
      renderTips();
    });
  }
  
  // Upvote and downvote buttons
  if (upvoteBtn) {
    upvoteBtn.addEventListener('click', () => {
      const tipId = parseInt(upvoteBtn.getAttribute('data-id'));
      handleUpvote(tipId);
    });
  }
  
  if (downvoteBtn) {
    downvoteBtn.addEventListener('click', () => {
      const tipId = parseInt(downvoteBtn.getAttribute('data-id'));
      handleDownvote(tipId);
    });
  }
  
  // Contribute button
  if (contributeBtn) {
    contributeBtn.addEventListener('click', () => {
      contributeModal.classList.remove('hidden');
    });
  }
  
  // Contribute form submission
  if (contributeForm) {
    contributeForm.addEventListener('submit', handleTipSubmission);
  }
  
  // FAQ toggles
  if (faqToggles) {
    faqToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggleFaq(toggle);
      });
    });
  }
  
  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
});