import { Column, Entity,  PrimaryGeneratedColumn } from "typeorm";


@Entity('user')
export class User {

    @PrimaryGeneratedColumn()
    id:string;

    @Column({nullable:true})
    token:string;
    
    @Column({nullable:true})
    username:string;
    
    @Column({nullable:true})
    name:string;

    @Column({nullable:true})
    password:string;

    
}