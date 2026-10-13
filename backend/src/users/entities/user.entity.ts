import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { Socio } from '../../socios/entities/socio.entity';
import { Instructor } from '../../instructores/entities/instructor.entity';
import { Cobrador } from '../../cobradores/entities/cobrador.entity';

/**
 * Credenciales de acceso al sistema (R1). Un usuario ADMIN no requiere
 * perfil adicional; los usuarios COBRADOR, INSTRUCTOR y SOCIO están
 * vinculados 1:1 a su entidad de negocio correspondiente.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  /** Hash bcrypt. select:false evita que se devuelva por defecto en queries. */
  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ default: true })
  activo: boolean;

  @OneToOne(() => Socio, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  socio: Socio | null;

  @OneToOne(() => Instructor, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  instructor: Instructor | null;

  @OneToOne(() => Cobrador, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  cobrador: Cobrador | null;

  @CreateDateColumn()
  createdAt: Date;
}
