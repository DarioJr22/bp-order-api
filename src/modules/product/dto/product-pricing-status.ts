export enum ProdutoStatus {
    PRECIFICADO = 'precificado',
    ATENCAO = 'atencao',
    URGENTE = 'urgente',
  }


export class ProducPricing{
    marketplace:string;
    preco_venda: number;
    margem_contribuicao: number;
    lucro_liquido: number;
}