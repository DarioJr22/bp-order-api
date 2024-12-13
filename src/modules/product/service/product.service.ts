import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { AnexoEntity, Product } from '../entities/product.entity';
import { ProductDto } from '../dto/product';
import { Order } from 'src/modules/order/entities/order.entity';
import { PedidoDetailDTO } from 'src/modules/order/dto/order';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    
    @InjectRepository(AnexoEntity)
    private readonly anexoRepository: Repository<AnexoEntity>,
    
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}


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
      order.ecommerce_id = await this.returnNullIfIsUndefined(OrderData.ecommerce.id,OrderData)
      order.ecommerce_nomeEcommerce = await this.returnNullIfIsUndefined(OrderData.ecommerce.nomeEcommerce,OrderData)
      order.ecommerce_numeroPedidoCanalVenda = await this.returnNullIfIsUndefined(OrderData.numero_ordem_compra,OrderData)
       // 2. Salva o produto no banco de dados
       const savedOrder = await this.orderRepository.save(order);
       return savedOrder
    })
     
   
    return await savedItems;
  }

  async returnNullIfIsUndefined(value:any,obj:PedidoDetailDTO){

    let returnValue = value ? value : null

    if(
      obj.ecommerce.nomeEcommerce == undefined || 
      obj.ecommerce.nomeEcommerce == null || 
      obj.ecommerce.nomeEcommerce == ''  && 
      obj.forma_envio.includes("SHOPEE")   
    ){
      returnValue = obj.forma_envio
    }

    return returnValue
  }

  // Função para salvar o produto e anexos
  async saveProductFromExternalSystem(
    productData: ProductDto,empresa:string): Promise<Product> {
    // 1. Cria uma nova instância de Product com os dados recebidos
    const product = new Product();
    Object.assign(product,productData);
    product.empresa = empresa;

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

    console.log('Salvou o produto ', savedProduct);
    

    return savedProduct;
  }




  async truncateTables(){
    this.anexoRepository.clear();
    this.productRepository.clear();
    this.orderRepository.clear();
    
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
    (await this.orderRepository.find()).map(
      (order) => this.productRepository.update(
        {id:order.id_item},
        {marketplace:order.ecommerce_nomeEcommerce}
      )
    )
  }


}
