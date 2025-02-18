import { InjectQueue, OnWorkerEvent, Processor, WorkerHost
 } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { TinyService } from './tiny.service';
import Bottleneck from 'bottleneck';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ProductService } from 'src/modules/product/service/product.service';
import { EntityOperation } from 'src/shared/constants/entity-operation';
import { BehaviorSubject } from 'rxjs';
import { Product } from 'src/modules/product/entities/product.entity';
import { EmailService } from './email.service';

export interface QueueDataProcessor {
  id:string
  token:string
  entity?:EntityOperation
}
@Processor('erp-data-queue')
export class ErpDataProcessor extends WorkerHost {
  private readonly logger = new Logger(ErpDataProcessor.name);
  private readonly limiter: Bottleneck;
  QUEUE_DATA:QueueDataProcessor = {
    id:'',
    token:''
  }
  ENTITY_OPERATION = ''
  
  constructor(
    private readonly productService: ProductService,
    private readonly tinyService: TinyService,
    private readonly emailService: EmailService,

    @InjectQueue('erp-data-queue') private readonly erpDataQueue: Queue,
  ) {
    super();
    // Configura o limitador para 30 requisições por minuto
    this.limiter = new Bottleneck({
      reservoir: 40, // Número máximo de requisições disponíveis
      reservoirRefreshAmount: 40, // Quantidade de requisições a ser restaurada
      reservoirRefreshInterval: 60 * 500, // Intervalo em milissegundos (1 minuto)
      maxConcurrent: 1, // Número máximo de requisições simultâneas
    });
  }

  @OnWorkerEvent('drained')
  async onDrained(){
   // this.logger.log(`Queue id ${job.data.id}`)

    //If the product queue if finished start to get the order base.
    //If the order quee is finished, put the marketplaces on products.
    if(this.QUEUE_DATA.entity == EntityOperation.PRODUCT){
      this.logger.log(this.productService.savedProducts.value)
      //TODO email do usuário logado
      this.logger.log('Enviado para o email:', this.productService.clientEmail.value)
      
      const products = this.productService.savedProducts.value
      
      const emailHtml = await this.emailService.generateEntLoadProducts(
        [...products].length,
        new Date,
        products
      );

      const result = await this.emailService.sendMail(
       'executivo@bravanparts.com', 
        'Carregamento de produtos finalizado - Bravan Parts', 
        `Foram ${products.length} carregados`,
        emailHtml
      )
    }
    
    /* else if(this.QUEUE_DATA.entity == EntityOperation.ORDER){
      this.productService.putMarketPlacesOnProducts()
    } */
  }

  async process(job: Job<{ id: string ,token:string,entity:EntityOperation}>): Promise<void> {
    const { id,token,entity } = job.data;
    Object.assign(this.QUEUE_DATA,job.data)
 
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
        
        const skuAndSupplierSkuIsNull = (
          (productData.retorno.produto.codigo == '' || productData.retorno.produto.codigo == null ) && 
          (productData.retorno.produto.codigo_pelo_fornecedor == '' || productData.retorno.produto.codigo_pelo_fornecedor == null)
        )

        if(skuAndSupplierSkuIsNull){
          this.logger.log(`Produto ${productId} não pode ser processado. Todos os códigos estão vazios.`);
          throw new Error(`Produto ${productId} não pode ser processado. Todos os códigos estão vazios.`)
        }else{
          await this.productService.saveProductFromExternalSystem(
            productData.retorno.produto,
            companyInfo.retorno.conta.razao_social
          );
          this.logger.log(`Produto ${productId} processado com sucesso.`);
        }
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