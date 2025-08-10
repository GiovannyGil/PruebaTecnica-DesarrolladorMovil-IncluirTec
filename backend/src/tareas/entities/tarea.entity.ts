import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'Tareas' })
export class Tarea {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'titulo', type: 'varchar', length: 50, nullable: false })
    titulo: string;

    @Column({ name: 'descripcion', type: 'text', nullable: false, length: 500 })
    descripcion: string;

    @Column({ name: 'completada', default: false, nullable: false })
    completada: boolean;

    @Column({ name: 'created_at', type: "date", nullable: false })
    createdAt: Date

    @Column({ name: 'updated_at', type: "date", nullable: true })
    updatedAt: Date

    @Column({ name: 'deleted_at', type: "date", nullable: true })
    deletedAt: Date

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = new Date();
    }

    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = new Date();
    }
}