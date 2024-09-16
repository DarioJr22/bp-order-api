import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { URLGETPROD, URLPRODEST, URLREADPROD } from "src/shared/constants/URLS";
import { ProductSearchReturn, ReturnProductDto } from "src/modules/product/dto/response/returnProduct";
import { SearchProductDto } from "src/modules/product/dto/request/searchProduct";
import { ProtucStocktDto, ReturnStockDto } from "src/modules/product/dto/product-stock";
import { Product } from "src/modules/product/dto/product";
import * as dotenv from 'dotenv';
dotenv.config();


@Injectable()
export class TinyService{
    //E aqui será oque será manipulado do TINY
    //Refactoring possíveis aqui:
    // - [ ] Tornar códigos que se repentem em função 
   async searchProduct(){

       try {
        return this.getAllProducts()
       }catch(error){
              Logger.log(error)
        return new HttpException('Erro ao buscar os produtos',HttpStatus.INTERNAL_SERVER_ERROR)
       }
    }

    async getFilterFields(fieldStr:string[]){
       Logger.log(fieldStr)
       console.log(fieldStr)
       //Result 
       const result:any = {}

       try{
       //Pegatodos os produtos
              const resp = await this.searchProduct();

       //Pega todos os campos
              const fields:string[] = fieldStr


       //Se não retornar uma exceção então faz o L
              if(!(resp instanceof HttpException)){
                     fields.forEach((key:string) => {
                            result[key] = [...new Set(resp.map(prod => {return {[key]:prod.produto[key]}}).filter(mappedProd => mappedProd[key] != ""))
                            ]  
                     }
              );
       }

       }catch(error){
              Logger.log(error)
       }
      
       return result
    }



    async getAllProducts(){
       //TODO - TIPAR ISSO
       // eslint-disable-next-line prefer-const
       let results:ProductSearchReturn[] = [];
       // eslint-disable-next-line prefer-const
       let page = {
              numero_paginas:0,
              pagina:0
       };

       do{
              //Recover data from actual pages
              const resp = await axios.get<ReturnProductDto>(`${URLGETPROD}?token=${process.env.APIKEY}&formato=json&pagina=${page.pagina}`)
              
              //Set to next page
              page.pagina = ++resp.data.retorno.pagina 
              
              //Get total number of pages
              page.numero_paginas = resp.data.retorno.numero_paginas
              
              
              //Put results to a 
              results.push(...resp.data.retorno.produtos)   
       }while(page.pagina <= page.numero_paginas);


     //  results = await Promise.all(await this.iterateProductBalance(results))
       return results
    }

 


    async getStockProductBalance(idProduto:string){

       try{
              //Recover data from actual pages
              const resp = await axios.get<ReturnStockDto<ProtucStocktDto>>(`${URLPRODEST}?token=${process.env.APIKEY}&formato=json&id=${idProduto}`)
              return resp.data.retorno.produto
       }catch(erro){
              throw Error('Erro ao consultar estoque')
       }        
    }


    async searchAllProducts(searchDto:SearchProductDto){
       //TODO - TIPAR ISSO
       // eslint-disable-next-line prefer-const
       let results:any[] = [];
       // eslint-disable-next-line prefer-const
       let page = {
              numero_paginas:0,
              pagina:0
       };

       let params:any = {
                     token: process.env.APIKEY,
                     formato: 'json',
                     pagina: page.pagina,
                     pesquisa: searchDto.pesquisa || undefined,
                     idTag: searchDto.idTag || undefined,
                     situacao:searchDto.situacao || undefined,
                     dataCriacao:searchDto.dataCriacao || undefined                        
              }

       params = await this.removeUndefinedParams(params)

       do{
              console.log(params)
              //Recover data from actual pages
              const resp = await axios.get<ReturnProductDto>(`${URLGETPROD}`,{params:params})
              
              //Set to next page
              page.pagina = ++resp.data.retorno.pagina 
              
              //Get total number of pages
              page.numero_paginas = resp.data.retorno.numero_paginas
              
              console.log(resp.data);
              console.log(resp.data.retorno.pagina );
              
              //Put results to a 
              results.push(...resp.data.retorno.produtos)   
       }while(page.pagina <= page.numero_paginas);


       return results
    }



    
    async findProductById(id:string){
        try {
         const resp = await axios.get<{retorno:{produto:Product}}>(`${URLREADPROD}?token=${process.env.APIKEY}&formato=json&id=${id}`)
         resp.data.retorno.produto.saldo_estoque = await this.getStockProductBalance(id);
              
 
         return resp.data
        }catch(error){
         return new HttpException('Erro ao buscar o produto',HttpStatus.INTERNAL_SERVER_ERROR)
        }
     }

     async removeUndefinedParams(params:{[key:string]:any}){
       const paramsHandler = params
       Object.keys(paramsHandler).forEach(key => {
              if (paramsHandler[key] === undefined) {
              delete params[key];
              }
       });

       return paramsHandler
     }

}