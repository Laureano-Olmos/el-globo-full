import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Turno } from '../../common/enums/turno.enum';
import { Instructor } from '../../instructores/entities/instructor.entity';
import { Inscripcion } from '../../inscripciones/entities/inscripcion.entity';

/**
 * Actividad deportiva (R5). El club ofrece 20 disciplinas que se dictan en
 * turno matutino, vespertino o nocturno, cada una con un arancel propio que
 * se incluye en el cupón de cobranza mensual del socio inscripto.
 */
@Entity('actividades')
export class Actividad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  /** Costo mensual de la práctica, incluido en el cupón del socio. */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  arancel: number;

  @Column({ type: 'enum', enum: Turno })
  turno: Turno;

  /** Ej: "Lunes, Miércoles, Viernes". */
  @Column({ nullable: true })
  diasSemana: string;

  @Column({ type: 'time', nullable: true })
  horaInicio: string;

  @Column({ type: 'time', nullable: true })
  horaFin: string;

  @Column({ type: 'int', nullable: true })
  cupoMaximo: number | null;

  @ManyToOne(() => Instructor, (instructor) => instructor.actividades, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  instructor: Instructor | null;

  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.actividad)
  inscripciones: Inscripcion[];

  @Column({ default: true })
  activa: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
