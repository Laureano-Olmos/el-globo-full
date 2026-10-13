import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Rendicion } from './rendicion.entity';
import { Cupon } from '../../cupones/entities/cupon.entity';

/**
 * Detalle de la planilla de rendición: por cada socio/cupón indica el
 * importe efectivamente cobrado (o si no fue cobrado, para la devolución).
 */
@Entity('rendicion_detalles')
export class RendicionDetalle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Rendicion, (rendicion) => rendicion.detalles, { onDelete: 'CASCADE' })
  rendicion: Rendicion;

  @ManyToOne(() => Cupon, { onDelete: 'CASCADE' })
  cupon: Cupon;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  importeCobrado: number;

  @Column({ default: true })
  cobrado: boolean;
}
