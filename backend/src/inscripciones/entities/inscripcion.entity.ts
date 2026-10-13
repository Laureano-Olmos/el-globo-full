import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Socio } from '../../socios/entities/socio.entity';
import { Actividad } from '../../actividades/entities/actividad.entity';

/**
 * Relación N:M entre socios y actividades deportivas. Un socio puede estar
 * anotado en diversas actividades. Sirve además como registro de asistencia
 * (listado ordenado por actividad y horario) para los instructores.
 */
@Entity('inscripciones')
@Unique(['socio', 'actividad'])
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Socio, (socio) => socio.inscripciones, { onDelete: 'CASCADE' })
  socio: Socio;

  @ManyToOne(() => Actividad, (actividad) => actividad.inscripciones, { onDelete: 'CASCADE' })
  actividad: Actividad;

  @Column({ default: true })
  activa: boolean;

  @CreateDateColumn()
  fechaInscripcion: Date;
}
