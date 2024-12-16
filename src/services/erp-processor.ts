import { InjectQueue, Processor, WorkerHost
 } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { TinyService } from './tiny.service';
import Bottleneck from 'bottleneck';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ProductService } from 'src/modules/product/service/product.service';

@Processor('erp-data-queue')
export class ErpDataProcessor extends WorkerHost {
  private readonly logger = new Logger(ErpDataProcessor.name);
  private readonly limiter: Bottleneck;

  constructor(
    private readonly productService: ProductService,
    private readonly tinyService: TinyService,
    @InjectQueue('erp-data-queue') private readonly erpDataQueue: Queue,
  ) {
    super();
    // Configura o limitador para 30 requisições por minuto
    this.limiter = new Bottleneck({
      reservoir: 30, // Número máximo de requisições disponíveis
      reservoirRefreshAmount: 30, // Quantidade de requisições a ser restaurada
      reservoirRefreshInterval: 60 * 1000, // Intervalo em milissegundos (1 minuto)
      maxConcurrent: 1, // Número máximo de requisições simultâneas
    });
  }

  async process(job: Job<{ id: string ,token:string,entity:'product' | 'order'}>): Promise<void> {
    const { id,token,entity } = job.data;
    console.log(id,token,entity);
    
    switch(entity){
      case 'product':
        await this.processProduct(id,token);
        return;
      case 'order':
        await this.processOrder(id,token)
        return;
      default:
        throw new HttpException('Entity cant be recognized',HttpStatus.BAD_GATEWAY);
    }
  }


  async processOrder(OrderId,token){
    try{
      const orderData = await this.limiter.schedule(() => this.tinyService.findOrderById(OrderId,token)) 

      if (!(orderData instanceof HttpException)) {
        await this.productService.saveOrderFromExternalSystem(orderData.retorno.pedido);

        this.logger.log(`Pedido ${OrderId} processado com sucesso.`);
      } else {
        this.logger.error(
          `Erro ao buscar o Pedido ${orderData}: ${orderData.message}`,
        );
      }
    }catch(erro){
      return new HttpException('Erro ao buscar o Pedido', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }


  async processProduct(productId,token){
    try {
      // Usa o limitador para controlar as requisições
      const productData = await this.limiter.schedule(() =>
        this.tinyService.findProductById(productId,token),
      );

      const companyInfo = await this.tinyService.findCompanyInfo(token)

      if (!(productData instanceof HttpException)) {
        await this.productService.saveProductFromExternalSystem(
          productData.retorno.produto,
          companyInfo.retorno.conta.razao_social
        );
        this.logger.log(`Produto ${productId} processado com sucesso.`);
      } else {
        this.logger.error(
          `Erro ao buscar o produto ${productId}: ${productData.message}`,
        );
      }
  } catch (error) {
    this.logger.error(
      `Erro ao processar o produto ${productId}: ${error.message}`,
    );
    throw error;
  }
  }

}