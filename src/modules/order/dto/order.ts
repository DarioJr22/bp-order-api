import { ProductDto } from "src/modules/product/dto/product";


//Orders from the ecommerce 
export class Order {
    //In the future we will use users and admin.
    //This implementation its for an mvp without that logic.
    products:ProductDto[]
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
    products:ProductDto[]
    price:number;
    contact:string // <Email, nome, phone number
}

export interface PedidoTinyResponseDTO {
    retorno: {
      status_processamento: string;
      status: string;
      pedidos: Pedido[];
      pagina:number;
      numero_paginas: number;
    };
  }
  
  export interface Pedido {
    id: string;
    numero: string;
    numero_ecommerce: string;
    data_pedido: string;
    data_prevista: string;
    data_faturamento: string;
    data_envio: string;
    data_entrega: string;
    id_lista_preco: string | null;
    descricao_lista_preco: string;
    cliente: Cliente;
    endereco_entrega: EnderecoEntrega;
    itens: Array<ItemWrapper>;
    parcelas: Array<any>; // Caso queira tipar, substitua `any` por uma interface apropriada.
    marcadores: Array<MarcadorWrapper>;
    condicao_pagamento: string;
    forma_pagamento: string;
    meio_pagamento: string | null;
    nome_transportador: string;
    frete_por_conta: string;
    valor_frete: string;
    valor_desconto: number;
    outras_despesas: string;
    total_produtos: string;
    total_pedido: string;
    numero_ordem_compra: string;
    deposito: string;
    ecommerce: Ecommerce;
    forma_envio: string;
    situacao: string;
    obs: string;
    obs_interna: string;
    id_vendedor: string;
    codigo_rastreamento: string;
    url_rastreamento: string;
    id_nota_fiscal: string;
    intermediador: Intermediador;
    id_natureza_operacao: string;
  }
  
  export interface Cliente {
    nome: string;
    codigo: string;
    nome_fantasia: string | null;
    tipo_pessoa: string;
    cpf_cnpj: string;
    ie: string;
    rg: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    fone: string;
    email: string;
    cep: string;
  }
  
  export interface EnderecoEntrega {
    tipo_pessoa: string;
    cpf_cnpj: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    cidade: string;
    uf: string;
    fone: string;
    nome_destinatario: string;
    ie: string;
  }
  
  export interface ItemWrapper {
    item: Item;
  }
  
  export interface Item {
    id_produto: string;
    codigo: string;
    descricao: string;
    unidade: string;
    quantidade: string;
    valor_unitario: string;
  }
  
  export interface MarcadorWrapper {
    marcador: Marcador;
  }
  
  export interface Marcador {
    id: string;
    descricao: string;
    cor: string;
  }
  
  export interface Ecommerce {
    id: string;
    numeroPedidoEcommerce: string;
    numeroPedidoCanalVenda: string;
    nomeEcommerce: string;
  }
  
  export interface Intermediador {
    nome: string;
    cnpj: string;
    cnpjPagamento: string | null;
  }
  

  export interface PedidoResponseDTO {
    retorno: {
      status_processamento: string;
      status: string;
      pedido: Pedido;
    };
  }
  
  export interface PedidoDetailDTO {
    id: string;
    numero: string;
    numero_ecommerce: string;
    data_pedido: string;
    data_prevista: string;
    data_faturamento: string;
    data_envio: string;
    data_entrega: string;
    id_lista_preco: string | null;
    descricao_lista_preco: string;
    cliente: Cliente;
    endereco_entrega: EnderecoEntrega;
    itens: Array<ItemWrapper>;
    parcelas: Array<any>;
    marcadores: Array<MarcadorWrapper>;
    condicao_pagamento: string;
    forma_pagamento: string;
    meio_pagamento: string | null;
    nome_transportador: string;
    frete_por_conta: string;
    valor_frete: string;
    valor_desconto: number;
    outras_despesas: string;
    total_produtos: string;
    total_pedido: string;
    numero_ordem_compra: string;
    deposito: string;
    ecommerce: Ecommerce;
    forma_envio: string;
    situacao: string;
    obs: string;
    obs_interna: string;
    id_vendedor: string;
    codigo_rastreamento: string;
    url_rastreamento: string;
    id_nota_fiscal: string;
    intermediador: Intermediador;
    id_natureza_operacao: string;
  }
  
  export interface Cliente {
    nome: string;
    codigo: string;
    nome_fantasia: string | null;
    tipo_pessoa: string;
    cpf_cnpj: string;
    ie: string;
    rg: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    fone: string;
    email: string;
    cep: string;
  }
  
  export interface EnderecoEntrega {
    tipo_pessoa: string;
    cpf_cnpj: string;
    endereco: string;
    numero: string;
    complemento: string;
    bairro: string;
    cep: string;
    cidade: string;
    uf: string;
    fone: string;
    nome_destinatario: string;
    ie: string;
  }
  
  export interface ItemWrapper {
    item: Item;
  }
  
  export interface Item {
    id_produto: string;
    codigo: string;
    descricao: string;
    unidade: string;
    quantidade: string;
    valor_unitario: string;
  }
  
  export interface MarcadorWrapper {
    marcador: Marcador;
  }
  
  export interface Marcador {
    id: string;
    descricao: string;
    cor: string;
  }
  
  export interface Ecommerce {
    id: string;
    numeroPedidoEcommerce: string;
    numeroPedidoCanalVenda: string;
    nomeEcommerce: string;
  }
  
  export interface Intermediador {
    nome: string;
    cnpj: string;
    cnpjPagamento: string | null;
  }
  