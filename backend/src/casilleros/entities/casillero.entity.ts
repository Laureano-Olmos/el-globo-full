import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Socio } from '../../socios/entities/socio.entity';

/**
 * Casillero (R6). El club dispone de 100 casilleros para alquilar. Cada
 * casillero tiene, como máximo, un único socio vinculado (relación 1:1).
 */
@Entity('casilleros')
export class Casillero {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  numero: number;

  @OneToOne(() => Socio, (socio) => socio.casillero, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  socio: Socio | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 2500 })
  costoMensual: number;

  @Column({ type: 'date', nullable: true })
  fechaAlquiler: Date | null;
}
