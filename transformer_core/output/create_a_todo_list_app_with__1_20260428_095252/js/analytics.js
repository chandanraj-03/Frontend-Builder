/**
 * analytics.js - Analytics and statistics functionality for task management insights
 * Handles productivity tracking, completion charts, and performance metrics
 */

class AnalyticsManager {
    constructor() {
        this.analyticsData = {
            tasks: {
                totalCreated: 0,
                totalCompleted: 0,
                totalDeleted: 0
            },
            productivity: {
                daily: [],
                weekly: [],
                monthly: []
            },
            streaks: {
                current: 0,
                longest: 0,
                lastCompletion: null
            },
            categories: {},
            timeStats: {
                averageCompletionTime: 0,
                fastestCompletion: Infinity,
                slowestCompletion: 0
            }
        };
        this.init();
    }

    // Initialize analytics manager
    init() {
        this.loadAnalyticsData();
        this.setupAnalyticsListeners();
        this.startPeriodicUpdates();
        console.log('Analytics Manager initialized');
    }

    // Load analytics data from localStorage
    loadAnalyticsData() {
        try {
            const storedData = localStorage.getItem('todoAnalytics');
            if (storedData) {
                this.analyticsData = { ...this.analyticsData, ...JSON.parse(storedData) };
            }
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    }

    // Save analytics data to localStorage
    saveAnalyticsData() {
        try {
            localStorage.setItem('todoAnalytics', JSON.stringify(this.analyticsData));
        } catch (error) {
            console.error('Error saving analytics data:', error);
        }
    }

    // Setup event listeners for task operations
    setupAnalyticsListeners() {
        // Listen for task events if task manager exists
        if (window.taskManager) {
            this.monitorTaskEvents();
        } else {
            // Wait for task manager to be available
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.monitorTaskEvents(), 1000);
            });
        }
    }

    // Monitor task-related events
    monitorTaskEvents() {
        // Override or hook into task manager methods
        const originalAddTask = window.taskManager?.addTask;
        const originalToggleTask = window.taskManager?.toggleTaskCompletion;
        const originalDeleteTask = window.taskManager?.deleteTask;

        if (originalAddTask) {
            window.taskManager.addTask = (text) => {
                const result = originalAddTask.call(window.taskManager, text);
                this.trackTaskCreated();
                return result;
            };
        }

        if (originalToggleTask) {
            window.taskManager.toggleTaskCompletion = (id) => {
                const task = window.taskManager.tasks.find(t => t.id === id);
                const wasCompleted = task?.completed;
                const result = originalToggleTask.call(window.taskManager, id);
                
                if (task && !wasCompleted && task.completed) {
                    this.trackTaskCompleted(task);
                }
                return result;
            };
        }

        if (originalDeleteTask) {
            window.taskManager.deleteTask = (id) => {
                const result = originalDeleteTask.call(window.taskManager, id);
                this.trackTaskDeleted();
                return result;
            };
        }
    }

    // Track task creation
    trackTaskCreated() {
        this.analyticsData.tasks.totalCreated++;
        this.updateDailyStats('created');
        this.saveAnalyticsData();
        this.updateStatsDisplay();
    }

    // Track task completion
    trackTaskCompleted(task) {
        this.analyticsData.tasks.totalCompleted++;
        
        // Update completion time stats
        const creationTime = new Date(task.createdAt);
        const completionTime = new Date();
        const completionDuration = completionTime - creationTime;
        
        this.updateTimeStats(completionDuration);
        this.updateStreak();
        this.updateDailyStats('completed');
        this.updateCategoryStats(task);
        
        this.saveAnalyticsData();
        this.updateStatsDisplay();
        this.checkAchievements();
    }

    // Track task deletion
    trackTaskDeleted() {
        this.analyticsData.tasks.totalDeleted++;
        this.updateDailyStats('deleted');
        this.saveAnalyticsData();
        this.updateStatsDisplay();
    }

    // Update time-based statistics
    updateTimeStats(duration) {
        const hours = duration / (1000 * 60 * 60);
        
        this.analyticsData.timeStats.averageCompletionTime = 
            ((this.analyticsData.timeStats.averageCompletionTime * (this.analyticsData.tasks.totalCompleted - 1)) + hours) / 
            this.analyticsData.tasks.totalCompleted;
        
        this.analyticsData.timeStats.fastestCompletion = 
            Math.min(this.analyticsData.timeStats.fastestCompletion, hours);
        
        this.analyticsData.timeStats.slowestCompletion = 
            Math.max(this.analyticsData.timeStats.slowestCompletion, hours);
    }

    // Update completion streak
    updateStreak() {
        const today = new Date().toDateString();
        const lastCompletion = this.analyticsData.streaks.lastCompletion;
        
        if (!lastCompletion || new Date(lastCompletion).toDateString() !== today) {
            if (lastCompletion && this.isConsecutiveDay(new Date(lastCompletion), new Date())) {
                this.analyticsData.streaks.current++;
            } else {
                this.analyticsData.streaks.current = 1;
            }
            
            this.analyticsData.streaks.longest = 
                Math.max(this.analyticsData.streaks.longest, this.analyticsData.streaks.current);
            
            this.analyticsData.streaks.lastCompletion = new Date().toISOString();
        }
    }

    // Check if two dates are consecutive days
    isConsecutiveDay(date1, date2) {
        const day1 = new Date(date1);
        const day2 = new Date(date2);
        day1.setHours(0, 0, 0, 0);
        day2.setHours(0, 0, 0, 0);
        
        const diffTime = day2 - day1;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        return diffDays === 1;
    }

    // Update daily statistics
    updateDailyStats(action) {
        const today = new Date().toDateString();
        let dailyStat = this.analyticsData.productivity.daily.find(stat => stat.date === today);
        
        if (!dailyStat) {
            dailyStat = { date: today, created: 0, completed: 0, deleted: 0 };
            this.analyticsData.productivity.daily.push(dailyStat);
            
            // Keep only last 30 days
            if (this.analyticsData.productivity.daily.length > 30) {
                this.analyticsData.productivity.daily.shift();
            }
        }
        
        dailyStat[action]++;
        
        // Update weekly and monthly stats
        this.updateWeeklyMonthlyStats();
    }

    // Update weekly and monthly statistics
    updateWeeklyMonthlyStats() {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        this.analyticsData.productivity.weekly = this.aggregateStatsByPeriod(weekStart);
        this.analyticsData.productivity.monthly = this.aggregateStatsByPeriod(monthStart);
    }

    // Aggregate statistics by time period
    aggregateStatsByPeriod(startDate) {
        const aggregated = { created: 0, completed: 0, deleted: 0 };
        
        this.analyticsData.productivity.daily.forEach(stat => {
            const statDate = new Date(stat.date);
            if (statDate >= startDate) {
                aggregated.created += stat.created;
                aggregated.completed += stat.completed;
                aggregated.deleted += stat.deleted;
            }
        });
        
        return aggregated;
    }

    // Update category statistics
    updateCategoryStats(task) {
        const category = task.category || 'uncategorized';
        
        if (!this.analyticsData.categories[category]) {
            this.analyticsData.categories[category] = { total: 0, completed: 0 };
        }
        
        this.analyticsData.categories[category].total++;
        this.analyticsData.categories[category].completed++;
    }

    // Update statistics display
    updateStatsDisplay() {
        this.updateTaskCountDisplay();
        this.updateCompletionCharts();
        this.updateProductivityTrends();
        this.updateCategoryBreakdown();
        this.updateWeeklyMonthlyStatsDisplay();
    }

    // Update task count display
    updateTaskCountDisplay() {
        const countElement = document.getElementById('task-count-display');
        if (countElement) {
            const activeTasks = window.taskManager?.tasks.filter(t => !t.completed).length || 0;
            countElement.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;
        }
    }

    // Update completion charts
    updateCompletionCharts() {
        const chartsElement = document.getElementById('completion-charts');
        if (chartsElement) {
            this.renderCompletionChart(chartsElement);
        }
    }

    // Render completion chart
    renderCompletionChart(container) {
        const completionRate = this.analyticsData.tasks.totalCreated > 0 ? 
            (this.analyticsData.tasks.totalCompleted / this.analyticsData.tasks.totalCreated) * 100 : 0;
        
        container.innerHTML = `
            <div class="chart-container">
                <div class="chart-title">Completion Rate</div>
                <div class="chart-progress">
                    <div class="progress-bar" style="width: ${completionRate}%">
                        <span class="progress-text">${Math.round(completionRate)}%</span>
                    </div>
                </div>
                <div class="chart-stats">
                    <div>Completed: ${this.analyticsData.tasks.totalCompleted}</div>
                    <div>Total: ${this.analyticsData.tasks.totalCreated}</div>
                </div>
            </div>
        `;
        
        this.animateChart(container.querySelector('.progress-bar'));
    }

    // Update productivity trends
    updateProductivityTrends() {
        const trendsElement = document.getElementById('productivity-trends');
        if (trendsElement) {
            this.renderProductivityTrends(trendsElement);
        }
    }

    // Render productivity trends
    renderProductivityTrends(container) {
        const last7Days = this.analyticsData.productivity.daily.slice(-7);
        
        container.innerHTML = `
            <div class="trends-container">
                <div class="trends-title">7-Day Productivity</div>
                <div class="trends-chart">
                    ${last7Days.map(day => `
                        <div class="trend-bar" style="height: ${(day.completed / Math.max(...last7Days.map(d => d.completed)) || 0) * 100}%">
                            <span class="trend-value">${day.completed}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="trends-labels">
                    ${last7Days.map(day => `
                        <div class="trend-label">${new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.animateTrendBars(container.querySelectorAll('.trend-bar'));
    }

    // Update category breakdown
    updateCategoryBreakdown() {
        const breakdownElement = document.getElementById('task-category-breakdown');
        if (breakdownElement) {
            this.renderCategoryBreakdown(breakdownElement);
        }
    }

    // Render category breakdown
    renderCategoryBreakdown(container) {
        const categories = Object.entries(this.analyticsData.categories);
        
        container.innerHTML = `
            <div class="breakdown-container">
                <div class="breakdown-title">Category Breakdown</div>
                <div class="breakdown-chart">
                    ${categories.map(([category, stats]) => `
                        <div class="category-item">
                            <span class="category-name">${category}</span>
                            <span class="category-stats">${stats.completed}/${stats.total}</span>
                            <div class="category-bar" style="width: ${(stats.completed / stats.total) * 100 || 0}%"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Update weekly/monthly stats display
    updateWeeklyMonthlyStatsDisplay() {
        const weeklyElement = document.getElementById('weekly-monthly-stats');
        if (weeklyElement) {
            weeklyElement.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <h4>This Week</h4>
                        <div class="stat-number">${this.analyticsData.productivity.weekly.completed}</div>
                        <div class="stat-label">Tasks Completed</div>
                    </div>
                    <div class="stat-card">
                        <h4>This Month</h4>
                        <div class="stat-number">${this.analyticsData.productivity.monthly.completed}</div>
                        <div class="stat-label">Tasks Completed</div>
                    </div>
                    <div class="stat-card">
                        <h4>Current Streak</h4>
                        <div class="stat-number">${this.analyticsData.streaks.current}</div>
                        <div class="stat-label">Days</div>
                    </div>
                </div>
            `;
        }
    }

    // Check for achievements
    checkAchievements() {
        this.checkStreakAchievements();
        this.checkCompletionAchievements();
    }

    // Check streak achievements
    checkStreakAchievements() {
        const badgesElement = document.getElementById('achievement-badges');
        if (!badgesElement) return;

        const streaks = this.analyticsData.streaks;
        
        if (streaks.current >= 7 && !badgesElement.querySelector('.badge-7day')) {
            this.unlockBadge('7-Day Streak', 'badge-7day');
        }
        
        if (streaks.current >= 30 && !badgesElement.querySelector('.badge-30day')) {
            this.unlockBadge('30-Day Streak', 'badge-30day');
        }
    }

    // Check completion achievements
    checkCompletionAchievements() {
        const badgesElement = document.getElementById('achievement-badges');
        if (!badgesElement) return;

        const totalCompleted = this.analyticsData.tasks.totalCompleted;
        
        if (totalCompleted >= 10 && !badgesElement.querySelector('.badge-10tasks')) {
            this.unlockBadge('10 Tasks Completed', 'badge-10tasks');
        }
        
        if (totalCompleted >= 100 && !badgesElement.querySelector('.badge-100tasks')) {
            this.unlockBadge('100 Tasks Master', 'badge-100tasks');
        }
    }

    // Unlock achievement badge
    unlockBadge(title, className) {
        const badgesElement = document.getElementById('achievement-badges');
        if (!badgesElement) return;

        const badge = document.createElement('div');
        badge.className = `achievement-badge ${className}`;
        badge.innerHTML = `
            <div class="badge-icon">🏆</div>
            <div class="badge-title">${title}</div>
        `;
        
        badgesElement.appendChild(badge);
        this.animateBadgeUnlock(badge);
    }

    // Start periodic updates
    startPeriodicUpdates() {
        // Update stats every minute
        setInterval(() => {
            this.updateStatsDisplay();
        }, 60000);
    }

    // Animation: Chart progress
    animateChart(element) {
        if (element) {
            element.style.transition = 'width 1s ease-in-out';
        }
    }

    // Animation: Trend bars
    animateTrendBars(bars) {
        bars.forEach((bar, index) => {
            bar.style.transition = 'height 0.8s ease-in-out';
            bar.style.transitionDelay = `${index * 0.1}s`;
        });
    }

    // Animation: Badge unlock
    animateBadgeUnlock(badge) {
        badge.style.transform = 'scale(0)';
        badge.style.opacity = '0';
        
        setTimeout(() => {
            badge.style.transition = 'all 0.5s ease-out';
            badge.style.transform = 'scale(1)';
            badge.style.opacity = '1';
        }, 100);
    }

    // Get analytics summary
    getSummary() {
        return {
            completionRate: this.analyticsData.tasks.totalCreated > 0 ? 
                (this.analyticsData.tasks.totalCompleted / this.analyticsData.tasks.totalCreated) * 100 : 0,
            currentStreak: this.analyticsData.streaks.current,
            weeklyCompleted: this.analyticsData.productivity.weekly.completed,
            monthlyCompleted: this.analyticsData.productivity.monthly.completed
        };
    }
}

// Initialize analytics manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
});