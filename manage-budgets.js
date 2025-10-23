// Budget data
const categories = [
    {
        id: 'food',
        name: 'Food',
        icon: '🍔',
        color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        budget: 250,
        spent: 72
    },
    {
        id: 'transport',
        name: 'Transport',
        icon: '🚗',
        color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
        budget: 180,
        spent: 145
    },
    {
        id: 'shopping',
        name: 'Shopping',
        icon: '🛍️',
        color: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
        budget: 400,
        spent: 89
    },
    {
        id: 'bills',
        name: 'Bills',
        icon: '💡',
        color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        budget: 320,
        spent: 320
    },
    {
        id: 'other',
        name: 'Other',
        icon: '📦',
        color: 'linear-gradient(135deg, #c2e9fb 0%, #a1c4fd 100%)',
        budget: 350,
        spent: 99
    }
];

let currentMonth = 'October 2025';
let editingCategory = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    updateOverview();
    setupEventListeners();
    setupSVGGradient();
});

// Setup SVG gradient for circular progress
function setupSVGGradient() {
    const svg = document.querySelector('.progress-ring');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'gradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('style', 'stop-color:#667eea;stop-opacity:1');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('style', 'stop-color:#764ba2;stop-opacity:1');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.insertBefore(defs, svg.firstChild);
}

// Render category cards
function renderCategories() {
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = '';

    categories.forEach(category => {
        const percentage = (category.spent / category.budget) * 100;
        const progressColor = percentage < 70 ? 'green' : percentage < 90 ? 'yellow' : 'red';

        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-header">
                <div class="category-info">
                    <div class="category-icon" style="background: ${category.color}">
                        ${category.icon}
                    </div>
                    <div class="category-name">${category.name}</div>
                </div>
                <div class="edit-icon" data-id="${category.id}">✏️</div>
            </div>
            <div class="category-amounts">
                <span class="amount-spent">Spent $${category.spent.toFixed(2)}</span>
                <span class="amount-budget">Budget $${category.budget.toFixed(2)}</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar ${progressColor}" style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
        `;

        // Click handler for card
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('edit-icon')) {
                openEditModal(category.id);
            }
        });

        // Click handler for edit icon
        card.querySelector('.edit-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(category.id);
        });

        grid.appendChild(card);
    });
}

// Update overview section
function updateOverview() {
    const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
    const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
    const percentage = (totalSpent / totalBudget) * 100;

    // Update text
    document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById('totalBudget').textContent = `$${totalBudget.toFixed(2)}`;
    document.getElementById('totalPercent').textContent = `${Math.round(percentage)}%`;

    // Update circular progress
    const circle = document.getElementById('progressCircle');
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    circle.style.strokeDashoffset = offset;
}

// Open edit modal
function openEditModal(categoryId) {
    editingCategory = categories.find(cat => cat.id === categoryId);
    if (!editingCategory) return;

    const modal = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalIcon = document.getElementById('modalIcon');
    const budgetInput = document.getElementById('budgetInput');
    const budgetSlider = document.getElementById('budgetSlider');
    const modalSpent = document.getElementById('modalSpent');

    modalTitle.textContent = `Edit ${editingCategory.name} Budget`;
    modalIcon.innerHTML = editingCategory.icon;
    modalIcon.style.background = editingCategory.color;
    budgetInput.value = editingCategory.budget;
    budgetSlider.value = editingCategory.budget;
    budgetSlider.max = Math.max(1000, editingCategory.budget * 1.5);
    modalSpent.textContent = `$${editingCategory.spent.toFixed(2)}`;

    modal.classList.add('active');

    // Sync input and slider
    budgetInput.addEventListener('input', syncSlider);
    budgetSlider.addEventListener('input', syncInput);
}

// Close modal
function closeEditModal() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('active');
    editingCategory = null;
}

// Sync slider with input
function syncSlider(e) {
    const budgetSlider = document.getElementById('budgetSlider');
    budgetSlider.value = e.target.value;
}

// Sync input with slider
function syncInput(e) {
    const budgetInput = document.getElementById('budgetInput');
    budgetInput.value = e.target.value;
}

// Save budget changes
function saveBudget() {
    if (!editingCategory) return;

    const budgetInput = document.getElementById('budgetInput');
    const newBudget = parseFloat(budgetInput.value);

    if (isNaN(newBudget) || newBudget < 0) {
        alert('Please enter a valid budget amount');
        return;
    }

    editingCategory.budget = newBudget;

    // Smooth update animation
    renderCategories();
    updateOverview();
    closeEditModal();

    // Show success feedback
    showNotification('Budget updated successfully!');
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'custom-notification';

    // Check if mobile
    const isMobile = window.innerWidth <= 768;

    notification.style.cssText = `
        position: fixed;
        ${isMobile ? 'top: 1rem; left: 1rem; right: 1rem;' : 'top: 2rem; right: 2rem;'}
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        z-index: 2000;
        animation: ${isMobile ? 'slideInMobile' : 'slideIn'} 0.3s ease;
        ${isMobile ? 'text-align: center; max-width: 100%;' : ''}
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = `${isMobile ? 'slideOutMobile' : 'slideOut'} 0.3s ease`;
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }

    @keyframes slideInMobile {
        from {
            opacity: 0;
            transform: translateY(-50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideOutMobile {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-50px);
        }
    }
`;
document.head.appendChild(style);

// Reset all budgets
function resetBudgets() {
    if (!confirm('Are you sure you want to reset all budgets? This will set all budgets to $0.')) {
        return;
    }

    categories.forEach(cat => cat.budget = 0);
    renderCategories();
    updateOverview();
    showNotification('All budgets have been reset');
}

// Save all changes
function saveChanges() {
    // Simulate save operation
    showNotification('All changes saved successfully!');

    // Add a nice animation to the save button
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        saveBtn.style.transform = 'scale(1)';
    }, 100);
}

// Month navigation
function changeMonth(direction) {
    // Simulate month change
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const [month, year] = currentMonth.split(' ');
    let monthIndex = months.indexOf(month);
    let yearNum = parseInt(year);

    if (direction === 'prev') {
        monthIndex--;
        if (monthIndex < 0) {
            monthIndex = 11;
            yearNum--;
        }
    } else {
        monthIndex++;
        if (monthIndex > 11) {
            monthIndex = 0;
            yearNum++;
        }
    }

    currentMonth = `${months[monthIndex]} ${yearNum}`;
    document.getElementById('currentMonth').textContent = currentMonth;
    showNotification(`Switched to ${currentMonth}`);
}

// AI Suggest feature
function aiSuggest() {
    showNotification('AI is analyzing your spending patterns...');

    // Simulate AI processing
    setTimeout(() => {
        showNotification('AI suggestions ready! Check the AI panel for recommendations.');
    }, 2000);
}

// Rebalance budgets
function rebalance() {
    showNotification('Rebalancing budgets based on AI suggestions...');

    // Simulate rebalancing
    setTimeout(() => {
        categories[0].budget = 280; // Food
        categories[1].budget = 150; // Transport
        renderCategories();
        updateOverview();
        showNotification('Budgets rebalanced successfully!');
    }, 1500);
}

// Haptic feedback helper
function triggerHaptic(style = 'light') {
    if ('vibrate' in navigator) {
        const patterns = {
            light: 10,
            medium: 20,
            heavy: 30
        };
        navigator.vibrate(patterns[style] || 10);
    }
}

// Mobile AI panel collapse/expand
function setupMobileAIPanel() {
    const aiPanel = document.querySelector('.ai-panel');
    if (!aiPanel) return;

    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    // Start collapsed on mobile
    aiPanel.classList.add('collapsed');

    // Toggle on click
    aiPanel.addEventListener('click', () => {
        aiPanel.classList.toggle('collapsed');
        triggerHaptic('light');
    });

    // Prevent toggle when clicking buttons inside
    const buttons = aiPanel.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Month navigation
    document.getElementById('prevMonth').addEventListener('click', () => {
        changeMonth('prev');
        triggerHaptic('light');
    });
    document.getElementById('nextMonth').addEventListener('click', () => {
        changeMonth('next');
        triggerHaptic('light');
    });

    // AI suggest
    document.querySelector('.ai-suggest-btn').addEventListener('click', () => {
        aiSuggest();
        triggerHaptic('medium');
    });

    // Modal controls
    document.getElementById('modalClose').addEventListener('click', closeEditModal);
    document.getElementById('modalCancel').addEventListener('click', closeEditModal);
    document.getElementById('modalSave').addEventListener('click', () => {
        saveBudget();
        triggerHaptic('medium');
    });

    // Close modal on overlay click
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') {
            closeEditModal();
        }
    });

    // AI actions
    document.getElementById('rebalanceBtn').addEventListener('click', () => {
        rebalance();
        triggerHaptic('heavy');
    });
    document.getElementById('ignoreBtn').addEventListener('click', () => {
        showNotification('AI suggestion dismissed');
        triggerHaptic('light');
    });

    // Auto-adjust toggle
    document.getElementById('autoAdjust').addEventListener('change', (e) => {
        triggerHaptic('medium');
        if (e.target.checked) {
            showNotification('Auto-adjust enabled for next month');
            // Add glow effect
            e.target.parentElement.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.5)';
        } else {
            showNotification('Auto-adjust disabled');
            e.target.parentElement.style.boxShadow = '';
        }
    });

    // Action bar buttons
    document.getElementById('resetBtn').addEventListener('click', () => {
        resetBudgets();
        triggerHaptic('medium');
    });
    document.getElementById('saveBtn').addEventListener('click', () => {
        saveChanges();
        triggerHaptic('medium');
    });
    document.getElementById('floatingSaveBtn').addEventListener('click', () => {
        saveChanges();
        triggerHaptic('medium');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('modalOverlay').classList.contains('active')) {
            closeEditModal();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveChanges();
        }
    });

    // Setup mobile features
    setupMobileAIPanel();

    // Update AI panel on resize
    window.addEventListener('resize', setupMobileAIPanel);
}

// Smooth scroll reveal animation for cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe category cards when they're created
setTimeout(() => {
    document.querySelectorAll('.category-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}, 100);
