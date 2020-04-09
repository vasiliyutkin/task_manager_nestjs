import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

const mockCredentialsDto = {
  username: 'TestUsername',
  password: 'TestPassword',
};

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save: any;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({
        save,
      });
    });

    it('successfully signs up the user', async () => {
      save.mockResolvedValue(null);
      expect(userRepository.signUp(mockCredentialsDto)).resolves.not.toThrow();
    });

    it('throws a conflict exception as username already exists', async () => {
      save.mockRejectedValue({ code: '23505' });
      expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
        new ConflictException('Username already exists'),
      );
    });

    it('throws a internal exception as username already exists', async () => {
      save.mockRejectedValue({ code: '23566' });
      expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validateUserPassword', () => {
    let user: User;

    beforeEach(() => {
      userRepository.findOne = jest.fn();
      user = new User();
      user.username = 'TestUsername';
      user.validatePassword = jest.fn();
    });

    it('returns username if validation is successful', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (user.validatePassword as jest.Mock).mockResolvedValue(user);

      const result = await userRepository.validateUserPassword(
        mockCredentialsDto,
      );

      expect(result).toEqual(mockCredentialsDto.username);
    });

    it('returns null as user cannot be found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.validateUserPassword(
        mockCredentialsDto,
      );

      expect(user.validatePassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null as password is invalid', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (user.validatePassword as jest.Mock).mockResolvedValue(false);

      const result = await userRepository.validateUserPassword(
        mockCredentialsDto,
      );

      expect(user.validatePassword).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('calls bcrypt to generate a hash', async () => {
      (bcrypt as any).hash = jest.fn().mockResolvedValue('testHash');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await userRepository.hashPassword(
        'testPassword',
        'testSalt',
      );
      expect(result).toEqual('testHash');
      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt');
    });
  });
});
