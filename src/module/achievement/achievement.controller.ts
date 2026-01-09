import { Controller } from '@nestjs/common';
import { AchievementService } from './achievement.service';

@Controller('achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}
}
