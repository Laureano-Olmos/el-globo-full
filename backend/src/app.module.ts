import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { buildTypeOrmConfig } from './database/typeorm.config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';
import { SociosModule } from './socios/socios.module';
import { GruposFamiliaresModule } from './grupos-familiares/grupos-familiares.module';
import { InstructoresModule } from './instructores/instructores.module';
import { ActividadesModule } from './actividades/actividades.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { CobradoresModule } from './cobradores/cobradores.module';
import { CasillerosModule } from './casilleros/casilleros.module';
import { CuponesModule } from './cupones/cupones.module';
import { RendicionesModule } from './rendiciones/rendiciones.module';
import { ReportesModule } from './reportes/reportes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: buildTypeOrmConfig,
    }),
    ScheduleModule.forRoot(),

    // Dominio
    ConfiguracionModule,
    AuthModule,
    UsersModule,
    SociosModule,
    GruposFamiliaresModule,
    InstructoresModule,
    ActividadesModule,
    InscripcionesModule,
    CobradoresModule,
    CasillerosModule,
    CuponesModule,
    RendicionesModule,
    ReportesModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
