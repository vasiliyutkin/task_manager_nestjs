import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './repository/task.repository';
import { GetTasksFilterDto } from './dto/get_tasks_filter.dto';
import { TaskStatus } from './task_status.enum';
import { User } from '../auth/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create_task.dto';
import { Task } from './entities/task.entity';

const mockUser: User = new User();
mockUser.username = 'Test user';
mockUser.password = 'Test pass';
mockUser.id = 51;

const testData = {
  title: 'test val',
  description: 'test desc',
};

const taskDto: CreateTaskDto = {
  title: 'title',
  description: 'description',
};

const taskMock = {
  title: taskDto.title,
  description: taskDto.description,
  status: TaskStatus.OPEN,
};

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TaskService', () => {
  let tasksService: TasksService;
  let taskRepository: TaskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TaskRepository,
          useFactory: mockTaskRepository,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    taskRepository = module.get<TaskRepository>(TaskRepository);

    (taskRepository.findOne as jest.Mock).mockResolvedValue(testData);
  });

  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      (taskRepository.getTasks as jest.Mock).mockResolvedValue('someValue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'search query',
      };

      const result = await tasksService.getTasks(filters, mockUser);

      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrieve and return the task', async () => {
      const res = await tasksService.getTaskById(1, mockUser);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: mockUser.id },
      });
      expect(res.title).toBe(testData.title);
      expect(res.description).toBe(testData.description);
    });

    it('throws an error as task is not found', () => {
      (taskRepository.findOne as jest.Mock).mockResolvedValue(null);
      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('should create task with provided dto', async () => {
      (taskRepository.createTask as jest.Mock).mockResolvedValue(taskMock);

      const newTask: Task = await tasksService.createTask(taskDto, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalled();
      expect(newTask).toEqual(taskMock);
    });
  });

  describe('deleteTask', () => {
    it('calls taskRepository.deleteTask() to delete a task', async () => {
      (taskRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.deleteTask(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalled();
    });

    it('throws an error as task could not be found', async () => {
      (taskRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      expect(tasksService.deleteTask(5, mockUser)).rejects.toThrow(
        new NotFoundException(`task with id "5" not found`),
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('should retrieve task by id and update its status', async () => {
      const save = jest.fn().mockResolvedValue(true);
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save: save,
      });
      const updatedTask = await tasksService.updateTaskStatus(
        1,
        TaskStatus.DONE,
        mockUser,
      );
      expect(tasksService.updateTaskStatus).not.toThrowError();
      expect(save).toHaveBeenCalled();
      expect(updatedTask.status).toBe(TaskStatus.DONE);
    });
  });
});
