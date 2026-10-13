import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cobrador } from '../../cobradores/entities/cobrador.entity';
import { RendicionDetalle } from './rendicion-detalle.entity';

/**
 * Rendición semanal de un cobrador (R9). Agrupa el importe total cobrado
 * durante la semana, calcula automáticamente la comisión (10%) y, si es la
 * última semana del mes, marca los cupones no cobrados como devueltos.
 */
@Entity('rendiciones')
export class Rendicion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cobrador, { onDelete: 'CASCADE' })
  cobrador: Cobrador;

  @Column({ type: 'date' })
  semanaInicio: Date;

  @Column({ type: 'date' })
  semanaFin: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  montoRecaudado: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  comisionCalculada: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  montoNeto: number;

  /** Indica si es la rendición de la última semana del mes (dispara devoluciones). */
  @Column({ default: false })
  esUltimaSemanaDelMes: boolean;

  @OneToMany(() => RendicionDetalle, (detalle) => detalle.rendicion, { cascade: true })
  detalles: RendicionDetalle[];

  @CreateDateColumn()
  fechaRendicion: Date;
}
