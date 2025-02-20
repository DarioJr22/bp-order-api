import { Injectable, NotFoundException } from '@nestjs/common';
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

  


}
