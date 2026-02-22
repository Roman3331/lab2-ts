export type Priority = 'low' | 'medium' | 'high';

export interface ITask {
  id: number;
  title: string;
  description?: string;
  priority: Priority;
  deadline?: string;
  reminder: boolean;
  completed: boolean;
  createdAt: string;
}

export class Task implements ITask {
  constructor(
    public id: number,
    public title: string,
    public description: string | undefined,
    public priority: Priority,
    public deadline: string | undefined,
    public reminder: boolean,
    public completed: boolean = false,
    public createdAt: string = new Date().toISOString()
  ) {}

  toggleCompleted(): void {
    this.completed = !this.completed;
  }
}