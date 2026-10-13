import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrupoFamiliar } from './entities/grupo-familiar.entity';
import { CreateGrupoFamiliarDto } from './dto/create-grupo-familiar.dto';
import { Socio } from '../socios/entities/socio.entity';
import { RolGrupoFamiliar } from '../common/enums/rol-grupo-familiar.enum';
import { ConfiguracionService } from '../configuracion/configuracion.service';

@Injectable()
export class GruposFamiliaresService {
  constructor(
    @InjectRepository(GrupoFamiliar) private readonly repo: Repository<GrupoFamiliar>,
    @InjectRepository(Socio) private readonly sociosRepo: Repository<Socio>,
    private readonly configuracionService: ConfiguracionService,
  ) {}

  /**
   * Da de alta el Plan Grupo Familiar (R4): un matrimonio con hijos paga una
   * única cuota fija ($80.000 por defecto) y recibe un solo recibo para
   * todo el grupo. Los socios ya deben existir en el padrón.
   */
  async create(dto: CreateGrupoFamiliarDto): Promise<GrupoFamiliar> {
    const ids = [dto.titularId, dto.conyugeId, ...dto.hijosIds];
    const idsUnicos = new Set(ids);
    if (idsUnicos.size !== ids.length) {
      throw new BadRequestException('Un socio no puede figurar dos veces en el mismo grupo familiar.');
    }

    const socios = await this.sociosRepo.find({ where: ids.map((id) => ({ id })) });
    if (socios.length !== ids.length) {
      throw new NotFoundException('Alguno de los socios indicados no existe en el padrón.');
    }

    const yaAgrupado = socios.find((s) => s.grupoFamiliar !== null && s.grupoFamiliar !== undefined);
    if (yaAgrupado) {
      throw new BadRequestException(
        `El socio ${yaAgrupado.apellido}, ${yaAgrupado.nombre} ya pertenece a otro grupo familiar.`,
      );
    }

    const config = await this.configuracionService.getOrCreate();
    const grupo = await this.repo.save(
      this.repo.create({ cuotaGrupal: dto.cuotaGrupal ?? config.cuotaGrupoFamiliar }),
    );

    const asignarRol = (socio: Socio, rol: RolGrupoFamiliar) => {
      socio.grupoFamiliar = grupo;
      socio.rolGrupoFamiliar = rol;
    };

    const titular = socios.find((s) => s.id === dto.titularId)!;
    const conyuge = socios.find((s) => s.id === dto.conyugeId)!;
    asignarRol(titular, RolGrupoFamiliar.TITULAR);
    asignarRol(conyuge, RolGrupoFamiliar.CONYUGE);
    for (const hijoId of dto.hijosIds) {
      asignarRol(socios.find((s) => s.id === hijoId)!, RolGrupoFamiliar.HIJO);
    }

    await this.sociosRepo.save(socios);
    return this.findOne(grupo.id);
  }

  findAll(): Promise<GrupoFamiliar[]> {
    return this.repo.find({ relations: ['integrantes'] });
  }

  async findOne(id: number): Promise<GrupoFamiliar> {
    const grupo = await this.repo.findOne({ where: { id }, relations: ['integrantes'] });
    if (!grupo) {
      throw new NotFoundException(`No existe un grupo familiar con id ${id}.`);
    }
    return grupo;
  }

  /** Quita a un socio del grupo familiar (vuelve a pagar su cuota individual). */
  async quitarIntegrante(grupoId: number, socioId: number): Promise<GrupoFamiliar> {
    const grupo = await this.findOne(grupoId);
    const socio = grupo.integrantes.find((s) => s.id === socioId);
    if (!socio) {
      throw new NotFoundException('El socio indicado no pertenece a este grupo familiar.');
    }
    socio.grupoFamiliar = null;
    socio.rolGrupoFamiliar = null;
    await this.sociosRepo.save(socio);
    return this.findOne(grupoId);
  }
}
