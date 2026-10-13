import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Actividad } from '../../actividades/entities/actividad.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Instructor: profesional contratado por el club para dictar una o más de
 * las 20 disciplinas deportivas disponibles.
 */
@Entity('instructores')
export class Instructor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  sueldo: number | null;

  @OneToMany(() => Actividad, (actividad) => actividad.instructor)
  actividades: Actividad[];

  @OneToOne(() => User, (user) => user.instructor, { nullable: true })
  user: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
