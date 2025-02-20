export enum ProdutoStatus {
    PRECIFICADO = 'precificado',
    ATENCAO = 'atencao',
    URGENTE = 'urgente',
  }


export class ProducPricing{
    marketplace!:string;
    comissao!:string;
    preco_custo:number;
    preco_venda: number;
    margem_contribuicao: number;
    lucro_liquido: number;
    data_precificacao: Date;
    status:string
}



export const DEFAULT_MARKET_PLACES:ProducPricing[] = [{
  "marketplace":"Mercado Livre Clássico",
  "comissao":"12%",
  "preco_venda": 0,
  "preco_custo":0,
  "margem_contribuicao": 0,
  "lucro_liquido": 0,
  "data_precificacao":new Date(),
  "status":ProdutoStatus.ATENCAO
},
{
  "marketplace":"Mercado Livre Premium",
  "comissao":"17%",
  "preco_venda": 0,
  "preco_custo":0,
  "margem_contribuicao": 0,
  "lucro_liquido": 0,
  "data_precificacao":new Date(),
  "status":ProdutoStatus.ATENCAO,
}]