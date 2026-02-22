import { TaskService } from './services/TaskService.js';
import { UIManager } from './ui/UIManager.js';
import { Router } from './utils/Router.js';
import { NotificationManager } from './utils/Notification.js';
const taskService = new TaskService();
const elements = {
    taskList: document.getElementById('taskList'),
    emptyState: document.getElementById('emptyState'),
    searchInput: document.getElementById('searchInput'),
    filterPriority: document.getElementById('filterPriority'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    modal: document.getElementById('taskModal'),
    modalTitle: document.getElementById('modalTitle'),
    closeModalBtn: document.getElementById('closeModal'),
    cancelBtn: document.getElementById('cancelBtn'),
    saveTaskBtn: document.getElementById('saveTaskBtn'),
    taskForm: document.getElementById('taskForm'),
};
const uiManager = new UIManager(taskService, elements);
// Відкриття модалки
elements.addTaskBtn.addEventListener('click', () => uiManager.showModal());
// Функція, яка завжди бере актуальний вид з location.hash
const getCurrentView = () => {
    let hash = location.hash;
    if (hash.startsWith('#/'))
        hash = hash.substring(2);
    else if (hash.startsWith('#'))
        hash = hash.substring(1);
    if (!hash || hash === '')
        hash = 'home';
    return hash === 'archive' ? 'archive' : 'active';
};
// Функція рендерингу
const render = () => {
    const view = getCurrentView();
    // Оновлюємо активну вкладку
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    const selector = `.tab[href="#${view}"], .tab[href="#/${view}"]`;
    const activeTab = document.querySelector(selector) || document.querySelector('.tab[href="#home"]');
    if (activeTab)
        activeTab.classList.add('active');
    // Малюємо список
    uiManager.renderTasks(view, elements.searchInput.value, elements.filterPriority.value);
};
// Ініціалізація роутера
new Router((viewFromRouter) => {
    render();
});
// Додатковий надійний слухач на зміну хешу
window.addEventListener('hashchange', render);
// Початковий рендер
render();
// Обробка кліків по списку завдань
elements.taskList.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn)
        return;
    const id = Number(btn.dataset.id);
    if (isNaN(id))
        return;
    if (btn.classList.contains('complete-btn')) {
        taskService.toggleCompleted(id);
        render();
    }
    else if (btn.classList.contains('delete-btn')) {
        if (confirm('Видалити завдання назавжди?')) {
            taskService.remove(id);
            render();
        }
    }
    else if (btn.classList.contains('edit-btn')) {
        const task = taskService.getAll().find(t => t.id === id);
        if (task)
            uiManager.showModal(task);
    }
});
// Збереження форми
elements.saveTaskBtn.addEventListener('click', () => {
    const titleInput = elements.taskForm.querySelector('#title');
    if (!titleInput.value.trim()) {
        alert('Назва обов’язкова!');
        return;
    }
    const data = {
        title: titleInput.value.trim(),
        description: elements.taskForm.querySelector('#description').value.trim() || undefined,
        priority: elements.taskForm.querySelector('#priority').value,
        deadline: elements.taskForm.querySelector('#deadline').value || undefined,
        reminder: elements.taskForm.querySelector('#reminder').checked,
    };
    const editIdInput = elements.taskForm.querySelector('#editId');
    const editId = editIdInput.value ? Number(editIdInput.value) : null;
    if (editId) {
        taskService.update(editId, data);
    }
    else {
        taskService.add(data);
    }
    uiManager.closeModal();
    render();
});
// Закриття модалки
elements.closeModalBtn.addEventListener('click', () => uiManager.closeModal());
elements.cancelBtn.addEventListener('click', () => uiManager.closeModal());
elements.modal.addEventListener('click', e => {
    if (e.target === elements.modal)
        uiManager.closeModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !elements.modal.classList.contains('hidden')) {
        uiManager.closeModal();
    }
});
// Фільтри
elements.searchInput.addEventListener('input', render);
elements.filterPriority.addEventListener('change', render);
// Нагадування
NotificationManager.requestPermission();
setInterval(() => {
    const now = Date.now();
    taskService.getAll().forEach(task => {
        if (task.reminder && !task.completed && task.deadline) {
            const diff = new Date(task.deadline).getTime() - now;
            if (Math.abs(diff) < 65000) {
                NotificationManager.notify(`Нагадування: ${task.title}`, task.description || 'Дедлайн наближається!');
            }
        }
    });
}, 30000);
