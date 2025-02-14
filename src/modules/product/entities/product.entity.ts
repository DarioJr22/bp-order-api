import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  
} from 'typeorm';
import { ProdutoStatus } from '../dto/product-pricing-status';
import { LogAcess } from '../../logAcess/entity/logacesso.entity';

// Entidade Product, associada à tabela 'produto'
@Entity('produto')
export class Product {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: true })
  id_item:string

  @Column({ nullable: true })
  nome: string;

  @Column({ nullable: true })
  codigo: string;

  @Column({ nullable: true })
  unidade: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  preco: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  preco_promocional: number;

  @Column({ nullable: true })
  ncm: string;

  @Column({ nullable: true })
  origem: string;

  @Column({ nullable: true })
  gtin: string;

  @Column({ nullable: true })
  gtin_embalagem: string;

  @Column({ nullable: true })
  localizacao: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  peso_liquido: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  peso_bruto: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  estoque_minimo: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  estoque_maximo: number;

  @Column({ nullable: true })
  id_fornecedor: string;

  @Column({ nullable: true })
  nome_fornecedor: string;

  @Column({ nullable: true })
  codigo_fornecedor: string;

  @Column({ nullable: true })
  codigo_pelo_fornecedor: string;

  @Column({ nullable: true })
  unidade_por_caixa: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  preco_custo: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  preco_custo_medio: number;

  @Column({ nullable: true })
  situacao: string;

  @Column({ nullable: true })
  tipo: string;

  @Column({ nullable: true })
  classe_ipi: string;

  @Column({ nullable: true })
  valor_ipi_fixo: string;

  @Column({ nullable: true })
  cod_lista_servicos: string;

  @Column({ nullable: true })
  descricao_complementar: string;

  @Column({ nullable: true })
  garantia: string;

  @Column({ nullable: true })
  cest: string;

  @Column({ nullable: true })
  obs: string;

  @Column({ nullable: true })
  tipoVariacao: string;

  @Column({ nullable: true })
  variacoes: string;

  @Column({ nullable: true })
  idProdutoPai: string;

  @Column({ nullable: true })
  sob_encomenda: string;

  @Column({ nullable: true })
  dias_preparacao: string;

  @Column({ nullable: true })
  marca: string;

  @Column({ nullable: true })
  tipoEmbalagem: string;

  @Column({ nullable: true })
  alturaEmbalagem: string;

  @Column({ nullable: true })
  comprimentoEmbalagem: string;

  @Column({ nullable: true })
  larguraEmbalagem: string;

  @Column({ nullable: true })
  diametroEmbalagem: string;

  @Column({ nullable: true })
  qtd_volumes: string;

  @Column({ nullable: true })
  categoria: string;

  // Relação OneToMany entre Product e AnexoEntity
  @OneToMany(() => AnexoEntity, (anexo) => anexo.product, { cascade: true })
  anexos: AnexoEntity[];

  @Column('simple-json', { nullable: true })
  imagens_externas: any[];

  @Column({ nullable: true })
  classe_produto: string; //Identifier kit case 

  @Column({ nullable: true })
  seo_title: string;

  @Column({ nullable: true })
  seo_keywords: string;

  @Column({ nullable: true })
  link_video: string;

  @Column({ nullable: true })
  seo_description: string;

  @Column({ nullable: true })
  slug: string;

  // Propriedades adicionais

  @Column('decimal', { nullable: true, precision: 10, scale: 2 })
  desconto: number;

  @Column('simple-json', { nullable: true })
  saldo_estoque: any;

  @Column({ nullable: true })
  empresa: string;

  @Column({nullable:true})
  marketplace:string;

  //Precificação customizada

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  preco_venda: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  margem_contribuicao: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lucro_liquido: number;

  @Column({ type: 'boolean', default: false })
  em_promocao: boolean;

  @Column({
    type: 'enum',
    enum: ProdutoStatus,
    default: ProdutoStatus.ATENCAO,
  })
  status_precificacao: ProdutoStatus;

  @Column({ type: 'timestamp', nullable: true })
  data_prec: Date; // Data da última precificação

  @OneToMany(() => LogAcess,(log) => log.product)
  logs:LogAcess;
}






// Entidade Anexo
@Entity('anexo')
export class AnexoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  anexo: string;

  @ManyToOne(() => Product, (product) => product.anexos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}