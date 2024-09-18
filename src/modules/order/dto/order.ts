import { Product } from "src/modules/product/dto/product";

export class Order {
    //In the future we will use users and admin.
    //This implementation its for an mvp without that logic.
    products:Product[]
    price:number;
    constructor(private order:Partial<Order>){
        Object.assign(this,order);

        //On creating class this order makes the price be calculated 
        //By formula price = product * price
        this.price = this.products.reduce((total, currPrd) => {
            return total + (currPrd.preco * currPrd.quantidade);
        }, 0);
    }
}

export class EmailOrder {
    products:Product[]
    price:number;
    contact:string // <Email, nome, phone number
}
