import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { StoreSource } from '../dto/store';
import { User } from 'src/modules/user/entity/user.entity';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  idInterno: number; // ID interno da tabela

  @Column({ nullable: true })
  id: string;

  @Column({nullable:true})
  id_item:string;

  @Column({ nullable: true })
  numero: string;

  @Column({ nullable: true })
  numero_ecommerce: string;

  @Column({ nullable: true })
  data_pedido: string;

  // Informações do cliente em formato JSON (opcional)
  @Column({ type: 'jsonb', nullable: true })
  cliente: any;

  // Endereço de entrega também em JSON, se for útil manter assim
  @Column({ type: 'jsonb', nullable: true })
  endereco_entrega: any;

  // Armazena o JSON completo de itens (opcional, caso queira manter)
  @Column({ type: 'jsonb', nullable: true })
  itens: any;

  // Armazena apenas os IDs dos itens (id_produto) como array de texto
  @Column("text", { array: true, nullable: true })
  item_ids: string[];

  // Caso queira armazenar parcelas
  @Column({ type: 'jsonb', nullable: true })
  parcelas: any;

  // Marcadores
  @Column({ type: 'jsonb', nullable: true })
  marcadores: any;

  @Column({ nullable: true })
  condicao_pagamento: string;

  @Column({ nullable: true })
  forma_pagamento: string;

  @Column({ nullable: true })
  meio_pagamento: string;

  @Column({ nullable: true })
  nome_transportador: string;

  @Column({ nullable: true })
  frete_por_conta: string;

  @Column({ nullable: true })
  valor_frete: string;

  @Column({ type: 'float', nullable: true })
  valor_desconto: number;

  @Column({ nullable: true })
  outras_despesas: string;

  @Column({ nullable: true })
  total_produtos: string;

  @Column({ nullable: true })
  total_pedido: string;

  @Column({ nullable: true })
  numero_ordem_compra: string;

  @Column({ nullable: true })
  deposito: string;

  // Atributos individualizados do ecommerce
  @Column({ nullable: true })
  ecommerce_id: string;

  @Column({ nullable: true })
  ecommerce_numeroPedidoEcommerce: string;

  @Column({ nullable: true })
  ecommerce_numeroPedidoCanalVenda: string;

  @Column({ nullable: true })
  ecommerce_nomeEcommerce: string;

  @Column({ nullable: true })
  forma_envio: string;

  @Column({ nullable: true })
  situacao: string;

  @Column({ type: 'text', nullable: true })
  obs: string;

  @Column({ type: 'text', nullable: true })
  obs_interna: string;

  @Column({ nullable: true })
  id_vendedor: string;

  @Column({ nullable: true })
  codigo_rastreamento: string;

  @Column({ nullable: true })
  url_rastreamento: string;

  @Column({ nullable: true })
  id_nota_fiscal: string;

  // Intermediador
  @Column({ type: 'jsonb', nullable: true })
  intermediador: any;

  //Fonte de dados do pedido 
  @Column({type:'enum',enum:StoreSource,default:StoreSource.TINY})
  source:StoreSource

  @ManyToOne(() => User, (User) => User.orders)
  User: User;

  
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  data_criacao: Date;

  @Column({ type: 'timestamp', nullable: true })
  data_atualizacao: Date;


}
