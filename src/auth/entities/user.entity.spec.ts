import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('UserEntity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.salt = 'testSalt';
    user.password = 'testPassword';
    (bcrypt as any).hash = jest.fn();
  });
  describe('validate password', () => {
    it('returns true as password is valid', async () => {
      (bcrypt.hash as jest.Mock).mockReturnValue('testPassword');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('123456');
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 'testSalt');
      expect(result).toEqual(true);
    });

    it('returns fasle as password is invalid', async () => {
      (bcrypt.hash as jest.Mock).mockReturnValue('wrongPass');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('wrongPass');
      expect(bcrypt.hash).toHaveBeenCalledWith('wrongPass', 'testSalt');
      expect(result).toEqual(false);
    });
  });
});
