import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import { v4 as uuidv4 } from 'uuid';
import { CreateTaskDto } from './dto/create_task.dto';
import { GetTasksFilterDto } from './dto/get_tasks_filter.dto';
@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTasksWithFilters(filterDto: GetTasksFilterDto): Task[] {
    const { status, search } = filterDto;

    let tasks = this.getAllTasks();

    if (status) tasks = tasks.filter(t => t.status === status);
    if (search)
      tasks = tasks.filter(
        t => t.title.includes(search) || t.description.includes(search),
      );

    return tasks;
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
    const found = this.tasks.find(t => t.id === taskId);

    if (!found) {
      throw new NotFoundException(`Task with id '${taskId}' not found`);
    }

    return found;
  }

  deleteTask(taskId: string): Task {
    const found: Task = this.getTaskById(taskId);
    this.tasks = this.tasks.filter(t => t.id !== found.id);
    return found;
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
