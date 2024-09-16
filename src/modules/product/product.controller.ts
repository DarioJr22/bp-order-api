import {  Controller, Get, HttpException, HttpStatus, Logger, Param, Query } from "@nestjs/common";
import { TinyService } from "src/services/tiny.service";
import { SearchProductDto } from "./dto/request/searchProduct";

@Controller('product')
export class ProductController{
    
    constructor(private tinyService:TinyService){}
    
    @Get()
    async getAllProducts(){
        try {
            const resp = await this.tinyService.searchProduct();
            return  resp
          } catch (error) {
            throw new HttpException('Erro ao buscar produtos', HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }


    @Get(':id')
    async getProductsByID(@Param('id') id:string){
        try {

            // Validação simples do ID (opcional)
            if (!id || typeof id !== 'string') {
              throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
            }
            const resp = await this.tinyService.findProductById(id);

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
    @Get('search')
    async searchProducts(
      @Query('pesquisa') pesquisa:string,
      @Query('idTag') idTag:number,
      @Query('situacao') situacao:string,
      @Query('dataCriacao') dataCriacao:string){

      
        try {
            const searchProduct = new SearchProductDto({
              formato:'json',
              pesquisa:pesquisa,
              idTag:idTag,
              situacao:situacao,
              dataCriacao:dataCriacao
            })
            const resp = await this.tinyService.searchAllProducts(searchProduct);
            Logger.log(searchProduct)
            return  resp
          } catch (error) {
            throw new HttpException('Erro ao buscar produtos', HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }

    @Get('fields/getter')
    async getFields(){
        try {
            const resp = await this.tinyService.getFilterFields(['id','nome','tipoVariacao','situacao','codigo']);
            return  resp
          } catch (error) {
            throw new HttpException('Erro ao recuperar os campos de filtro', HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }



}