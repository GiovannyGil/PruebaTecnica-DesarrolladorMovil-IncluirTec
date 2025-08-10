import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TareasService } from './tareas.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';

@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  /**
   * ! Crea una nueva tarea.
   * @param createTareaDto - Datos de la tarea a crear.
   * @returns Un objeto con un mensaje y la tarea creada.
   */
  @Post()
  create(@Body() createTareaDto: CreateTareaDto) {
    return this.tareasService.crearTarea(createTareaDto);
  }

  /**
   * ! Encuentra todas las tareas.
   * @returns Un array de tareas.
   */
  @Get()
  findAll() {
    return this.tareasService.encontrarTareas();
  }

  /**
   * ! Encuentra una tarea por su ID.
   * @param id - ID de la tarea a encontrar.
   * @returns La tarea encontrada.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tareasService.encontrarTareaPorId(+id);
  }

  /**
   * ! Actualiza una tarea por su ID.
   * @param id - ID de la tarea a actualizar.
   * @param updateTareaDto - Datos actualizados de la tarea.
   * @returns Un objeto con un mensaje y la tarea actualizada.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTareaDto: UpdateTareaDto) {
    return this.tareasService.actualizarTarea(+id, updateTareaDto);
  }

  /**
   * ! Marca una tarea como completada.
   * @param id - ID de la tarea a completar.
   * @returns Un objeto con un mensaje y la tarea completada.
   */
  @Patch('terminar/:id')
  terminar(@Param('id') id: string) {
    return this.tareasService.terminarTarea(+id);
  }

  /**
   * ! Elimina una tarea por su ID.
   * @param id - ID de la tarea a eliminar.
   * @returns Un objeto con un mensaje de confirmación.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tareasService.eliminarTarea(+id);
  }
}
