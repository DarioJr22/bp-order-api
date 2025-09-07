import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { AnexoEntity, Product } from '../entities/product.entity';
import { ProductDto } from '../dto/product';
import { Order } from 'src/modules/order/entity/order.entity';
import { PedidoDetailDTO } from 'src/modules/order/dto/order';
import { UserService } from 'src/modules/user/services/user.service';
import { TinyService } from 'src/services/tiny.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { DEFAULT_MARKET_PLACES, ProducPricing, ProdutoStatus } from '../dto/product-pricing-status';

export const DEFAULT_PRODUCT_MARKETPLACE = "MERCADO LIVRE"

@Injectable()
export class ProductService {

  public savedProducts:BehaviorSubject<Product[]> = new BehaviorSubject([]);
  public savedProductsObs$:Observable<any> = this.savedProducts.asObservable();
  public clientEmail:BehaviorSubject<string> = new BehaviorSubject('')
  public clientEmail$:Observable<any> = this.savedProducts.asObservable();

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    
    @InjectRepository(AnexoEntity)
    private readonly anexoRepository: Repository<AnexoEntity>,
    
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    private readonly userService:UserService,

    private dataSource:DataSource
  ) {}

  
  async isProductInDatabase(productId: string,codigo:string): Promise<boolean> {
    const product = await this.productRepository.findOne({ where: { id_item: productId.toString() ,codigo:codigo } });    
    return !!product; // Retorna true se o produto existir, false caso contrário
  }

   async encontrarPorId(id: string): Promise<Product> {
      const produto = await this.productRepository.findOne({ where: { id } });
      if (!produto) throw new NotFoundException('Produto não encontrado');
      return produto;
    }

  async saveOrderFromExternalSystem(
    OrderData: PedidoDetailDTO
  ): Promise<any[]> {
    // 1. Cria uma nova instância de Order com os dados recebidos


   const savedItems = OrderData.itens.map(async (item)=>{

      const order = new Order();
      Object.assign(order,OrderData);
      console.log(order);
      console.log(OrderData);
      order.id_item = item.item.id_produto
  /*     order.ecommerce_id = await this.returnNullIfIsUndefined(( OrderData.ecommerce.id ?  OrderData.ecommerce.id : 0),OrderData) */
      order.ecommerce_nomeEcommerce = await this.returnNullIfIsUndefined(OrderData.ecommerce.nomeEcommerce || DEFAULT_PRODUCT_MARKETPLACE ,OrderData)
      order.ecommerce_numeroPedidoCanalVenda = await this.returnNullIfIsUndefined(OrderData.numero_ordem_compra || 0,OrderData)
       // 2. Salva o produto no banco de dados
       const savedOrder = await this.orderRepository.save(order);
       return savedOrder
    })  
     
   
    return savedItems;
  }

  async returnNullIfIsUndefined(value:any,obj:PedidoDetailDTO){
    let returnValue = value ? value : null
    
    if(await this.verifyMarketPlaceInOtherPattern(obj)){
      returnValue = obj.forma_envio
    }
    return returnValue
  }

  async verifyMarketPlaceInOtherPattern(obj:PedidoDetailDTO){
    if(
      obj.ecommerce.nomeEcommerce == undefined || 
      obj.ecommerce.nomeEcommerce == null || 
      obj.ecommerce.nomeEcommerce == ''  && 
      obj.forma_envio.includes("SHOPEE")   
    ){
      return true
    }
    return false
  }

  // Função para salvar o produto e anexos
  async saveProductFromExternalSystem(
    productData: ProductDto,empresa:string): Promise<Product> {
    // 1. Cria uma nova instância de Product com os dados recebidos
    const product = new Product();
    Object.assign(product,productData);
    product.id_item = productData.id;
    product.empresa = empresa;
    product.codigo = !product.codigo && product.codigo_pelo_fornecedor ? product.codigo_pelo_fornecedor : product.codigo  
    product.preco_marketplace = DEFAULT_MARKET_PLACES
    // 2. Salva o produto no banco de dados
    const savedProduct = await this.productRepository.save(product);

    // 3. Salvar os anexos (se houver)
    if (productData.anexos && productData.anexos.length > 0) {
      for (const anexo of productData.anexos) {
            const newAnexo = new AnexoEntity();
            newAnexo.anexo = anexo.anexo;

            // Salva o anexo no banco
            await this.anexoRepository.save(newAnexo);
      }
    }

    this.savedProducts.next([...this.savedProducts.value,savedProduct])
    return savedProduct;
  }

  async getProductById(id:string){
    return this.productRepository.find({ 
      relations:['anexos'],
      where:{
       id:id
      }})
  }

  async getProductBySKU(id:string){
    return this.productRepository.find({ 
      relations:['anexos'],
      where:{
       codigo:id
      }})
  }

  /**
   * Obtém as configurações de preço por marketplace de um produto
   * @param codigo Código do produto
   */
  async getMarketplacePricings(codigo: string): Promise<ProducPricing[]> {
    const product = await this.productRepository.findOne({ 
      where: { codigo },
      select: ["preco_marketplace"] // Seleciona apenas o campo necessário
    });
    
    if (!product) {
      throw new NotFoundException(`Produto com código ${codigo} não encontrado`);
    }
    
    return product.preco_marketplace || [];
  }




  async truncateTables(){
    this.anexoRepository.clear();
    this.productRepository.clear();
    this.orderRepository.clear();
    
  }


  async truncateTablesWithQueryRunner(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Begin transaction
      await queryRunner.startTransaction();

      // Use raw SQL to truncate with cascade
      await queryRunner.query(`TRUNCATE TABLE anexo CASCADE;`);
      await queryRunner.query(`TRUNCATE TABLE produto CASCADE;`);
      await queryRunner.query(`TRUNCATE TABLE "order" CASCADE;`);

      // Commit the transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback the transaction in case of error
      await queryRunner.rollbackTransaction();
      console.error('Error truncating tables:', error);
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
  



  async getAllProducts(){
    // eslint-disable-next-line prefer-const
    let prds = await this.productRepository.find({
      relations:['anexos']
    })
    return prds.map(prd => {
      return {
        produto:prd
      }
    }) ;
  }

  async getProductsByEmpresa(empresa:string){
    // eslint-disable-next-line prefer-const
    let prds = await this.productRepository.find({
      relations:['anexos'],
      where:{
        empresa:Like(`${empresa}`),
        situacao:'A'

      }
    })
    return prds.map(prd => {
      return {
        produto:prd
      }
    }) ;
  }


  async putMarketPlacesOnProducts(){
    (await this.orderRepository.find()).forEach(
      (order) => this.productRepository.update(
        {id_item:order.id_item},
        {marketplace:order.ecommerce_nomeEcommerce}
      )
    )
  }

  async productUpdatePrice(
    codigo:string,
    preco:ProducPricing[]){
   await this.productRepository.update(
    {codigo:codigo},
    {
      preco_marketplace:preco
    })
  }

  /**
   * Adiciona uma nova configuração de preço de marketplace para um produto
   * @param codigo Código do produto
   * @param newPricing Nova configuração de preço a ser adicionada
   */
  async addMarketplacePricing(codigo: string, newPricing: ProducPricing): Promise<ProducPricing[]> {
    // Busca o produto pelo código apenas para validar existência
    const product = await this.productRepository.findOne({ where: { codigo } });
    
    if (!product) {
      throw new NotFoundException(`Produto com código ${codigo} não encontrado`);
    }
    
    // Obter as configurações de preço atuais
    let currentPricings = product.preco_marketplace || [];
    
    // Cria uma cópia do array para trabalhar com ele
    const updatedPricings = [...currentPricings];
    
    // Verifica se já existe configuração para este marketplace
    const existingIndex = updatedPricings.findIndex(
      p => p.marketplace.toLowerCase() === newPricing.marketplace.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // Se já existe, atualiza
      updatedPricings[existingIndex] = newPricing;
    } else {
      // Se não existe, adiciona
      updatedPricings.push(newPricing);
    }
    
    // Usar update ao invés de save para evitar problemas com relacionamentos
    await this.productRepository.update({ codigo }, { 
      preco_marketplace: updatedPricings 
    });
    
    return updatedPricings;
  }
  
  /**
   * Remove uma configuração de preço de marketplace para um produto
   * @param codigo Código do produto
   * @param marketplaceName Nome do marketplace a ser removido
   */
  async deleteMarketplacePricing(codigo: string, marketplaceName: string): Promise<ProducPricing[]> {
    // Busca o produto pelo código apenas para validar existência
    const product = await this.productRepository.findOne({ where: { codigo } });
    
    if (!product) {
      throw new NotFoundException(`Produto com código ${codigo} não encontrado`);
    }
    
    // Verifica se o produto tem configurações de preço
    if (!product.preco_marketplace || product.preco_marketplace.length === 0) {
      throw new NotFoundException(`Produto não possui configurações de preço para marketplaces`);
    }
    
    // Filtra removendo o marketplace especificado
    const initialLength = product.preco_marketplace.length;
    const updatedPricings = product.preco_marketplace.filter(
      p => p.marketplace.toLowerCase() !== marketplaceName.toLowerCase()
    );
    
    // Verifica se algo foi removido
    if (updatedPricings.length === initialLength) {
      throw new NotFoundException(`Marketplace ${marketplaceName} não encontrado nas configurações`);
    }
    
    // Usar update ao invés de save para evitar problemas com relacionamentos
    await this.productRepository.update({ codigo }, { 
      preco_marketplace: updatedPricings 
    });
    
    return updatedPricings;
  }

async findProductsByPricingStatus(
  status: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: Product[]; count: number; totalPages: number }> {
  const skip = (page - 1) * pageSize;
  const countQuery = this.productRepository
    .createQueryBuilder('product')
    .where(`EXISTS (
      SELECT 1 
      FROM jsonb_array_elements(CAST("product"."preco_marketplace" AS jsonb)) AS price
      WHERE price->>'status' = :status
    )`, { status })
    .andWhere('product.preco_marketplace IS NOT NULL');

  const total = await countQuery.getCount();
  const query = this.productRepository
    .createQueryBuilder('product')
    .where(`EXISTS (
      SELECT 1 
      FROM jsonb_array_elements(CAST("product"."preco_marketplace" AS jsonb)) AS price
      WHERE price->>'status' = :status
    )`, { status })
    .andWhere('product.preco_marketplace IS NOT NULL')
    .orderBy('product.id', 'ASC')
    .skip(skip)
    .take(pageSize);

  const data = await query.getMany();
  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    count: total,
    totalPages
  };
}
async getPricingStatusSummary(): Promise<{
  totalProducts: number;
  statusCounts: Record<string, number>;
  statusDetails: { status: string; count: number }[];
}> {
  try {
    const totalProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.preco_marketplace IS NOT NULL')
      .getCount();

    console.log('Total de produtos com preco_marketplace:', totalProducts);
    const summaryQuery = `
      WITH valid_data AS (
        SELECT
          id,
          CASE 
            WHEN jsonb_typeof(CAST(preco_marketplace AS jsonb)) = 'array' 
            THEN CAST(preco_marketplace AS jsonb) 
            ELSE '[]'::jsonb 
          END AS safe_marketplace
        FROM produto
        WHERE preco_marketplace IS NOT NULL
      )
      SELECT 
        status,
        COUNT(DISTINCT product_id) as count
      FROM (
        SELECT
          vd.id as product_id,
          jsonb_array_elements(vd.safe_marketplace)->>'status' as status
        FROM valid_data vd
      ) AS subquery
      WHERE status IS NOT NULL AND status != ''
      GROUP BY status
    `;

    const statusResults = await this.productRepository.query(summaryQuery);
    const statusCounts: Record<string, number> = {};
    const statusDetails: { status: string; count: number }[] = [];

    statusResults.forEach((row: any) => {
      statusCounts[row.status] = Number(row.count);
      statusDetails.push({
        status: row.status,
        count: Number(row.count)
      });
    });

    return {
      totalProducts,
      statusCounts,
      statusDetails
    };
  } catch (error) {
    console.error('Erro detalhado ao gerar resumo de status:', error);
    throw new InternalServerErrorException(
      'Erro ao gerar resumo de status: ' + error.message
    );
  }
}

async findProductsByName(
  name: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: Product[]; count: number; totalPages: number }> {
  const skip = (page - 1) * pageSize;
  
  const [data, total] = await this.productRepository
    .createQueryBuilder('product')
    .where('product.nome ILIKE :name', { name: `%${name}%` }) // ILIKE para case-insensitive
    .orderBy('product.nome', 'ASC')
    .skip(skip)
    .take(pageSize)
    .getManyAndCount();

  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    count: total,
    totalPages
  };
}

async findProductsBySkuOrGtin(
  searchTerm: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: Product[]; count: number; totalPages: number }> {
  const skip = (page - 1) * pageSize;
  
  const [data, total] = await this.productRepository
    .createQueryBuilder('product')
    .where('product.codigo = :searchTerm', { searchTerm })
    .orWhere('product.gtin = :searchTerm', { searchTerm })
    .orderBy('product.nome', 'ASC')
    .skip(skip)
    .take(pageSize)
    .getManyAndCount();

  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    count: total,
    totalPages
  };
}
  


}
