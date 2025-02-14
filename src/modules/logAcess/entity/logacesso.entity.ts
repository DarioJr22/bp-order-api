import { User } from 'src/modules/user/entity/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
export enum TipoAcao {
  VISUALIZACAO = 'visualizacao',
  CLIQUE = 'clique',
  CARRINHO = 'carrinho',
  COMPRA = 'compra',
}

@Entity('log_acess')
export class LogAcess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TipoAcao })
  acao: TipoAcao;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  data: Date;

  @ManyToOne(() => User, (user) => user.logs)
  user: User;

  @ManyToOne(() => Product, (product) => product.logs, { nullable: true })
  product: Product;
}