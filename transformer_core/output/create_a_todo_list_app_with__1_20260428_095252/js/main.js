/**
 * main.js - Core application logic, initialization, and shared utilities
 * Handles todo task management with local storage, UI interactions, and animations
 */

// Application state and utilities
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.isInitialized = false;
        this.init();
    }

    // Initialize application
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.renderTasks();
        this.updateTaskCount();
        this.isInitialized = true;
        console.log('TodoApp initialized');
    }

    // Load tasks from localStorage
    loadFromStorage() {
        const storedTasks = localStorage.getItem('todoTasks');
        if (storedTasks) {
            this.tasks = JSON.parse(storedTasks);
        }
    }

    // Save tasks to localStorage
    saveToStorage() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    // Add new task
    addTask(text) {
        if (!text.trim()) return;
        
        const newTask = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.saveToStorage();
        this.renderTasks();
        this.updateTaskCount();
        this.animateTaskAddition(newTask.id);
    }

    // Toggle task completion
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage();
            this.renderTasks();
            this.updateTaskCount();
            this.animateTaskToggle(id);
        }
    }

    // Delete individual task
    deleteTask(id) {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            this.animateTaskRemoval(id, () => {
                this.tasks.splice(taskIndex, 1);
                this.saveToStorage();
                this.renderTasks();
                this.updateTaskCount();
            });
        }
    }

    // Clear all completed tasks
    clearCompleted() {
        const completedTasks = this.tasks.filter(t => t.completed);
        if (completedTasks.length === 0) return;

        this.animateBulkRemoval(completedTasks, () => {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveToStorage();
            this.renderTasks();
            this.updateTaskCount();
        });
    }

    // Filter tasks based on current selection
    filterTasks(filter) {
        this.currentFilter = filter;
        this.renderTasks();
        this.updateActiveFilterUI(filter);
    }

    // Render tasks based on current filter
    renderTasks() {
        const taskList = document.getElementById('task-list');
        if (!taskList) return;

        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}" draggable="true">
                <div class="task-checkbox">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </div>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="delete-task-btn" aria-label="Delete task">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
                </button>
            </li>
        `).join('');

        this.setupTaskInteractions();
    }

    // Get tasks based on current filter
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    // Update task count display
    updateTaskCount() {
        const countElement = document.getElementById('task-count-display');
        if (!countElement) return;

        const activeCount = this.tasks.filter(t => !t.completed).length;
        countElement.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} left`;
    }

    // Show empty state illustration
    showEmptyState() {
        const taskList = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state-illustration');
        
        if (taskList) taskList.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
    }

    // Hide empty state
    hideEmptyState() {
        const taskList = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state-illustration');
        
        if (taskList) taskList.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
    }

    // Setup task interactions (checkboxes, delete buttons)
    setupTaskInteractions() {
        document.querySelectorAll('.task-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.toggleTask(taskId);
            });
        });

        document.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.deleteTask(taskId);
            });
        });

        this.setupDragAndDrop();
    }

    // Setup drag and drop functionality
    setupDragAndDrop() {
        const taskList = document.getElementById('task-list');
        if (!taskList) return;

        let draggedItem = null;

        taskList.querySelectorAll('.task-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                setTimeout(() => item.classList.add('dragging'), 0);
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                draggedItem = null;
            });
        });

        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(taskList, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (draggable && afterElement) {
                taskList.insertBefore(draggable, afterElement);
            }
        });

        taskList.addEventListener('drop', (e) => {
            e.preventDefault();
            this.updateTaskOrder();
        });
    }

    // Get element to insert dragged item after
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

    // Update task order after drag and drop
    updateTaskOrder() {
        const taskList = document.getElementById('task-list');
        const newOrder = [...taskList.querySelectorAll('.task-item')].map(item => 
            parseInt(item.dataset.id)
        );
        
        this.tasks.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
        this.saveToStorage();
    }

    // Setup event listeners
    setupEventListeners() {
        // Task input
        const taskInput = document.getElementById('task-input-field');
        if (taskInput) {
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTask(taskInput.value);
                    taskInput.value = '';
                }
            });
        }

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                if (filter) {
                    this.filterTasks(filter);
                }
            });
        });

        // Clear completed button
        const clearBtn = document.getElementById('clear-completed-button');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCompleted());
        }

        // Save settings button
        const saveSettingsBtn = document.getElementById('save-settings-button');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }
    }

    // Update active filter UI
    updateActiveFilterUI(filter) {
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });
    }

    // Save application settings
    saveSettings() {
        // Implementation for saving various settings
        console.log('Settings saved');
    }

    // Animation: Task addition
    animateTaskAddition(taskId) {
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.style.opacity = '0';
            taskElement.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                taskElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                taskElement.style.opacity = '1';
                taskElement.style.transform = 'translateY(0)';
            }, 10);
        }
    }

    // Animation: Task toggle
    animateTaskToggle(taskId) {
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.style.transition = 'all 0.2s ease';
        }
    }

    // Animation: Task removal
    animateTaskRemoval(taskId, callback) {
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.style.transition = 'all 0.3s ease';
            taskElement.style.opacity = '0';
            taskElement.style.transform = 'translateX(100%)';
            
            setTimeout(callback, 300);
        } else {
            callback();
        }
    }

    // Animation: Bulk removal
    animateBulkRemoval(tasks, callback) {
        let completed = 0;
        const total = tasks.length;

        tasks.forEach(task => {
            const taskElement = document.querySelector(`[data-id="${task.id}"]`);
            if (taskElement) {
                taskElement.style.transition = 'all 0.3s ease';
                taskElement.style.opacity = '0';
                taskElement.style.transform = 'translateX(100%)';
                
                completed++;
                if (completed === total) {
                    setTimeout(callback, 300);
                }
            } else {
                completed++;
                if (completed === total) {
                    callback();
                }
            }
        });
    }

    // Utility: Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});

// Utility functions for shared use across components
const Utils = {
    // Debounce function for performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Smooth scroll to element
    smoothScrollTo(element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// Export utilities for use in other modules
window.AppUtils = Utils;