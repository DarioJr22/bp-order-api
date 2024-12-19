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
    
    @Cron("51 23 * * *")
    async updateUsersData(){
        this.productService.truncateTablesWithQueryRunner()
        const users = await this.UserService.getUsers();
        for(const user of users)
            this.TinyService.updateProductBase(user.token)
        
    }
}