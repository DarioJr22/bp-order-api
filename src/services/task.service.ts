import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { UserService } from '../modules/user/services/user.service';
import { TinyService } from './tiny.service';

@Injectable()
export class TaskService{
    constructor(
    private readonly UserService:UserService,
    private readonly TinyService:TinyService
    
    ){
        
    }
    
    @Cron("25 23 * * *")
    async updateUsersData(){
        this.TinyService.truncateOperationTable()
        const users = await this.UserService.getUsers();
        for(const user of users)
            this.TinyService.updateProductBase(user.token)
        
    }
}