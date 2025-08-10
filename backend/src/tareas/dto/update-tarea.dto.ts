import { PartialType } from '@nestjs/mapped-types';
import { CreateTareaDto } from './create-tarea.dto';

export class UpdateTareaDto extends PartialType(CreateTareaDto) {
    // Todas las propiedades de CreateTareaDto son opcionales en UpdateTareaDto
}
