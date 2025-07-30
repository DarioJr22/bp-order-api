import {  BadRequestException, Body, Controller, DefaultValuePipe, Delete, Get, HttpException, HttpStatus, Logger, Param, ParseIntPipe, Put, Query } from "@nestjs/common";
import { TinyService } from "src/services/tiny.service";

import { ProductService } from "../service/product.service";
import { SearchProductDto } from "../dto/searchProduct";
import { TaskService } from "src/services/task.service";
import { ProducPricing, ProdutoStatus } from "../dto/product-pricing-status";

@Controller('product')
export class ProductController{
    
    constructor(
        private tinyService:TinyService,
        private productService:ProductService,
        private taskServic:TaskService
      ){}


    
    @Put('update-product')
    async updateProductPrice(@Body() productpricing:{
      codigo:string,
      preco:ProducPricing[],
    }){

     this.productService.productUpdatePrice(
      productpricing.codigo,
      productpricing.preco)

    }

    @Get('update-admin-products/:email')
    async updateUsersData(@Param('email') email:string){
      try {
         
          const resp = await this.taskServic.updateUsersData(email);

          return  resp
        } catch (error) {
          console.log(error);
          throw new HttpException('Erro ao buscar produtos', HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }
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



    @Get('update-marketplaces')
    async updateMarketPlacesOrder(){
      try {
        const resp = await this.productService.putMarketPlacesOnProducts();
        return  resp
      } catch (error) {
        throw new HttpException('Erro ao buscar Pedidos: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }


    @Delete()
    async clearAll(){
      return await this.productService.truncateTablesWithQueryRunner()
    }


    @Get(':id')
    async getProductsFromTyniByID(@Param('id') id:string,@Param('store') token:'bravan' | 'planet'){
        try {

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

    @Get('byId/:id')
    async getProductsByLocalAppID(@Param('id') id:string){
        try {

            // Validação simples do ID (opcional)
            if (!id || typeof id !== 'string') {
              throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
            }
            const resp = await this.productService.getProductById(id);

              // Verifica se o produto foi encontrado
            if (!resp || resp.length == 0) {
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

    @Get('sheets/migradados')
    async getMigradados(){
        try {
            const resp = await this.taskServic.updateSheetProducts();
            return  resp
          } catch (error) {
            console.log(error);
            
            throw new HttpException('Erro ao recuperar os campos de filtro', HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }



    @Get('pricing-status/:status')
    async getProductsByPricingStatus(
      @Param('status') status: ProdutoStatus,
      @Query('page') page: number = 1,
      @Query('pageSize') pageSize: number = 10
    ) {
      try {
        const result = await this.productService.findProductsByPricingStatus(status, page, pageSize);
        return result;
      } catch (error) {
        console.error('Erro ao buscar produtos por status de precificação:', error);
        throw new HttpException('Erro ao buscar produtos por status de precificação', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }


    @Get('pricing-summary/status')
    async getPricingSummary() {

       try {
      const summary = await this.productService.getPricingStatusSummary();

      return {
        success: true,
        message: 'Resumo de status obtido com sucesso',
        data: summary
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao obter resumo de status',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
    }


  @Get('search/name')
  async searchByName(
    @Query('name') name: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number = 10
  ) {
    if (!name) {
      throw new BadRequestException('O parâmetro "name" é obrigatório');
    }
    
    const result = await this.productService.findProductsByName(name, page, pageSize);
    
    return {
      success: true,
      message: `Encontrados ${result.count} produtos para "${name}"`,
      data: result
    };
  }

  @Get('search/sku-gtin')
  async searchBySkuOrGtin(
    @Query('term') term: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number = 10
  ) {
    if (!term) {
      throw new BadRequestException('O parâmetro "term" é obrigatório');
    }
    
    const result = await this.productService.findProductsBySkuOrGtin(term, page, pageSize);
    
    return {
      success: true,
      message: `Encontrados ${result.count} produtos para "${term}"`,
      data: result
    };
  }
}