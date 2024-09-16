// DTO genérico para o retorno com suporte a Generics <T>
export class ReturnStockDto<T> {
    retorno:{
        status_processamento: string;
        status: string;
        produto: T;
    }
  
    constructor(init: Partial<ReturnStockDto<T>>) {
      Object.assign(this, init);
    }
  }
  
  // DTO específico para o produto
  export class ProtucStocktDto {
    id: string;
    nome: string;
    codigo: string;
    unidade: string;
    saldo: number;
    saldoReservado: number;
    depositos: DepositoDto[];
  
    constructor(init: Partial<ProtucStocktDto>) {
      Object.assign(this, init);
    }
  }
  
  // DTO para os depósitos do produto
  export class DepositoDto {
    nome: string;
    desconsiderar: string;
    saldo: number;
    empresa: string;
  
    constructor(init: Partial<DepositoDto>) {
      Object.assign(this, init);
    }
  }