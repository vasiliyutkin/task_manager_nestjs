import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import { v4 as uuidv4 } from 'uuid';
import { CreateTaskDto } from './dto/create_task.dto';
@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;
    const task: Task = {
      id: uuidv4(),
      title,
      description,
      status: TaskStatus.OPEN,
    };

    this.tasks.push(task);
    return task;
  }

  getTaskById(taskId: string): Task {
    return this.tasks.find(t => t.id === taskId);
  }

  deleteTask(taskId: string): Task {
    const deletedTask: Task = this.tasks.find(t => t.id !== taskId);
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    return deletedTask;
  }

  updateTaskStatus(taskId: string, taskStatus: TaskStatus): Task {
    this.tasks = this.tasks.map(t => {
      if (t.id === taskId) {
        t.status = taskStatus;
        return t;
      }
      return t;
    });

    return this.getTaskById(taskId);
  }
}
