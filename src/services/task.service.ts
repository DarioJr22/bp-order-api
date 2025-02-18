import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { UserService } from '../modules/user/services/user.service';
import { TinyService } from './tiny.service';
import { ProductService } from "src/modules/product/service/product.service";

@Injectable()
export class TaskService{
    constructor(
    private readonly UserService:UserService,
    private readonly TinyService:TinyService,
    private readonly productService:ProductService
    
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
}