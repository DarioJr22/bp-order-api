export class ReturnProductDto {
    retorno: {
      status_processamento: number;
      status: string;
      codigo_erro?: number;
      erros?: {
        erro: string;
      }[];
      pagina: number;
      numero_paginas: number;
      produtos?: ProductSearchReturn[];
    };
  }

  export class ProductSearchReturn{
    produto: {
      id: string;
      nome: string;
      codigo?: string;
      preco: number;
      preco_promocional: number;
      preco_custo?: number;
      preco_custo_medio?: number;
      unidade?: string;
      gtin?: string;
      tipoVariacao: string;
      localizacao?: string;
      situacao?: string;
      data_criacao?: string;
      estado_estoque?:number
    }
  }
  