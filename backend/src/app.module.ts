import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TareasModule } from './tareas/tareas.module';
import ConnexionDDBB from './database/conexion';

@Module({
  imports: [TypeOrmModule.forRoot(ConnexionDDBB), TareasModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
