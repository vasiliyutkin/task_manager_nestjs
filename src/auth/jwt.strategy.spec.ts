import { JwtStrategy } from './jwt_strategy';
import { Test } from '@nestjs/testing';
import { UserRepository } from './repository/user.repository';
import { User } from './entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('jwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository: UserRepository;
  let user: User;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UserRepository,
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<UserRepository>(UserRepository);

    user = new User();
    user.username = 'testUser';
  });

  describe('validate', () => {
    it('validates and returns the user based on jwt payload', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      const res = await jwtStrategy.validate({ username: 'testUser' });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        username: 'testUser',
      });
      expect(res).toEqual(user);
    });
    it('throws an unauthorized exception as user cannot be found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      expect(jwtStrategy.validate({ username: 'testUserErr' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
