import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { UserService } from '../modules/user/services/user.service';
import { TinyService } from './tiny.service';
import { ProductService } from "src/modules/product/service/product.service";
import { GoogleSheetsService } from "./google-sheet.service";
import { ProducPricing } from "src/modules/product/dto/product-pricing-status";

@Injectable()
export class TaskService{
    constructor(
    private readonly UserService:UserService,
    private readonly TinyService:TinyService,
    private readonly productService:ProductService,
    private readonly googleSheet:GoogleSheetsService
    
    ){
        
    }
    
    //@Cron("06 20 * * *")
    async updateUsersData(email:string){
        const users = await this.UserService.getUsers();
        for(const user of users){
            if(user.token){
                this.TinyService.updateProductBase(user.token,email)
            }
        }  
    }

    /* 		[
			"Laq-1105130",
			"7909201032731",
			" Biela Almento Cilindrada Txk Cg Fan 160 Bros 160 Pino 15mm",
			"",
			"EUROSTAR DO BRASIL S/A.",
			"Simples",
			"Mercado Livre Premium",
			"17%",
			"12,00",
			"R$ 12,00",
			"1200%",
			"R$ 12,00",
			"Precificado",
			"11/01/2025 17:51:40"
		], */


    async getDataFromGoogleSheets(){

        let sheets = ['BRAVAN','PLANET']
        let sheetsData = []

        for(let sheet in sheets){
            try{
                const data = await this.googleSheet.getAllSheetValues(sheets[sheet])
                let filteredData = data.data.values.filter(product => product[12] && 
                    product[12] != "" && 
                    product[0] != "" && 
                    product[0] != "SKU" && 
                    product.length > 0 )
                sheetsData.push(...filteredData)
            }catch(erro){
                  throw new HttpException('Erro ao buscar dados de migração do sheets', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
     
     
        console.log(sheetsData);
             
        return sheetsData
    }

    /* 
    1º Pegar o produto da base 
    2º Fazer alteração no mesmo 
        */


    async updateSheetProducts(){
        const sheetData = await this.getDataFromGoogleSheets()

        for(let product =  0 ;product < sheetData.length; product++ ){
         
                
           
            try{
                let productRecovered = await this.productService.getProductBySKU(sheetData[product][0])
                if(productRecovered.length > 0){
                    let productPricing = productRecovered[0].preco_marketplace
                    productPricing.forEach((productPricing)=>{
                        if(sheetData[product][6] == productPricing.marketplace){
                            Object.assign(productPricing,this.clearInputs(sheetData[product]))
                        }
                    })
                    console.log(productPricing);
                    console.log(sheetData[product][0]);
                    await this.productService.productUpdatePrice(sheetData[product][0],productPricing)
                }
                
            }catch(erro){
                throw new HttpException('Erro ao buscar dados de migração do sheets', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        
    }


    clearInputs(sheetData:string[]):ProducPricing{
       let productPricing = new ProducPricing()
        productPricing.lucro_liquido = this.clearNumber(sheetData[11]);
        productPricing.margem_contribuicao = this.clearNumber(sheetData[10]);
        productPricing.preco_custo = this.clearNumber(sheetData[8]);
        productPricing.preco_venda = this.clearNumber(sheetData[9]);
        productPricing.data_precificacao = this.formatDate(sheetData[13]);
        productPricing.status = sheetData[12].toLocaleLowerCase();
        return productPricing
    }

    clearNumber(string:string){
        string = string.replaceAll("R$ ",'')
        string = string.replaceAll(",",'.')
        return parseFloat(string)
    }

    formatDate(dataComHora){
        // Dividir a data e o horário em partes
        const [data, hora] = dataComHora.split(' ');
        const [dia, mes, ano] = data.split('/');
        const [horaStr, minutoStr, segundoStr] = hora.split(':');

        // Converter para números
        const diaNum = parseInt(dia, 10);
        const mesNum = parseInt(mes, 10) - 1; // Mês é baseado em zero (janeiro = 0)
        const anoNum = parseInt(ano, 10);
        const horaNum = parseInt(horaStr, 10);
        const minutoNum = parseInt(minutoStr, 10);
        const segundoNum = parseInt(segundoStr, 10);

        // Criar o objeto Date
        const dataObj = new Date(anoNum, mesNum, diaNum, horaNum, minutoNum, segundoNum);

       return dataObj
    }




}