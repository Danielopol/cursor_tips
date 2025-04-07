// Client-side router for blog paths

class BlogRouter {
  constructor() {
    this.currentPath = window.location.pathname;
    this.isInBlogSection = this.currentPath.startsWith('/blog');
    this.routes = {
      '/blog': this.showBlogIndex,
      '/blog/(.+)': this.showBlogPost
    };
    
    // Listen for browser back/forward navigation
    window.addEventListener('popstate', this.handleRouteChange.bind(this));
  }
  
  // Initialize router
  init() {
    if (this.isInBlogSection) {
      this.handleRouteChange();
    }
  }
  
  // Handle route changes
  handleRouteChange() {
    const path = window.location.pathname;
    
    // Match route to handler
    for (const route in this.routes) {
      const regex = new RegExp(`^${route.replace(/\//g, '\\/').replace(/\((.+)\)/, '($1)')}$`);
      const match = path.match(regex);
      
      if (match) {
        // If there's a capture group, pass it as parameter (post slug)
        const param = match.length > 1 ? match[1] : null;
        this.routes[route].call(this, param);
        return;
      }
    }
    
    // No matching route
    console.error('No route handler found for:', path);
  }
  
  // Show blog index page
  showBlogIndex() {
    console.log('Loading blog index');
    // The blog index page is loaded directly from server
    // But we can add any additional initialization here
    
    // Update page title if needed
    document.title = 'CursorTips Blog - Latest News and Tips';
  }
  
  // Show individual blog post
  showBlogPost(slug) {
    console.log('Loading blog post:', slug);
    // The blog post template is loaded directly from server
    // The actual content is populated by blog-post.js
    
    // Initialize specific blog post functionality here if needed
  }
  
  // Navigate to a blog post
  navigateTo(url) {
    window.history.pushState({}, '', url);
    this.handleRouteChange();
  }
  
  // Create a URL-friendly slug from title
  static createSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim(); // Trim leading/trailing spaces
  }
}

// Initialize router when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const router = new BlogRouter();
  router.init();
  
  // Export router to global scope for use in other scripts
  window.blogRouter = router;
});