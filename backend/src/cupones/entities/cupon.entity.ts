import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ZonaCobro } from '../../common/enums/zona-cobro.enum';
import { EstadoCupon } from '../../common/enums/estado-cupon.enum';
import { Socio } from '../../socios/entities/socio.entity';
import { Cobrador } from '../../cobradores/entities/cobrador.entity';
import { GrupoFamiliar } from '../../grupos-familiares/entities/grupo-familiar.entity';

/**
 * Cupón de cobranza mensual (R8). Se emite uno por socio (o uno solo por
 * grupo familiar) y agrega: cuota social/grupal + cuotas de actividades
 * + alquiler de casillero, más el recargo del 5% si corresponde a la
 * reemisión de un período impago anterior (R11).
 */
@Entity('cupones')
export class Cupon {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Socio, (socio) => socio.cupones, { onDelete: 'CASCADE' })
  socio: Socio;

  /** Presente si el cupón corresponde a un recibo único de grupo familiar. */
  @ManyToOne(() => GrupoFamiliar, { nullable: true, onDelete: 'SET NULL' })
  grupoFamiliar: GrupoFamiliar | null;

  /** Período de cobranza en formato 'YYYY-MM'. */
  @Column()
  periodo: string;

  @Column({ type: 'enum', enum: ZonaCobro })
  zona: ZonaCobro;

  @ManyToOne(() => Cobrador, (cobrador) => cobrador.cupones, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  cobrador: Cobrador | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  montoCuotaSocial: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montoActividades: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montoCasillero: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  recargoPorcentaje: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  montoTotal: number;

  @Column({ type: 'enum', enum: EstadoCupon, default: EstadoCupon.PENDIENTE })
  estado: EstadoCupon;

  /** true si este cupón es la reemisión con recargo del período anterior impago. */
  @Column({ default: false })
  esReemision: boolean;

  @Column({ type: 'text', nullable: true })
  detalle: string;

  @Column({ type: 'date', nullable: true })
  fechaPago: Date | null;

  @CreateDateColumn()
  fechaEmision: Date;
}
