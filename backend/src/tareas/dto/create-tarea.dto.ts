import { IsBoolean, IsNotEmpty, IsString, Length } from "class-validator";

export class CreateTareaDto {
    @IsString({ message: 'el campo debe ser un string' })
    @IsNotEmpty({ message: 'el campo es obligatorio' })
    @Length(1, 50, { message: 'el tamaño es de maximo 50 carácteres' })
    titulo: string;

    @IsString({ message: 'el campo debe ser un string' })
    @IsNotEmpty({ message: 'el campo es obligatorio' })
    @Length(1, 500, { message: 'el tamaño es de maximo 500 carácteres' })
    descripcion: string;

    @IsBoolean({ message: 'el campo debe ser un booleano' })
    @IsNotEmpty({ message: 'el campo es obligatorio' })
    completed?: boolean;
}
