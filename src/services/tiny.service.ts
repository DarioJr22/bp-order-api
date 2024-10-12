import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { URLGETPROD, URLPRODEST, URLREADPROD } from "src/shared/constants/URLS";
import { ProductSearchReturn, ReturnProductDto } from "src/modules/product/dto/returnProduct";
import { SearchProductDto } from "src/modules/product/dto/searchProduct";
import { ProtucStocktDto, ReturnStockDto } from "src/modules/product/dto/product-stock";
import { ProductDto } from "src/modules/product/dto/product";
import * as dotenv from 'dotenv';
import { Cron } from "@nestjs/schedule";
import { ProductService } from "src/modules/product/service/product.service";
import Bottleneck from "bottleneck";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
dotenv.config();


@Injectable()
export class TinyService {


  private readonly limiter: Bottleneck;

  constructor(private readonly productService: ProductService,
    @InjectQueue('erp-data-queue') private readonly erpDataQueue: Queue,
  ) {
    this.limiter = new Bottleneck({
      reservoir: 30,
      reservoirRefreshAmount: 30,
      reservoirRefreshInterval: 60 * 1000,
      maxConcurrent: 1,
    });
  }

  async searchProduct() {
    try {
      return this.getAllProducts()
    } catch (error) {
      Logger.log(error)
      return new HttpException('Erro ao buscar os produtos', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

 

  async getFilterFields(fieldStr: string[]) {
    Logger.log(fieldStr)
    console.log(fieldStr)
    //Result 
    const result: any = {}

    try {
      //Pegatodos os produtos
      const resp = await this.searchProduct();

      //Pega todos os campos
      const fields: string[] = fieldStr


      //Se não retornar uma exceção então faz o L
      if (!(resp instanceof HttpException)) {
        fields.forEach((key: string) => {
          result[key] = [...new Set(resp.map(prod => { return { [key]: prod.produto[key] } }).filter(mappedProd => mappedProd[key] != ""))
          ]
        }
        );
      }

    } catch (error) {
      Logger.log(error)
    }

    return result
  }



  async getAllProducts() {
    //TODO - TIPAR ISSO
    // eslint-disable-next-line prefer-const
    let results: ProductSearchReturn[] = [];
    // eslint-disable-next-line prefer-const
    let page = {
      numero_paginas: 0,
      pagina: 0
    };

    do {
      //Recover data from actual pages
      const resp = await axios.get<ReturnProductDto>(`${URLGETPROD}?token=${process.env.APIKEY}&formato=json&pagina=${page.pagina}`)
      console.log(resp);
      //Set to next page
      page.pagina = ++resp.data.retorno.pagina

      //Get total number of pages
      page.numero_paginas = resp.data.retorno.numero_paginas

      const result = resp.data.retorno.produtos || []
      //Put results to a 
      results.push(...result)
    } while (page.pagina <= page.numero_paginas);


    //  results = await Promise.all(await this.iterateProductBalance(results))
    return results
  }





  async getStockProductBalance(idProduto: string) {

    try {
      //Recover data from actual pages
      const resp = await axios.get<ReturnStockDto<ProtucStocktDto>>(`${URLPRODEST}?token=${process.env.APIKEY}&formato=json&id=${idProduto}`)
      return resp.data.retorno.produto
    } catch (erro) {
      throw Error('Erro ao consultar estoque')
    }
  }


  async searchAllProducts(searchDto: SearchProductDto) {
    //TODO - TIPAR ISSO
    // eslint-disable-next-line prefer-const
    let results: any[] = [];
    // eslint-disable-next-line prefer-const
    let page = {
      numero_paginas: 0,
      pagina: 0
    };

    let params: any = {
      token: process.env.APIKEY,
      formato: 'json',
      pagina: page.pagina,
      pesquisa: searchDto.pesquisa || undefined,
      idTag: searchDto.idTag || undefined,
      situacao: searchDto.situacao || undefined,
      dataCriacao: searchDto.dataCriacao || undefined
    }

    params = await this.removeUndefinedParams(params)

    do {
      console.log(params)
      //Recover data from actual pages
      const resp = await axios.get<ReturnProductDto>(`${URLGETPROD}`, { params: params })
      //Set to next page
      page.pagina = ++resp.data.retorno.pagina
      //Get total number of pages
      page.numero_paginas = resp.data.retorno.numero_paginas
      //Put results to a 
      results.push(...resp.data.retorno.produtos)
    } while (page.pagina <= page.numero_paginas);


    return results
  }




  async findProductById(id: string) {
    try {
      const resp = await axios.get<{ retorno: { produto: ProductDto } }>(`${URLREADPROD}?token=${process.env.APIKEY}&formato=json&id=${id}`)
      resp.data.retorno.produto.saldo_estoque = await this.getStockProductBalance(id);
      return resp.data
    } catch (error) {
      return new HttpException('Erro ao buscar o produto', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async removeUndefinedParams(params: { [key: string]: any }) {
    const paramsHandler = params
    Object.keys(paramsHandler).forEach(key => {
      if (paramsHandler[key] === undefined) {
        delete params[key];
      }
    });

    return paramsHandler
  }

  async getAllProductIds(): Promise<string[]> {
    let productIds: string[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const resp = await axios.get<ReturnProductDto>(
        `${URLGETPROD}?token=${process.env.APIKEY}&formato=json&pagina=${page}`
      );

      if (resp.data.retorno.produtos) {
        const ids = resp.data.retorno.produtos.map(prod => prod.produto.id);
        productIds = productIds.concat(ids);
      }

      totalPages = resp.data.retorno.numero_paginas;
      page++;
    } while (page <= totalPages);

    return productIds;
  }

  @Cron('0 40 1 * * *')
  async saveProductsScheduled() {
    console.log('Tarefa executada às 22:40!');
    //Recupera os ID's de todos os produtos
    const productIds = await this.getAllProductIds();
    
    //Limpa todas as tabelas envolvidas antes da transação começar
    this.productService.truncateTables();
    
    //Pesquisa e salva cada um dos produtos usando a fila
    for (const id of productIds) {
      await this.erpDataQueue.add('fetch-and-save-product', { productId: id });
    }
  }

  async trucateTables(){

  }


  async findProductByIdScheduled(id: string) {
    try {
      const resp = await this.limiter.schedule(() =>
        axios.get<{ retorno: { produto: ProductDto } }>(
          `${URLREADPROD}?token=${process.env.APIKEY}&formato=json&id=${id}`
        )
      );

      const produto = resp.data.retorno.produto;
      produto.saldo_estoque = await this.getStockProductBalance(id);

      return resp.data;
    } catch (error) {
      return new HttpException(
        'Erro ao buscar o produto',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStockProductBalanceScheduled(idProduto: string) {
    try {
      const resp = await this.limiter.schedule(() =>
        axios.get<ReturnStockDto<ProtucStocktDto>>(
          `${URLPRODEST}?token=${process.env.APIKEY}&formato=json&id=${idProduto}`,
        )
      );
      return resp.data.retorno.produto;
    } catch (erro) {
      throw new Error('Erro ao consultar estoque');
    }
  }
}