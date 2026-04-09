// js/search.js - Search related functionality including real-time autocomplete and filtering

// ============================================
// SEARCH MODULE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Search module initialized');
    
    // Initialize all search components
    initSearchBar();
    initAutocomplete();
    initTagFilters();
    initCategoryFilters();
    initSortOptions();
    initResultsGrid();
    initTagCloud();
    
    // Setup search event listeners
    setupSearchListeners();
    
    // Load initial search data if needed
    if (window.location.pathname.includes('/search')) {
        performSearchFromURL();
    }
});

// ============================================
// SEARCH BAR FUNCTIONALITY
// ============================================

/**
 * Initialize search bar with enhanced functionality
 */
function initSearchBar() {
    const searchBar = document.querySelector('.search-bar');
    const searchInput = searchBar?.querySelector('input[type="search"]');
    const searchButton = searchBar?.querySelector('button[type="submit"]');
    
    if (!searchInput) return;
    
    // Add search icon if not present
    if (!searchInput.previousElementSibling?.classList.contains('search-icon')) {
        const searchIcon = document.createElement('span');
        searchIcon.className = 'search-icon';
        searchIcon.innerHTML = '🔍';
        searchIcon.setAttribute('aria-hidden', 'true');
        searchInput.parentNode.insertBefore(searchIcon, searchInput);
    }
    
    // Add clear button
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'search-clear';
    clearButton.innerHTML = '×';
    clearButton.setAttribute('aria-label', 'Clear search');
    clearButton.style.cssText = `
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        display: none;
        color: #666;
    `;
    
    searchInput.parentNode.style.position = 'relative';
    searchInput.parentNode.appendChild(clearButton);
    
    // Show/hide clear button based on input
    searchInput.addEventListener('input', function() {
        clearButton.style.display = this.value ? 'block' : 'none';
    });
    
    // Clear search input
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        clearButton.style.display = 'none';
        hideAutocomplete();
    });
    
    // Handle search submission
    if (searchButton) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch(searchInput.value);
        });
    }
    
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(searchInput.value);
        }
    });
    
    // Focus management
    searchInput.addEventListener('focus', () => {
        searchBar.classList.add('focused');
        if (searchInput.value.length >= 2) {
            showAutocomplete(searchInput.value);
        }
    });
    
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            searchBar.classList.remove('focused');
            hideAutocomplete();
        }, 200);
    });
}

// ============================================
// AUTOCOMPLETE FUNCTIONALITY
// ============================================

let autocompleteData = [];
let currentAutocompleteRequest = null;

/**
 * Initialize autocomplete suggestions system
 */
function initAutocomplete() {
    // Load autocomplete data
    loadAutocompleteData();
    
    // Create autocomplete container
    const searchInput = document.querySelector('.search-bar input[type="search"]');
    if (!searchInput) return;
    
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'autocomplete-container';
    autocompleteContainer.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        display: none;
        max-height: 300px;
        overflow-y: auto;
    `;
    
    searchInput.parentNode.style.position = 'relative';
    searchInput.parentNode.appendChild(autocompleteContainer);
    
    // Keyboard navigation for autocomplete
    searchInput.addEventListener('keydown', handleAutocompleteNavigation);
}

/**
 * Load autocomplete data from API or local storage
 */
async function loadAutocompleteData() {
    try {
        // Try to load from local storage first
        const cachedData = localStorage.getItem('autocompleteData');
        const cacheTime = localStorage.getItem('autocompleteDataTime');
        
        if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime)) < 3600000) {
            autocompleteData = JSON.parse(cachedData);
            return;
        }
        
        // Fetch from API
        const response = await fetch('/api/autocomplete-data');
        if (response.ok) {
            autocompleteData = await response.json();
            
            // Cache the data
            localStorage.setItem('autocompleteData', JSON.stringify(autocompleteData));
            localStorage.setItem('autocompleteDataTime', Date.now().toString());
        }
    } catch (error) {
        console.error('Failed to load autocomplete data:', error);
        // Use fallback data
        autocompleteData = getFallbackAutocompleteData();
    }
}

/**
 * Get fallback autocomplete data
 */
function getFallbackAutocompleteData() {
    // Extract from page content as fallback
    const posts = document.querySelectorAll('.post-title');
    const tags = document.querySelectorAll('.tag');
    const categories = document.querySelectorAll('.category');
    
    const data = [];
    
    posts.forEach(post => {
        data.push({
            type: 'post',
            title: post.textContent,
            url: post.closest('a')?.href || '#'
        });
    });
    
    tags.forEach(tag => {
        data.push({
            type: 'tag',
            title: tag.textContent,
            url: tag.href || '#'
        });
    });
    
    categories.forEach(category => {
        data.push({
            type: 'category',
            title: category.textContent,
            url: category.href || '#'
        });
    });
    
    return data;
}

/**
 * Show autocomplete suggestions
 */
async function showAutocomplete(query) {
    if (query.length < 2) {
        hideAutocomplete();
        return;
    }
    
    // Cancel previous request if still pending
    if (currentAutocompleteRequest) {
        currentAutocompleteRequest.abort();
    }
    
    const container = document.querySelector('.autocomplete-container');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = '<div class="autocomplete-loading">Loading suggestions...</div>';
    container.style.display = 'block';
    
    try {
        // Create new AbortController for this request
        const controller = new AbortController();
        currentAutocompleteRequest = controller;
        
        // Fetch suggestions
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
            signal: controller.signal
        });
        
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        
        const suggestions = await response.json();
        displayAutocompleteSuggestions(suggestions, query);
        
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Autocomplete error:', error);
            // Use client-side filtering as fallback
            const filteredSuggestions = filterAutocompleteData(query);
            displayAutocompleteSuggestions(filteredSuggestions, query);
        }
    }
}

/**
 * Filter autocomplete data client-side
 */
function filterAutocompleteData(query) {
    const queryLower = query.toLowerCase();
    return autocompleteData.filter(item => 
        item.title.toLowerCase().includes(queryLower) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(queryLower)))
    ).slice(0, 10); // Limit to 10 results
}

/**
 * Display autocomplete suggestions
 */
function displayAutocompleteSuggestions(suggestions, query) {
    const container = document.querySelector('.autocomplete-container');
    if (!container) return;
    
    if (!suggestions || suggestions.length === 0) {
        container.innerHTML = '<div class="autocomplete-empty">No suggestions found</div>';
        return;
    }
    
    let html = '';
    
    // Group suggestions by type
    const grouped = {
        posts: suggestions.filter(s => s.type === 'post'),
        tags: suggestions.filter(s => s.type === 'tag'),
        categories: suggestions.filter(s => s.type === 'category')
    };
    
    // Add posts
    if (grouped.posts.length > 0) {
        html += '<div class="autocomplete-section">';
        html += '<div class="autocomplete-section-title">Posts</div>';
        grouped.posts.forEach(suggestion => {
            html += createAutocompleteItem(suggestion, query);
        });
        html += '</div>';
    }
    
    // Add tags
    if (grouped.tags.length > 0) {
        html += '<div class="autocomplete-section">';
        html += '<div class="autocomplete-section-title">Tags</div>';
        grouped.tags.forEach(suggestion => {
            html += createAutocompleteItem(suggestion, query);
        });
        html += '</div>';
    }
    
    // Add categories
    if (grouped.categories.length > 0) {
        html += '<div class="autocomplete-section">';
        html += '<div class="autocomplete-section-title">Categories</div>';
        grouped.categories.forEach(suggestion => {
            html += createAutocompleteItem(suggestion, query);
        });
        html += '</div>';
    }
    
    // Add search all option
    html += `
        <div class="autocomplete-footer">
            <a href="/search?q=${encodeURIComponent(query)}" class="autocomplete-all">
                Search for "${query}"
            </a>
        </div>
    `;
    
    container.innerHTML = html;
    container.style.display = 'block';
    
    // Add click handlers
    container.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const url = item.getAttribute('href');
            if (url) {
                window.location.href = url;
            }
        });
    });
}

/**
 * Create autocomplete item HTML
 */
function createAutocompleteItem(suggestion, query) {
    const title = highlightMatches(suggestion.title, query);
    const typeIcon = {
        post: '📄',
        tag: '🏷️',
        category: '📁'
    }[suggestion.type] || '🔍';
    
    return `
        <a href="${suggestion.url || '#'}" class="autocomplete-item" data-type="${suggestion.type}">
            <span class="autocomplete-icon">${typeIcon}</span>
            <span class="autocomplete-title">${title}</span>
            ${suggestion.date ? `<span class="autocomplete-date">${suggestion.date}</span>` : ''}
        </a>
    `;
}

/**
 * Highlight matching text in search results
 */
function highlightMatches(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Hide autocomplete suggestions
 */
function hideAutocomplete() {
    const container = document.querySelector('.autocomplete-container');
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * Handle keyboard navigation for autocomplete
 */
function handleAutocompleteNavigation(e) {
    const container = document.querySelector('.autocomplete-container');
    if (!container || container.style.display === 'none') return;
    
    const items = container.querySelectorAll('.autocomplete-item');
    if (items.length === 0) return;
    
    const currentIndex = Array.from(items).findIndex(item => item.classList.contains('active'));
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            navigateAutocomplete(items, currentIndex, 1);
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            navigateAutocomplete(items, currentIndex, -1);
            break;
            
        case 'Enter':
            const activeItem = container.querySelector('.autocomplete-item.active');
            if (activeItem) {
                e.preventDefault();
                window.location.href = activeItem.getAttribute('href');
            }
            break;
            
        case 'Escape':
            hideAutocomplete();
            break;
    }
}

/**
 * Navigate autocomplete items with arrow keys
 */
function navigateAutocomplete(items, currentIndex, direction) {
    items.forEach(item => item.classList.remove('active'));
    
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = items.length - 1;
    if (newIndex >= items.length) newIndex = 0;
    
    items[newIndex].classList.add('active');
    items[newIndex].scrollIntoView({ block: 'nearest' });
}

// ============================================
// TAG FILTERS FUNCTIONALITY
// ============================================

/**
 * Initialize tag filters for search refinement
 */
function initTagFilters() {
    const tagFilters = document.querySelector('.tag-filters');
    if (!tagFilters) return;
    
    const tags = tagFilters.querySelectorAll('.tag-filter');
    
    tags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTagFilter(this);
        });
        
        // Make tags keyboard accessible
        tag.setAttribute('tabindex', '0');
        tag.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTagFilter(tag);
            }
        });
    });
    
    // Add clear all filters button
    const clearButton = document.createElement('button');
    clearButton.className = 'clear-filters';
    clearButton.textContent = 'Clear all filters';
    clearButton.style.cssText = `
        margin-left: 10px;
        padding: 5px 10px;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 3px;
        cursor: pointer;
        font-size: 14px;
    `;
    
    clearButton.addEventListener('click', clearAllFilters);
    tagFilters.appendChild(clearButton);
}

/**
 * Toggle tag filter selection
 */
function toggleTagFilter(tagElement) {
    const isActive = tagElement.classList.contains('active');
    
    if (isActive) {
        tagElement.classList.remove('active');
        tagElement.setAttribute('aria-pressed', 'false');
    } else {
        tagElement.classList.add('active');
        tagElement.setAttribute('aria-pressed', 'true');
    }
    
    // Update search with new filters
    updateSearchWithFilters();
}

/**
 * Clear all active filters
 */
function clearAllFilters() {
    document.querySelectorAll('.tag-filter.active').forEach(tag => {
        tag.classList.remove('active');
        tag.setAttribute('aria-pressed', 'false');
    });
    
    document.querySelectorAll('.category-filter.active').forEach(category => {
        category.classList.remove('active');
        category.setAttribute('aria-pressed', 'false');
    });
    
    updateSearchWithFilters();
}

// ============================================
// CATEGORY FILTERS FUNCTIONALITY
// ============================================

/**
 * Initialize category filters
 */
function initCategoryFilters() {
    const categoryFilters = document.querySelector('.category-filters');
    if (!categoryFilters) return;
    
    const categories = categoryFilters.querySelectorAll('.category-filter');
    
    categories.forEach(category => {
        category.addEventListener('click', function(e) {
            e.preventDefault();
            toggleCategoryFilter(this);
        });
        
        category.setAttribute('tabindex', '0');
        category.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCategoryFilter(category);
            }
        });
    });
}

/**
 * Toggle category filter selection
 */
function toggleCategoryFilter(categoryElement) {
    const isActive = categoryElement.classList.contains('active');
    
    // For single selection (radio behavior)
    if (categoryElement.dataset.single === 'true') {
        document.querySelectorAll('.category-filter').forEach(cat => {
            cat.classList.remove('active');
            cat.setAttribute('aria-pressed', 'false');
        });
    }
    
    if (isActive) {
        categoryElement.classList.remove('active');
        categoryElement.setAttribute('aria-pressed', 'false');
    } else {
        categoryElement.classList.add('active');
        categoryElement.setAttribute('aria-pressed', 'true');
    }
    
    updateSearchWithFilters();
}

// ============================================
// SORT OPTIONS FUNCTIONALITY
// ============================================

/**
 * Initialize sort options dropdown
 */
function initSortOptions() {
    const sortOptions = document.querySelector('.sort-options');
    if (!sortOptions) return;
    
    const sortButton = sortOptions.querySelector('.sort-button');
    const sortDropdown = sortOptions.querySelector('.sort-dropdown');
    
    if (!sortButton || !sortDropdown) return;
    
    // Toggle dropdown visibility
    sortButton.addEventListener('click', (e) => {
        e.stopPropagation();
        sortDropdown.classList.toggle('show');
        sortButton.setAttribute('aria-expanded', sortDropdown.classList.contains('show'));
    });
    
    // Handle sort option selection
    sortDropdown.querySelectorAll('.sort-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            selectSortOption(this);
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        sortDropdown.classList.remove('show');
        sortButton.setAttribute('aria-expanded', 'false');
    });
}

/**
 * Select sort option and update search
 */
function selectSortOption(optionElement) {
    const sortOptions = document.querySelector('.sort-options');
    const sortButton = sortOptions.querySelector('.sort-button');
    const sortText = sortOptions.querySelector('.sort-text');
    
    // Update button text
    sortText.textContent = optionElement.textContent;
    
    // Update active state
    sortOptions.querySelectorAll('.sort-option').forEach(opt => {
        opt.classList.remove('active');
    });
    optionElement.classList.add('active');
    
    // Close dropdown
    const sortDropdown = sortOptions.querySelector('.sort-dropdown');
    sortDropdown.classList.remove('show');
    sortButton.setAttribute('aria-expanded', 'false');
    
    // Update search with sort parameter
    const sortBy = optionElement.dataset.sort;
    updateSearchSort(sortBy);
}

// ============================================
// RESULTS GRID FUNCTIONALITY
// ============================================

/**
 * Initialize results grid with dynamic loading
 */
function initResultsGrid() {
    const resultsGrid = document.querySelector('.results-grid');
    if (!resultsGrid) return;
    
    // Setup infinite scroll for results
    setupResultsInfiniteScroll();
    
    // Setup grid view toggle if available
    const viewToggle = document.querySelector('.view-toggle');
    if (viewToggle) {
        initViewToggle(viewToggle, resultsGrid);
    }
}

/**
 * Setup infinite scroll for search results
 */
function setupResultsInfiniteScroll() {
    let isLoading = false;
    let currentPage = 1;
    let hasMore = true;
    
    const loadMoreResults = async () => {
        if (isLoading || !hasMore) return;
        
        isLoading = true;
        currentPage++;
        
        try {
            const query = getCurrentSearchQuery();
            const filters = getCurrentFilters();
            const sort = getCurrentSort();
            
            const response = await fetchSearchResults(query, filters, sort, currentPage);
            
            if (response.results && response.results.length > 0) {
                appendResultsToGrid(response.results);
                hasMore = response.hasMore;
            } else {
                hasMore = false;
            }
        } catch (error) {
            console.error('Failed to load more results:', error);
            hasMore = false;
        } finally {
            isLoading = false;
        }
    };
    
    // Listen for infinite scroll event
    window.addEventListener('app:infiniteScroll', loadMoreResults);
    
    // Also check on scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.documentElement.scrollHeight - 500;
        
        if (scrollPosition >= threshold && !isLoading && hasMore) {
            loadMoreResults();
        }
    });
}

/**
 * Append new results to grid
 */
function appendResultsToGrid(results) {
    const resultsGrid = document.querySelector('.results-grid');
    if (!resultsGrid) return;
    
    const fragment = document.createDocumentFragment();
    
    results.forEach(result => {
        const resultElement = createResultElement(result);
        fragment.appendChild(resultElement);
    });
    
    resultsGrid.appendChild(fragment);
    
    // Re-initialize lightboxes for new images
    if (typeof initImageLightboxes === 'function') {
        initImageLightboxes();
    }
}

/**
 * Create result element HTML
 */
function createResultElement(result) {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `
        <article class="post-card">
            ${result.image ? `
                <div class="post-image">
                    <img src="${result.image}" alt="${result.title}" loading="lazy" data-lightbox>
                </div>
            ` : ''}
            
            <div class="post-content">
                <div class="post-meta">
                    ${result.category ? `<span class="post-category">${result.category}</span>` : ''}
                    ${result.date ? `<time datetime="${result.date}">${formatDate(result.date)}</time>` : ''}
                    ${result.readingTime ? `<span class="reading-time">${result.readingTime} min read</span>` : ''}
                </div>
                
                <h3 class="post-title">
                    <a href="${result.url}">${result.title}</a>
                </h3>
                
                ${result.excerpt ? `<p class="post-excerpt">${result.excerpt}</p>` : ''}
                
                ${result.tags && result.tags.length > 0 ? `
                    <div class="post-tags">
                        ${result.tags.map(tag => `<a href="/tag/${tag.slug}" class="tag">${tag.name}</a>`).join('')}
                    </div>
                ` : ''}
                
                <div class="post-footer">
                    ${result.author ? `
                        <div class="post-author">
                            <img src="${result.author.avatar}" alt="${result.author.name}" class="author-avatar">
                            <span class="author-name">${result.author.name}</span>
                        </div>
                    ` : ''}
                    
                    <div class="post-actions">
                        <button class="share-button" data-platform="twitter" data-url="${result.url}" data-title="${result.title}">
                            Share
                        </button>
                    </div>
                </div>
            </div>
        </article>
    `;
    
    return div;
}

// ============================================
// TAG CLOUD FUNCTIONALITY
// ============================================

/**
 * Initialize tag cloud with interactive features
 */
function initTagCloud() {
    const tagCloud = document.querySelector('.tag-cloud');
    if (!tagCloud) return;
    
    const tags = tagCloud.querySelectorAll('.tag');
    const maxFontSize = 24;
    const minFontSize = 12;
    
    // Find max and min counts
    let maxCount = 0;
    let minCount = Infinity;
    
    tags.forEach(tag => {
        const count = parseInt(tag.dataset.count) || 1;
        maxCount = Math.max(maxCount, count);
        minCount = Math.min(minCount, count);
    });
    
    // Calculate and apply font sizes
    tags.forEach(tag => {
        const count = parseInt(tag.dataset.count) || 1;
        const fontSize = calculateTagFontSize(count, minCount, maxCount, minFontSize, maxFontSize);
        
        tag.style.fontSize = `${fontSize}px`;
        tag.style.opacity = 0.7 + (fontSize - minFontSize) / (maxFontSize - minFontSize) * 0.3;
        
        // Add hover effects
        tag.addEventListener('mouseenter', () => {
            tag.style.transform = 'scale(1.1)';
            tag.style.transition = 'transform 0.2s ease';
        });
        
        tag.addEventListener('mouseleave', () => {
            tag.style.transform = 'scale(1)';
        });
        
        // Click to search by tag
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            const tagName = tag.textContent.trim();
            searchByTag(tagName);
        });
    });
}

/**
 * Calculate font size for tag based on count
 */
function calculateTagFontSize(count, minCount, maxCount, minSize, maxSize) {
    if (maxCount === minCount) return (minSize + maxSize) / 2;
    
    return minSize + (count - minCount) / (maxCount - minCount) * (maxSize - minSize);
}

// ============================================
// SEARCH EXECUTION AND FILTERING
// ============================================

/**
 * Perform search with given query
 */
async function performSearch(query, filters = {}, sort = 'relevance', page = 1) {
    if (!query.trim()) {
        showEmptySearchMessage();
        return;
    }
    
    // Show loading state
    showSearchLoading();
    
    try {
        const response = await fetchSearchResults(query, filters, sort, page);
        
        if (response.results && response.results.length > 0) {
            displaySearchResults(response.results);
            updateSearchStats(response.total, query);
            updateURLWithSearch(query, filters, sort);
        } else {
            showNoResultsMessage(query);
        }
        
    } catch (error) {
        console.error('Search failed:', error);
        showSearchError();
    } finally {
        hideSearchLoading();
    }
}

/**
 * Fetch search results from API
 */
async function fetchSearchResults(query, filters, sort, page = 1) {
    const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        sort: sort,
        ...filters
    });
    
    const response = await fetch(`/api/search?${params.toString()}`);
    
    if (!response.ok) {
        throw new Error(`Search API failed: ${response.status}`);
    }
    
    return await response.json();
}

/**
 * Display search results in grid
 */
function displaySearchResults(results) {
    const resultsGrid = document.querySelector('.results-grid');
    const resultsContainer = document.querySelector('.results-container');
    
    if (!resultsGrid || !resultsContainer) return;
    
    // Clear previous results
    resultsGrid.innerHTML = '';
    
    // Create and append result elements
    results.forEach(result => {
        const resultElement = createResultElement(result);
        resultsGrid.appendChild(resultElement);
    });
    
    // Show results container
    resultsContainer.style.display = 'block';
    
    // Initialize components for new results
    if (typeof initImageLightboxes === 'function') {
        initImageLightboxes();
    }
    
    if (typeof initShareButtons === 'function') {
        initShareButtons();
    }
}

/**
 * Perform search based on URL parameters
 */
function performSearchFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || '';
    const filters = getFiltersFromURL();
    const sort = urlParams.get('sort') || 'relevance';
    
    if (query) {
        // Update search input
        const searchInput = document.querySelector('.search-bar input[type="search"]');
        if (searchInput) {
            searchInput.value = query;
        }
        
        // Perform search
        performSearch(query, filters, sort);
    }
}

/**
 * Get filters from URL parameters
 */
function getFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const filters = {};
    
    urlParams.forEach((value, key) => {
        if (key.startsWith('filter_')) {
            const filterName = key.replace('filter_', '');
            filters[filterName] = value;
        }
    });
    
    return filters;
}

/**
 * Update URL with search parameters
 */
function updateURLWithSearch(query, filters, sort) {
    const url = new URL(window.location);
    url.searchParams.set('q', query);
    url.searchParams.set('sort', sort);
    
    // Remove existing filter params
    url.searchParams.forEach((value, key) => {
        if (key.startsWith('filter_')) {
            url.searchParams.delete(key);
        }
    });
    
    // Add new filter params
    Object.entries(filters).forEach(([key, value]) => {
        url.searchParams.set(`filter_${key}`, value);
    });
    
    window.history.pushState({}, '', url);
}

/**
 * Update search with current filters
 */
function updateSearchWithFilters() {
    const query = getCurrentSearchQuery();
    const filters = getCurrentFilters();
    const sort = getCurrentSort();
    
    if (query) {
        performSearch(query, filters, sort);
    }
}

/**
 * Update search sort parameter
 */
function updateSearchSort(sortBy) {
    const query = getCurrentSearchQuery();
    const filters = getCurrentFilters();
    
    if (query) {
        performSearch(query, filters, sortBy);
    }
}

/**
 * Search by tag name
 */
function searchByTag(tagName) {
    const searchInput = document.querySelector('.search-bar input[type="search"]');
    if (searchInput) {
        searchInput.value = tagName;
    }
    
    performSearch(tagName);
}

/**
 * Get current search query
 */
function getCurrentSearchQuery() {
    const searchInput = document.querySelector('.search-bar input[type="search"]');
    return searchInput ? searchInput.value.trim() : '';
}

/**
 * Get current active filters
 */
function getCurrentFilters() {
    const filters = {};
    
    // Get active tag filters
    document.querySelectorAll('.tag-filter.active').forEach(tag => {
        const tagName = tag.dataset.tag || tag.textContent.trim();
        if (!filters.tags) filters.tags = [];
        filters.tags.push(tagName);
    });
    
    // Get active category filters
    document.querySelectorAll('.category-filter.active').forEach(category => {
        const categoryName = category.dataset.category || category.textContent.trim();
        filters.category = categoryName;
    });
    
    return filters;
}

/**
 * Get current sort option
 */
function getCurrentSort() {
    const activeSort = document.querySelector('.sort-option.active');
    return activeSort ? activeSort.dataset.sort : 'relevance';
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

/**
 * Show search loading state
 */
function showSearchLoading() {
    const resultsContainer = document.querySelector('.results-container');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="search-loading">
            <div class="loading-spinner"></div>
            <p>Searching...</p>
        </div>
    `;
    
    resultsContainer.style.display = 'block';
}

/**
 * Hide search loading state
 */
function hideSearchLoading() {
    const loadingElement = document.querySelector('.search-loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

/**
 * Show empty search message
 */
function showEmptySearchMessage() {
    const resultsContainer = document.querySelector('.results-container');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="search-empty">
            <p>Please enter a search term to begin</p>
        </div>
    `;
    
    resultsContainer.style.display = 'block';
}

/**
 * Show no results message
 */
function showNoResultsMessage(query) {
    const resultsContainer = document.querySelector('.results-container');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="search-no-results">
            <p>No results found for "${query}"</p>
            <p class="suggestions">Try different keywords or check your spelling</p>
        </div>
    `;
    
    resultsContainer.style.display = 'block';
}

/**
 * Show search error message
 */
function showSearchError() {
    const resultsContainer = document.querySelector('.results-container');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="search-error">
            <p>Something went wrong with your search</p>
            <button class="retry-search">Try Again</button>
        </div>
    `;
    
    resultsContainer.style.display = 'block';
    
    // Add retry button handler
    const retryButton = resultsContainer.querySelector('.retry-search');
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            const query = getCurrentSearchQuery();
            if (query) {
                performSearch(query);
            }
        });
    }
}

/**
 * Update search statistics display
 */
function updateSearchStats(totalResults, query) {
    const statsElement = document.querySelector('.search-stats');
    if (!statsElement) return;
    
    statsElement.innerHTML = `
        Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"
    `;
    
    statsElement.style.display = 'block';
}

/**
 * Initialize view toggle (grid/list view)
 */
function initViewToggle(viewToggle, resultsGrid) {
    const gridButton = viewToggle.querySelector('.view-grid');
    const listButton = viewToggle.querySelector('.view-list');
    
    if (!gridButton || !listButton) return;
    
    gridButton.addEventListener('click', () => {
        resultsGrid.classList.remove('list-view');
        resultsGrid.classList.add('grid-view');
        gridButton.classList.add('active');
        listButton.classList.remove('active');
        
        // Save preference
        localStorage.setItem('searchView', 'grid');
    });
    
    listButton.addEventListener('click', () => {
        resultsGrid.classList.remove('grid-view');
        resultsGrid.classList.add('list-view');
        listButton.classList.add('active');
        gridButton.classList.remove('active');
        
        // Save preference
        localStorage.setItem('searchView', 'list');
    });
    
    // Load saved preference
    const savedView = localStorage.getItem('searchView') || 'grid';
    if (savedView === 'list') {
        listButton.click();
    } else {
        gridButton.click();
    }
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

/**
 * Setup all search-related event listeners
 */
function setupSearchListeners() {
    // Debounced input for autocomplete
    const searchInput = document.querySelector('.search-bar input[type="search"]');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            if (this.value.length >= 2) {
                showAutocomplete(this.value);
            } else {
                hideAutocomplete();
            }
        }, 300));
    }
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
        performSearchFromURL();
    });
    
    // Handle filter changes
    const filterObserver = new MutationObserver(debounce(() => {
        updateSearchWithFilters();
    }, 500));
    
    const filtersContainer = document.querySelector('.filters-container');
    if (filtersContainer) {
        filterObserver.observe(filtersContainer, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
        });
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format date for display (reuse from main.js if available)
 */
function formatDate(dateString) {
    if (typeof window.AppUtils?.formatDate === 'function') {
        return window.AppUtils.formatDate(dateString);
    }
    
    // Fallback implementation
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Debounce function (reuse from main.js if available)
 */
function debounce(func, wait) {
    if (typeof window.AppUtils?.debounce === 'function') {
        return window.AppUtils.debounce(func, wait);
    }
    
    // Fallback implementation
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}