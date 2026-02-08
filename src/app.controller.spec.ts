import { AppController } from './app.controller';

describe('AppController', () => {
  it('should return health status', () => {
    const appController = new AppController();
    expect(appController.health()).toEqual({ status: 'ok' });
  });
});
