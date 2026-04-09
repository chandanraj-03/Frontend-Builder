// js/comments.js - Comments system with nested replies, moderation, and user interactions

// ============================================
// COMMENTS MODULE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Comments module initialized');
    
    // Initialize comments system
    initCommentsSystem();
    setupCommentListeners();
    
    // Load comments if auto-load is enabled
    if (document.querySelector('.comments-system[data-auto-load="true"]')) {
        loadComments();
    }
});

// ============================================
// COMMENTS SYSTEM INITIALIZATION
// ============================================

/**
 * Initialize the complete comments system
 */
function initCommentsSystem() {
    // Create comments container if it doesn't exist
    if (!document.querySelector('.comments-system')) {
        createCommentsContainer();
    }
    
    // Initialize comment form
    initCommentForm();
    
    // Setup reply system
    setupReplySystem();
    
    // Setup voting system
    setupVotingSystem();
    
    // Setup moderation tools
    setupModerationTools();
    
    // Load user comment preferences
    loadUserPreferences();
}

/**
 * Create comments container structure
 */
function createCommentsContainer() {
    const commentsSection = document.createElement('section');
    commentsSection.className = 'comments-system';
    commentsSection.innerHTML = `
        <div class="comments-header">
            <h3 class="comments-title">Comments</h3>
            <div class="comments-sort">
                <select class="comments-sort-select">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="popular">Most popular</option>
                </select>
            </div>
        </div>
        
        <div class="comments-loading" style="display: none;">
            <div class="loading-spinner"></div>
            <p>Loading comments...</p>
        </div>
        
        <div class="comments-list"></div>
        
        <div class="comments-error" style="display: none;">
            <p>Failed to load comments. <button class="retry-comments">Try Again</button></p>
        </div>
        
        <div class="comment-form-container">
            <h4>Leave a Comment</h4>
            <form class="comment-form">
                <div class="form-group">
                    <label for="comment-author">Name</label>
                    <input type="text" id="comment-author" name="author" required>
                </div>
                
                <div class="form-group">
                    <label for="comment-email">Email</label>
                    <input type="email" id="comment-email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="comment-content">Comment</label>
                    <textarea id="comment-content" name="content" rows="5" required></textarea>
                </div>
                
                <div class="form-group" style="display: none;">
                    <label for="comment-website">Website (optional)</label>
                    <input type="url" id="comment-website" name="website">
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="submit-comment">Post Comment</button>
                    <button type="button" class="preview-comment">Preview</button>
                </div>
            </form>
        </div>
    `;
    
    // Insert comments section after the article content
    const articleContent = document.querySelector('.post-content') || document.querySelector('article');
    if (articleContent) {
        articleContent.parentNode.insertBefore(commentsSection, articleContent.nextSibling);
    } else {
        document.body.appendChild(commentsSection);
    }
}

// ============================================
// COMMENT LOADING AND DISPLAY
// ============================================

let currentComments = [];
let currentSort = 'newest';

/**
 * Load comments from API
 */
async function loadComments() {
    const commentsSystem = document.querySelector('.comments-system');
    if (!commentsSystem) return;
    
    showLoading(true);
    hideError();
    
    try {
        const postId = commentsSystem.dataset.postId || getPostIdFromURL();
        const response = await fetch(`/api/comments?post_id=${postId}&sort=${currentSort}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load comments: ${response.status}`);
        }
        
        const comments = await response.json();
        currentComments = comments;
        displayComments(comments);
        updateCommentsCount(comments.length);
        
    } catch (error) {
        console.error('Comments loading error:', error);
        showError('Failed to load comments. Please try again.');
    } finally {
        showLoading(false);
    }
}

/**
 * Display comments in the list
 */
function displayComments(comments) {
    const commentsList = document.querySelector('.comments-list');
    if (!commentsList) return;
    
    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div class="no-comments">
                <p>No comments yet. Be the first to comment!</p>
            </div>
        `;
        return;
    }
    
    commentsList.innerHTML = buildCommentsHTML(comments);
    
    // Re-initialize interactive elements
    setupReplySystem();
    setupVotingSystem();
    setupModerationTools();
}

/**
 * Build HTML for comments tree
 */
function buildCommentsHTML(comments, level = 0) {
    return comments.map(comment => `
        <div class="comment level-${level}" data-comment-id="${comment.id}" data-author-id="${comment.author.id}">
            <div class="comment-header">
                <div class="comment-author">
                    <img src="${comment.author.avatar}" alt="${comment.author.name}" class="comment-avatar">
                    <div class="comment-author-info">
                        <span class="comment-author-name">${comment.author.name}</span>
                        ${comment.author.verified ? '<span class="comment-author-verified">✓</span>' : ''}
                    </div>
                </div>
                
                <div class="comment-meta">
                    <time class="comment-date" datetime="${comment.date}">${formatCommentDate(comment.date)}</time>
                    ${comment.edited ? '<span class="comment-edited">(edited)</span>' : ''}
                </div>
            </div>
            
            <div class="comment-content">
                ${escapeHTML(comment.content)}
            </div>
            
            <div class="comment-actions">
                <button class="comment-reply" data-comment-id="${comment.id}">
                    <span class="reply-icon">↩️</span> Reply
                </button>
                
                <button class="comment-vote comment-upvote" data-comment-id="${comment.id}" data-vote="up">
                    <span class="vote-icon">👍</span>
                    <span class="vote-count">${comment.upvotes || 0}</span>
                </button>
                
                <button class="comment-vote comment-downvote" data-comment-id="${comment.id}" data-vote="down">
                    <span class="vote-icon">👎</span>
                    <span class="vote-count">${comment.downvotes || 0}</span>
                </button>
                
                ${comment.canEdit ? `
                    <button class="comment-edit" data-comment-id="${comment.id}">
                        <span class="edit-icon">✏️</span> Edit
                    </button>
                ` : ''}
                
                ${comment.canDelete ? `
                    <button class="comment-delete" data-comment-id="${comment.id}">
                        <span class="delete-icon">🗑️</span> Delete
                    </button>
                ` : ''}
                
                <button class="comment-report" data-comment-id="${comment.id}">
                    <span class="report-icon">⚠️</span> Report
                </button>
            </div>
            
            ${comment.replies && comment.replies.length > 0 ? `
                <div class="comment-replies">
                    ${buildCommentsHTML(comment.replies, level + 1)}
                </div>
            ` : ''}
            
            ${level === 0 ? `
                <div class="comment-reply-form" style="display: none;" data-parent-id="${comment.id}">
                    <form class="reply-form">
                        <div class="form-group">
                            <textarea name="content" placeholder="Write your reply..." rows="3" required></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="submit-reply">Post Reply</button>
                            <button type="button" class="cancel-reply">Cancel</button>
                        </div>
                    </form>
                </div>
            ` : ''}
        </div>
    `).join('');
}

/**
 * Format comment date for display
 */
function formatCommentDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 7) {
        return date.toLocaleDateString();
    } else if (days > 0) {
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

// ============================================
// COMMENT FORM HANDLING
// ============================================

/**
 * Initialize comment form functionality
 */
function initCommentForm() {
    const commentForm = document.querySelector('.comment-form');
    if (!commentForm) return;
    
    // Form submission
    commentForm.addEventListener('submit', handleCommentSubmit);
    
    // Preview functionality
    const previewButton = commentForm.querySelector('.preview-comment');
    if (previewButton) {
        previewButton.addEventListener('click', showCommentPreview);
    }
    
    // Auto-save draft
    setupCommentDraft();
    
    // Character counter
    setupCharacterCounter();
    
    // Input validation
    setupInputValidation();
}

/**
 * Handle comment form submission
 */
async function handleCommentSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const commentData = {
        author: formData.get('author'),
        email: formData.get('email'),
        content: formData.get('content'),
        website: formData.get('website'),
        parent_id: form.querySelector('[name="parent_id"]')?.value || null
    };
    
    // Validate input
    if (!validateComment(commentData)) {
        showFormError('Please fill in all required fields correctly.');
        return;
    }
    
    try {
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData)
        });
        
        if (response.ok) {
            const newComment = await response.json();
            addNewComment(newComment);
            form.reset();
            clearCommentDraft();
            showFormSuccess('Comment submitted successfully!');
            
            // Track comment submission
            trackCommentEvent('submit', newComment.id);
            
        } else {
            throw new Error('Submission failed');
        }
        
    } catch (error) {
        console.error('Comment submission error:', error);
        showFormError('Failed to submit comment. Please try again.');
    }
}

/**
 * Validate comment data
 */
function validateComment(commentData) {
    if (!commentData.author?.trim() || !commentData.email?.trim() || !commentData.content?.trim()) {
        return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(commentData.email)) {
        return false;
    }
    
    // Content length validation
    if (commentData.content.length < 10 || commentData.content.length > 1000) {
        return false;
    }
    
    return true;
}

/**
 * Show comment preview
 */
function showCommentPreview() {
    const form = document.querySelector('.comment-form');
    const formData = new FormData(form);
    const content = formData.get('content');
    
    if (!content.trim()) {
        showFormError('Please write a comment to preview.');
        return;
    }
    
    const previewModal = document.createElement('div');
    previewModal.className = 'comment-preview-modal';
    previewModal.innerHTML = `
        <div class="preview-content">
            <h4>Comment Preview</h4>
            <div class="preview-text">${escapeHTML(content)}</div>
            <div class="preview-actions">
                <button class="edit-preview">Edit</button>
                <button class="submit-preview">Submit</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(previewModal);
    
    // Add event listeners
    previewModal.querySelector('.edit-preview').addEventListener('click', () => {
        previewModal.remove();
    });
    
    previewModal.querySelector('.submit-preview').addEventListener('click', () => {
        form.dispatchEvent(new Event('submit'));
        previewModal.remove();
    });
}

// ============================================
// REPLY SYSTEM
// ============================================

/**
 * Setup reply functionality
 */
function setupReplySystem() {
    const replyButtons = document.querySelectorAll('.comment-reply');
    
    replyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentId = this.dataset.commentId;
            const comment = this.closest('.comment');
            showReplyForm(commentId, comment);
        });
    });
    
    // Reply form submission
    document.querySelectorAll('.reply-form').forEach(form => {
        form.addEventListener('submit', handleReplySubmit);
    });
    
    // Cancel reply
    document.querySelectorAll('.cancel-reply').forEach(button => {
        button.addEventListener('click', function() {
            const form = this.closest('.comment-reply-form');
            form.style.display = 'none';
        });
    });
}

/**
 * Show reply form for a comment
 */
function showReplyForm(commentId, commentElement) {
    // Hide any other open reply forms
    document.querySelectorAll('.comment-reply-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Show reply form for this comment
    const replyForm = commentElement.querySelector('.comment-reply-form');
    if (replyForm) {
        replyForm.style.display = 'block';
        replyForm.querySelector('textarea').focus();
        
        // Smooth scroll to form
        replyForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Handle reply form submission
 */
async function handleReplySubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const parentId = form.closest('.comment-reply-form').dataset.parentId;
    const content = formData.get('content');
    
    if (!content.trim()) {
        showFormError('Please write a reply.');
        return;
    }
    
    try {
        const response = await fetch('/api/comments/reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            'X-CSRF-Token': getCSRFToken()
            },
            body: JSON.stringify({
                parent_id: parentId,
                content: content,
                author: getCurrentUser()?.name || 'Anonymous',
                email: getCurrentUser()?.email || ''
            })
        });
        
        if (response.ok) {
            const newReply = await response.json();
            addNewReply(parentId, newReply);
            form.reset();
            form.closest('.comment-reply-form').style.display = 'none';
            showFormSuccess('Reply posted successfully!');
            
            trackCommentEvent('reply', newReply.id);
        }
        
    } catch (error) {
        console.error('Reply submission error:', error);
        showFormError('Failed to post reply. Please try again.');
    }
}

/**
 * Add new reply to the comments tree
 */
function addNewReply(parentId, reply) {
    const parentComment = document.querySelector(`.comment[data-comment-id="${parentId}"]`);
    if (!parentComment) return;
    
    let repliesContainer = parentComment.querySelector('.comment-replies');
    if (!repliesContainer) {
        repliesContainer = document.createElement('div');
        repliesContainer.className = 'comment-replies';
        parentComment.appendChild(repliesContainer);
    }
    
    const replyHTML = buildCommentsHTML([reply], 1);
    repliesContainer.insertAdjacentHTML('beforeend', replyHTML);
    
    // Re-initialize interactive elements for the new reply
    const newReply = repliesContainer.lastElementChild;
    setupReplySystemForElement(newReply);
    setupVotingSystemForElement(newReply);
}

// ============================================
// VOTING SYSTEM
// ============================================

/**
 * Setup voting functionality
 */
function setupVotingSystem() {
    const voteButtons = document.querySelectorAll('.comment-vote');
    
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentId = this.dataset.commentId;
            const voteType = this.dataset.vote;
            handleVote(commentId, voteType);
        });
    });
}

/**
 * Handle comment voting
 */
async function handleVote(commentId, voteType) {
    if (!isUserLoggedIn()) {
        showLoginPrompt();
        return;
    }
    
    try {
        const response = await fetch('/api/comments/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCSRFToken()
            },
            body: JSON.stringify({
                comment_id: commentId,
                vote_type: voteType
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            updateVoteDisplay(commentId, result);
            trackCommentEvent('vote', { commentId, voteType });
        }
        
    } catch (error) {
        console.error('Voting error:', error);
        showNotification('Voting failed. Please try again.', 'error');
    }
}

/**
 * Update vote count display
 */
function updateVoteDisplay(commentId, voteData) {
    const comment = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
    if (!comment) return;
    
    const upvoteButton = comment.querySelector('.comment-upvote');
    const downvoteButton = comment.querySelector('.comment-downvote');
    
    if (upvoteButton) {
        upvoteButton.querySelector('.vote-count').textContent = voteData.upvotes;
    }
    
    if (downvoteButton) {
        downvoteButton.querySelector('.vote-count').textContent = voteData.downvotes;
    }
    
    // Update button states based on user's vote
    updateVoteButtonStates(comment, voteData.user_vote);
}

// ============================================
// MODERATION TOOLS
// ============================================

/**
 * Setup moderation functionality
 */
function setupModerationTools() {
    // Edit comments
    document.querySelectorAll('.comment-edit').forEach(button => {
        button.addEventListener('click', handleEditComment);
    });
    
    // Delete comments
    document.querySelectorAll('.comment-delete').forEach(button => {
        button.addEventListener('click', handleDeleteComment);
    });
    
    // Report comments
    document.querySelectorAll('.comment-report').forEach(button => {
        button.addEventListener('click', handleReportComment);
    });
}

/**
 * Handle comment editing
 */
async function handleEditComment(e) {
    const commentId = this.dataset.commentId;
    const comment = this.closest('.comment');
    const contentElement = comment.querySelector('.comment-content');
    
    // Create edit form
    const editForm = document.createElement('form');
    editForm.className = 'comment-edit-form';
    editForm.innerHTML = `
        <textarea class="edit-content">${contentElement.textContent}</textarea>
        <div class="edit-actions">
            <button type="submit">Save</button>
            <button type="button" class="cancel-edit">Cancel</button>
        </div>
    `;
    
    contentElement.replaceWith(editForm);
    
    // Form submission
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveEditedComment(commentId, editForm.querySelector('.edit-content').value);
    });
    
    // Cancel edit
    editForm.querySelector('.cancel-edit').addEventListener('click', () => {
        editForm.replaceWith(contentElement);
    });
}

/**
 * Save edited comment
 */
async function saveEditedComment(commentId, newContent) {
    try {
        const response = await fetch(`/api/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCSRFToken()
            },
            body: JSON.stringify({ content: newContent })
        });
        
        if (response.ok) {
            const updatedComment = await response.json();
            updateCommentDisplay(commentId, updatedComment);
            trackCommentEvent('edit', commentId);
        }
        
    } catch (error) {
        console.error('Edit error:', error);
        showNotification('Failed to edit comment.', 'error');
    }
}

/**
 * Handle comment deletion
 */
async function handleDeleteComment() {
    const commentId = this.dataset.commentId;
    
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-Token': getCSRFToken()
            }
        });
        
        if (response.ok) {
            removeComment(commentId);
            trackCommentEvent('delete', commentId);
        }
        
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Failed to delete comment.', 'error');
    }
}

/**
 * Handle comment reporting
 */
async function handleReportComment() {
    const commentId = this.dataset.commentId;
    
    const reason = prompt('Please specify the reason for reporting this comment:');
    if (!reason) return;
    
    try {
        const response = await fetch('/api/comments/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCSRFToken()
            },
            body: JSON.stringify({
                comment_id: commentId,
                reason: reason
            })
        });
        
        if (response.ok) {
            showNotification('Comment reported. Thank you for your feedback.', 'success');
            trackCommentEvent('report', commentId);
        }
        
    } catch (error) {
        console.error('Report error:', error);
        showNotification('Failed to report comment.', 'error');
    }
}

// ============================================
// USER PREFERENCES AND DRAFT SAVING
// ============================================

/**
 * Load user comment preferences
 */
function loadUserPreferences() {
    const savedSort = localStorage.getItem('comments_sort_preference');
    if (savedSort) {
        currentSort = savedSort;
        const sortSelect = document.querySelector('.comments-sort-select');
        if (sortSelect) {
            sortSelect.value = savedSort;
        }
    }
    
    loadCommentDraft();
}

/**
 * Setup comment draft auto-saving
 */
function setupCommentDraft() {
    const form = document.querySelector('.comment-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(saveCommentDraft, 500));
    });
    
    // Auto-load draft on page load
    window.addEventListener('load', loadCommentDraft);
}

/**
 * Save comment draft to localStorage
 */
function saveCommentDraft() {
    const form = document.querySelector('.comment-form');
    if (!form) return;
    
    const draft = {
        author: form.querySelector('[name="author"]').value,
        email: form.querySelector('[name="email"]').value,
        content: form.querySelector('[name="content"]').value,
        website: form.querySelector('[name="website"]').value,
        timestamp: Date.now()
    };
    
    localStorage.setItem('comment_draft', JSON.stringify(draft));
}

/**
 * Load comment draft from localStorage
 */
function loadCommentDraft() {
    const form = document.querySelector('.comment-form');
    if (!form) return;
    
    const draft = JSON.parse(localStorage.getItem('comment_draft') || '{}');
    const oneHourAgo = Date.now() - 3600000;
    
    if (draft.timestamp && draft.timestamp > oneHourAgo) {
        form.querySelector('[name="author"]').value = draft.author || '';
        form.querySelector('[name="email"]').value = draft.email || '';
        form.querySelector('[name="content"]').value = draft.content || '';
        form.querySelector('[name="website"]').value = draft.website || '';
    }
}

/**
 * Clear comment draft
 */
function clearCommentDraft() {
    localStorage.removeItem('comment_draft');
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

/**
 * Setup all comment-related event listeners
 */
function setupCommentListeners() {
    // Sort selection
    const sortSelect = document.querySelector('.comments-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            localStorage.setItem('comments_sort_preference', currentSort);
            loadComments();
        });
    }
    
    // Retry button
    document.querySelector('.retry-comments')?.addEventListener('click', loadComments);
    
    // Auto-refresh comments
    if (document.querySelector('.comments-system[data-auto-refresh="true"]')) {
        setInterval(loadComments, 30000); // Refresh every 30 seconds
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleCommentKeyboardShortcuts);
}

/**
 * Handle keyboard shortcuts for comments
 */
function handleCommentKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to submit comment
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const focusedElement = document.activeElement;
        if (focusedElement?.closest('.comment-form') || focusedElement?.closest('.reply-form')) {
            e.preventDefault();
            focusedElement.closest('form').dispatchEvent(new Event('submit'));
        }
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Escape HTML to prevent XSS
 */
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show loading state
 */
function showLoading(show) {
    const loading = document.querySelector('.comments-loading');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

/**
 * Show error message
 */
function showError(message) {
    const error = document.querySelector('.comments-error');
    if (error) {
        error.style.display = 'block';
        error.querySelector('p').textContent = message;
    }
}

/**
 * Hide error message
 */
function hideError() {
    const error = document.querySelector('.comments-error');
    if (error) {
        error.style.display = 'none';
    }
}

/**
 * Show form success message
 */
function showFormSuccess(message) {
    showNotification(message, 'success');
}

/**
 * Show form error message
 */
function showFormError(message) {
    showNotification(message, 'error');
}

/**
 * Show general notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        z-index: 9999;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/**
 * Get CSRF token from meta tag
 */
function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content || '';
}

/**
 * Check if user is logged in
 */
function isUserLoggedIn() {
    return document.cookie.includes('user_session=') || localStorage.getItem('user_token');
}

/**
 * Show login prompt
 */
function showLoginPrompt() {
    showNotification('Please log in to perform this action.', 'info');
}

/**
 * Get current user info
 */
function getCurrentUser() {
    // Implement based on your authentication system
    try {
        return JSON.parse(localStorage.getItem('user_info') || '{}');
    } catch {
        return null;
    }
}

/**
 * Get post ID from URL
 */
function getPostIdFromURL() {
    const path = window.location.pathname;
    const match = path.match(/\/post\/(\d+)/) || path.match(/\/articles\/(\d+)/);
    return match ? match[1] : null;
}

/**
 * Update comments count display
 */
function updateCommentsCount(count) {
    const countElement = document.querySelector('.comments-count');
    if (countElement) {
        countElement.textContent = `${count} comment${count !== 1 ? 's' : ''}`;
    }
    
    // Update any other count displays
    document.querySelectorAll('[data-comments-count]').forEach(el => {
        el.textContent = count;
    });
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
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

/**
 * Track comment events for analytics
 */
function trackCommentEvent(action, data = null) {
    console.log(`Comment ${action}:`, data);
    
    if (typeof gtag === 'function') {
        gtag('event', 'comment_interaction', {
            event_action: action,
            event_label: data,
            post_id: getPostIdFromURL(),
            user_id: getCurrentUser()?.id || 'anonymous'
        });
    }
}

// ============================================
// EXPORT FOR GLOBAL USAGE
// ============================================

// Make comments functions available globally
window.Comments = {
    load: loadComments,
    submit: handleCommentSubmit,
    reply: handleReplySubmit,
    vote: handleVote,
    edit: handleEditComment,
    delete: handleDeleteComment,
    report: handleReportComment
};

// Auto-initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    initCommentsSystem();
    setupCommentListeners();
});