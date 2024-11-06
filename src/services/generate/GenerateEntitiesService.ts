import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class GenerateEntitiesService {
  private entitiesDir = path.join(__dirname, '../../../src/entities/new');
  private dtosDir = path.join(__dirname, '../../../src/dtos/new');
  private servicesDir = path.join(__dirname, '../../../src/services/new');
  private controllersDir = path.join(__dirname, '../../../src/controllers/new');

  private entitiesDirGenerate = path.join(__dirname, '../../../src/entities');
  private servicesDirGenerate = path.join(__dirname, '../../../src/services');
  private controllersDirGenerate = path.join(
    __dirname,
    '../../../src/controllers',
  );

  async createEntitiesWithRelations(entitiesConfig: any) {
    if (!Array.isArray(entitiesConfig)) {
      throw new Error('entitiesConfig debe ser un array.');
    }

    for (const entityConfig of entitiesConfig) {
      const { entityName, properties, relations, nodoRelations } = entityConfig;
      const relationsMap = this.buildRelationsMap(relations);
      const entityClass = this.generateEntityClass(
        entityName,
        properties,
        relationsMap,
      );

      const dtoClass = this.generateDtoClass(entityName, properties, relations);
      const serviceClass = this.generateServiceClass(
        entityName,
        nodoRelations,
        relations,
      );
      const controllerClass = this.generateControllerClass(entityName);

      // Generar ENTITY
      await fs.outputFile(
        path.join(this.entitiesDir, `${entityName}.entity.ts`),
        entityClass,
      );

      // Generar DTO
      await fs.outputFile(
        path.join(this.dtosDir, `${entityName}.dto.ts`),
        dtoClass,
      );

      // Generar SERVICE
      await fs.outputFile(
        path.join(this.servicesDir, `${entityName}.service.ts`),
        serviceClass,
      );

      // Generar CONTROLLER
      await fs.outputFile(
        path.join(this.controllersDir, `${entityName}.controller.ts`),
        controllerClass,
      );

      // Actualizar INDEX
      await this.updateIndex(entityName, this.entitiesDirGenerate, 'entity');
      await this.updateIndex(entityName, this.servicesDirGenerate, 'service');
      await this.updateIndex(
        entityName,
        this.controllersDirGenerate,
        'controller',
      );
    }

    return { message: 'Entidades creadas exitosamente.' };
  }

  private buildRelationsMap(relations) {
    const relationsMap = {};

    for (const relation of relations) {
      relationsMap[relation.target.toLowerCase()] = {
        type: relation.type,
        target: relation.target,
        joinTable: relation.joinTable,
        inverseSide: relation.target.toLowerCase(),
      };
    }

    return relationsMap;
  }

  private generateEntityClass(
    entityName: string,
    properties: { [key: string]: string },
    relations?: { [key: string]: any },
  ): string {
    const props = Object.entries(properties)
      .map(([key, type]) => ` @Column()\n ${key}: ${type};`)
      .join('\n');

    let relationsStr = '';
    let aux = '';
    if (relations) {
      for (const [relationName, relationDef] of Object.entries(relations)) {
        aux += `import { ${relationDef.target} } from './${relationDef.target}.entity';\n`;
        if (relationDef.type === 'one-to-many') {
          relationsStr += ` @OneToMany(() => ${relationDef.target}, (target) => target.${entityName.toLowerCase()})\n${relationName}s: ${relationDef.target}[];\n`;
        } else if (relationDef.type === 'many-to-one') {
          relationsStr += ` @ManyToOne(() => ${relationDef.target}, (target) => target.${entityName.toLowerCase()}s)\n${relationName}: ${relationDef.target};\n`;
        } else if (relationDef.type === 'one-to-one') {
          relationsStr += ` @OneToOne(() => ${relationDef.target}, (target) => target.${entityName.toLowerCase()})\n${relationDef.joinTable ? '@JoinColumn()\n' : ''}\n${relationName}: ${relationDef.target};\n`;
        } else if (relationDef.type === 'many-to-many') {
          relationsStr += `@ManyToMany(() => ${relationDef.target}, (target) => target.${entityName.toLowerCase()}s)\n${relationDef.joinTable ? '@JoinTable()\n' : ''}${relationName}s: ${relationDef.target}[];
          `;
        }
      }
    }

    return `
      import { Entity, Column, JoinTable, JoinColumn ,PrimaryGeneratedColumn, OneToMany, ManyToOne, OneToOne, ManyToMany } from 'typeorm';
      ${aux}
      @Entity()
      export class ${entityName} {
      @PrimaryGeneratedColumn()
      id: number;
      ${props}
     ${relationsStr}
      }
    `;
  }

  private generateDtoClass(
    entityName: string,
    properties: { [key: string]: string },
    relations?: Array<{ type: string; target: string; joinTable: boolean }>,
  ): string {
    const props = Object.entries(properties)
      .map(([key, type]) => {
        switch (type.toLowerCase()) {
          case 'string':
            return `@ApiProperty()\n@IsString()\n ${key}: string;`;
          case 'number':
            return `@ApiProperty()\n@IsNumber()\n ${key}: number;`;
          default:
            throw new Error(`Tipo desconocido: ${type}`);
        }
      })
      .join('\n');

    let relationsProps = '';
    let imports = '';

    if (relations) {
      for (const relation of relations) {
        imports += `import { ${relation.target} } from 'src/entities/new/${relation.target}.entity';\n`;
        if (relation.type === 'many-to-one') {
          relationsProps += `@ApiProperty()\n@IsNumber()\n ${relation.target.toLowerCase()}: ${relation.target};\n`; // Usar ID para la relación
        } else if (relation.type === 'one-to-one' && relation.joinTable) {
          relationsProps += `@ApiProperty()\n@IsNumber()\n ${relation.target.toLowerCase()}: ${relation.target};\n`; // Usar ID para la relación
        } else if (relation.type === 'many-to-many' && relation.joinTable) {
          relationsProps += `@ApiProperty()\n@IsArray()\n ${relation.target.toLowerCase()}s: number[];\n`;
        }
      }
    }

    return `
      import { IsString, IsNumber, IsArray } from 'class-validator';
      import { ApiProperty } from '@nestjs/swagger';
      ${imports}

      export class Create${entityName}Dto {
      ${props}
      ${relationsProps}
      }

      export class Update${entityName}Dto{
      @ApiProperty()
      @IsNumber()\n
      id: number;
      ${props}
      }
    `;
  }

  private generateServiceClass(
    entityName: string,
    nodoRelations: Array<string>,
    relations?: Array<{ type: string; target: string; joinTable: boolean }>,
  ): string {
    var data = [];
    var importRepository: string = '';
    var targetEntityName: String = '';
    var withRelation: string = '';
    console.log(nodoRelations);
    if (relations && relations.length > 0) {
      relations.map((item) => {
        if (item.type === 'many-to-one') {
          data.push("'" + item.target.toLocaleLowerCase() + "'");
        } else {
          data.push("'" + item.target.toLocaleLowerCase() + 's' + "'");
        }
        if (item.joinTable && item.type === 'many-to-many') {
          importRepository = `@InjectRepository(${item.target}) private readonly repository${item.target}: Repository<${item.target}>,`;
          targetEntityName = `import { ${item.target} } from '../../entities/new/${item.target}.entity';`;
          withRelation = `const found = await this.repository${item.target}.findBy({ id: In(data.${item.target.toLocaleLowerCase()}s) });
              if(found.length===0)throw new Error("No exists Ids")

              const entity = new ${entityName}()

                Object.keys(data).forEach(key => {
                  if (data[key] !== undefined) {
                      entity[key] = data[key]; 
                  }
              });

              entity.${item.target.toLocaleLowerCase() + 's'}=found;
              return this.repository.save(entity);`;
        } else {
          withRelation = `return this.repository.save(data);`;
        }
      });
    } else {
      withRelation = `return this.repository.save(data);`;
    }
    var relationString = [];
    var relaciónAux = '';
    if (nodoRelations && nodoRelations.length > 0) {
      relationString = nodoRelations.map((item) => "'" + item + "'");
      relaciónAux = `{ relations: [${relationString}]}`;
    }

    return `
      import { Injectable, NotFoundException } from '@nestjs/common';
      import { Repository,In } from 'typeorm';
      import { InjectRepository } from '@nestjs/typeorm';
      import { ${entityName} } from '../../entities/new/${entityName}.entity';
      ${targetEntityName}
      import { Create${entityName}Dto, Update${entityName}Dto } from '../../dtos/new/${entityName}.dto';
      @Injectable()
      export class ${entityName}Service {
          constructor(
          ${importRepository}
              @InjectRepository(${entityName}) private readonly repository: Repository<${entityName}>,
          ) {}

          async create(data: Create${entityName}Dto): Promise<${entityName}> {
              ${withRelation}

          }

          async findAll(): Promise<${entityName}[]> {
              return await this.repository.find(${relaciónAux}); // Cargar relaciones si existen
          }

          async findOne(id: number): Promise<${entityName}> {
              return await this.repository.findOne({ where: { id } });
          }

          remove(id: number) {
              return this.repository.delete(id);
          }

          async update(data: Update${entityName}Dto): Promise<${entityName}> {
              const found = await this.repository.findOne({ where: { id: data.id } });
          
               if (!found) { throw new NotFoundException('id not found') }
          
              Object.assign(found, data);

              return await this.repository.save(data)
          }
      }
    `;
  }

  private generateControllerClass(entityName: string): string {
    return `
      import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
      import { ${entityName}Service } from '../../services/new/${entityName}.service';
      import { Create${entityName}Dto, Update${entityName}Dto } from '../../dtos/new/${entityName}.dto';
      import { ${entityName} } from '../../entities/new/${entityName}.entity';

      @Controller('${entityName.toLowerCase()}')
      export class ${entityName}Controller {
          constructor(private readonly service: ${entityName}Service) {}

          @Post()
          async create(@Body() dto: Create${entityName}Dto) {
              try{
              return await this.service.create(dto);
              }catch(error){
                  console.log(error)
              }
  }

          @Get()
          async findAll() {
              try{
              return await this.service.findAll();
              }catch(error){
                  console.log(error)
              }
  }

          @Get(':id')
          async findOne(@Param('id') id: number) {
              try{
              return await this.service.findOne(id);
              }catch(error){
                  console.log(error)
              }
  }
          @Delete(':id/delete')
          remove(@Param('id') id: number) {
              try{
              return this.service.remove(id);
              }catch(error){
                  console.log(error)
              }
  }

         @Put()
          async update(@Body() data: Update${entityName}Dto ) {
          try{
          return await this.service.update(data);
              }catch(error){
              console.log(error)
          }
  }
      }
    `;
  }

  private async updateIndex(
    entityName: string,
    controllersDirGenerate: string,
    extent: string,
  ) {
    const indexFilePath = path.join(controllersDirGenerate, 'index.ts');
    let indexContent = await fs.readFile(indexFilePath, 'utf8');
    const exportLine = `\nexport * from './new/${entityName}.${extent}';`;

    if (!indexContent.includes(exportLine)) {
      indexContent += exportLine;
      await fs.writeFile(indexFilePath, indexContent);
    }
  }
}
