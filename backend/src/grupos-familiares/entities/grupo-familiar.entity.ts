import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Socio } from '../../socios/entities/socio.entity';

/**
 * Plan Grupo Familiar (R4): un matrimonio con hijos abona una única cuota
 * fija y recibe un solo recibo de pago para todo el grupo. No hay máximo de
 * hijos a incorporar.
 */
@Entity('grupos_familiares')
export class GrupoFamiliar {
  @PrimaryGeneratedColumn()
  id: number;

  /** Cuota fija mensual de todo el grupo (por defecto $80.000). */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cuotaGrupal: number;

  @OneToMany(() => Socio, (socio) => socio.grupoFamiliar)
  integrantes: Socio[];

  @CreateDateColumn()
  createdAt: Date;
}
