import { ITaskRepository, IAuthRepository, IStatsRepository, ISettingsRepository, IPlanRepository } from '../domain/repositories';
import { FirebaseTaskRepository, FirebaseAuthRepository, FirebaseStatsRepository, FirebaseSettingsRepository, FirebasePlanRepository } from '../data/repositories';

import { CreateTaskUseCase, GetTasksUseCase, CompleteStepUseCase, DeleteTaskUseCase, StartTaskUseCase } from '../domain/usecases/tasks';
import { LoginUseCase, RegisterUseCase, LogoutUseCase, DeleteAccountUseCase, ResetPasswordUseCase } from '../domain/usecases/auth';
import { IncrementPomodoroUseCase, IncrementTaskCompletedUseCase, GetStatsUseCase } from '../domain/usecases/stats';
import { GetTimerSettingsUseCase, SaveTimerSettingsUseCase } from '../domain/usecases/settings';
import { GetDailyPrioritiesUseCase, SaveDailyPrioritiesUseCase, SaveMoodUseCase, GetMoodHistoryUseCase, SaveShutdownChecklistUseCase, GetShutdownChecklistUseCase } from '../domain/usecases/plan';

class Container {
  private static instance: Container;
  
  private _taskRepository: ITaskRepository;
  private _authRepository: IAuthRepository;
  private _statsRepository: IStatsRepository;
  private _settingsRepository: ISettingsRepository;
  private _planRepository: IPlanRepository;

  private constructor() {
    this._taskRepository = new FirebaseTaskRepository();
    this._authRepository = new FirebaseAuthRepository();
    this._statsRepository = new FirebaseStatsRepository();
    this._settingsRepository = new FirebaseSettingsRepository();
    this._planRepository = new FirebasePlanRepository();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // Repositories
  get taskRepository(): ITaskRepository {
    return this._taskRepository;
  }

  get authRepository(): IAuthRepository {
    return this._authRepository;
  }

  get statsRepository(): IStatsRepository {
    return this._statsRepository;
  }

  get settingsRepository(): ISettingsRepository {
    return this._settingsRepository;
  }

  get planRepository(): IPlanRepository {
    return this._planRepository;
  }

  // Use Cases - Tasks
  get createTaskUseCase(): CreateTaskUseCase {
    return new CreateTaskUseCase(this._taskRepository);
  }

  get startTaskUseCase(): StartTaskUseCase {
    return new StartTaskUseCase(this._taskRepository);
  }

  get getTasksUseCase(): GetTasksUseCase {
    return new GetTasksUseCase(this._taskRepository);
  }

  get completeStepUseCase(): CompleteStepUseCase {
    return new CompleteStepUseCase(this._taskRepository);
  }

  get deleteTaskUseCase(): DeleteTaskUseCase {
    return new DeleteTaskUseCase(this._taskRepository);
  }

  // Use Cases - Auth
  get loginUseCase(): LoginUseCase {
    return new LoginUseCase(this._authRepository);
  }

  get registerUseCase(): RegisterUseCase {
    return new RegisterUseCase(this._authRepository);
  }

  get logoutUseCase(): LogoutUseCase {
    return new LogoutUseCase(this._authRepository);
  }

  get deleteAccountUseCase(): DeleteAccountUseCase {
    return new DeleteAccountUseCase(this._taskRepository, this._settingsRepository, this._statsRepository, this._planRepository);
  }

  get resetPasswordUseCase(): ResetPasswordUseCase {
    return new ResetPasswordUseCase(this._authRepository);
  }

  // Use Cases - Stats
  get incrementPomodoroUseCase(): IncrementPomodoroUseCase {
    return new IncrementPomodoroUseCase(this._statsRepository);
  }

  get incrementTaskCompletedUseCase(): IncrementTaskCompletedUseCase {
    return new IncrementTaskCompletedUseCase(this._statsRepository);
  }

  get getStatsUseCase(): GetStatsUseCase {
    return new GetStatsUseCase(this._statsRepository);
  }

  // Use Cases - Settings
  get getTimerSettingsUseCase(): GetTimerSettingsUseCase {
    return new GetTimerSettingsUseCase(this._settingsRepository);
  }

  get saveTimerSettingsUseCase(): SaveTimerSettingsUseCase {
    return new SaveTimerSettingsUseCase(this._settingsRepository);
  }

  // Use Cases - Plan
  get getDailyPrioritiesUseCase(): GetDailyPrioritiesUseCase {
    return new GetDailyPrioritiesUseCase(this._planRepository);
  }

  get saveDailyPrioritiesUseCase(): SaveDailyPrioritiesUseCase {
    return new SaveDailyPrioritiesUseCase(this._planRepository);
  }

  get saveMoodUseCase(): SaveMoodUseCase {
    return new SaveMoodUseCase(this._planRepository);
  }

  get getMoodHistoryUseCase(): GetMoodHistoryUseCase {
    return new GetMoodHistoryUseCase(this._planRepository);
  }

  get saveShutdownChecklistUseCase(): SaveShutdownChecklistUseCase {
    return new SaveShutdownChecklistUseCase(this._planRepository);
  }

  get getShutdownChecklistUseCase(): GetShutdownChecklistUseCase {
    return new GetShutdownChecklistUseCase(this._planRepository);
  }
}

export const container = Container.getInstance();
