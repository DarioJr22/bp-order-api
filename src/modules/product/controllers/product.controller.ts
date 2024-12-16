import {  Controller, Get, HttpException, HttpStatus, Logger, Param, Query } from "@nestjs/common";
import { TinyService } from "src/services/tiny.service";

import { ProductService } from "../service/product.service";
import { SearchProductDto } from "../dto/searchProduct";

@Controller('product')
export class ProductController{
    
    constructor(private tinyService:TinyService,
      private productService:ProductService
    ){}
    
    @Get()
    async getAllProducts(){
        try {
            const resp = await this.productService.getAllProducts();
            return  resp
          } catch (error) {
            console.log(error);
            throw new HttpException('Erro ao buscar produtos', HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }

    @Get('find-company-products/:company')
    async getProductsByCompany(@Param('company') company:string){
        try {
            const resp = await this.productService.getProductsByEmpresa(company);
            return  resp
          } catch (error) {
            console.log(error);
            throw new HttpException('Erro ao buscar produtos', HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }

    @Get('updates/:token')
    async updateStoreProducts(@Param('token') token:string){
      try {
        console.log(token);
        
        const resp = await this.tinyService.updateProductBase(token);
        return  resp
      } catch (error) {
        console.log(error);
        throw new HttpException('Erro ao buscar produtos', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    @Get('order-update/:token')
    async updateStoreOrder(@Param('token') token:string){
      try {
        console.log(token);
        const resp = await this.tinyService.updateOrderBase(token);
        return  resp
      } catch (error) {
        console.log(error);
        Logger.log(token)
        throw new HttpException('Erro ao buscar Pedidos: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }


    @Get(':id')
    async getProductsByID(@Param('id') id:string,@Param('store') token:'bravan' | 'planet'){
        try {

            // Validação simples do ID (opcional)
            if (!id || typeof id !== 'string') {
              throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
            }
            const resp = await this.tinyService.findProductById(id,token);

              // Verifica se o produto foi encontrado
            if (!resp) {
                throw new HttpException('Produto não encontrado', HttpStatus.NOT_FOUND);
            }

            return  resp
          } catch (error) {
            throw new HttpException('Erro ao buscar produtos', HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }


    //TODO - Filtrar a gente mesmo pq isso aqui não tá prestando
    /* 
    * @deprecated
    */
    @Get('search')
    async searchProducts(
      @Query('pesquisa') pesquisa:string,
      @Query('idTag') idTag:number,
      @Query('situacao') situacao:string,
      @Query('dataCriacao') dataCriacao:string,
      @Query('token') token:string){

      
        try {
            const searchProduct = new SearchProductDto({
              formato:'json',
              pesquisa:pesquisa,
              idTag:idTag,
              situacao:situacao,
              dataCriacao:dataCriacao
            })
            const resp = await this.tinyService.searchAllProducts(searchProduct,token);
            Logger.log(searchProduct)
            return  resp
          } catch (error) {
            throw new HttpException('Erro ao buscar produtos', HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }

    @Get('fields/getter')
    async getFields(@Param('token') token:string){
        try {
            const resp = await this.tinyService.getFilterFields(['id','nome','tipoVariacao','situacao','codigo'],token);
            return  resp
          } catch (error) {
            throw new HttpException('Erro ao recuperar os campos de filtro', HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }



}