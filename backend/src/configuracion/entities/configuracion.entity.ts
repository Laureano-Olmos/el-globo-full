import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Parámetros generales del sistema. Se modela como una tabla de fila única
 * (singleton) en lugar de "hardcodear" los montos, para que la comisión
 * directiva pueda actualizar cuotas, recargos y comisiones sin requerir un
 * despliegue de código (Requerimiento No Funcional de mantenibilidad).
 */
@Entity('configuracion')
export class Configuracion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 35000 })
  cuotaCadete: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 50000 })
  cuotaActivo: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cuotaVitalicio: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 80000 })
  cuotaGrupoFamiliar: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 2500 })
  costoCasillero: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 5 })
  recargoMorosidad: number; // %

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  comisionCobrador: number; // %

  @Column({ default: 18 })
  edadMinimaActivo: number;

  @Column({ default: 60 })
  edadMinimaVitalicio: number;

  @Column({ default: 30 })
  antiguedadMinimaVitalicio: number;

  @Column({ default: 2 })
  mesesConsecutivosParaMorosidad: number;

  @Column({ default: 100 })
  totalCasilleros: number;

  @Column({ default: 20 })
  totalActividades: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
