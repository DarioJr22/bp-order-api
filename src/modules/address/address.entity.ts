import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/entity/user.entity';

@Entity('address')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  street: string;

  @Column()
  number: string;

  @Column({ nullable: true })
  complement: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  cep: string;

  @ManyToOne(() => User, (user) => user.address)
  user: User;
}