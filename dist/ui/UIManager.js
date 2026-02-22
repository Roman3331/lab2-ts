export class UIManager {
    constructor(taskService, elements) {
        this.taskService = taskService;
        this.elements = elements;
    }
    renderTasks(view = 'active', query = '', prio = 'all') {
        const tasks = this.taskService.filter(view, query, prio);
        this.elements.taskList.innerHTML = '';
        if (tasks.length === 0) {
            this.elements.emptyState.classList.remove('hidden');
            return;
        }
        this.elements.emptyState.classList.add('hidden');
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
        <h3>${task.title}</h3>
        ${task.description ? `<p>${task.description}</p>` : ''}
        <p>Пріоритет: <strong>${this.formatPriority(task.priority)}</strong>
           ${task.deadline ? ` | Дедлайн: ${new Date(task.deadline).toLocaleDateString('uk-UA')}` : ''}
        </p>
        <div class="task-actions">
          <button class="complete-btn" data-id="${task.id}">
            ${task.completed ? 'Відновити' : 'Завершити'}
          </button>
          <button class="edit-btn" data-id="${task.id}">Редагувати</button>
          <button class="delete-btn" data-id="${task.id}">Видалити</button>
        </div>
      `;
            this.elements.taskList.appendChild(li);
        });
    }
    formatPriority(p) {
        return p === 'high' ? 'Високий' : p === 'medium' ? 'Середній' : 'Низький';
    }
    showModal(task) {
        this.elements.modalTitle.textContent = task ? 'Редагувати завдання' : 'Нове завдання';
        if (task) {
            this.elements.taskForm.querySelector('#editId').value = String(task.id);
            this.elements.taskForm.querySelector('#title').value = task.title;
            this.elements.taskForm.querySelector('#description').value = task.description || '';
            this.elements.taskForm.querySelector('#priority').value = task.priority;
            this.elements.taskForm.querySelector('#deadline').value = task.deadline || '';
            this.elements.taskForm.querySelector('#reminder').checked = task.reminder;
        }
        else {
            this.elements.taskForm.querySelector('#editId').value = '';
        }
        this.elements.modal.classList.remove('hidden');
    }
    closeModal() {
        this.elements.modal.classList.add('hidden');
        this.elements.taskForm.reset();
    }
}
