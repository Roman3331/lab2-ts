import { ITask, Priority, Task } from '../models/Task.js';

const TASKS_KEY = 'todo-tasks-lab2';

export class TaskService {
  private tasks: Task[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    const data = localStorage.getItem(TASKS_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.tasks = parsed.map((t: any) => new Task(
          t.id, t.title, t.description, t.priority, t.deadline,
          t.reminder, t.completed, t.createdAt
        ));
      } catch (e) {
        console.error('Помилка завантаження завдань:', e);
      }
    }
  }

  private save(): void {
    localStorage.setItem(TASKS_KEY, JSON.stringify(this.tasks));
  }

  getAll(): Task[] {
    return [...this.tasks];
  }

  add(taskData: Omit<ITask, 'id' | 'createdAt' | 'completed'>): void {
    const newTask = new Task(Date.now(), taskData.title, taskData.description,
      taskData.priority, taskData.deadline, taskData.reminder);
    this.tasks.push(newTask);
    this.save();
  }

  update(id: number, updates: Partial<ITask>): void {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      Object.assign(task, updates);
      this.save();
    }
  }

  remove(id: number): void {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save();
  }

  toggleCompleted(id: number): void {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.toggleCompleted();
      this.save();
    }
  }

  filter(view: 'active' | 'archive', query: string = '', priority: string = 'all'): Task[] {
    let result = this.tasks.filter(t =>
      view === 'active' ? !t.completed : t.completed
    );

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (priority !== 'all') {
      result = result.filter(t => t.priority === (priority as Priority));
    }

    result.sort((a, b) => {
      const prioOrder = { high: 3, medium: 2, low: 1 };
      const prioDiff = prioOrder[b.priority] - prioOrder[a.priority];
      if (prioDiff !== 0) return prioDiff;
      const da = new Date(a.deadline || '9999-12-31').getTime();
      const db = new Date(b.deadline || '9999-12-31').getTime();
      return da - db;
    });

    return result;
  }
}