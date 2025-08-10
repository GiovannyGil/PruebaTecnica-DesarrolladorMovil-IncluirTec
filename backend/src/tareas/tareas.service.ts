import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { Tarea } from './entities/tarea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class TareasService {

  constructor(
    @InjectRepository(Tarea) private tareaRepository: Repository<Tarea>,
  ) { }

  /**
   * ! Crea una nueva tarea.
   * @param createTareaDto - Datos de la tarea a crear.
   * @returns Un objeto con un mensaje y la tarea creada.
   */
  async crearTarea(createTareaDto: CreateTareaDto): Promise<{ message: string; tarea: Tarea }> {
    try {
      const nuevaTarea = this.tareaRepository.create(createTareaDto);
      await this.tareaRepository.save(nuevaTarea);
      return { message: 'Tarea creada exitosamente', tarea: nuevaTarea };
    } catch (error) {
      console.error('Error al crear la tarea:', error);
      throw new InternalServerErrorException(`Error al crear la tarea: ${error.message}`);
    }
  }

  /**
   * ! Encuentra todas las tareas.
   * @returns Un array de tareas.
   */
  async encontrarTareas(): Promise<Tarea[]> {
    try {
      const tareas = await this.tareaRepository.find({ where: { deletedAt: IsNull() } });
      return tareas;
    } catch (error) {
      console.error('Error al encontrar las tareas:', error);
      throw new InternalServerErrorException(`Error al encontrar las tareas: ${error.message}`);
    }
  }

  /**
   * ! Encuentra una tarea por su ID.
   * @param id - ID de la tarea a encontrar.
   * @returns La tarea encontrada.
   */
  async encontrarTareaPorId(id: number): Promise<Tarea> {
    try {
      const tarea = await this.tareaRepository.findOne({ where: { id, deletedAt: IsNull() } });
      if (!tarea) {
        throw new InternalServerErrorException(`Tarea con ID ${id} no encontrada`);
      }
      return tarea;
    } catch (error) {
      throw new InternalServerErrorException(`Error al encontrar la tarea: ${error.message}`);
    }
  }

  /**
   * ! Actualiza una tarea por su ID.
   * @param id - ID de la tarea a actualizar.
   * @param updateTareaDto - Datos actualizados de la tarea.
   * @returns Un objeto con un mensaje y la tarea actualizada.
   */
  async actualizarTarea(id: number, updateTareaDto: UpdateTareaDto): Promise<{ message: string; tarea: Tarea }> {
    try {
      const tarea = await this.encontrarTareaPorId(id);
      this.tareaRepository.merge(tarea, updateTareaDto);
      await this.tareaRepository.save(tarea);
      return { message: 'Tarea actualizada exitosamente', tarea };
    } catch (error) {
      throw new InternalServerErrorException(`Error al actualizar la tarea: ${error.message}`);
    }
  }

  /**
   * ! Marca una tarea como completada.
   * @param id - ID de la tarea a completar.
   * @returns Un objeto con un mensaje y la tarea completada.
   */
  async terminarTarea(id: number): Promise<{ message: string; tarea: Tarea }> {
    try {
      const tarea = await this.encontrarTareaPorId(id);
      tarea.completada = true;
      await this.tareaRepository.save(tarea);
      return { message: 'Tarea completada exitosamente', tarea };
    } catch (error) {
      throw new InternalServerErrorException(`Error al terminar la tarea: ${error.message}`);
    }
  }

  /**
   * ! Elimina una tarea por su ID.
   * @param id - ID de la tarea a eliminar (Soft Delete).
   * @returns Un objeto con un mensaje de confirmación.
   */
  async eliminarTarea(id: number): Promise<{ message: string }> {
    try {
      const tarea = await this.encontrarTareaPorId(id);
      tarea.deletedAt = new Date();
      await this.tareaRepository.save(tarea);
      return { message: 'Tarea eliminada exitosamente' };
    } catch (error) {
      throw new InternalServerErrorException(`Error al eliminar la tarea: ${error.message}`);
    }
  }
}
