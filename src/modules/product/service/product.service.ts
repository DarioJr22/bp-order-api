import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnexoEntity, Product } from '../entities/product.entity';
import { ProductDto } from '../dto/product';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    
    @InjectRepository(AnexoEntity)
    private readonly anexoRepository: Repository<AnexoEntity>,
  ) {}

  // Função para salvar o produto e anexos
  async saveProductFromExternalSystem(
    productData: ProductDto): Promise<Product> {
    // 1. Cria uma nova instância de Product com os dados recebidos
    const product = new Product();
    Object.assign(product,productData);


    // 2. Salva o produto no banco de dados
    console.log('Chegou aqui pelo menos');
    console.log(productData);

    
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
}
