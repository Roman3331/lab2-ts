import { TaskService } from './services/TaskService.js';
import { UIManager } from './ui/UIManager.js';
import { Router } from './utils/Router.js';
import { NotificationManager } from './utils/Notification.js';
import { Priority } from './models/Task.js';

const taskService = new TaskService();

const elements = {
  taskList: document.getElementById('taskList') as HTMLUListElement,
  emptyState: document.getElementById('emptyState') as HTMLElement,
  searchInput: document.getElementById('searchInput') as HTMLInputElement,
  filterPriority: document.getElementById('filterPriority') as HTMLSelectElement,
  addTaskBtn: document.getElementById('addTaskBtn') as HTMLButtonElement,
  modal: document.getElementById('taskModal') as HTMLElement,
  modalTitle: document.getElementById('modalTitle') as HTMLElement,
  closeModalBtn: document.getElementById('closeModal') as HTMLButtonElement,
  cancelBtn: document.getElementById('cancelBtn') as HTMLButtonElement,
  saveTaskBtn: document.getElementById('saveTaskBtn') as HTMLButtonElement,
  taskForm: document.getElementById('taskForm') as HTMLFormElement,
};

const uiManager = new UIManager(taskService, elements);

elements.addTaskBtn.addEventListener('click', () => uiManager.showModal());

const getCurrentView = (): 'active' | 'archive' => {
  let hash = location.hash;

  if (hash.startsWith('#/')) hash = hash.substring(2);
  else if (hash.startsWith('#')) hash = hash.substring(1);

  if (!hash || hash === '') hash = 'home';

  return hash === 'archive' ? 'archive' : 'active';
};

const render = () => {
  const view = getCurrentView();

  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  const selector = `.tab[href="#${view}"], .tab[href="#/${view}"]`;
  const activeTab = document.querySelector(selector) || document.querySelector('.tab[href="#home"]');
  if (activeTab) activeTab.classList.add('active');

  uiManager.renderTasks(view, elements.searchInput.value, elements.filterPriority.value);
};

new Router((viewFromRouter: string) => {
  render();
});

window.addEventListener('hashchange', render);

render();

elements.taskList.addEventListener('click', e => {
  const btn = (e.target as HTMLElement).closest('button');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (isNaN(id)) return;

  if (btn.classList.contains('complete-btn')) {
    taskService.toggleCompleted(id);
    render();
  } else if (btn.classList.contains('delete-btn')) {
    if (confirm('Видалити завдання назавжди?')) {
      taskService.remove(id);
      render();
    }
  } else if (btn.classList.contains('edit-btn')) {
    const task = taskService.getAll().find(t => t.id === id);
    if (task) uiManager.showModal(task);
  }
});

elements.saveTaskBtn.addEventListener('click', () => {
  const titleInput = elements.taskForm.querySelector('#title') as HTMLInputElement;
  if (!titleInput.value.trim()) {
    alert('Назва обов’язкова!');
    return;
  }

  const data = {
    title: titleInput.value.trim(),
    description: (elements.taskForm.querySelector('#description') as HTMLTextAreaElement).value.trim() || undefined,
    priority: (elements.taskForm.querySelector('#priority') as HTMLSelectElement).value as Priority,
    deadline: (elements.taskForm.querySelector('#deadline') as HTMLInputElement).value || undefined,
    reminder: (elements.taskForm.querySelector('#reminder') as HTMLInputElement).checked,
  };

  const editIdInput = elements.taskForm.querySelector('#editId') as HTMLInputElement;
  const editId = editIdInput.value ? Number(editIdInput.value) : null;

  if (editId) {
    taskService.update(editId, data);
  } else {
    taskService.add(data);
  }

  uiManager.closeModal();
  render();
});

elements.closeModalBtn.addEventListener('click', () => uiManager.closeModal());
elements.cancelBtn.addEventListener('click', () => uiManager.closeModal());
elements.modal.addEventListener('click', e => {
  if (e.target === elements.modal) uiManager.closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !elements.modal.classList.contains('hidden')) {
    uiManager.closeModal();
  }
});

elements.searchInput.addEventListener('input', render);
elements.filterPriority.addEventListener('change', render);

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