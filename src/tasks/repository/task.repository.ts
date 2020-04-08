import { Repository, EntityRepository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { CreateTaskDto } from '../dto/create_task.dto';
import { TaskStatus } from '../task_status.enum';
import { GetTasksFilterDto } from '../dto/get_tasks_filter.dto';
import { User } from 'src/auth/entities/user.entity';
import { Logger, InternalServerErrorException } from '@nestjs/common';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger: Logger = new Logger('TaskRepository');

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task: Task = new Task();

    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.user = user;

    try {
      await task.save();
    } catch (error) {
      this.logger.error(
        `Failed to create the task for user "${
          user.username
        }", Data: ${JSON.stringify(createTaskDto)}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException();
    }

    delete task.user;

    return task;
  }

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.createQueryBuilder('task');

    query.where(`task.userId = :userId`, { userId: user.id });

    if (status) {
      query.andWhere(`task.status = :status`, { status });
    }

    if (search) {
      query.andWhere(
        `(task.title LIKE :search OR task.description LIKE :search)`,
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();

      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user: "${
          user.username
        }", DTO: ${JSON.stringify(filterDto)}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
