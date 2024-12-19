import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";



@Injectable()
export class UserService{
    constructor(
        @InjectRepository(User)
        private readonly userRepository:Repository<User>){}


    async getUsers(){
        try{    
             return await this.userRepository.find();
            }catch(error){
                throw new HttpException({
                    status:HttpStatus.BAD_REQUEST,
                    error:'Erro ao pesquisar usuários'},
                    HttpStatus.BAD_GATEWAY,{
                        cause:error
                    });
        }
    }



}