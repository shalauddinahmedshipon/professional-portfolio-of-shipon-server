import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './module/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { SeederService } from './seeder/seeder.service';
import { ProfileModule } from './module/profile/profile.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { ProjectModule } from './module/project/project.module';
import { BlogModule } from './module/blog/blog.module';
import { EventModule } from './module/event/event.module';
import { GalleryModule } from './module/gallery/gallery.module';
import { SkillModule } from './module/skill/skill.module';
import { EducationModule } from './module/education/education.module';
import { ExperienceModule } from './module/experience/experience.module';
import { AchievementModule } from './module/achievement/achievement.module';
import { ContactModule } from './module/contact/contact.module';



@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
      defaults: {
        from: process.env.EMAIL_USER,
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    CloudinaryModule,
    ProjectModule,
    BlogModule,
    EventModule,
    GalleryModule,
    SkillModule,
    EducationModule,
    ExperienceModule,
    AchievementModule,
    ContactModule
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule {}
