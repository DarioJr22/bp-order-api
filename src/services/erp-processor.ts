import { InjectQueue, Processor, WorkerHost
 } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { TinyService } from './tiny.service';
import Bottleneck from 'bottleneck';
import { HttpException, Logger } from '@nestjs/common';
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

  async process(job: Job<{ productId: string ,store:'bravan' |'planet'}>): Promise<void> {
    const { productId,store } = job.data;
    try {
      // Usa o limitador para controlar as requisições
      const productData = await this.limiter.schedule(() =>
        this.tinyService.findProductById(productId,store),
      );

      if (!(productData instanceof HttpException)) {
        await this.productService.saveProductFromExternalSystem(
          productData.retorno.produto,
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
