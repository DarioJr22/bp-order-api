import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    OrderData: PedidoDetailDTO): Promise<Order> {
    // 1. Cria uma nova instância de Order com os dados recebidos
      const order = new Order();
      Object.assign(order,OrderData);
      

    // 2. Salva o produto no banco de dados
      const savedOrder = await this.orderRepository.save(order);

    return savedOrder;
  }

  // Função para salvar o produto e anexos
  async saveProductFromExternalSystem(
    productData: ProductDto): Promise<Product> {
    // 1. Cria uma nova instância de Product com os dados recebidos
    const product = new Product();
    Object.assign(product,productData);


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
        empresa:empresa,
        situacao:'A'

      }
    })
    return prds.map(prd => {
      return {
        produto:prd
      }
    }) ;
  }
}
