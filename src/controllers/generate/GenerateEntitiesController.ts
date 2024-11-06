// src/dynamic-entity/dynamic-entity.controller.ts

import { Controller, Post, Get } from '@nestjs/common';
import { GenerateEntitiesService } from 'src/services/generate/GenerateEntitiesService';

@Controller('entities')
export class GenerateEntitiesController {
  constructor(private readonly dynamicEntityService: GenerateEntitiesService) {}

  private entitiesConfig = [
    {
      entityName: 'Author',
      properties: {
        name: 'string',
        age: 'number',
      },
      relations: [{ type: 'one-to-many', target: 'Book' }],
      nodoRelations: ['books', 'books.genres', 'books.library'],
    },
    {
      entityName: 'Book',
      properties: {
        title: 'string',
        publishedYear: 'number',
      },
      relations: [
        { type: 'many-to-one', target: 'Author' },
        { type: 'many-to-one', target: 'Library' },
        { type: 'many-to-many', target: 'Genre', joinTable: true },
      ],
      nodoRelations: ['author', 'genres', 'library', 'library.genres'],
    },
    {
      entityName: 'Genre',
      properties: {
        name: 'string',
      },
      relations: [{ type: 'many-to-many', target: 'Book' }],
      nodoRelations: ['books', 'books.author', ''],
    },
    {
      entityName: 'Library',
      properties: {
        name: 'string',
        location: 'string',
      },
      relations: [
        { type: 'one-to-many', target: 'Book' },
        { type: 'many-to-many', target: 'Member', joinTable: true },
      ],
      nodoRelations: ['books', 'books.author', 'books.genres', 'members'],
    },
    {
      entityName: 'Member',
      properties: {
        name: 'string',
        membershipId: 'number',
      },
      relations: [{ type: 'many-to-many', target: 'Library' }],
      nodoRelations: ['libraries'],
    },
    {
      entityName: 'SinRelacion',
      properties: {
        name: 'string',
        membershipId: 'number',
      },
      relations: [],
      nodoRelations: [],
    },
    {
      entityName: 'OneToOneMain',
      properties: {
        name: 'string',
        membershipId: 'number',
      },
      relations: [{ type: 'one-to-one', target: 'OneToOneRecive' }],
      nodoRelations: [],
    },
    {
      entityName: 'OneToOneRecive',
      properties: {
        name: 'string',
        membershipId: 'number',
      },
      relations: [{ type: 'one-to-one', target: 'OneToOneMain', joinTable: true }],
      nodoRelations: ['onetoonemain'],
    },
  ];

  @Post()
  async create() {
    try {
      const data = await this.dynamicEntityService.createEntitiesWithRelations(
        this.entitiesConfig,
      );
      return data;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  @Get()
  get() {
    return this.entitiesConfig;
  }
}
