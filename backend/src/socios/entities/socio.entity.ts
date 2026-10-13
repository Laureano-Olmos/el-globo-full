import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoriaSocial } from '../../common/enums/categoria-social.enum';
import { ZonaCobro } from '../../common/enums/zona-cobro.enum';
import { EstadoSocio } from '../../common/enums/estado-socio.enum';
import { RolGrupoFamiliar } from '../../common/enums/rol-grupo-familiar.enum';
import { GrupoFamiliar } from '../../grupos-familiares/entities/grupo-familiar.entity';
import { Casillero } from '../../casilleros/entities/casillero.entity';
import { Inscripcion } from '../../inscripciones/entities/inscripcion.entity';
import { Cupon } from '../../cupones/entities/cupon.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Socio del club (R3). El número de socio coincide con el id autonumérico,
 * que además sirve como "número de socio" solicitado en los listados de
 * salida del enunciado.
 */
@Entity('socios')
export class Socio {
  @PrimaryGeneratedColumn()
  id: number; // número de socio

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true, length: 20 })
  dni: string;

  @Column({ type: 'date' })
  fechaNacimiento: Date;

  /** Fecha de ingreso como socio (usada para el cálculo de antigüedad). */
  @Column({ type: 'date' })
  fechaAlta: Date;

  @Column({ nullable: true })
  direccion: string;

  @Column({ nullable: true })
  localidad: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: CategoriaSocial })
  categoria: CategoriaSocial;

  @Column({ type: 'enum', enum: ZonaCobro, default: ZonaCobro.ZONA_0 })
  zonaCobro: ZonaCobro;

  @Column({ type: 'enum', enum: EstadoSocio, default: EstadoSocio.ACTIVO })
  estado: EstadoSocio;

  /** Contador de meses consecutivos impagos, usado para detectar morosidad (R10). */
  @Column({ default: 0 })
  mesesImpagosConsecutivos: number;

  @ManyToOne(() => GrupoFamiliar, (grupo) => grupo.integrantes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  grupoFamiliar: GrupoFamiliar | null;

  @Column({ type: 'enum', enum: RolGrupoFamiliar, nullable: true })
  rolGrupoFamiliar: RolGrupoFamiliar | null;

  @OneToOne(() => Casillero, (casillero) => casillero.socio, { nullable: true })
  casillero: Casillero | null;

  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.socio)
  inscripciones: Inscripcion[];

  @OneToMany(() => Cupon, (cupon) => cupon.socio)
  cupones: Cupon[];

  @OneToOne(() => User, (user) => user.socio, { nullable: true })
  user: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
