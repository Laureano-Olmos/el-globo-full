import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ZonaCobro } from '../../common/enums/zona-cobro.enum';
import { Cupon } from '../../cupones/entities/cupon.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Cobrador (R7/R9): personal de recaudación asignado a una zona geográfica
 * (Sr. Pérez, Sr. García o Sr. Rodríguez). Se retiene el 10% de comisión
 * sobre lo recaudado en su rendición semanal.
 */
@Entity('cobradores')
export class Cobrador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true })
  correo: string;

  @Column({ type: 'enum', enum: ZonaCobro })
  zona: ZonaCobro; // ZONA_1, ZONA_2 o ZONA_3

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  comisionPorcentaje: number;

  @OneToMany(() => Cupon, (cupon) => cupon.cobrador)
  cupones: Cupon[];

  @OneToOne(() => User, (user) => user.cobrador, { nullable: true })
  user: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
