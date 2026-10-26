import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instructor } from './entities/instructor.entity';
import { User } from '../users/entities/user.entity';
import { InstructoresService } from './instructores.service';
import { InstructoresController } from './instructores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Instructor, User])],
  controllers: [InstructoresController],
  providers: [InstructoresService],
  exports: [InstructoresService],
})
export class InstructoresModule {}
