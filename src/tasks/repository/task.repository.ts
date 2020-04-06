import { Repository, EntityRepository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { CreateTaskDto } from '../dto/create_task.dto';
import { TaskStatus } from '../task_status.enum';
import { GetTasksFilterDto } from '../dto/get_tasks_filter.dto';
import { User } from 'src/auth/entities/user.entity';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task: Task = new Task();

    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.user = user;

    await task.save();

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

    const tasks = await query.getMany();

    return tasks;
  }
}
