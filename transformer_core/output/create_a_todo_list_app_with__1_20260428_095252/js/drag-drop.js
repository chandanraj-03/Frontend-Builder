/**
 * drag-drop.js - Drag and drop functionality for task reordering and interactive elements
 * Handles smooth drag operations with visual feedback and accessibility support
 */

class DragDropManager {
    constructor() {
        this.draggedItem = null;
        this.dragOverItem = null;
        this.isDragging = false;
        this.dragStartY = 0;
        this.init();
    }

    // Initialize drag and drop functionality
    init() {
        this.setupDragDropListeners();
        this.setupAccessibility();
        console.log('Drag Drop Manager initialized');
    }

    // Setup drag and drop event listeners
    setupDragDropListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeTaskDragDrop();
            this.initializeOtherDraggableElements();
        });
    }

    // Initialize task list drag and drop
    initializeTaskDragDrop() {
        const taskList = document.getElementById('task-list');
        if (!taskList) return;

        // Make tasks draggable
        this.makeTasksDraggable();

        // Setup drop zone
        taskList.addEventListener('dragover', (e) => this.handleDragOver(e, taskList));
        taskList.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        taskList.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        taskList.addEventListener('drop', (e) => this.handleDrop(e, taskList));
    }

    // Initialize other draggable elements
    initializeOtherDraggableElements() {
        // Setup draggable settings panels if they exist
        const draggablePanels = document.querySelectorAll('[draggable="true"]');
        draggablePanels.forEach(panel => {
            this.setupDraggableElement(panel);
        });
    }

    // Make all tasks draggable
    makeTasksDraggable() {
        const taskItems = document.querySelectorAll('.task-item');
        taskItems.forEach(item => {
            this.setupDraggableTask(item);
        });
    }

    // Setup individual draggable task
    setupDraggableTask(taskItem) {
        taskItem.setAttribute('draggable', 'true');
        taskItem.setAttribute('aria-grabbed', 'false');
        
        taskItem.addEventListener('dragstart', (e) => this.handleDragStart(e, taskItem));
        taskItem.addEventListener('dragend', (e) => this.handleDragEnd(e, taskItem));
        taskItem.addEventListener('drag', (e) => this.handleDrag(e, taskItem));
    }

    // Setup generic draggable element
    setupDraggableElement(element) {
        element.addEventListener('dragstart', (e) => this.handleGenericDragStart(e, element));
        element.addEventListener('dragend', (e) => this.handleGenericDragEnd(e, element));
    }

    // Handle drag start for tasks
    handleDragStart(e, taskItem) {
        this.draggedItem = taskItem;
        this.isDragging = true;
        this.dragStartY = e.clientY;
        
        // Set drag image and data
        e.dataTransfer.setData('text/plain', taskItem.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
        
        // Visual feedback
        taskItem.classList.add('dragging');
        taskItem.setAttribute('aria-grabbed', 'true');
        taskItem.style.opacity = '0.5';
        
        // Add ghost element for better visual feedback
        this.createDragGhost(taskItem);
        
        // Prevent text selection during drag
        e.preventDefault();
        
        console.log('Drag started for task:', taskItem.dataset.id);
    }

    // Handle generic drag start
    handleGenericDragStart(e, element) {
        e.dataTransfer.setData('text/plain', element.id || element.dataset.id);
        element.classList.add('dragging');
        this.animateDragStart(element);
    }

    // Handle drag end for tasks
    handleDragEnd(e, taskItem) {
        this.isDragging = false;
        
        // Remove visual feedback
        taskItem.classList.remove('dragging');
        taskItem.setAttribute('aria-grabbed', 'false');
        taskItem.style.opacity = '1';
        taskItem.style.transform = '';
        
        // Clean up drag state
        this.cleanupDragState();
        
        console.log('Drag ended for task:', taskItem.dataset.id);
    }

    // Handle generic drag end
    handleGenericDragEnd(e, element) {
        element.classList.remove('dragging');
        this.animateDragEnd(element);
    }

    // Handle drag movement
    handleDrag(e, taskItem) {
        // Update position for smooth movement
        const deltaY = e.clientY - this.dragStartY;
        if (Math.abs(deltaY) > 5) {
            taskItem.style.transform = `translateY(${deltaY}px)`;
        }
    }

    // Handle drag over event
    handleDragOver(e, container) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Find the element after which to insert
        const afterElement = this.getDragAfterElement(container, e.clientY);
        this.dragOverItem = afterElement;
        
        // Visual feedback for drop zone
        if (afterElement) {
            this.showDropIndicator(afterElement, e.clientY);
        }
    }

    // Handle drag enter
    handleDragEnter(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    // Handle drag leave
    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
        this.hideDropIndicator();
    }

    // Handle drop event
    handleDrop(e, container) {
        e.preventDefault();
        
        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedElement = document.querySelector(`[data-id="${draggedId}"]`);
        
        if (!draggedElement) return;
        
        const afterElement = this.getDragAfterElement(container, e.clientY);
        
        if (afterElement) {
            container.insertBefore(draggedElement, afterElement);
        } else {
            container.appendChild(draggedElement);
        }
        
        // Animate the drop and update state
        this.animateDrop(draggedElement);
        this.updateTaskOrder();
        
        // Clean up
        this.cleanupDragState();
        container.classList.remove('drag-over');
        
        console.log('Task dropped at new position');
    }

    // Get element after which to insert dragged item
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Update task order in data store
    updateTaskOrder() {
        const taskList = document.getElementById('task-list');
        if (!taskList || !window.taskManager) return;
        
        const newOrder = [...taskList.querySelectorAll('.task-item')].map(item => 
            parseInt(item.dataset.id)
        );
        
        // Update task order in the manager
        if (window.taskManager.updateTaskOrder) {
            window.taskManager.updateTaskOrder(newOrder);
        }
    }

    // Create drag ghost element for better visual feedback
    createDragGhost(taskItem) {
        const ghost = taskItem.cloneNode(true);
        ghost.classList.add('drag-ghost');
        ghost.style.position = 'absolute';
        ghost.style.opacity = '0.8';
        ghost.style.pointerEvents = 'none';
        ghost.style.zIndex = '1000';
        
        document.body.appendChild(ghost);
        
        // Position ghost near cursor
        const updateGhostPosition = (e) => {
            ghost.style.left = (e.clientX + 10) + 'px';
            ghost.style.top = (e.clientY + 10) + 'px';
        };
        
        document.addEventListener('mousemove', updateGhostPosition);
        
        // Clean up on drag end
        document.addEventListener('dragend', () => {
            ghost.remove();
            document.removeEventListener('mousemove', updateGhostPosition);
        }, { once: true });
    }

    // Show drop indicator
    showDropIndicator(afterElement, y) {
        this.hideDropIndicator();
        
        const indicator = document.createElement('div');
        indicator.className = 'drop-indicator';
        indicator.style.cssText = `
            height: 2px;
            background: #007bff;
            position: absolute;
            left: 0;
            right: 0;
            z-index: 100;
        `;
        
        const rect = afterElement.getBoundingClientRect();
        const containerRect = afterElement.parentElement.getBoundingClientRect();
        const top = y < rect.top + rect.height / 2 ? rect.top - containerRect.top : rect.bottom - containerRect.top;
        
        indicator.style.top = top + 'px';
        afterElement.parentElement.style.position = 'relative';
        afterElement.parentElement.appendChild(indicator);
    }

    // Hide drop indicator
    hideDropIndicator() {
        const existingIndicator = document.querySelector('.drop-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    }

    // Clean up drag state
    cleanupDragState() {
        this.draggedItem = null;
        this.dragOverItem = null;
        this.hideDropIndicator();
        
        // Remove drag-over classes
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
    }

    // Setup accessibility features
    setupAccessibility() {
        // Add keyboard drag and drop support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.hasAttribute('draggable')) {
                this.handleKeyboardDragStart(e.target);
            }
        });
    }

    // Handle keyboard drag start
    handleKeyboardDragStart(element) {
        console.log('Keyboard drag started for:', element.id || element.dataset.id);
        // Implement keyboard-based drag and drop
    }

    // Animation: Drag start
    animateDragStart(element) {
        element.style.transition = 'all 0.2s ease';
        element.style.transform = 'scale(1.02)';
        element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }

    // Animation: Drag end
    animateDragEnd(element) {
        element.style.transform = '';
        element.style.boxShadow = '';
        
        setTimeout(() => {
            element.style.transition = '';
        }, 200);
    }

    // Animation: Drop
    animateDrop(element) {
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1)';
        
        // Pulse animation to confirm drop
        element.animate([
            { backgroundColor: 'rgba(0, 123, 255, 0.1)' },
            { backgroundColor: 'transparent' }
        ], {
            duration: 300,
            easing: 'ease-out'
        });
        
        setTimeout(() => {
            element.style.transition = '';
        }, 300);
    }

    // Refresh draggable elements (call after DOM updates)
    refreshDraggableElements() {
        this.makeTasksDraggable();
    }
}

// Initialize drag drop manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dragDropManager = new DragDropManager();
});

// Export function to refresh draggable elements
window.refreshDraggableElements = () => {
    if (window.dragDropManager) {
        window.dragDropManager.refreshDraggableElements();
    }
};