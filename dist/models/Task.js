export class Task {
    constructor(id, title, description, priority, deadline, reminder, completed = false, createdAt = new Date().toISOString()) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.deadline = deadline;
        this.reminder = reminder;
        this.completed = completed;
        this.createdAt = createdAt;
    }
    toggleCompleted() {
        this.completed = !this.completed;
    }
}
