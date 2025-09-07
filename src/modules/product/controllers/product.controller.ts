import {  BadRequestException, Body, Controller, DefaultValuePipe, Delete, Get, HttpException, HttpStatus, Logger, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { TinyService } from "src/services/tiny.service";

import { ProductService } from "../service/product.service";
import { SearchProductDto } from "../dto/searchProduct";
import { TaskService } from "src/services/task.service";
import { ProducPricing, ProdutoStatus } from "../dto/product-pricing-status";
import { AddMarketplacePricingDto, DeleteMarketplacePricingDto, MarketplacePricingResponseDto } from "../dto/marketplace-pricing.dto";

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

    /**
     * Adiciona uma nova configuração de preço de marketplace para um produto
     */
    @Post('marketplace-pricing')
    async addMarketplacePricing(@Body() dto: AddMarketplacePricingDto): Promise<MarketplacePricingResponseDto> {
      try {
        const updatedPricings = await this.productService.addMarketplacePricing(
          dto.codigo,
          dto.pricing
        );
        
        return {
          success: true,
          message: `Configuração de preço para ${dto.pricing.marketplace} adicionada com sucesso`,
          data: updatedPricings
        };
      } catch (error) {
        Logger.error(`Erro ao adicionar configuração de preço: ${error.message}`, error.stack);
        return {
          success: false,
          message: error.message || 'Erro ao adicionar configuração de preço'
        };
      }
    }
    
    /**
     * Remove uma configuração de preço de marketplace para um produto
     */
    @Delete('marketplace-pricing')
    async deleteMarketplacePricing(@Body() dto: DeleteMarketplacePricingDto): Promise<MarketplacePricingResponseDto> {
      try {
        const updatedPricings = await this.productService.deleteMarketplacePricing(
          dto.codigo,
          dto.marketplace
        );
        
        return {
          success: true,
          message: `Configuração de preço para ${dto.marketplace} removida com sucesso`,
          data: updatedPricings
        };
      } catch (error) {
        Logger.error(`Erro ao remover configuração de preço: ${error.message}`, error.stack);
        return {
          success: false,
          message: error.message || 'Erro ao remover configuração de preço'
        };
      }
    }
    
    /**
     * Lista todas as configurações de preço por marketplace de um produto
     */
    @Get('marketplace-pricing/:codigo')
    async getMarketplacePricings(@Param('codigo') codigo: string): Promise<MarketplacePricingResponseDto> {
      try {
        const pricings = await this.productService.getMarketplacePricings(codigo);
        
        return {
          success: true,
          message: 'Configurações de preço obtidas com sucesso',
          data: pricings
        };
      } catch (error) {
        Logger.error(`Erro ao obter configurações de preço: ${error.message}`, error.stack);
        return {
          success: false,
          message: error.message || 'Erro ao obter configurações de preço'
        };
      }
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