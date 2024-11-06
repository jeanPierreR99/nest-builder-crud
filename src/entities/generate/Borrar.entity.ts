import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
@Entity()
export class Borrar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;
  @Column()
  descripcion: string;
}
