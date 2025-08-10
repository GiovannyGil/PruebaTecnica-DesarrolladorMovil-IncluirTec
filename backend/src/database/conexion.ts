import { TypeOrmModuleOptions } from "@nestjs/typeorm";


const ConnexionDDBB: TypeOrmModuleOptions = {
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [__dirname + './../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: false,
}

export default ConnexionDDBB