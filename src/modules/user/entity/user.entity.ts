import { Address } from "src/modules/address/address.entity";
import { Order } from "src/modules/order/entity/order.entity";
import { LogAcess } from "src/modules/logAcess/entity/logacesso.entity";
import { Column, Entity,  OneToMany,  PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role";


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

    @Column({nullable:true,unique:true})
    email:string;


    @Column({nullable:true})
    password:string;

    @OneToMany(() => LogAcess,(log) => log.user)
    logs:LogAcess;

    @OneToMany(() => Address, (address) => address.user)
    address: Address[];

    @OneToMany(() => Order, (Order) => Order)
    orders: Order[];

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.CLIENT,
      })
      role: Role;

    @Column({nullable:true})
    data_atualizacao:Date
}